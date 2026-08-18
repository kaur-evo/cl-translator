<template>
  <v-card v-if="isMounted" class="my-2 px-4 py-2">
    <div
      class="d-flex"
      :style="{ opacity: notApplicableSelected ? 0.5 : '' }"
    >
      <ordering-number
        :number="orderNumber"
        :color="checkNumberColor"
        :small="dense"
        class="mr-1"
        :class="{ 'mt-1': dense }"
      />
      <span class="mr-6 text-body-large check-name">
        {{ item.name }}
      </span>
    </div>
    <info-block
      v-if="item.description"
      :body="item.description"
      :icon="mdiBookOpenVariantOutline"
      class="mt-2"
      collapsible
    />
    <div
      class="d-flex mt-2 full-width"
      :class="dense ? 'flex-column' : 'flex-row'"
    >
      <div
        class="d-flex"
        :class="{
          'flex-grow-1': [checkTypes.MEASUREMENT, checkTypes.TEXT].includes(item.type) || (item.type === checkTypes.YES_NO && item.multipleSelection),
          'overflow-hidden': item.type === checkTypes.MEASUREMENT,
          'full-width': item.type === checkTypes.SELECTION,
        }"
      >
        <check-card-chips
          v-if="[checkTypes.YES_NO, checkTypes.CHECK].includes(item.type)"
          :item-type="item.type"
          :is-multiple-selection="item.multipleSelection"
          :model-value="inputValue"
          :disabled="disabled"
          :not-applicable-selected="notApplicableSelected"
          :dense="dense"
          :limit="item.requiredSampleCount || 100"
          @update:model-value="chipChanged"
        />
        <div
          v-if="item.type === checkTypes.MEASUREMENT"
          class="d-flex full-width"
        >
          <evocon-multi-chip-input
            v-if="item.multipleSelection"
            ref="value-input-measurement"
            v-model="inputValue"
            v-bind="multiChipInputCommonProps"
            :hint="multiChipInputHint"
            :allow-negative="true"
            :chip-validation-fn="measureValidationFn"
            chip-type="Number"
            @update:model-value="emitData"
          >
            <template #append-inner>
              <span>
                <span :class="{ 'text-secondary': inputValue.some(el => el < item.minVal) }">{{ formatNumber(item.minVal) }}</span>
                -
                <span :class="{ 'text-secondary': inputValue.some(el => el > item.maxVal) }">{{ formatNumber(item.maxVal) }}</span>
                {{ item.unit }}
              </span>
            </template>
            <template v-if="item.requiredSampleCount" #hint-addition="{ count, isLimitReached, limit }">
              <span :class="{ 'text-secondary': count !== 0 && !isLimitReached }">{{ count }}</span>/{{ limit }} {{ $t('Entered').toLowerCase() }}
            </template>
          </evocon-multi-chip-input>
          <evocon-number-input
            v-else
            id="value-input"
            ref="value-input-measurement"
            v-model="inputValue[0]"
            :hint="$t('Enter measurement')"
            :allow-negative="true"
            :disabled="disabled || notApplicableSelected"
            :density="dense ? 'compact' : 'comfortable'"
            @update:model-value="emitData"
          >
            <template #append-inner>
              <span :class="{ 'text-secondary': inputValue[0] < item.minVal }">{{ formatNumber(item.minVal) }}</span>
              <span class="mx-1">-</span>
              <span :class="{ 'text-secondary': inputValue[0] > item.maxVal }">{{ formatNumber(item.maxVal) }}</span>
              <span class="ml-1">{{ item.unit }}</span>
            </template>
          </evocon-number-input>
        </div>
        <evocon-v-combobox
          v-if="item.type === checkTypes.TEXT"
          id="value-input"
          ref="value-input-answer"
          v-model.trim="inputValue"
          :hint="$t('Answer')"
          :placeholder="$t('Answer')"
          :disabled="disabled || notApplicableSelected"
          :items="textAnswerSuggestions"
          max-length="500"
          :density="dense ? 'compact' : 'comfortable'"
          @update:model-value="emitData"
        />
        <evocon-v-select
          v-if="item.type === checkTypes.SELECTION && item.multipleSelection"
          v-model="inputValue"
          :items="item.selectionOptions"
          :hint="$t('Select')"
          :placeholder="$t('Select')"
          item-title="value"
          :disabled="disabled || notApplicableSelected"
          :chips="true"
          :density="dense ? 'compact' : 'comfortable'"
          closable-chips
          multiple
          @update:model-value="emitData"
        />
        <span
          v-if="item.type === checkTypes.SELECTION && !item.multipleSelection"
          class="full-width"
        >
          <selection-input
            v-model="inputValue"
            :items="item.selectionOptions"
            item-text="value"
            item-value="value"
            :hint="$t('Select')"
            :placeholder="$t('Select')"
            :density="dense ? 'compact' : 'comfortable'"
            :disabled="disabled || notApplicableSelected"
            is-single-select
            hide-search
            hide-select-all
            @update:model-value="emitData"
          />
        </span>
      </div>
      <div
        class="d-flex flex-row justify-end align-center"
        :class="{
          'flex-grow-1 flex-shrink-0': ![checkTypes.TEXT, checkTypes.SELECTION, checkTypes.MEASUREMENT].includes(item.type),
          'mb-5': !dense && [checkTypes.TEXT, checkTypes.MEASUREMENT, checkTypes.SELECTION].includes(item.type),
        }"
      >
        <v-chip-group :model-value="valueNotApplicable">
          <evocon-v-chip
            v-if="item.notApplicableEnabled"
            id="not-applicable-chip"
            ref="not-applicable-chip"
            :label="$t('Not applicable')"
            :icon="mdiCancel"
            :disabled="disabled"
            :active="valueNotApplicable"
            type="neutral"
            :size="dense ? 'small' : 'default'"
            :style="{ order: dense ? 1 : 0 }"
            :dark="false"
            class="my-0"
            :class="{ 'ml-2': !dense }"
            @click="notApplicableChipChanged"
          />
        </v-chip-group>
        <evocon-v-button
          v-if="!disabled"
          id="check-comment-btn"
          ref="check-comment-btn"
          class="pa-0 ml-2"
          :style="{ order: dense ? 0 : 1 }"
          :icon="mdiMessageReply"
          @click="commentFieldVisible = !commentFieldVisible"
        />
      </div>
    </div>
    <evocon-multi-chip-input
      v-if="item.type === checkTypes.YES_NO && item.multipleSelection"
      ref="value-input-yesno"
      v-model="inputValue"
      v-bind="multiChipInputCommonProps"
      :placeholder="$t('Choose Yes/No')"
      :hint="`${$t('Answer')} (${$t('multiple')})`"
      :chip-validation-fn="yesNoValidationFn"
      chip-type="Boolean"
      @update:model-value="emitData"
    >
      <template v-if="item.requiredSampleCount" #hint-addition="{ count, isLimitReached, limit }">
        <span :class="{ 'text-secondary': count !== 0 && !isLimitReached }">{{ count }}</span>/{{ limit }} {{ $t('Entered').toLowerCase() }}
      </template>
    </evocon-multi-chip-input>
    <info-block
      v-if="showWarningMessage"
      :body="item.warningMessage"
      :icon="mdiInformationOutline"
      :color="colorConstants.dark['lw-orange']"
      class="mt-2"
    />
    <evocon-v-combobox
      v-if="commentFieldVisible"
      id="check-comment-input"
      ref="check-comment-input"
      v-model.trim="comment"
      class="mt-2"
      :hint="`${$t('Extra note')} (${$t('Optional').toLowerCase()})`"
      :disabled="disabled"
      :items="extraNoteSuggestions"
      max-length="500"
      :density="dense ? 'compact' : 'comfortable'"
      autofocus
      @update:model-value="emitData"
    />
    <div v-if="item.attachmentsEnabled" class="mt-1" :class="{ 'd-flex flex-column': isMobileView }">
      <span :class="{ 'd-block order-0': isMobileView }">
        <evocon-v-chip
          v-for="(file, i) in selectedFiles"
          :key="`img-${i}`"
          :label="file.fileName"
          :error="file.error"
          class="mr-2 my-1"
          active
          type="primary"
          :icon="mdiImageOutline"
          @click="openImg(i)"
        >
          <template #append>
            <v-icon
              v-if="!disabled"
              class="ml-2 selection-chip-icon"
              size="18"
              @click.stop="onFileRemove(i)"
            >
              {{ mdiCloseCircle }}
            </v-icon>
          </template>
        </evocon-v-chip>
      </span>
      <span class="order-2">
        <evocon-v-button
          type="primary-light"
          :icon="mdiPlus"
          :text="$t('Image')"
          size="small"
          class="mr-2 my-1"
          :disabled="selectedFiles.length >= maxFileCount || disabled"
          @click="$refs.files.click()"
        />
        <icon-with-tooltip
          :text="`${maxFileCountWarning} ${maxFileSizeWarning}`"
          :icon="mdiInformationOutline"
        />
        <label for="file-input">
          <input
            id="file-input"
            ref="files"
            type="file"
            class="d-none"
            multiple
            :accept="allowedFileTypes.join(',')"
            @change="filesPicked()"
          >
        </label>
      </span>
      <info-block
        v-if="fileInfoBlock.visible"
        :body="fileInfoBlock.body"
        :icon="fileInfoBlock.icon"
        class="my-1 order-1"
        :color="fileInfoBlock.color"
      />
    </div>
  </v-card>
  <checklist-img-preview
    :file="selectedFiles[previewImgIndex]"
    :deletable="!disabled"
    @close="previewImgIndex = null"
    @delete="onFileRemove(previewImgIndex)"
  />
</template>
<script>
import {
  mdiMessageReply, mdiCancel, mdiInformationOutline, mdiBookOpenVariantOutline, mdiPlus,
  mdiImageOutline, mdiAlert, mdiCloseCircle,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import { useDeviceStore, useConfirmDialogStore } from '@/stores/index';
import { checkTypes } from '@/constants/checklistsConstants';
import getItemsFromLocalStorageArray from '@/helpers/localStorage/getItemsFromLocalStorageArray';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVCombobox from '@/components/atoms/EvoconVCombobox/index.vue';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import colorConstants from '@/constants/colorConstants';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import OrderingNumber from '@/components/atoms/OrderingNumber/index.vue';
import EvoconVSelect from '@/components/atoms/EvoconVSelect/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import checklistApi from '@/api/checklistApi';
import ChecklistImgPreview from '@/components/organisms/shiftview/ChecklistImgPreview/index.vue';
import EvoconMultiChipInput from '@/components/molecules/EvoconMultiChipInput/index.vue';
import CheckCardChips from '@/components/molecules/CheckCardChips/index.vue';

const icons = {
  mdiMessageReply, mdiCancel, mdiInformationOutline, mdiBookOpenVariantOutline, mdiPlus, mdiImageOutline, mdiAlert, mdiCloseCircle,
};

export default {
  name: 'CheckCard',
  components: {
    EvoconVChip,
    EvoconVButton,
    EvoconVCombobox,
    InfoBlock,
    EvoconNumberInput,
    OrderingNumber,
    SelectionInput,
    EvoconVSelect,
    IconWithTooltip,
    ChecklistImgPreview,
    EvoconMultiChipInput,
    CheckCardChips,
  },
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
    },
    orderNumber: {
      type: Number,
      default: 0,
    },
    dense: {
      type: Boolean,
    },
    checklistId: {
      type: String,
      required: true,
    },
    files: {
      type: Array,
      default: () => [],
    },
    fileUuid: {
      type: String,
      default: '',
    },
  },
  emits: ['update:model-value', 'file-added', 'file-removed', 'file-add-start'],
  data() {
    return {
      ...icons,
      checkTypes,
      inputValue: null,
      comment: '',
      commentFieldVisible: false,
      isMounted: false,
      valueNotApplicable: false,
      colorConstants,
      selectedFiles: [],
      allowedFileTypes: ['image/jpeg', 'image/png'],
      showFileLimitWarning: false,
      showFileSizeWarning: false,
      previewImgIndex: null,
      maxFileCount: 5,
      maxFileSizeinMB: 5,
      MBMultiplier: 1000000,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    isArrayValueType() {
      return [checkTypes.SELECTION, checkTypes.MEASUREMENT, checkTypes.YES_NO].includes(this.item.type);
    },
    hasValue() {
      if (this.isArrayValueType) return this.item.value?.length > 0;
      return this.item.value || typeof this.item.value === 'boolean';
    },
    checkNumberColor() {
      if (!this.hasValue) return 'white';
      return this.item.successful ? 'primary' : 'lw-orange';
    },
    extraNoteSuggestions() {
      return getItemsFromLocalStorageArray('checklistNoteSuggestions', this.comment || '');
    },
    textAnswerSuggestions() {
      return getItemsFromLocalStorageArray(`checkText-${this.checklistId}-${this.item.id}`, this.inputValue || '');
    },
    notApplicableSelected() {
      return this.item.notApplicableEnabled && this.valueNotApplicable;
    },
    showWarningMessage() {
      const hasWarningMessage = this.item.warningMessage?.length > 0;
      if (!hasWarningMessage) return false;

      if (this.item.type === checkTypes.MEASUREMENT) {
        const inputInRange = this.inputValue?.every((el) => this.measureValidationFn(el));
        return this.inputValue && !inputInRange;
      }

      if (this.item.type === checkTypes.YES_NO) {
        return Array.isArray(this.inputValue) && this.inputValue.some((v) => !this.yesNoValidationFn(v)) && !this.valueNotApplicable;
      }

      return false;
    },
    fileInfoBlock() {
      let body = '';
      if (this.showFileLimitWarning && this.showFileSizeWarning) body = `${this.maxFileCountWarning} ${this.maxFileSizeWarning}`;
      else if (this.showFileLimitWarning) body = this.maxFileCountWarning;
      else if (this.showFileSizeWarning) body = this.maxFileSizeWarning;
      return {
        visible: this.showFileLimitWarning || this.showFileSizeWarning,
        icon: this.showFileSizeWarning ? mdiInformationOutline : mdiAlert,
        color: this.showFileSizeWarning ? colorConstants.dark.error : colorConstants.dark['lw-orange'],
        body,
      };
    },
    maxFileCountWarning() {
      return this.$t('Upload up to {value} files.', { value: this.maxFileCount });
    },
    maxFileSizeWarning() {
      return this.$t('Maximum file size: {value}MB.', { value: this.maxFileSizeinMB });
    },
    multiChipInputCommonProps() {
      return {
        id: 'value-input',
        disabled: this.disabled || this.notApplicableSelected,
        density: this.dense ? 'compact' : 'comfortable',
        validate: false,
        showOrderingNumbers: true,
        wrapChips: true,
        limit: this.item.requiredSampleCount || 100,
      };
    },
    multiChipInputHint() {
      if (this.inputValue && this.inputValue.length >= 2) {
        const numericValues = this.inputValue.filter((val) => val !== null && val !== '').map(Number);
        if (numericValues.length >= 2) {
          const sum = numericValues.reduce((acc, val) => acc + val, 0);
          const average = sum / numericValues.length;
          return `${this.$t('Average')}: ${this.formatNumber(average)}`;
        }
      }
      return `${this.$t('Enter measurement')} (${this.$t('multiple')})`;
    },
  },
  mounted() {
    this.inputValue = this.getInputValue();
    this.comment = this.item.comment || '';
    this.commentFieldVisible = this.comment.length > 0;
    this.valueNotApplicable = this.item.valueNotApplicable;
    this.selectedFiles = this.files || [];
    this.isMounted = true;
  },
  updated() {
    if (this.item.valueNotApplicable !== this.valueNotApplicable) {
      this.notApplicableChipChanged();
    }
  },
  methods: {
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    formatNumber(val) {
      return formatNumber(val, { decimalPlaces: null });
    },
    getInputValue() {
      if (this.isArrayValueType) {
        if (this.item.value === null || this.item.value === undefined) return [];
        return Array.isArray(this.item.value) ? this.item.value : [this.item.value];
      }
      return this.item.value;
    },
    emitData() {
      if (this.disabled) return;
      this.$emit('update:model-value', {
        inputValue: this.item.type === checkTypes.MEASUREMENT ? this.inputValue.filter((el) => !!el || el === 0) : this.inputValue,
        comment: this.comment,
        valueNotApplicable: this.valueNotApplicable,
      });
    },
    chipChanged(newValue) {
      this.inputValue = newValue === undefined ? null : newValue;
      this.valueNotApplicable = false;
      this.emitData();
    },
    notApplicableChipChanged() {
      this.valueNotApplicable = !this.valueNotApplicable;
      this.inputValue = this.isArrayValueType ? [] : null;
      this.emitData();
    },
    filesPicked() {
      if (this.disabled) return;
      const fileList = this.$refs.files.files;
      Array.from(fileList).forEach((file) => {
        if (!this.allowedFileTypes.includes(file.type)) return;
        const reader = new FileReader();
        const modifiedFile = {
          currentFile: file,
          type: file.type,
          fileName: file.name,
          size: file.size,
          error: file.size > this.maxFileSizeinMB * this.MBMultiplier,
        };
        reader.addEventListener('load', (e) => {
          modifiedFile.url = e.target.result;
        });
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          const isWithinFirstFiveFiles = this.selectedFiles.length < 5;
          const isSmallEnough = file.size <= this.maxFileSizeinMB * this.MBMultiplier;
          if (isWithinFirstFiveFiles) {
            this.selectedFiles.push(modifiedFile);
            if (isSmallEnough) this.uploadFile(modifiedFile, this.selectedFiles.length - 1);
            else this.showFileSizeWarning = true;
          } else {
            this.showFileLimitWarning = true;
          }
        };
      });
    },
    removeFile(file, index) {
      this.selectedFiles.splice(index, 1);
      this.$emit('file-removed', { file, index });
      this.showFileLimitWarning = false;
      this.showFileSizeWarning = this.selectedFiles.some((f) => f.error);
      this.previewImgIndex = null;
    },
    onFileRemove(index) {
      if (this.disabled) return;
      const file = this.selectedFiles[index];
      if (file.error) this.removeFile(file, index);
      else {
        this.openConfirmDialog({
          title: this.$t('Confirmation'),
          text: this.$t('Are you sure you want to delete {value}?', { value: file.fileName }),
          action: () => {
            this.removeFile(file, index);
          },
          confirmText: this.$t('Delete'),
          cancelText: this.$t('Cancel'),
        });
      }
    },
    async uploadFile(file, index) {
      if (this.disabled) return;
      this.$emit('file-add-start');
      const formData = new FormData();
      formData.append(file.fileName, file.currentFile);
      formData.append('uuid', this.fileUuid);
      try {
        const addedFile = await checklistApi.postChecklistFile(formData);
        this.selectedFiles[index].path = addedFile[0];
        this.$emit('file-added', addedFile[0]);
      } catch {
        this.selectedFiles[index].error = true;
        this.$emit('file-added');
      }
    },
    openImg(index) {
      if (!this.selectedFiles[index] || this.selectedFiles[index].error) return;
      this.previewImgIndex = index;
    },
    yesNoValidationFn(val) {
      return val !== false;
    },
    measureValidationFn(val) {
      if (!val && val !== 0) return true;
      return Number(val) >= this.item.minVal && Number(val) <= this.item.maxVal;
    },
  },
};
</script>
