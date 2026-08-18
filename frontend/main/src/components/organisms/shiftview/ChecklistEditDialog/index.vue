<template>
  <div>
    <shiftview-checklist-auth-dialog
      v-model="showChecklistAuthDialog"
      @on-auth-success="formData.passcodeValidation = $event"
    />
    <dialog-toolbar
      id="dialog-toolbar"
      :color="toolbarColor"
      :title="formData.name"
    />
    <v-progress-linear v-if="loading" indeterminate />
    <v-card-text
      v-else
      class="dialog-content pb-0"
      :class="{ 'dialog-content--mobile': isMobileView, 'dialog-content--tablet': showFullscreenDialogs && !isMobileView }"
    >
      <v-card
        class="px-4 py-2"
        @click="isDescriptionCollapsed = !isDescriptionCollapsed"
      >
        <template v-if="formData.frequency">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex flex-wrap align-baseline">
              <template v-if="isChecklistAuthRequired && doneBy">
                <img
                  v-show="hasFormDataChanged"
                  class="align-self-center mr-1"
                  src="@/assets/animations/editing.gif"
                  :width="isMobileView ? 16 : 24"
                  :height="isMobileView ? 16 : 24"
                  alt="Editing"
                >
                <v-icon
                  v-show="!hasFormDataChanged"
                  class="align-self-center mr-1"
                  :size="isMobileView ? 16 : 24"
                >
                  {{ mdiDraw }}
                </v-icon>
                <span class="text-body-medium mr-4">{{ doneBy }}</span>
              </template>
              <template v-if="formData.dateTimeISO">
                <span class="text-label-small text-tertiary-dark mr-1">{{ $t('Due') }}</span>
                <span class="text-body-medium mr-4">
                  {{ formatTimeInZone(formData.dateTimeISO, lineviewStation.zoneId) }}
                </span>
              </template>
              <template v-if="formData.submissionTimeISO">
                <span class="text-label-small text-tertiary-dark mr-1">{{ $t('Done') }}</span>
                <span class="text-body-medium mr-4">
                  {{ getSubmissionTime(formData, lineviewStation.zoneId) }}
                </span>
              </template>
              <template v-if="frequencyStringsArray.length">
                <span class="text-label-small text-tertiary-dark mr-1">{{ $t('Frequency') }}</span>
                <span id="frequency-string" class="text-body-medium d-flex align-center mr-4">
                  <template v-for="(string, idx) in frequencyStringsArray" :key="'frequency-' + idx">
                    {{ string }}
                    <v-divider
                      v-if="idx < frequencyStringsArray.length - 1"
                      vertical
                      thickness="2"
                      class="mx-1"
                    />
                  </template>
                </span>
              </template>
            </div>
            <evocon-v-button
              v-if="isDescriptionTruncated"
              id="collapse-text-btn"
              :icon="isDescriptionCollapsed ? mdiChevronDown : mdiChevronUp"
              @click.stop="isDescriptionCollapsed = !isDescriptionCollapsed"
            />
          </div>
        </template>
        <div
          v-if="formData.description"
          ref="checklist-description"
          class="mt-2 checklist-description"
          :class="{ 'checklist-description--collapsed': isDescriptionCollapsed }"
        >
          <text-with-url
            v-for="(line, i) in visibleDescriptionRows"
            id="check-description"
            :key="i"
            :ref="`checklist-description-row-${i}`"
            :text="line"
            tag="div"
            class="text-body-medium mb-0"
            :class="{
              'checklist-description--collapsed': isDescriptionCollapsed,
              'd-inline-flex': isDescriptionCollapsed && descriptionByRows.length > 1,
            }"
          />{{ isDescriptionCollapsed && descriptionByRows.length > 1 ? '...' : '' }}
        </div>
      </v-card>
      <div
        v-for="(check, i) in formData.elements"
        :key="`check-${i}`"
        class="check-card"
      >
        <check-card
          :ref="`checklistCard-${check.id}`"
          :item="check"
          :order-number="i + 1"
          :disabled="isReadOnly"
          :dense="isMobileView"
          :checklist-id="dialogData.manual ? formData.id : formData.checklistId"
          :file-uuid="fileUuid"
          :files="files?.filter((f) => f.checklistTaskElementId === check.id)"
          @file-add-start="() => { filesLoading.push(check.id); }"
          @file-added="onFileAdded(check, $event)"
          @file-removed="onFileRemoved(check, $event)"
          @update:model-value="setCheckCardValue(i, $event)"
        />
      </div>
      <div
        class="d-flex py-2"
        :class="isMobileView ? 'flex-column' : `align-center ${isNotApplicableCheckboxVisible ? 'justify-space-between' : 'justify-end'}`"
      >
        <evocon-v-checkbox
          v-if="isNotApplicableCheckboxVisible"
          :model-value="areAllUnfilledTasksMarkedNA"
          class="pl-2"
          :class="{ 'pb-2': isMobileView }"
          :label="notApplicableString"
          :disabled="areAllTasksWithNAOptionFilled || isReadOnly"
          @update:model-value="onNotApplicableCheckboxChange"
        />
        <div :class="isMobileView ? 'pl-2' : ''">
          <v-progress-circular
            :model-value="getCheckTasksFilledPercentage(formData)"
            color="secondary-dark"
            width="2"
            size="12"
            class="mr-1"
          />
          <span class="mr-1 text-label-small text-secondary-dark">{{ $t('Tasks filled') }}</span>
          <span>{{ getCheckTasksFilledString(formData) }}</span>
        </div>
      </div>
    </v-card-text>
    <v-card-actions
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <delete-button
        v-if="shiftviewStationRoleAllows('deleteChecklist') && !isManual"
        id="delete-btn"
        @click="onDelete"
      />
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        :text="$t('Cancel')"
        type="secondary"
        @click="close"
      />
      <evocon-v-button
        id="save-button"
        color="primary"
        :text="$t('Save')"
        :disabled="isReadOnly || !hasFormDataChanged"
        :loading="isLoading || filesLoading.length > 0"
        @click="onSave"
      />
    </v-card-actions>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { nextTick } from 'vue';
import { cloneDeep, isEqual, countBy } from 'lodash';
import { mdiChevronDown, mdiChevronUp, mdiDraw } from '@mdi/js';

import {
  useGenericDialogStore,
  useStationStore,
  useProfileStore,
  useDeviceStore,
  useOperatorStore,
  useConfirmDialogStore,
  useChecklistTaskStore,
  useShiftviewSelectionStore,
} from '@/stores/index';
import { getCheckTasksFilledString, getCheckTasksFilledPercentage } from '@/helpers/checklist/checkTasksFilledCalculations';
import CheckCard from '@/components/molecules/CheckCard/index.vue';
import { checkTypes } from '@/constants/checklistsConstants';
import getChecklistFrequencyStrings from '@/helpers/checklist/getChecklistFrequencyStrings';
import addItemToLocalStorageArray from '@/helpers/localStorage/addItem';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import TextWithUrl from '@/components/atoms/TextWithUrl/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import { getSubmissionTime } from '@/helpers/checklist/getSubmissionTime';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { LINEVIEW_USER } from '@/constants/userRoles';
import ShiftviewChecklistAuthDialog from '@/components/organisms/shiftview/ShiftviewChecklistAuthDialog/index.vue';
import { eventBus } from '@/eventBus';
import checklistApi from '@/api/checklistApi';

const icons = { mdiChevronDown, mdiChevronUp, mdiDraw };

export default {
  name: 'ChecklistEditDialog',
  components: {
    CheckCard,
    DialogToolbar,
    EvoconVButton,
    TextWithUrl,
    ShiftviewChecklistAuthDialog,
    DeleteButton,
    EvoconVCheckbox,
  },
  data() {
    return {
      ...icons,
      isDescriptionCollapsed: true,
      formData: {
        elements: [],
        passcodeValidation: {},
        checklistFileSourceMap: {},
      },
      showChecklistAuthDialog: false,
      doneBy: null,
      isLoading: false,
      isDescriptionTruncated: false,
      notApplicableString: this.$t('Mark unfilled tasks as "Not Applicable" (if available)'),
      files: [],
      fileUuid: null,
      loading: false,
      filesLoading: [],
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData', 'previousState']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['isReadOnly', 'shiftviewStationRoleAllows', 'shiftviewStationUserRole', 'currentUser']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useOperatorStore, ['operatorsMap']),
    isNotApplicableCheckboxVisible() {
      if (!this.formData.elements) return false;
      return this.formData.elements.filter((el) => el.notApplicableEnabled).length > 1;
    },
    tasksWithNAOption() {
      return this.formData.elements?.filter((el) => el.notApplicableEnabled) || [];
    },
    areAllUnfilledTasksMarkedNA() {
      const unfilledNAEnabledTasks = this.tasksWithNAOption.filter((el) => !this.isElementFilled(el));
      return unfilledNAEnabledTasks.length > 0 && unfilledNAEnabledTasks.every((el) => el.valueNotApplicable);
    },
    areAllTasksWithNAOptionFilled() {
      return this.tasksWithNAOption.every((el) => this.isElementFilled(el));
    },
    toolbarColor() {
      if (!this.formData.elements) return '';
      if (this.formData.elements.some((el) => el.successful === false && this.getChecklistNormalizedValue(el.value) !== null && !el.valueNotApplicable)) return 'lw-orange';
      if (this.formData.elements.every((el) => el.successful || el.valueNotApplicable)) return 'primary';
      return 'lw-gray';
    },
    descriptionByRows() {
      return this.formData.description?.split('\n');
    },
    visibleDescriptionRows() {
      return this.isDescriptionCollapsed ? [this.descriptionByRows[0]] : this.descriptionByRows;
    },
    isManual() {
      return this.dialogData.manual;
    },
    hasFormDataChanged() {
      if (!this.formData.elements) return false;
      if (Object.keys(this.formData.checklistFileSourceMap).length > 0) return true;
      return this.formData.elements.some((el, i) => {
        const comparison = this.dialogData.item.elements[i];
        const bothValuesEmpty = this.isEmptyValue(el.value) && this.isEmptyValue(comparison.value);
        const valuesSame = this.areFormDataValuesEqual(el.value, comparison.value);
        const valueHasChanged = !bothValuesEmpty && !valuesSame;
        const bothCommentsEmpty = !el.comment && !comparison.comment;
        const commentsSame = el.comment === comparison.comment;
        const commentHasChanged = !bothCommentsEmpty && !commentsSame;
        const notApplicableChanged = this.getNormalizedNotApplicableValue(el.valueNotApplicable) !== this.getNormalizedNotApplicableValue(comparison.valueNotApplicable);
        return commentHasChanged || valueHasChanged || notApplicableChanged;
      });
    },
    isChecklistAuthRequired() {
      return this.isManual ? this.formData.authenticationRequired : this.formData.conditionAuthenticationRequired;
    },
    frequencyStringsArray() {
      return this.isManual ? [this.$t('Manual activation')] : this.getChecklistFrequencyStrings(this.formData.frequency);
    },
  },
  watch: {
    hasFormDataChanged(newVal) {
      if (newVal && this.isChecklistAuthRequired) this.changeDoneBy();
    },
  },
  async mounted() {
    this.loading = true;
    this.formData = cloneDeep({ ...this.dialogData.item, checklistFileSourceMap: {} });
    if (!this.isManual) {
      this.files = await checklistApi.getTaskFiles({ checklistTaskId: this.formData.id }) || [];
      this.files.forEach((file) => {
        if (!file.path) return;
        const elementId = file.checklistTaskElementId;
        this.formData.checklistFileSourceMap[elementId] ??= [];
        this.formData.checklistFileSourceMap[elementId].push(file.path);
      });
    }
    this.loading = false;
    if (this.isChecklistAuthRequired || this.isReadOnly) {
      if (this.shiftviewStationUserRole === LINEVIEW_USER || this.isReadOnly) this.doneBy = this.formData.doneBy || null;
      else this.doneBy = this.formData.doneBy || this.currentUser.fullName;
    }
    this.showChecklistAuthDialog = !this.isReadOnly && this.isChecklistAuthRequired && this.shiftviewStationUserRole === LINEVIEW_USER;
    await nextTick();
    const descriptionRow = this.$refs['checklist-description']?.getElementsByTagName('div')[0];
    if (descriptionRow) {
      this.isDescriptionTruncated = descriptionRow.offsetWidth < descriptionRow.scrollWidth || this.descriptionByRows.length > 1;
    }
    this.fileUuid = crypto.randomUUID();
  },
  methods: {
    formatTimeInZone,
    getSubmissionTime,
    getChecklistFrequencyStrings,
    getCheckTasksFilledString,
    getCheckTasksFilledPercentage,
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openPreviousDialog']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useChecklistTaskStore, ['saveCheck', 'deleteChecklistTask', 'saveManualCheck']),
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection']),
    isElementFilled(el) {
      if (el.notApplicableEnabled && el.valueNotApplicable) return false;
      if ([checkTypes.SELECTION, checkTypes.YES_NO, checkTypes.MEASUREMENT].includes(el.type)) return el.value && el.value.length !== 0;
      return el.value !== null && el.value !== undefined;
    },
    getChecklistNormalizedValue(value) {
      if (this.isEmptyValue(value)) return null;
      return value;
    },
    getNormalizedNotApplicableValue(value) {
      return value === undefined ? false : value;
    },
    areFormDataValuesEqual(value, comparisonValue) {
      const normalizedValue = this.getChecklistNormalizedValue(value);
      const normalizedComparisonValue = this.getChecklistNormalizedValue(comparisonValue);
      if (Array.isArray(normalizedValue) && Array.isArray(normalizedComparisonValue)) {
        if (normalizedValue.length !== normalizedComparisonValue.length) return false;
        return isEqual(countBy(normalizedValue), countBy(normalizedComparisonValue));
      }
      return isEqual(normalizedValue, normalizedComparisonValue);
    },
    isEmptyValue(value) {
      if (Array.isArray(value)) return value.length === 0;
      return !value && value !== false && value !== 0;
    },
    changeDoneBy() {
      if (this.shiftviewStationUserRole === LINEVIEW_USER) {
        const currentOperatorName = this.operatorsMap[this.formData.passcodeValidation?.operatorId]?.name;
        if (this.doneBy !== currentOperatorName) this.doneBy = currentOperatorName;
      } else if (this.doneBy !== this.currentUser.fullName) {
        this.doneBy = this.currentUser.fullName;
      }
    },
    isCheckSuccessful(item) {
      if (item.type === checkTypes.MEASUREMENT) {
        if (!item.value || item.value.length === 0) return false;
        if (item.requiredSampleCount && item.value.length < item.requiredSampleCount) return false;
        return item.value.every((v) => v >= item.minVal && v <= item.maxVal);
      }
      if (item.type === checkTypes.YES_NO) {
        if (!item.value || item.value.length === 0) return false;
        if (item.requiredSampleCount && item.value.length < item.requiredSampleCount) return false;
        return item.value.every((v) => v === true);
      }
      if (item.type === checkTypes.SELECTION) return item.value.length > 0;
      return !!item.value;
    },
    setCheckCardValue(index, val) {
      const item = { ...this.dialogData.item.elements[index] };
      item.value = val.inputValue;
      item.successful = this.isCheckSuccessful(item);
      item.comment = val.comment;
      item.valueNotApplicable = val.valueNotApplicable;
      this.formData.elements.splice(index, 1, item);
    },
    onFileAdded(check, filePath) {
      this.filesLoading.pop();
      if (!filePath) return;
      this.formData.checklistFileSourceMap[check.id] ??= [];
      this.formData.checklistFileSourceMap[check.id].push(filePath);
    },
    onFileRemoved(check, { file }) {
      this.formData.checklistFileSourceMap[check.id] ??= [];
      const filePath = file.path || file.fileName;
      const fileIndex = this.formData.checklistFileSourceMap[check.id].indexOf(filePath);
      if (fileIndex > -1) {
        this.formData.checklistFileSourceMap[check.id].splice(fileIndex, 1);
      }
    },
    async onSave() {
      if (!this.hasFormDataChanged || this.showChecklistAuthDialog) return;
      this.isLoading = true;
      if (this.isManual) {
        const {
          description, elements, name, checklistFileSourceMap,
        } = this.formData;
        await this.saveManualCheck({
          checklistId: this.formData.id,
          description,
          eventTimeISO: this.dialogData.eventTimeISO,
          elements,
          stationId: this.lineviewStation.id,
          name,
          passcodeValidation: this.formData.passcodeValidation,
          checklistFileSourceMap,
        });
      } else {
        await this.saveCheck({ processId: this.formData.id, ...this.formData, stationId: this.lineviewStation.id });
        eventBus.$emit('checklist-saved');
      }
      this.saveExtraNoteSuggestion();
      this.isLoading = false;
      this.close();
    },
    saveExtraNoteSuggestion() {
      this.formData.elements?.forEach((element, i) => {
        if (element.type === checkTypes.TEXT && element.value && element.value !== this.dialogData.item.elements[i].value) {
          addItemToLocalStorageArray(element.value, `checkText-${this.formData.checklistId}-${element.id}`);
        }
        if (element.comment !== this.dialogData.item.elements[i].comment) {
          addItemToLocalStorageArray(element.comment, 'checklistNoteSuggestions');
        }
      });
    },
    onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this checklist?'),
        action: () => {
          this.deleteChecklistTask(this.formData);
          this.close();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    close() {
      if (this.isManual) this.clearSliceSelection();
      if (this.previousState.component && !this.isManual) {
        this.openPreviousDialog();
      } else {
        this.closeDialog();
      }
    },
    onNotApplicableCheckboxChange($event) {
      this.formData.elements = this.formData.elements?.map((el) => {
        const element = { ...el };
        const isEmptyMultiSelect = ([checkTypes.SELECTION, checkTypes.YES_NO, checkTypes.MEASUREMENT].includes(element.type)) && element.value?.length === 0;
        if (element.notApplicableEnabled && (isEmptyMultiSelect || element.value === null || element.value === undefined)) {
          element.valueNotApplicable = $event;
        }
        return element;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 0.9px - 124px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 124px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 120px);
  }
}

.checklist-description--collapsed {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
