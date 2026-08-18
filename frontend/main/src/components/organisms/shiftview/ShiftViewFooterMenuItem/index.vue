<template>
  <v-btn
    :key="item.id"
    :disabled="isDisabled"
    :active="false"
    class="menu-item-button max-width-reset min-width-reset text-body-medium px-3"
    :class="[(item.additional || item.compact) && $vuetify.display.mdAndUp ? 'flex-shrink-1 flex-grow-0' : 'flex-grow-1 flex-shrink-0']"
    @click.stop="onOpen"
  >
    <v-badge
      :model-value="!!item.counter"
      :color="item.color"
      location="right top"
      :dot="isCompact"
      floating
      :offset-x="isCompact ? 3 : -15"
      :offset-y="isCompact ? 7 : 18"
      :class="{ 'ml-n3 mr-4': !isCompact && item.counter }"
    >
      <div class="d-flex align-center">
        <v-icon
          class="menu-icon"
          :color="isDisabled ? 'secondary-dark' : 'white'"
        >
          {{ item.icon }}
        </v-icon>
        <v-icon
          v-if="item.hasIconDot"
          :color="item.color"
          size="9"
          class="ml-n2 mt-n4"
        >
          {{ mdiCircle }}
        </v-icon>
        <span
          v-if="!isCompact"
          class="ml-3"
          :class="isDisabled ? 'text-tertiary-text' : 'text-white'"
        >
          {{ item.name }}
        </span>
      </div>
      <template #badge>
        <span class="font-weight-regular">
          {{ item.counter }}
        </span>
      </template>
    </v-badge>
  </v-btn>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { mdiCircle } from '@mdi/js';

import {
  useShiftviewSelectionStore, useShiftviewTimelineStore,
  useStationStore, useGenericDialogStore, useGenericNotificationStore,
} from '@/stores/index';
import i18n from '@/services/i18n';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';

export default {
  name: 'ShiftViewFooterMenuItem',
  props: {
    item: { type: Object, default: () => {} },
  },
  data() {
    return {
      mdiCircle,
    };
  },
  computed: {
    ...mapState(useShiftviewSelectionStore, ['isSelectionActive']),
    ...mapState(useShiftviewTimelineStore, ['timeline']),
    ...mapState(useStationStore, ['lineviewStation']),
    isCompact() {
      return this.item.additional || this.item.compact || this.$vuetify.display.mdAndDown;
    },
    isDisabled() {
      return this.item.disabled || this.isSelectionActive;
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyWarning']),
    ...mapActions(useShiftviewSelectionStore, ['selectSlice']),
    requestOperator() {
      this.openDialog(editTeamDialogConfig);
      this.notifyWarning({ text: i18n.global.t('Please select team first') });
    },
    onOpen() {
      if (this.item.requireOperatorBeforeOpen) {
        this.requestOperator();
        return;
      }
      if (this.isSelectionActive || this.item.disabled) {
        return;
      }
      if (this.item.id === 'changeover') {
        const activeSlice = this.timeline[this.timeline.length - 1].batchId > 0 ? this.timeline[this.timeline.length - 1] : this.timeline[this.timeline.length - 2];
        this.selectSlice(activeSlice);
      } else {
        const conf = { ...this.item.dialogConf };
        if (this.item.id === 'messages' && !this.lineviewStation.notificationEmails) {
          conf.width = 700;
        }
        this.openDialog(conf);
      }
    },
  },
};
</script>
