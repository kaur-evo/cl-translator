<template>
  <shiftview-popover
    class="shiftview-pin-popover"
    :title="title"
    :items="mappedItems"
    :item-icon-color="getIconColor"
    :item-icon="getIcon"
    :item-text="getText"
    :item-disabled="getItemDisabled"
    :subtitle="subtitle"
    :target-el="targetEl"
    @item-click="onItemClick"
    @outside-click="$emit('close')"
  >
    <template #tooltip-content="{ item }">
      <shiftview-pin-tooltip :item="item" />
    </template>
  </shiftview-popover>
</template>

<script>
import { mdiPlaylistCheck, mdiAutorenew, mdiAccount, mdiFlagCheckered, mdiImageOutline } from '@mdi/js';
import { isSameMinute } from 'date-fns';
import { mapState, mapActions } from 'pinia';

import { useProfileStore, useShiftviewSelectionStore, useGenericDialogStore, useGenericNotificationStore } from '@/stores/index';
import ShiftviewPopover from '@/components/organisms/shiftview/ShiftviewPopover/index.vue';
import colorConstants from '@/constants/colorConstants';
import shiftviewDialogs from '@/constants/dialogConfigs';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import checklistEditDialogConfig from '@/constants/shiftviewDialogConfigs/checklistEditDialogConfig';
import ShiftviewPinTooltip from '@/components/organisms/shiftview/PinTooltip/index.vue';
import { checklistStatuses } from '@/constants/checklistsConstants';
import { pinTypes } from '@/constants/shiftviewPinConstants';
import { formatTime } from '@/helpers/time/formatTime';

export default {
  name: 'ShiftviewPinPopover',
  components: { ShiftviewPopover, ShiftviewPinTooltip },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    targetEl: {
      type: [HTMLDivElement, SVGSVGElement],
      required: true,
    },
  },
  emits: ['close'],
  data() {
    return {
      itemsMap: {
        [pinTypes.CHANGEOVER]: {
          color: colorConstants.dark['lw-blue'],
          icon: mdiAutorenew,
          text: this.$t('Edit changeover'),
        },
        [pinTypes.CHECK]: {
          icon: mdiPlaylistCheck,
          color: (item) => {
            const colorsMap = {
              [checklistStatuses.MISSED]: colorConstants.dark['lw-red'],
              [checklistStatuses.NEW]: colorConstants.dark['tertiary-dark'],
              [checklistStatuses.SUCCESSFUL]: colorConstants.dark.primary,
              [checklistStatuses.UNSUCCESSFUL]: colorConstants.dark['lw-orange'],
            };
            return (colorsMap[item.check.status]);
          },
          text: (item) => item.check.name,
        },
        [pinTypes.TEAM]: {
          icon: mdiAccount,
          text: this.$t('Edit team'),
        },
        [pinTypes.BATCH_TARGET_REACHED]: {
          icon: mdiFlagCheckered,
          text: this.$t('Target reached'),
          disabled: true,
        },
      },
    };
  },
  computed: {
    ...mapState(useProfileStore, ['isReadOnly']),
    title() {
      return `${this.$t('Multiple events')} (${this.items.length})`;
    },
    subtitle() {
      const firstItem = this.items[0];
      const lastItem = this.items[this.items.length - 1];
      const start = formatTime(firstItem.time);
      if (isSameMinute(new Date(firstItem.time), new Date(lastItem.time))) return start;
      return `${start} - ${formatTime(lastItem.time)}`;
    },
    mappedItems() {
      return this.items.map((item) => ({
        ...item,
        appendIcon: item.type === pinTypes.CHECK && item.check.fileCount > 0 ? mdiImageOutline : null,
      }));
    },
  },
  methods: {
    ...mapActions(useShiftviewSelectionStore, ['selectSlice']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    getIconColor(item) {
      const { color } = this.itemsMap[item.type];
      if (!color) return '';
      return typeof color === 'function' ? color(item) : color;
    },
    getIcon(item) {
      return this.itemsMap[item.type].icon;
    },
    getText(item) {
      const { text } = this.itemsMap[item.type];
      if (typeof text === 'function') return text(item);
      return text;
    },
    getItemDisabled(item) {
      return this.itemsMap[item.type].disabled;
    },
    async onItemClick(item) {
      if (this.isReadOnly && item.type !== pinTypes.CHECK) {
        this.notifyError(this.$t('You are in read-only mode'));
        return;
      }
      this.$emit('close');
      switch (item.type) {
        case pinTypes.CHANGEOVER:
          this.selectSlice({ ...item.slice, isPin: true });
          this.openDialog(shiftviewDialogs.CHANGEOVER);
          break;
        case pinTypes.TEAM:
          this.openDialog({ ...editTeamDialogConfig, data: item.team });
          break;
        case pinTypes.CHECK:
          this.openDialog({ ...checklistEditDialogConfig, data: { item: item.check } });
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.shiftview-pin-popover {
  //pointer events are disabled for icons(pins) layer
  pointer-events: all;
}
</style>
