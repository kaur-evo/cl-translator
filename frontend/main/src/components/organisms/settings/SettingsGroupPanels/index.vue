<template>
  <draggable
    :model-value="groups"
    :items="groups"
    handle=".handle"
    draggable=".drag-item"
    force-fallback="true"
    scroll-sensitivity="64"
    :disabled="!areFiltersEmpty"
    item-key="id"
    @change="onGroupOrderChange"
  >
    <template #item="{ element: group }">
      <div
        :id="`group-panel-${group.id}`"
        class="expansion-panel drag-item bg-white rounded elevation-2 mb-4 pa-2"
        :class="{ 'expansion-panel--opened': openedPanels.includes(group.id) }"
      >
        <div class="d-flex align-center panel-content" @click="onPanelOpened(group.id)">
          <v-icon
            v-if="showDragIcon"
            class="handle grabbable"
            :color="areFiltersEmpty ? 'secondary-dark' : 'quaternary-dark-2'"
          >
            {{ mdiDragVertical }}
          </v-icon>
          <v-tooltip location="top">
            <template #activator="{ props }">
              <evocon-v-button
                v-if="isGroupEditVisible(group)"
                :icon="mdiPencil"
                class="mx-2"
                v-bind="props"
                @click="onGroupEditClick(group)"
              />
            </template>
            <span>{{ $t('Edit') }}</span>
          </v-tooltip>
          <v-icon
            v-if="group.color"
            :color="group.color"
            class="mr-1"
            size="18"
          >
            {{ mdiSquareRounded }}
          </v-icon>
          <span
            class="text-body-large font-weight-medium text-truncate"
            :class="{ 'ml-2': !canEditGroups }"
          >
            {{ group.name }}
            <span v-if="showGroupItemsCount || openedPanels.includes(group.id)"> ({{ group.itemsCount }}) </span>
          </span>
          <icon-with-tooltip
            v-if="showGlobalGroupsIcon && !group.local"
            :icon="mdiWeb"
            :tooltip-text="$t('Global group')"
            additional-classes="ml-2"
          />
          <v-spacer />
          <v-icon class="collapse-icon">
            {{ mdiChevronDown }}
          </v-icon>
        </div>
        <slot
          v-if="openedPanels.includes(group.id)"
          name="panel-content"
          :group-id="group.id"
          :is-global="group.local === false"
        />
      </div>
    </template>
  </draggable>
</template>
<script>
import draggable from 'vuedraggable';
import {
  mdiWeb, mdiPencil, mdiSquareRounded, mdiDragVertical, mdiChevronDown,
} from '@mdi/js';
import { isEqual, difference } from 'lodash';
import { nextTick } from 'vue';
import { mapState } from 'pinia';

import useProfileStore from '@/stores/profile';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import getNewOrder from '@/helpers/getNewOrder';

const icons = {
  mdiWeb, mdiPencil, mdiSquareRounded, mdiDragVertical, mdiChevronDown,
};

export default {
  name: 'SettingsGroupPanels',
  components: {
    draggable,
    IconWithTooltip,
    EvoconVButton,
  },
  props: {
    groups: {
      type: Array,
      default: () => [],
    },
    areFiltersEmpty: { type: Boolean },
    showGlobalGroupsIcon: { type: Boolean },
    showDragIcon: { type: Boolean },
    canEditGroups: { type: Boolean, default: true },
    showGroupItemsCount: { type: Boolean, default: true },
    openPanelsOnFilter: { type: Boolean, default: true },
    loading: { type: Boolean },
  },
  emits: ['on-group-order-change', 'on-group-edit-click', 'on-panel-opened'],
  data() {
    return {
      ...icons,
      openedPanels: [],
      userHasInteracted: false,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['highestRoleAllows']),
  },
  watch: {
    async groups(value, oldVal) {
      await nextTick();
      if (this.loading || isEqual(value, oldVal)) return;
      if (!this.areFiltersEmpty && this.openPanelsOnFilter && !this.userHasInteracted) {
        this.openedPanels = value.map((group) => group.id);
      } else if (this.userHasInteracted) { // open only new groups
        const newValues = Array.from(difference(value.map((group) => group.id), oldVal.map((group) => group.id)));
        this.openedPanels = [...this.openedPanels, ...newValues];
      }
    },
    areFiltersEmpty(value) {
      if (value) this.openedPanels = [];
    },
  },
  methods: {
    isGroupEditVisible(group) {
      if (!this.canEditGroups) return false;
      if (group.local === undefined) return true; // no global-local prop for group
      return group.local || this.highestRoleAllows('editGlobalGroup');
    },
    onGroupEditClick(group) {
      this.$emit('on-group-edit-click', group);
    },
    onGroupOrderChange(event) {
      const { moved } = event;
      const { id } = moved.element;
      this.$emit('on-group-order-change', { ordering: getNewOrder(moved, this.groups), id });
    },
    async onPanelOpened(groupId) {
      this.userHasInteracted = true;
      const index = this.openedPanels.indexOf(groupId);
      if (index === -1) {
        this.openedPanels.push(groupId);
        this.$emit('on-panel-opened', groupId);
      } else {
        this.openedPanels.splice(index, 1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.expansion-panel {
  max-height: 56px;
  overflow: hidden;
  transition: max-height 1s ease-in-out;

  &--opened {
    max-height: 100000000px; //unrealistically big value for transition to work

    .collapse-icon {
      transform: rotate(180deg);
    }
  }

  .panel-content {
    min-height: 40px;;
  }
}
</style>
