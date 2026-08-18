<template>
  <selection-input
    v-if="requirements.type"
    :model-value="[requirements.type]"
    :items="getAlertTypesArray()"
    use-chips
    is-single-select
    hide-search
    required
    menu-input-class="ma-1"
    @update:model-value="onAlertTypeChange($event[0])"
  />
  <div v-else>
    <evocon-v-chip
      v-for="alertType in getAlertTypesArray()"
      :key="alertType.id"
      :label="alertType.name"
      class="ma-1"
      @click="onAlertTypeChange(alertType.id)"
    />
  </div>
  <template v-if="isChecklistAlert">
    <selection-input
      :model-value="requirements.checklistIds"
      :items="filteredChecklistTemplates"
      :groups="checklistGroups"
      :prepend-text="`${$t('Checklist name')}:`"
      use-chips
      is-grouped-select
      groups-order-by="ordering"
      numeric-order-by
      show-empty-array-as-all-selected
      remove-non-existent-selections
      menu-input-class="ma-1"
      @update:model-value="$emit('update:requirements', { checklistIds: $event })"
    />
    <selection-input
      :model-value="requirements.checklistStatuses"
      :items="getChecklistAlertStatuses"
      :prepend-text="`${$t('Result')}:`"
      use-chips
      hide-search
      show-empty-array-as-all-selected
      menu-input-class="ma-1"
      @update:model-value="$emit('update:requirements', { checklistStatuses: $event })"
    />
  </template>
  <template v-if="isDowntimeAlert">
    <selection-input
      :model-value="requirements.commentIds"
      :items="filteredComments"
      :groups="commentGroupsIncludePredefined"
      :prepend-text="`${$t('Stops')}:`"
      use-chips
      is-grouped-select
      groups-order-by="ordering"
      numeric-order-by
      show-empty-array-as-all-selected
      remove-non-existent-selections
      menu-input-class="ma-1"
      @update:model-value="$emit('update:requirements', { commentIds: $event })"
    />
    <selection-input
      :model-value="requirements.positionIds"
      :items="filteredPositionsByComments"
      :prepend-text="`${$t('Machine locations')}:`"
      item-text="primaryName"
      item-value="id"
      use-chips
      show-empty-array-as-all-selected
      remove-non-existent-selections
      menu-input-class="ma-1"
      @update:model-value="$emit('update:requirements', { positionIds: $event })"
    />
    <selection-input
      :model-value="[alertSubtype]"
      :items="alertSubtypesArray"
      use-chips
      is-single-select
      hide-search
      required
      menu-input-class="ma-1"
      @update:model-value="onAlertSubtypeChange"
    />
    <template v-if="alertSubtype === alertSubtypes.EXCEEDS">
      <evocon-duration-chip
        :model-value="requirements.setpoint"
        class="ma-1"
        :error="hasStopReasonDurationError"
        :max-hours="99"
        @update:model-value="$emit('update:requirements', { setpoint: $event })"
      />
      <span v-if="hasStopReasonDurationError" class="ml-1 text-body-small text-error"> {{ $t('At least {value} min', { value: 5 }) }}</span>
    </template>
    <div v-if="alertSubtype === alertSubtypes.REPEATS" class="d-flex align-center">
      <evocon-number-input
        :model-value="requirements.count"
        :error="hasStopReasonCountError"
        :suffix="$t('times')"
        :allow-float="false"
        class="ma-1"
        use-chip
        grow
        @update:model-value="$emit('update:requirements', { count: $event })"
      />
      <span v-if="hasStopReasonCountError" class="ml-1 text-body-small text-error mr-1"> {{ $t('At least {value} times', { value: 2 }) }}</span>
      <div class="ml-1 d-flex align-center">
        <span class="text-body-medium">{{ $t('in a shift') }}</span>
        <icon-with-tooltip
          v-if="!isMobileView"
          additional-classes="ml-2"
          :icon="mdiInformationOutline"
          :tooltip-text="$t('Another alert will follow if this threshold is reached.')"
        />
      </div>
    </div>
  </template>
  <template v-if="isScrapAlert">
    <selection-input
      :model-value="requirements.scrapReasonIds"
      :items="filteredScrapReasons"
      :groups="scrapReasonGroupsInclUncommented"
      :prepend-text="`${$t('Scrap reasons')}:`"
      use-chips
      is-grouped-select
      groups-order-by="ordering"
      numeric-order-by
      show-empty-array-as-all-selected
      remove-non-existent-selections
      menu-input-class="ma-1"
      @update:model-value="$emit('update:requirements', { scrapReasonIds: $event })"
    />
    <div class="d-flex white-space-nowrap flex-wrap align-center">
      <span class="text-body-medium mx-1">{{ $t('count reaches') }}</span>
      <evocon-number-input
        :model-value="requirements.intervalQty"
        :error="hasScrapReasonIntervalQtyError"
        :suffix="$t('primary units')"
        class="ma-1"
        use-chip
        grow
        @update:model-value="$emit('update:requirements', { intervalQty: $event })"
      />
      <div class="ml-1 d-flex align-center">
        <span class="text-body-medium">{{ $t('in a shift per batch') }}</span>
        <icon-with-tooltip
          v-if="!isMobileView"
          additional-classes="ml-2"
          :icon="mdiInformationOutline"
          :tooltip-text="$t('Another alert will follow if this threshold is reached.')"
        />
      </div>
    </div>
  </template>
  <template v-if="isChangeoverAlert">
    <selection-input
      :model-value="[alertSubtype]"
      :items="alertSubtypesArray"
      use-chips
      is-single-select
      hide-search
      required
      menu-input-class="ma-1"
      @update:model-value="onAlertSubtypeChange"
    />
  </template>
  <evocon-v-button
    v-if="requirements.type"
    :text="$t('Reset')"
    size="small"
    type="secondary"
    class="ma-1"
    :class="isMobileView ? 'ml-auto mr-0' : 'ml-2'"
    :disabled="isTriggerResetDisabled"
    @click="resetTrigger"
  />
</template>

<script>
import { isEqual } from 'lodash';
import { mapState } from 'pinia';
import { nextTick } from 'vue';
import { mdiInformationOutline } from '@mdi/js';

import useCommentStore from '@/stores/comment';
import useScrapReasonStore from '@/stores/scrapReason';
import useFactoryStore from '@/stores/factory';
import useDeviceStore from '@/stores/device';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import { alertTypes, alertSubtypes, getAlertTypesArray } from '@/constants/alerts';
import { getChecklistAlertStatuses } from '@/constants/checklistsConstants';
import EvoconDurationChip from '@/components/atoms/EvoconDurationChip/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';

const icons = { mdiInformationOutline };

export default {
  name: 'AlertTriggerBlock',
  components: {
    EvoconVChip,
    EvoconDurationChip,
    SelectionInput,
    EvoconVButton,
    EvoconNumberInput,
    IconWithTooltip,
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
    filteredPositions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:requirements', 'update:has-trigger-error', 'update:is-trigger-complete', 'alert-subtype-change'],
  data() {
    return {
      ...icons,
      alertSubtypes,
      alertSubtype: null,
    };
  },
  computed: {
    ...mapState(useCommentStore, ['comments', 'commentGroupsIncludePredefined']),
    ...mapState(useChecklistTemplateStore, ['checklistTemplates', 'checklistGroups']),
    ...mapState(useScrapReasonStore, ['scrapReasons', 'scrapReasonGroupsInclUncommented']),
    ...mapState(useFactoryStore, ['getFactoryIdsByStationIds']),
    ...mapState(useDeviceStore, ['isMobileView']),
    getChecklistAlertStatuses,
    isDowntimeAlert() {
      return this.requirements.type === alertTypes.STOPREASON;
    },
    isChecklistAlert() {
      return this.requirements.type === alertTypes.CHECKLIST;
    },
    isScrapAlert() {
      return this.requirements.type === alertTypes.SCRAPREASON;
    },
    isChangeoverAlert() {
      return this.requirements.type === alertTypes.CHANGEOVER;
    },
    hasStopReasonDurationError() {
      return this.alertSubtype === alertSubtypes.EXCEEDS && this.requirements.setpoint < 5 * 60 && this.requirements.setpoint !== null;
    },
    hasStopReasonCountError() {
      return this.alertSubtype === alertSubtypes.REPEATS && this.requirements.count < 2 && this.requirements.count !== null;
    },
    hasScrapReasonIntervalQtyError() {
      return this.requirements.intervalQty < 1 && this.requirements.intervalQty !== null;
    },
    alertSubtypesArray() {
      if (this.isDowntimeAlert) {
        return [
          {
            id: alertSubtypes.EXCEEDS, name: this.$t('Lasts longer than'), durationDefault: null, countDefault: 1,
          },
          {
            id: alertSubtypes.ADDED, name: this.$t('Is added'), durationDefault: 0, countDefault: 1,
          },
          {
            id: alertSubtypes.REPEATS, name: this.$t('Repeats'), durationDefault: 0, countDefault: null,
          },
        ];
      }
      if (this.isChangeoverAlert) {
        return [
          {
            id: alertSubtypes.ADDED, name: this.$t('Is added'),
          },
          {
            id: alertSubtypes.PLANNED_QTY, name: this.$t('Target reached'),
          },
        ];
      }
      return [];
    },
    isTriggerResetDisabled() {
      if (this.isChecklistAlert) return false;
      if (this.isDowntimeAlert) {
        return this.getIsTriggerResetDisabled('commentIds')
          && isEqual(this.requirements.positionIds, this.savedRequirements.positionIds);
      }
      return this.getIsTriggerResetDisabled('scrapReasonIds');
    },
    isTriggerComplete() {
      if (!this.requirements.type) return false;
      if (this.isDowntimeAlert) {
        if (this.alertSubtype === alertSubtypes.EXCEEDS) return this.requirements.setpoint !== null;
        if (this.alertSubtype === alertSubtypes.REPEATS) return this.requirements.count !== null;
      }
      if (this.isScrapAlert) return this.requirements.intervalQty !== null;
      return true;
    },
    filteredPositionsByComments() {
      if (!this.requirements.commentIds?.length) return this.filteredPositions;
      const selectedIds = new Set(this.requirements.commentIds);
      return this.filteredPositions.filter((pos) => pos.commentsEnabled
        && (!pos.commentIds?.length || pos.commentIds.some((id) => selectedIds.has(id))));
    },
    filteredComments() {
      return this.comments.filter((comment) => {
        if ([alertSubtypes.ADDED].includes(this.alertSubtype) && comment.id === 0) return false;
        return this.filterEntities('factoryIds', comment, alertTypes.STOPREASON) && this.filterEntities('stationIds', comment, alertTypes.STOPREASON);
      });
    },
    filteredChecklistTemplates() {
      return this.checklistTemplates.filter((checklist) => this.filterEntities('factoryIds', checklist, alertTypes.CHECKLIST) && this.filterEntities('stationIds', checklist, alertTypes.CHECKLIST));
    },
    filteredScrapReasons() {
      return this.scrapReasons.filter(
        (scrapReason) => this.filterEntities('factoryIds', scrapReason, alertTypes.SCRAPREASON) && this.filterEntities('stationIds', scrapReason, alertTypes.SCRAPREASON),
      );
    },
  },
  watch: {
    hasStopReasonDurationError(val) {
      this.$emit('update:has-trigger-error', val);
    },
    hasStopReasonCountError(val) {
      this.$emit('update:has-trigger-error', val);
    },
    hasScrapReasonIntervalQtyError(val) {
      this.$emit('update:has-trigger-error', val);
    },
    isTriggerComplete(val) {
      this.$emit('update:is-trigger-complete', val);
    },
    alertSubtype(val) {
      this.$emit('alert-subtype-change', val);
    },
  },
  async mounted() {
    await nextTick();
    this.setAlertSubtype(this.requirements);
    if (this.isTriggerComplete) {
      this.$emit('update:is-trigger-complete', true);
    }
  },
  methods: {
    getAlertTypesArray,
    getIsTriggerResetDisabled(entity) {
      return isEqual(this.requirements[entity], this.savedRequirements[entity])
        && this.requirements.type === this.savedRequirements.type
        && this.requirements.setpoint === this.savedRequirements.setpoint
        && this.requirements.count === this.savedRequirements.count
        && this.requirements.intervalQty === this.savedRequirements.intervalQty;
    },
    filterEntities(filterName, entity, type) {
      if (this.requirements[filterName].length === 0) return true;
      if (type === alertTypes.CHECKLIST && filterName === 'factoryIds') {
        if (!entity.stationIds.length) return true;
        return this.getFactoryIdsByStationIds(entity.stationIds).some((fId) => this.requirements[filterName].includes(fId));
      }
      return entity[filterName].length === 0 || this.requirements[filterName].some((fId) => entity[filterName].includes(fId));
    },
    onAlertTypeChange(alertTypeId) {
      if (alertTypeId === alertTypes.STOPREASON) this.alertSubtype = alertSubtypes.EXCEEDS;
      else if (alertTypeId === alertTypes.SCRAPREASON) this.alertSubtype = alertSubtypes.SCRAP_QTY;
      else if (alertTypeId === alertTypes.CHANGEOVER) this.alertSubtype = alertSubtypes.ADDED;
      this.$emit('update:requirements', { type: alertTypeId, subType: this.alertSubtype });
      this.$emit('update:has-trigger-error', false);
    },
    onAlertSubtypeChange(value) {
      [this.alertSubtype] = value;
      if (this.isChangeoverAlert) {
        this.$emit('update:requirements', { subType: this.alertSubtype });
      } else if (this.isDowntimeAlert) {
        const duration = this.alertSubtypesArray.find((option) => option.id === value[0]).durationDefault;
        const count = this.alertSubtypesArray.find((option) => option.id === value[0]).countDefault;
        this.$emit('update:requirements', {
          setpoint: duration,
          count,
        });
        if ([alertSubtypes.ADDED, alertSubtypes.REPEATS].includes(this.alertSubtype)) {
          const commentIds = this.requirements.commentIds.length
            ? this.requirements.commentIds.filter((id) => id !== 0)
            : this.filteredComments.map((comment) => comment.id);
          this.$emit('update:requirements', { commentIds });
        }
      }
    },
    resetTrigger() {
      if (this.savedRequirements.type === alertTypes.STOPREASON) {
        this.$emit('update:requirements', {
          type: this.savedRequirements.type,
          setpoint: this.savedRequirements.setpoint,
          count: this.savedRequirements.count,
          commentIds: this.savedRequirements.commentIds,
          positionIds: this.savedRequirements.positionIds,
        });
      } else if (this.savedRequirements.type === alertTypes.SCRAPREASON) {
        this.$emit('update:requirements', {
          type: this.savedRequirements.type,
          intervalQty: this.savedRequirements.intervalQty,
          scrapReasonIds: this.savedRequirements.scrapReasonIds,
        });
      } else this.$emit('update:requirements', { type: this.savedRequirements.type });
      this.setAlertSubtype(this.savedRequirements);
    },
    setAlertSubtype(obj) {
      switch (obj.type) {
        case alertTypes.STOPREASON:
          if (obj.setpoint === 0 && obj.count > 1) this.alertSubtype = alertSubtypes.REPEATS;
          else if (obj.setpoint === 0) this.alertSubtype = alertSubtypes.ADDED;
          else this.alertSubtype = alertSubtypes.EXCEEDS;
          break;
        case alertTypes.CHANGEOVER:
          this.alertSubtype = obj.subType || alertSubtypes.ADDED;
          break;
        default:
          this.alertSubtype = null;
      }
    },
    // used when validating form
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      if (!this.requirements.type) {
        this.$emit('update:has-trigger-error', true);
      }
    },
  },
};
</script>
