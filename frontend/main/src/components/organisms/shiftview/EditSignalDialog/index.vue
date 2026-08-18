<template>
  <div>
    <dialog-toolbar
      id="signal-dialog-toolbar"
      :title="title"
    />
    <v-form ref="form" v-model="valid">
      <v-card-text class="pa-4 pb-0">
        <v-row>
          <v-col
            cols="12"
            md="6"
            class="px-1"
          >
            <evocon-v-input
              id="signal-product-input"
              :model-value="productName"
              :hint="$t('Product')"
              :disabled="true"
              :density="isMobileView ? 'compact' : 'default'"
              class="mb-2"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1"
          >
            <evocon-v-input
              v-if="isTimeModeActive"
              id="signal-time-input"
              disabled
              :value="signalQtyAsTime"
              :hint="$t('Time')"
              class="mb-2"
            />
            <evocon-v-input-with-selector
              v-else
              id="signal-qty-input"
              v-model="formData.signalQty"
              :disabled="!qtyEditAllowed"
              :placeholder="$t('Enter quantity')"
              :hint="$t('Enter quantity')"
              :items="units"
              :selected-item="formData.unitId"
              :rules="[qtyRule]"
              type="number"
              class="mb-2"
              @selection="onUnitChange"
            />
          </v-col>
          <v-col class="px-1">
            <evocon-v-combobox
              id="signal-notes-input"
              v-model="formData.notes"
              :hint="extraNoteHint"
              max-length="500"
              :rules="[noteRule]"
              :items="signalNoteSuggestions"
              :density="isMobileView ? 'compact' : 'default'"
              class="mb-2"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
    <v-card-actions
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <delete-button
        v-if="!isAddNew && !hasChangeover"
        id="delete-button"
        :disabled="!canDeleteSignal"
        @click="onDelete"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="close"
      />
      <evocon-v-button
        id="save-button"
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
import { mapState, mapActions } from 'pinia';
import { DateTime } from 'luxon';

import {
  useDeviceStore,
  useShiftviewSelectionStore,
  useShiftviewTimelineStore,
  useStationStore,
  useProfileStore,
  useGenericDialogStore,
  useConfirmDialogStore,
  useGenericNotificationStore,
} from '@/stores/index';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVCombobox from '@/components/atoms/EvoconVCombobox/index.vue';
import timelineApi from '@/api/timelineApi';
import addItemToLocalStorageArray from '@/helpers/localStorage/addItem';
import getItemsFromLocalStorageArray from '@/helpers/localStorage/getItemsFromLocalStorageArray';
import EvoconVInputWithSelector from '@/components/atoms/EvoconVInputWithSelector/index.vue';
import { getSelectedBatchUnits } from '@/helpers/timeline/selectedBatchUnits';
import { altUnitConversion, getUnitId } from '@/helpers/timeline/altUnitConversion';
import { getNormalizedValue } from '@/helpers/getNormalizedValue';
import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';
import { convertQuantityOnUnitChange } from '@/helpers/timeline/convertQuantityOnUnitChange';
import { formatTimeInZone } from '@/helpers/time/formatTime';

export default {
  name: 'EditSignalDialog',
  components: {
    DialogToolbar,
    EvoconVButton,
    EvoconVInput,
    EvoconVCombobox,
    EvoconVInputWithSelector,
    DeleteButton,
  },
  data() {
    return {
      valid: true,
      formData: {
        signalQty: 0,
        notes: '',
        unitId: '',
      },
      saveLoading: false,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useShiftviewSelectionStore, ['bracketRange', 'firstSelectedSlice', 'shiftviewSelectionType']),
    ...mapState(useShiftviewTimelineStore, ['batches']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['shiftviewStationRoleAllows']),
    isTimeModeActive() {
      return this.lineviewStation.timeModeActive;
    },
    selectedBatch() {
      if (!this.signalTime) return {};
      const signalTime = DateTime.fromISO(this.signalTime, { zone: this.lineviewStation.zoneId });
      return Array.from(this.batches.values()).find((batch) => {
        const batchStart = DateTime.fromISO(batch.startTimeISO, { zone: this.lineviewStation.zoneId });
        const batchEnd = batch.endTimeISO
          ? DateTime.fromISO(batch.endTimeISO, { zone: this.lineviewStation.zoneId })
          : DateTime.local().setZone(this.lineviewStation.zoneId);
        return batchStart <= signalTime && signalTime <= batchEnd;
      });
    },
    productName() {
      let name = this.selectedBatch.productName;
      if (this.selectedBatch.productSku) {
        name += ` (${this.selectedBatch.productSku})`;
      }
      return name;
    },
    signalTime() {
      if (!this.bracketRange.selectedRange || this.bracketRange.selectedRange.length < 2 || !this.firstSelectedSlice) return null;
      if (this.shiftviewSelectionType === 'PRODUCT') return this.firstSelectedSlice.sliceEndTmISO;
      const bracketEnd = this.bracketRange.selectedRange[1];
      if (this.shiftviewSelectionType === 'STOPPAGE') {
        const bracketEndTm = DateTime.fromISO(bracketEnd, { zone: this.lineviewStation.zoneId });
        const firstSliceEndTm = DateTime.fromISO(this.firstSelectedSlice.sliceEndTmISO, { zone: this.lineviewStation.zoneId });
        return bracketEndTm < firstSliceEndTm ? bracketEnd : this.firstSelectedSlice.sliceEndTmISO;
      }
      return bracketEnd;
    },
    title() {
      if (this.isTimeModeActive) {
        const { selectedRange } = this.bracketRange;
        if (!selectedRange || selectedRange.length < 2) return '';
        const startTime = formatTimeInZone(selectedRange[0], this.lineviewStation.zoneId, 'short');
        const endTime = formatTimeInZone(selectedRange[1], this.lineviewStation.zoneId, 'short');
        return `${this.$t('Change to production')} ${startTime}-${endTime}`;
      }
      if (!this.signalTime) return '';
      const formattedSignalTime = formatTimeInZone(this.signalTime, this.lineviewStation.zoneId, 'long');
      return `${this.$t('Production signal')} ${formattedSignalTime}`;
    },
    isAddNew() {
      return this.shiftviewSelectionType !== 'PRODUCT';
    },
    canDeleteSignal() {
      return this.lineviewStation.deleteSliceAllowed || this.shiftviewStationRoleAllows('editSignal');
    },
    qtyEditAllowed() {
      if (this.isTimeModeActive) return false;
      return this.shiftviewStationRoleAllows('editSignal');
    },
    signalNoteSuggestions() {
      return getItemsFromLocalStorageArray('signalNoteSuggestions', this.formData.notes || '');
    },
    units() {
      return getSelectedBatchUnits(this.selectedBatch);
    },
    qtyRule() {
      return this.formData.signalQty === null || this.formData.signalQty > 0 || this.$t('Quantity cannot be 0');
    },
    isMainUnitSelected() {
      return this.formData.unitId === this.batches.get(this.selectedBatch.id)?.unitId;
    },
    hasChangeover() {
      return this.firstSelectedSlice && this.firstSelectedSlice.isProductChange;
    },
    isSaveBtnDisabled() {
      if (!this.formData.signalQty || this.saveLoading) return true;
      const hasSameQty = this.formData.signalQty === this.initialSignalQty;
      const hasSameNotes = getNormalizedValue(this.formData.notes) === getNormalizedValue(this.firstSelectedSlice.signalNotes);
      const hasSameUnit = this.formData.unitId === this.initialUnitId;
      return !this.isAddNew && hasSameQty && hasSameNotes && hasSameUnit;
    },
    preferAltUnit() {
      return JSON.parse(window.localStorage.getItem('useAltUnitForSignal'));
    },
    selectedTimeInSec() {
      const { selectedRange } = this.bracketRange;
      if (!selectedRange || selectedRange.length < 2) return 0;
      return (new Date(selectedRange[1]) - new Date(selectedRange[0])) / 1000;
    },
    initialSignalQty() {
      if (this.isAddNew) {
        if (this.isTimeModeActive) {
          return this.selectedTimeInSec / 60;
        }
        const storageVal = JSON.parse(localStorage.getItem('signalQtyValue')) || {};
        return storageVal[this.selectedBatch.id] || this.selectedBatch.unitQty;
      }
      return altUnitConversion(this.selectedBatch, this.firstSelectedSlice.quantity, this.preferAltUnit);
    },
    initialUnitId() {
      return getUnitId(this.selectedBatch, this.preferAltUnit);
    },
    noteRule() {
      if (this.isTimeModeActive) return !!this.formData.notes || this.$t('Extra note');
      return true;
    },
    extraNoteHint() {
      if (this.isTimeModeActive) return this.$t('Extra note');
      return `${this.$t('Extra note')} (${this.$t('Optional').toLowerCase()})`;
    },
    signalQtyAsTime() {
      const minutes = Math.floor(this.selectedTimeInSec / 60);
      const seconds = Math.floor(this.selectedTimeInSec % 60);
      if (seconds) return `${minutes}min ${seconds}s`;
      return `${minutes}min`;
    },
  },
  mounted() {
    this.formData.signalQty = this.initialSignalQty;
    if (!this.isAddNew) this.formData.notes = this.firstSelectedSlice.signalNotes;
    this.formData.unitId = this.initialUnitId;
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    close() {
      this.closeDialog();
      this.clearSliceSelection();
    },
    addQtyToLocalStorage() {
      const storageVal = JSON.parse(localStorage.getItem('signalQtyValue')) || {};
      storageVal[this.selectedBatch.id] = this.formData.signalQty;
      localStorage.setItem('signalQtyValue', JSON.stringify(storageVal));
    },
    async onSave() {
      await this.$refs.form?.validate();
      if (!this.valid) return;
      this.saveLoading = true;
      let initialQty;
      if (this.isAddNew) initialQty = 0;
      else if (this.isMainUnitSelected) initialQty = this.firstSelectedSlice.quantity;
      else initialQty = this.firstSelectedSlice.quantity * getBatchMainToAltUnitConversion(this.selectedBatch);
      const slice = [{
        ...this.formData,
        eventTimeISO: this.signalTime,
        signalQty: (this.formData.signalQty - initialQty) / this.selectedBatch.unitQty,
      }];
      const response = await timelineApi.addProductionSignal(this.lineviewStation.id, slice);
      if (response.success) {
        this.notifySuccess(this.$t('Changes saved'));
        if (this.firstSelectedSlice.signalNotes !== this.formData.notes) {
          addItemToLocalStorageArray(this.formData.notes, 'signalNoteSuggestions');
        }
        this.addQtyToLocalStorage();
        window.localStorage.setItem('useAltUnitForSignal', !this.isMainUnitSelected);
        this.close();
      } else {
        this.notifyError(this.$t(response.message));
      }
      this.saveLoading = false;
    },
    onDelete() {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this production signal?'),
        action: () => this.deleteSignal(),
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    async deleteSignal() {
      const requestResponse = await timelineApi.deleteProductionSignals(this.lineviewStation.id, [this.firstSelectedSlice.sliceEndTmISO]);
      if (requestResponse[0].success) {
        this.close();
        this.notifySuccess(this.$t('Production signal deleted'));
      } else {
        this.notifyError(requestResponse[0].message);
      }
    },
    onUnitChange(selectedUnitId) {
      this.formData.signalQty = convertQuantityOnUnitChange(this.formData.signalQty, this.formData.unitId, selectedUnitId, this.selectedBatch);
      this.formData.unitId = selectedUnitId;
    },
  },
};
</script>
