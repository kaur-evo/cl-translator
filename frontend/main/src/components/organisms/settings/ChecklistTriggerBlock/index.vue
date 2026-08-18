<template>
  <div v-if="requirements.type" class="d-flex flex-column text-body-medium max-width-100 overflow-hidden">
    <span class="d-flex flex-wrap" :class="isMobileView ? 'flex-column justify-center' : 'align-center'">
      <component
        :is="currentTriggerComponent"
        ref="triggerRef"
        :requirements="requirements"
        @update:requirements="$emit('update:requirements', $event)"
        @update:is-trigger-complete="isCurrentTriggerComplete = $event"
        @update:has-trigger-error="hasCurrentTriggerError = $event"
      >
        <template #frequency-type>
          <selection-input
            :model-value="[requirements.type]"
            :items="frequenciesList"
            use-chips
            is-single-select
            hide-search
            required
            menu-input-class="ma-1"
            @update:model-value="onSelectType($event[0], true)"
          />
        </template>
        <template v-if="!isMobileView" #frequency-actions>
          <menu-with-button-activator
            :items="additionalMenuItems"
            :button-icon="mdiPlus"
            :disabled="areAllAdditionalMenuItemsSelected"
            :button-classes="additionalMenuItems.length === 0 ? 'd-none' : 'ma-1 ml-6'"
            :close-on-content-click="areAllAdditionalMenuItemsSelected"
            primary-text-field="text"
            size="small"
            has-checkbox
            value-key="isSelected"
            @item-clicked="$event.action()"
          />
          <evocon-v-button
            :text="$t('Reset')"
            class="ma-1 ml-2"
            size="small"
            type="secondary"
            :disabled="isResetDisabled"
            @click="resetTrigger('button', true)"
          />
        </template>
      </component>
    </span>
  </div>
  <div v-else>
    <evocon-v-chip
      v-for="frequency in frequenciesList"
      :key="frequency.id"
      class="ma-1"
      :label="frequency.name"
      @click="onSelectType(frequency.id, false)"
    />
  </div>
  <div class="full-width max-width-100 overflow-hidden">
    <div
      v-for="(block, i) in additionalMenuItems.filter((item) => item.isSelected)"
      :key="i"
      class="d-flex align-center justify-space-between px-4 py-2 frequency-row"
      :class="{ 'pl-8': !isMobileView, 'ml-4': block.id === 'resetOnShiftStart' && requirements.type === checklistTypes.CHANGEOVER }"
    >
      <span class="d-flex align-center text-body-medium additional-item__text">
        <v-icon size="16"> {{ mdiSubdirectoryArrowRight }} </v-icon>
        <span v-if="!isMobileView" class="ml-2">{{ $t('and_2') }}</span>
        <span
          class="font-weight-medium"
          :class="isMobileView ? 'ml-2' : 'mx-1'"
        >
          {{ block.text }}
        </span>
        <icon-with-tooltip
          v-if="block.iconTooltip && !isMobileView"
          :tooltip-text="block.iconTooltip"
          :icon="mdiInformationOutline"
          additional-classes="ml-1"
        />
        <template v-if="block.id === 'interval'">
          <evocon-duration-chip
            :model-value="requirements.intervalTime"
            class="mx-1"
            :max-hours="9999"
            :error="hasChangeoverIntervalError"
            @update:model-value="$emit('update:requirements', { intervalTime: $event })"
          />
          <span v-if="hasChangeoverIntervalError" class="mx-1 text-body-small text-error"> {{ $t('At least {value} min', { value: minIntervalTimeInMinutes }) }}</span>
        </template>
        <span v-if="block.id === 'location'" class="mx-1 flex-grow-1 flex-shrink-1 overflow-hidden">
          <selection-input
            :model-value="requirements.positionIds"
            :items="filteredPositions"
            :items-map="positionsMap"
            :prepend-text="`${$t('Machine locations')}:`"
            use-chips
            show-empty-array-as-all-selected
            remove-non-existent-selections
            @update:model-value="$emit('update:requirements', { positionIds: $event })"
          />
        </span>
      </span>
      <evocon-v-button
        :icon="mdiDelete"
        size="extra-small"
        @click="block.action()"
      />
    </div>
  </div>
  <div v-if="isMobileView && !!requirements.type" class="d-flex justify-space-between mt-2">
    <menu-with-button-activator
      :items="additionalMenuItems"
      :button-icon="mdiPlus"
      :disabled="areAllAdditionalMenuItemsSelected"
      :button-classes="additionalMenuItems.length === 0 ? 'd-none' : ''"
      :close-on-content-click="areAllAdditionalMenuItemsSelected"
      primary-text-field="text"
      size="small"
      has-checkbox
      value-key="isSelected"
      @item-clicked="$event.action()"
    />
    <evocon-v-button
      :text="$t('Reset')"
      class="ml-auto mr-1"
      size="small"
      type="secondary"
      :disabled="isResetDisabled"
      @click="resetTrigger('button', true)"
    />
  </div>
</template>

<script>
import {
  mdiPlus, mdiDelete, mdiClockOutline, mdiSubdirectoryArrowRight, mdiInformationOutline, mdiCloseCircle,
} from '@mdi/js';
import { mapState } from 'pinia';
import { isEqual } from 'lodash';
import { nextTick } from 'vue';

import usePositionStore from '@/stores/position';
import useDeviceStore from '@/stores/device';
import useConfigurationStore from '@/stores/configuration';
import { checklistTypes, getChecklistFrequenciesList, getPeriodicFrequenciesList } from '@/constants/checklistsConstants';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import EvoconDurationChip from '@/components/atoms/EvoconDurationChip/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import MenuWithButtonActivator from '@/components/molecules/MenuWithButtonActivator/index.vue';
import ChecklistPeriodicTrigger from '@/components/organisms/settings/ChecklistTriggerBlock/ChecklistPeriodicTrigger/index.vue';
import ChecklistIntervalTrigger from '@/components/organisms/settings/ChecklistTriggerBlock/ChecklistIntervalTrigger/index.vue';
import ChecklistChangeoverTrigger from '@/components/organisms/settings/ChecklistTriggerBlock/ChecklistChangeoverTrigger/index.vue';
import ChecklistQuantityTrigger from '@/components/organisms/settings/ChecklistTriggerBlock/ChecklistQuantityTrigger/index.vue';
import ChecklistDowntimeTrigger from '@/components/organisms/settings/ChecklistTriggerBlock/ChecklistDowntimeTrigger/index.vue';
import ChecklistManualTrigger from '@/components/organisms/settings/ChecklistTriggerBlock/ChecklistManualTrigger/index.vue';
import ChecklistShiftTrigger from '@/components/organisms/settings/ChecklistTriggerBlock/ChecklistShiftTrigger/index.vue';
import { alertSubtypes } from '@/constants/alerts';

const icons = {
  mdiPlus, mdiDelete, mdiClockOutline, mdiSubdirectoryArrowRight, mdiInformationOutline, mdiCloseCircle,
};

export default {
  name: 'ChecklistTriggerBlock',
  components: {
    EvoconVChip,
    EvoconDurationChip,
    EvoconVButton,
    SelectionInput,
    IconWithTooltip,
    MenuWithButtonActivator,
    ChecklistPeriodicTrigger,
    ChecklistIntervalTrigger,
    ChecklistChangeoverTrigger,
    ChecklistQuantityTrigger,
    ChecklistDowntimeTrigger,
    ChecklistManualTrigger,
    ChecklistShiftTrigger,
  },
  props: {
    requirements: {
      type: Object,
      default: () => {},
    },
    savedRequirements: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['update:requirements', 'update:has-trigger-error', 'update:is-trigger-complete'],
  data() {
    return {
      ...icons,
      checklistTypes,
      isIntervalBlockVisible: false,
      minIntervalTimeInMinutes: 1,
      isLocationBlockVisible: false,
      isCurrentTriggerComplete: false,
      hasCurrentTriggerError: false,
    };
  },
  computed: {
    ...mapState(usePositionStore, ['positionsWithAdminPermissions', 'positionsMap']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useConfigurationStore, ['adminChecklistStations']),
    isChangeoverAfterMode() {
      return this.requirements.type === checklistTypes.CHANGEOVER && !this.requirements.leadTime;
    },
    currentTriggerComponent() {
      if (this.requirements.type === this.checklistTypes.PERIODIC) return 'ChecklistPeriodicTrigger';
      if (this.requirements.type === this.checklistTypes.INTERVAL) return 'ChecklistIntervalTrigger';
      if (this.requirements.type === this.checklistTypes.CHANGEOVER) return 'ChecklistChangeoverTrigger';
      if (this.requirements.type === this.checklistTypes.QUANTITY) return 'ChecklistQuantityTrigger';
      if (this.isDowntimeTrigger) return 'ChecklistDowntimeTrigger';
      if (this.requirements.type === this.checklistTypes.MANUAL) return 'ChecklistManualTrigger';
      if (this.requirements.type === this.checklistTypes.SHIFT) return 'ChecklistShiftTrigger';
      return null;
    },
    isDowntimeTrigger() {
      return this.requirements.type === checklistTypes.STOPREASON;
    },
    frequenciesList() {
      return getChecklistFrequenciesList();
    },
    periodicFrequenciesList() {
      return getPeriodicFrequenciesList();
    },
    additionalMenuItems() {
      const items = [
        {
          id: 'interval',
          text: this.$t('Add interval'),
          isVisible: this.isChangeoverAfterMode,
          isSelected: this.isIntervalBlockVisible,
          action: () => {
            this.isIntervalBlockVisible = !this.isIntervalBlockVisible;
            if (!this.isIntervalBlockVisible) {
              this.$emit('update:requirements', { intervalTime: null });
            }
            if (this.requirements.type === checklistTypes.CHANGEOVER) {
              this.$emit('update:requirements', { resetOnShiftStart: false });
            }
          },
        },
        {
          id: 'resetOnShiftStart',
          text: this.$t('Reset at shift start'),
          isVisible: [checklistTypes.INTERVAL, checklistTypes.QUANTITY].includes(this.requirements.type) || this.isChangeoverAfterMode,
          isSelected: this.requirements.resetOnShiftStart,
          action: () => {
            const newVal = !this.requirements.resetOnShiftStart;
            this.$emit('update:requirements', { resetOnShiftStart: newVal });
            if (newVal && this.requirements.type === checklistTypes.CHANGEOVER) {
              this.isIntervalBlockVisible = true;
            }
          },
          isNew: [checklistTypes.CHANGEOVER, checklistTypes.QUANTITY].includes(this.requirements.type),
        },
        {
          text: this.$t('Reset at product changeover'),
          isVisible: [checklistTypes.INTERVAL, checklistTypes.QUANTITY].includes(this.requirements.type),
          isSelected: this.requirements.resetOnChangeover,
          action: () => {
            this.$emit('update:requirements', { resetOnChangeover: !this.requirements.resetOnChangeover });
          },
          isNew: true,
        },
        {
          text: this.$t('Pause timer during downtime'),
          isVisible: this.requirements.type === checklistTypes.INTERVAL || this.isChangeoverAfterMode,
          isSelected: this.requirements.pauseDuringDowntime,
          iconTooltip: this.$t('This option excludes machine downtime. E.g. if 10 minutes of downtime occur, the checklist will be displayed 10 minutes later'),
          action: () => {
            this.$emit('update:requirements', { pauseDuringDowntime: !this.requirements.pauseDuringDowntime });
          },
        },
        {
          id: 'location',
          text: this.$t('Machine location'),
          isVisible: this.isDowntimeTrigger,
          isSelected: this.isLocationBlockVisible,
          action: () => {
            this.isLocationBlockVisible = !this.isLocationBlockVisible;
            this.$emit('update:requirements', { positionIds: [] });
          },
        },
        {
          text: this.$t('Allow manual activation'),
          isVisible: this.requirements.type !== checklistTypes.MANUAL,
          isSelected: this.requirements.manualAllowed,
          action: () => {
            this.$emit('update:requirements', { manualAllowed: !this.requirements.manualAllowed });
          },
        },
      ];
      return items.filter((item) => item.isVisible);
    },
    areAllAdditionalMenuItemsSelected() {
      return this.additionalMenuItems.every((item) => item.isSelected);
    },
    hasChangeoverIntervalError() {
      if (this.requirements.type === checklistTypes.CHANGEOVER && this.isIntervalBlockVisible) {
        return this.requirements.intervalTime !== null && this.requirements.intervalTime < this.minIntervalTimeInMinutes * 60;
      }
      return false;
    },
    isTriggerComplete() {
      if (!this.requirements.type || this.hasTriggerError) return false;
      if (this.requirements.type === checklistTypes.MANUAL) return true;
      if (this.requirements.type === checklistTypes.CHANGEOVER) {
        if (this.isIntervalBlockVisible) return this.requirements.intervalTime !== null;
        return true;
      }
      return this.isCurrentTriggerComplete;
    },
    hasTriggerError() {
      if (this.hasChangeoverIntervalError) return true;
      return this.hasCurrentTriggerError;
    },
    availableStationIds() {
      return this.requirements.stationIds.length ? this.requirements.stationIds : this.adminChecklistStations;
    },
    filteredPositions() {
      return this.positionsWithAdminPermissions.filter((position) => {
        const isStationSelected = position.stationIds.some((id) => this.availableStationIds.includes(id));
        const hasAllComments = position.commentsEnabled && position.commentIds.length === 0;
        const noCommentFilter = this.requirements.commentIds?.length === 0;
        const isCommentSelected = hasAllComments || noCommentFilter
          || position.commentIds.some((id) => this.requirements.commentIds?.includes(id));
        return isStationSelected && isCommentSelected;
      });
    },
    isResetDisabled() {
      return Object.entries(this.savedRequirements).every(([key, value]) => {
        if (key === 'times') {
          if (this.savedRequirements.times.length !== this.requirements.times.length) return false;
          return this.savedRequirements.times.every((time, i) => time.substring(0, 5) === this.requirements.times[i]?.substring(0, 5));
        }
        return isEqual(value, this.requirements[key]);
      });
    },
  },
  watch: {
    isTriggerComplete: {
      handler(newVal) {
        this.$emit('update:is-trigger-complete', newVal);
      },
      immediate: true,
    },
    hasTriggerError(newVal) {
      this.$emit('update:has-trigger-error', newVal);
    },
    'requirements.type'(newType, oldType) {
      if (newType !== oldType) {
        this.isCurrentTriggerComplete = false;
        this.hasCurrentTriggerError = false;
      }
    },
    'requirements.leadTime'(newVal) {
      if (newVal > 0 && this.isIntervalBlockVisible) {
        this.isIntervalBlockVisible = false;
        this.$emit('update:requirements', { intervalTime: null, resetOnShiftStart: false, pauseDuringDowntime: false });
      }
    },
  },
  async mounted() {
    await nextTick();
    this.setAdditionalBlocksVisibility();
  },
  methods: {
    onSelectType(type, reset = false) {
      if (reset) this.resetTrigger('selector');
      this.$emit('update:has-trigger-error', false);
      if (type === checklistTypes.PERIODIC) this.$emit('update:requirements', { subType: this.periodicFrequenciesList[0].id });
      this.$emit('update:requirements', { type });
    },
    resetTrigger(source, useSavedRequirements = false) {
      // just reset everything to state where nothing is selected, do not reset filters
      this.$emit('update:requirements', useSavedRequirements
        ? this.savedRequirements
        : {
          type: '',
          intervalTime: null,
          delayTime: 0,
          leadTime: 0,
          pauseDuringDowntime: false,
          resetOnShiftStart: false,
          resetOnChangeover: false,
          manualAllowed: false,
          daysOfWeek: [],
          times: [''],
          targetQty: null,
          commentIds: [],
          positionIds: [],
          offsetFromStartSeconds: null,
          offsetFromEndSeconds: null,
        });
      this.setAdditionalBlocksVisibility();
    },
    // used when validating form
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      if (!this.requirements.type) {
        this.$emit('update:has-trigger-error', true);
      }
      if (this.requirements.type === checklistTypes.CHANGEOVER && this.isIntervalBlockVisible && !this.isTriggerComplete) {
        this.$emit('update:requirements', { intervalTime: 0 });
      } else {
        this.$refs.triggerRef?.validate?.();
      }
    },
    async setAdditionalBlocksVisibility() {
      await nextTick();
      this.isIntervalBlockVisible = this.requirements.type === checklistTypes.CHANGEOVER && this.requirements.intervalTime > 0;
      if (this.isDowntimeTrigger) {
        this.isLocationBlockVisible = this.requirements.positionIds.length > 0;
        const downtimeSubType = this.requirements.setpoint === 0 ? alertSubtypes.ADDED : alertSubtypes.EXCEEDS;
        this.$refs.triggerRef?.updateSubType?.(downtimeSubType);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.frequency-row {
  line-height: 32px;
}

.additional-item__text {
  max-width: calc(100% - 28px);
  overflow: hidden;
}
</style>
