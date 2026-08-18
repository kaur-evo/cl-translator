<template>
  <div>
    <dialog-toolbar
      id="scrap-dialog-toolbar"
      color="secondary"
      :title="dialogTitle"
    />
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    />
    <v-card-text
      v-else
      class="pt-4 pb-2 dialog-content"
      :class="[isMobileView ? 'px-4' : 'px-3']"
    >
      <v-form
        ref="form"
        v-model="valid"
      >
        <div
          v-if="showMostUsedReasonsAndSearch"
          ref="search-and-topReasons"
        >
          <span v-if="topReasons.length" class="text-label-small text-secondary-text">
            {{ $t('Most used reasons') }}
          </span>
          <v-card
            v-if="topReasons.length || topReasonsLoading"
            id="most-used-reasons"
            :flat="!isMobileView"
            class="px-1"
            :class="{ 'px-2 my-2': isMobileView, 'rounded-0': !isMobileView }"
          >
            <v-progress-linear
              v-if="topReasonsLoading"
              indeterminate
              color="primary"
            />
            <div
              v-else
              class="justify-start my-1"
            >
              <evocon-v-chip
                v-for="(reason, i) in topReasons"
                :key="`chip${i}`"
                :value="reason.entityId"
                :label="reason.name"
                :disabled="reason.disabled"
                type="primary"
                :active="reason.entityId === formData.scrapReasonId"
                class="my-1 mr-2"
                :size="isMobileView ? 'small' : 'default'"
                :dark="false"
                @select="selectReason(reason.entityId)"
              />
            </div>
          </v-card>
          <shiftview-search
            v-if="!isMobileView"
            id="scrap-reason-search"
            :items="shiftviewStationScrapReasons"
            class="mt-3 mb-4"
            :class="{ 'px-1': !isMobileView }"
            :density="isMobileView ? 'compact' : 'default'"
            @item-selected="selectReason($event.id)"
          />
        </div>
        <selection-input
          v-if="isMobileView"
          :model-value="[formData.scrapReasonId]"
          :hint="$t('Scrap reason')"
          :items="shiftviewStationScrapReasons"
          :groups="scrapReasonGroups"
          :placeholder="$t('Scrap reason')"
          is-single-select
          is-grouped-select
          required
          dense
          @update:model-value="selectReason($event[0])"
        />
        <v-row v-else>
          <v-col
            v-if="areGroupsVisible"
            :cols="6"
            class="pl-1 pr-2"
          >
            <shiftview-select
              id="scrap-group-selector"
              v-model="scrapGroupId"
              :items="filteredGroups"
              :subtitle="$t('Groups')"
              :item-append-icon="mdiChevronRight"
              :height="selectHeight"
              mandatory
            />
          </v-col>
          <v-col
            v-if="shiftviewStationScrapReasons.length > 0"
            :cols="areGroupsVisible ? 6 : 12"
            class="pr-1"
            :class="areGroupsVisible ? 'pl-2' : 'pl-1'"
          >
            <shiftview-select
              id="scrap-reason-selector"
              v-model="formData.scrapReasonId"
              :items="filteredReasons"
              :title="scrapGroupId ? scrapReasonGroupsRealMap.get(scrapGroupId).name : ''"
              :subtitle="$t('Reasons')"
              :height="selectHeight"
              @update:model-value="selectScrapReason"
            />
          </v-col>
        </v-row>
        <v-row class="mt-3">
          <v-col
            :cols="isMobileView ? 12 : 6"
            :class="{ 'px-1': !isMobileView }"
            class="mb-2"
          >
            <selection-input
              :model-value="[selectedBatchId]"
              :items="shiftBatchesWithProduction"
              :placeholder="$t('Product')"
              :hint="$t('Product')"
              :disabled="!isAddFromOverview || shiftBatchesWithProduction.length === 1"
              :dark="false"
              is-single-select
              hide-search
              required
              @update:model-value="selectedBatchId = $event[0]"
            />
          </v-col>
          <v-col
            :cols="isMobileView ? 12 : 6"
            :class="{ 'px-1': !isMobileView }"
            class="mb-2"
          >
            <evocon-v-input-with-selector
              id="scrap-qty-input"
              v-model.trim="formData.scrapQty"
              :placeholder="$t('Scrap quantity')"
              :hint="qtyHint"
              :items="units"
              :selected-item="formData.unitId"
              persistent-hint
              :rules="[qtyRule]"
              type="number"
              :disabled="!formData.scrapReasonId && shiftviewStationScrapReasons.length > 0"
              @selection="onUnitChange"
            />
          </v-col>
        </v-row>
        <evocon-v-combobox
          v-model="formData.scrapNotes"
          :hint="isNoteRequired ? $t('Extra note') : (`${$t('Extra note')} (${$t('Optional').toLowerCase()})`)"
          :rules="[isNoteValid]"
          :class="{ 'px-1': !isMobileView }"
          max-length="500"
          :items="scrapNoteSuggestions"
          validate-on-blur
          :density="isMobileView ? 'compact' : 'default'"
          @update:model-value="onNoteInput"
        />
      </v-form>
    </v-card-text>
    <v-card-actions
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <delete-button
        v-if="canDeleteScrap"
        @click="deleteScrap"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="closeScrapDialog"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Save')"
        :loading="saveLoading"
        :disabled="isSaveBtnDisabled"
        @click="onSave"
      />
    </v-card-actions>
  </div>
</template>
<script>
import { mdiChevronRight, mdiPencil } from '@mdi/js';
import { isAfter, isBefore } from 'date-fns';
import round from 'lodash/round';
import { mapState, mapActions } from 'pinia';

import {
  useStationStore, useScrapReasonStore, useShiftStore, useShiftviewTimelineStore,
  useShiftviewSelectionStore, useGenericDialogStore, useDeviceStore, useProfileStore,
  useGenericNotificationStore, useConfirmDialogStore,
} from '@/stores/index';
import groupScrap from '@/helpers/timeline/groupScrap';
import scrapApi from '@/api/scrapReasonApi';
import { eventBus } from '@/eventBus';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVCombobox from '@/components/atoms/EvoconVCombobox/index.vue';
import addItemToLocalStorageArray from '@/helpers/localStorage/addItem';
import getItemsFromLocalStorageArray from '@/helpers/localStorage/getItemsFromLocalStorageArray';
import ShiftviewSelect from '@/components/organisms/shiftview/ShiftviewSelect/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import statisticsApi from '@/api/statisticsApi';
import ShiftviewSearch from '@/components/organisms/shiftview/ShiftviewSearch/index.vue';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import EvoconVInputWithSelector from '@/components/atoms/EvoconVInputWithSelector/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { getSelectedBatchUnits } from '@/helpers/timeline/selectedBatchUnits';
import { getUnitId } from '@/helpers/timeline/altUnitConversion';
import { convertQuantityOnUnitChange } from '@/helpers/timeline/convertQuantityOnUnitChange';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';
import { DIALOG_HEIGHT_PTC } from '@/constants/dialog';

const icons = { mdiChevronRight, mdiPencil };
export default {
  name: 'EditScrapDialog',
  components: {
    DialogToolbar,
    EvoconVCombobox,
    ShiftviewSelect,
    EvoconVButton,
    DeleteButton,
    ShiftviewSearch,
    EvoconVChip,
    EvoconVInputWithSelector,
    SelectionInput,
  },
  data() {
    return {
      ...icons,
      valid: true,
      selectedBatchId: undefined,
      scrapGroupId: 0,
      formData: {
        scrapQty: 0,
        scrapReasonId: undefined,
        scrapNotes: '',
        unitId: '',
      },
      isNoteValid: true,
      isNoteRequired: false,
      saveLoading: false,
      selectHeight: '300px',
      preselectedReasonId: 0,
      preselectedQty: 0,
      preselectedNote: '',
      topReasonsLoading: false,
      topReasons: [],
      loading: false,
    };
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useScrapReasonStore, ['shiftviewStationScrapReasons', 'scrapReasonsRealMap', 'scrapReasonGroupsWithOrdering', 'scrapReasonGroupsRealMap', 'scrapReasonGroups']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useShiftviewTimelineStore, ['timeline', 'batches']),
    ...mapState(useShiftviewSelectionStore, ['bracketSelectedSlices', 'firstSelectedSlice']),
    ...mapState(useGenericDialogStore, ['dialogData', 'previousState']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView', 'screenWidth', 'screenHeight']),
    ...mapState(useProfileStore, ['language']),
    selectedScrapReason() {
      const reasonId = this.formData.scrapReasonId ?? 0;
      if (this.scrapReasonsRealMap.has(reasonId)) {
        return this.scrapReasonsRealMap.get(reasonId);
      }
      return {};
    },
    isMainUnitSelected() {
      return this.formData.unitId === this.batches.get(this.selectedBatchId)?.unitId;
    },
    mainToAltUnitConversion() {
      return getBatchMainToAltUnitConversion(this.batches.get(this.selectedBatchId) || {}) || 1;
    },
    unitMultiplier() {
      return this.isMainUnitSelected ? 1 : this.mainToAltUnitConversion;
    },
    selectedBatch() {
      return this.batches.get(this.selectedBatchId);
    },
    units() {
      return getSelectedBatchUnits(this.selectedBatch);
    },
    isAddFromOverview() {
      return this.bracketSelectedSlices.length === 0 && !this.dialogData.selectedScrapBatch;
    },
    isEditFromOverview() {
      return this.bracketSelectedSlices.length === 0 && !!this.dialogData.selectedScrapBatch;
    },
    isEditFromSignals() {
      return this.bracketSelectedSlices.length > 0 && this.bracketSelectedSlices.every((slice) => slice.scrapQty > 0);
    },
    dialogTitle() {
      const selectedReason = this.formData.scrapReasonId ? this.scrapReasonsRealMap.get(this.formData.scrapReasonId).name : this.$t('Uncommented');
      if (this.isMobileView) return selectedReason;
      let time = '';
      if (this.bracketSelectedSlices.length > 1) {
        time = this.getTimeRangeString(this.firstSelectedSlice.sliceEndTmISO, this.bracketSelectedSlices[this.bracketSelectedSlices.length - 1].sliceEndTmISO);
      } else if (this.bracketSelectedSlices.length === 1) {
        time = formatTimeInZone(this.firstSelectedSlice.sliceEndTmISO, this.lineviewStation.zoneId);
      } else if (this.isEditFromOverview) { // no selected slices - edit from overview
        const ranges = this.dialogData.selectedScrapBatch.scrapRanges;
        time = this.getTimeRangeString(ranges[0].startTimeISO, ranges[ranges.length - 1].endTimeISO);
      } else if (this.isAddFromOverview) { // no selected slices - add from overview
        if (!this.selectedBatchId || !this.scrapBatches) return '';
        try {
          const { start, end } = this.scrapBatches[this.selectedBatchId];
          time = this.getTimeRangeString(start, end);
        } catch {
          time = '';
        }
      }
      return `${selectedReason} ${time}`;
    },
    scrapNoteSuggestions() {
      return getItemsFromLocalStorageArray('scrapNoteSuggestions', this.formData.scrapNotes || '');
    },
    scrapBatches() {
      return groupScrap(this.timeline);
    },
    maxMainQtyValue() {
      if (!this.selectedBatchId) return 0;
      const selectedScrapBatch = this.scrapBatches[this.selectedBatchId];
      const batchGoodQty = selectedScrapBatch.qty - selectedScrapBatch.scrapQty;
      if (this.isAddFromOverview) return batchGoodQty;
      if (this.isEditFromOverview) return batchGoodQty + this.dialogData.selectedScrapBatch.scrapQty;
      return this.bracketSelectedSlices.reduce((acc, slice) => acc + slice.quantity, 0);
    },
    maxSelectedQtyValue() {
      return this.maxMainQtyValue * this.unitMultiplier;
    },
    selectedSlicesProperties() {
      return this.bracketSelectedSlices.reduce((acc, el) => {
        const reason = el.scrapReasonId;
        const note = el.scrapNotes;
        if (!acc.scrapReasons.includes(reason)) {
          if (reason) acc.scrapReasons.push(reason);
          else acc.hasEmptyReason = true;
        }
        if (!acc.scrapNotes.includes(note)) {
          if (note) acc.scrapNotes.push(note);
          else acc.hasEmptyNote = true;
        }
        acc.scrapQty += el.scrapQty;
        if (el.scrapQty === 0 && !acc.hasSliceWOScrap) acc.hasSliceWOScrap = true;
        return acc;
      }, {
        hasEmptyReason: false, scrapReasons: [], hasEmptyNote: false, scrapNotes: [], scrapQty: 0, hasSliceWOScrap: false,
      });
    },
    areGroupsVisible() {
      return this.filteredGroups.length > 1;
    },
    filteredReasons() {
      return this.shiftviewStationScrapReasons.filter((comment) => comment.groupId === this.scrapGroupId);
    },
    filteredGroups() {
      const groupsFromComments = [];
      this.shiftviewStationScrapReasons.forEach((comment) => {
        if (groupsFromComments.indexOf(comment.groupId) === -1) groupsFromComments.push(comment.groupId);
      });
      return this.scrapReasonGroupsWithOrdering.filter((group) => ((!group.local || group.factoryIds.includes(this.lineviewStation.factoryId)) && groupsFromComments.includes(group.id)));
    },
    qtyRule() {
      if (this.formData.scrapQty === '') return true;
      if (this.selectedScrapReason?.increaseTotalQty) {
        if (!this.formData.scrapQty) return this.$t('Enter quantity');
        return true;
      }
      const qty = Number(this.formData.scrapQty);
      if (qty === 0) return this.$t('Quantity cannot be 0');
      if (qty > this.maxSelectedQtyValue) {
        let hint = this.$t('Maximum quantity: {value}', { value: this.formatNumber(this.maxSelectedQtyValue) });
        if (this.bracketSelectedSlices.length > 0) {
          hint += ` (${this.$t('use brackets to select more signals')})`;
        }
        return hint;
      }
      return true;
    },
    qtyHint() {
      if (this.selectedScrapReason?.increaseTotalQty) {
        return this.$t('Enter quantity');
      }
      return `${this.$t('Maximum quantity: {value}', { value: formatNumber(this.maxSelectedQtyValue, { decimalPlaces: null }) })} ${this.formData.unitId}`;
    },
    canDeleteScrap() {
      if (this.isEditFromOverview) return true;
      if (this.isAddFromOverview) return false;
      if (this.selectedSlicesProperties.hasSliceWOScrap) return false;
      const reasonsCount = this.selectedSlicesProperties.scrapReasons.length;
      const notesCount = this.selectedSlicesProperties.scrapNotes.length;
      return (Math.max(reasonsCount, notesCount) <= 1);
    },
    areValuesBeingOverwritten() {
      if (this.selectedSlicesProperties.scrapQty === 0) return false;
      const selectedReasonsCount = this.selectedSlicesProperties.scrapReasons.length;
      const selectedNotesCount = this.selectedSlicesProperties.scrapNotes.length;
      if (selectedReasonsCount > 1 || selectedNotesCount > 1) return true;
      const hasNewAttributes = (this.preselectedReasonId && this.preselectedReasonId !== this.formData.scrapReasonId) || (this.preSelectedNote && this.preselectedNote !== this.formData.scrapNotes);
      return selectedReasonsCount === 1 && selectedNotesCount === 1 && hasNewAttributes;
    },
    shiftBatchesWithProduction() {
      return Array.from(this.batches.values()).reduce((acc, batch) => {
        if (
          batch.id in this.scrapBatches
          && batch.producedQty > 0
          && (!batch.endTime || isAfter(new Date(batch.endTimeISO), new Date(this.shift.startTimeISO)))
          && isBefore(new Date(batch.startTimeISO), new Date(this.shift.endTimeISO))
        ) {
          const productBatch = { name: batch.productName, id: batch.id };
          if (batch.productSku) productBatch.name += ` (${batch.productSku})`;
          acc.push(productBatch);
        }
        return acc;
      }, []);
    },
    showMostUsedReasonsAndSearch() {
      return this.shiftviewStationScrapReasons.length >= 10;
    },
    isSameScrapReasonSelected() {
      if (this.isEditFromSignals) return this.selectedSlicesProperties.scrapReasons.every((reason) => reason === this.formData.scrapReasonId);
      if (this.isEditFromOverview) return this.dialogData.selectedScrapBatch.scrapReasonId === this.formData.scrapReasonId;
      return false;
    },
    isSaveBtnDisabled() {
      if (this.saveLoading || !this.formData.scrapQty || (this.shiftviewStationScrapReasons.length > 0 && !this.formData.scrapReasonId)) return true;
      const isSameScrapQty = this.preselectedQty === this.formData.scrapQty;
      const isSameScrapNotes = this.preselectedNote === this.formData.scrapNotes;
      const isSameUnitId = this.formData.unitId === this.initialUnitId;
      return this.isSameScrapReasonSelected && isSameScrapQty && isSameScrapNotes && isSameUnitId;
    },
    initialUnitId() {
      const preferAltUnit = JSON.parse(window.localStorage.getItem('useAltUnitForScrap'));
      return getUnitId(this.selectedBatch, preferAltUnit);
    },
  },
  watch: {
    selectedBatchId(newVal, oldVal) {
      if (oldVal && oldVal !== newVal) {
        this.formData.scrapQty = this.batches.get(newVal).unitQty;
        this.formData.unitId = this.batches.get(newVal).unitId;
      }
    },
    screenWidth() {
      window.setTimeout(() => {
        this.selectHeight = this.getSelectHeight();
      }, 300);
    },
    screenHeight() {
      window.setTimeout(() => {
        this.selectHeight = this.getSelectHeight();
      }, 300);
    },
    topReasons() {
      window.setTimeout(() => {
        this.selectHeight = this.getSelectHeight();
      }, 300);
    },
    isNoteValid(val) {
      if (val === true) {
        this.$refs.form.resetValidation();
      }
    },
  },
  async mounted() {
    this.loading = true;
    await this.fetchScrapReasonGroups({ lang: this.language });
    await this.fetchAllScrapReasons({ lang: this.language });
    if (this.isAddFromOverview) {
      this.selectedBatchId = this.shiftBatchesWithProduction[0].id;
    } else if (this.isEditFromOverview) {
      this.selectedBatchId = this.dialogData.selectedScrapBatch.batchId;
    } else {
      this.selectedBatchId = this.firstSelectedSlice.batchId;
    }
    this.setFormData();
    this.preselectedReasonId = this.formData.scrapReasonId;
    this.preselectedQty = this.formData.scrapQty;
    this.preselectedNote = this.formData.scrapNotes;
    this.loading = false;
    this.setTop5Reasons();
    window.setTimeout(() => {
      this.selectHeight = this.getSelectHeight();
    }, 300);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openPreviousDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useScrapReasonStore, ['fetchAllScrapReasons', 'fetchScrapReasonGroups']),
    // eslint-disable-next-line sonarjs/cognitive-complexity
    setFormData() {
      let defaultId;

      if (this.lineviewStation.defaultScrapReasonId && this.shiftviewStationScrapReasons.some((comment) => comment.id === this.lineviewStation.defaultScrapReasonId)) {
        defaultId = this.lineviewStation.defaultScrapReasonId;
      }

      if (this.isAddFromOverview) {
        this.formData.scrapQty = this.batches.get(this.selectedBatchId).unitQty;
        this.formData.scrapReasonId = defaultId;
      } else if (this.isEditFromOverview) {
        this.formData.scrapQty = this.dialogData.selectedScrapBatch.scrapQty;
        this.formData.scrapReasonId = this.dialogData.selectedScrapBatch.scrapReasonId || defaultId;
        this.formData.scrapNotes = this.dialogData.selectedScrapBatch.scrapNotes;
      } else if (this.selectedSlicesProperties.scrapReasons.length === 1 && this.selectedSlicesProperties.scrapNotes.length <= 1) {
        [this.formData.scrapReasonId] = this.selectedSlicesProperties.scrapReasons;
        [this.formData.scrapNotes] = this.selectedSlicesProperties.scrapNotes;
        this.formData.scrapQty = this.selectedSlicesProperties.hasSliceWOScrap ? this.maxMainQtyValue : this.selectedSlicesProperties.scrapQty;
      } else {
        this.formData.scrapReasonId = defaultId;
        this.formData.scrapQty = this.maxMainQtyValue;
      }
      if (this.formData.scrapReasonId) {
        this.scrapGroupId = this.scrapReasonsRealMap.get(this.formData.scrapReasonId).groupId;
      } else {
        if (this.filteredGroups.length) this.scrapGroupId = this.filteredGroups[0].id;
        if (this.shiftviewStationScrapReasons.length === 1) this.formData.scrapReasonId = this.shiftviewStationScrapReasons[0].id;
      }
      this.formData.unitId = this.initialUnitId;
      if (!this.isMainUnitSelected) this.formData.scrapQty = round(this.formData.scrapQty * this.mainToAltUnitConversion, 5);
    },
    selectScrapReason() {
      const scrapReason = this.shiftviewStationScrapReasons.find((reason) => reason.id === this.formData.scrapReasonId);
      this.isNoteRequired = scrapReason && scrapReason.noteRequired;
      this.noteValidaton();
    },
    async onSave() {
      if ((this.shiftviewStationScrapReasons.length > 0 && !this.formData.scrapReasonId) || this.saveLoading) return;
      await this.$refs.form.validate();
      if (!this.valid) return;
      if (this.selectedSlicesProperties.scrapNotes[0] !== this.formData.scrapNotes) {
        addItemToLocalStorageArray(this.formData.scrapNotes, 'scrapNoteSuggestions');
      }
      window.localStorage.setItem('useAltUnitForScrap', !this.isMainUnitSelected);
      if (this.areValuesBeingOverwritten) {
        const confirmDialogConfig = {
          title: this.$t('Confirmation'),
          text: this.$t('Are you sure you want to overwrite scrap?'),
          action: async () => {
            await this.saveScrap();
            this.closeScrapDialog();
          },
          confirmText: this.$t('Yes'),
          color: 'primary',
          cancelText: this.$t('Cancel'),
        };
        this.openConfirmDialog(confirmDialogConfig);
      } else {
        await this.saveScrap();
        this.closeScrapDialog();
      }
    },
    getPreviousQty() {
      if (this.isEditFromOverview) {
        return this.dialogData.selectedScrapBatch.scrapQty * this.unitMultiplier;
      }
      if (!this.isAddFromOverview) { // selection from timeline
        return this.selectedSlicesProperties.scrapQty * this.unitMultiplier;
      }
      return 0;
    },
    getBatchEmptyRanges(batchId) {
      let lastEndTime = '';
      return this.timeline.reduce((acc, slice) => {
        if (slice.batchId !== batchId || slice.scrapQty > 0) return acc;
        if (lastEndTime === slice.sliceStartTmISO) {
          acc[acc.length - 1].endTimeISO = slice.sliceEndTmISO;
        } else {
          acc.push({ startTimeISO: slice.sliceStartTmISO, endTimeISO: slice.sliceEndTmISO });
        }
        lastEndTime = slice.sliceEndTmISO;
        return acc;
      }, []);
    },
    getScrapRanges() {
      if (this.isAddFromOverview) {
        const { start, end } = this.scrapBatches[this.selectedBatchId];
        return [{ startTimeISO: start, endTimeISO: end }];
      }
      if (this.isEditFromOverview) {
        return this.dialogData.selectedScrapBatch.scrapRanges.concat(this.getBatchEmptyRanges(this.dialogData.selectedScrapBatch.batchId));
      }
      return [{
        startTimeISO: this.firstSelectedSlice.sliceStartTmISO,
        endTimeISO: this.bracketSelectedSlices[this.bracketSelectedSlices.length - 1].sliceEndTmISO,
      }];
    },
    async saveScrap(data = this.formData, isDelete = false) {
      const requestBody = {
        scrapQty: round(parseFloat(data.scrapQty) - this.getPreviousQty(), 5),
        qtyType: 'delta',
        shiftId: this.shift.id,
        scrapNotes: data.scrapNotes,
        scrapReasonId: data.scrapReasonId || 0,
        overwrite: !this.isAddFromOverview,
        scrapRanges: this.getScrapRanges(),
        unitId: this.formData.unitId,
      };
      this.saveLoading = true;
      const scrapResult = await scrapApi.saveScrap(this.lineviewStation.id, requestBody);
      this.reactToRequestResponse(scrapResult, isDelete);
      this.saveLoading = false;
    },
    reactToRequestResponse(result, isDelete) {
      if (result.success || result[0]?.body.success) {
        const notificationMessage = isDelete ? this.$t('Scrap deleted') : this.$t('Scrap saved');
        this.notifySuccess(notificationMessage);
        eventBus.$emit('scrap-saved');
      } else {
        this.notifyError(this.$t(result.message || 'We are sorry! There is a problem with your request'));
      }
    },
    noteValidaton() {
      if (this.isNoteRequired && this.formData.scrapNotes.length === 0) {
        this.isNoteValid = this.$t('Extra note');
      } else {
        this.isNoteValid = true;
      }
    },
    onNoteInput(input) {
      this.formData.scrapNotes = input.trim() || '';
      this.noteValidaton();
    },
    closeScrapDialog() {
      this.clearSliceSelection();
      if (this.previousState.component) {
        this.openPreviousDialog();
      } else {
        this.closeDialog();
      }
    },
    getTimeRangeString(start, end) {
      return `${formatTimeInZone(start, this.lineviewStation.zoneId)} - ${formatTimeInZone(end, this.lineviewStation.zoneId)}`;
    },
    deleteScrap() {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete scrap?'),
        action: () => {
          this.saveScrap({
            scrapQty: 0,
            scrapReasonId: this.formData.scrapReasonId || 0,
            scrapNotes: '',
          }, true);
          this.closeScrapDialog();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    async setTop5Reasons() {
      if (this.shiftviewStationScrapReasons.length >= 10 && this.filteredGroups.length >= 2) {
        const params = {
          stationIds: [this.lineviewStation.id],
          lang: this.language,
        };
        try {
          this.topReasonsLoading = true;
          const top5 = await statisticsApi.getTopScrapReasons(params);
          this.topReasons = top5
            .map((reason) => ({ ...reason, disabled: !this.shiftviewStationScrapReasons.find((comment) => comment.id === reason.entityId) }));
        } finally {
          this.topReasonsLoading = false;
        }
      }
    },
    selectReason(reasonId) {
      this.formData.scrapReasonId = reasonId;
      this.scrapGroupId = this.scrapReasonsRealMap.get(reasonId).groupId;
    },
    getSelectHeight() {
      if (this.isMobileView) return '';
      const dialogHeightConstant = this.showFullscreenDialogs ? 1 : DIALOG_HEIGHT_PTC;
      const dialogHeight = window.innerHeight * dialogHeightConstant;
      const toolbar = 64;
      const cardPadding = 16;
      const productAndQty = 86;
      const margin = 12;
      let reasonsAndSearch = 0;
      if (this.showMostUsedReasonsAndSearch && this.topReasons.length === 0) {
        // eslint-disable-next-line no-magic-numbers
        reasonsAndSearch = 72; // 72 = search(56) + padding(16)
      } else if (this.showMostUsedReasonsAndSearch && this.topReasons.length > 0) {
        reasonsAndSearch = this.$refs['search-and-topReasons']?.getBoundingClientRect().height;
      }
      const extraTextHeight = 78;
      const actions = 60;
      const height = Math.max(200, dialogHeight - toolbar - cardPadding - productAndQty - reasonsAndSearch - margin - extraTextHeight - actions);
      return `${height}px`;
    },
    formatNumber(val, options = {}) {
      return formatNumber(val, options);
    },
    onUnitChange(selectedUnitId) {
      this.formData.scrapQty = convertQuantityOnUnitChange(this.formData.scrapQty, this.formData.unitId, selectedUnitId, this.selectedBatch);
      this.formData.unitId = selectedUnitId;
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 1px - 116px);
  overflow-y: auto;
}
</style>
