<template>
  <form-dialog-template
    :primary-segment-title="dialogTitle"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSaveClick"
      >
        <v-row>
          <v-col
            id="check-type-column"
            cols="12"
            class="px-1 mb-2"
          >
            <selection-input
              id="check-type-select"
              :model-value="internalType ? [internalType] : []"
              :rules="[typeRule]"
              :placeholder="$t('Type')"
              :items="types"
              item-title="name"
              item-value="id"
              :hint="$t('Type')"
              required
              is-single-select
              hide-search
              icon-key="icon"
              @update:model-value="onTypeChange"
            >
              <template #primary-title-append="{ item }">
                <new-indicator
                  v-if="[checkTypes.YES_NO, checkTypes.MEASUREMENT].includes(item.id)"
                  shown-until="2026-04-26T00:00:00"
                  small
                  class="ml-2 d-inline-flex"
                />
              </template>
            </selection-input>
          </v-col>
          <v-col
            v-if="formData.type"
            id="check-name-column"
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              id="check-name"
              v-model.trim="formData.name"
              :rules="[nameRule]"
              required
              validate-on-blur
              max-length="200"
              :placeholder="$t('Task')"
              :hint="formData.type === checkTypes.MEASUREMENT ? $t('What has to be measured?') : $t('What has to be checked?')"
            />
          </v-col>
          <v-col
            v-if="formData.type"
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-textarea
              v-if="isDescriptionVisible"
              v-model.trim="formData.description"
              validate-on-blur
              max-length="500"
              :placeholder="$t('Description')"
              :hint="`${$t('Description')} (${$t('Optional')})`"
              no-resize
            />
            <evocon-v-button
              v-else
              :text="$t('Description')"
              color="quaternary-dark"
              class="mb-2"
              :icon="mdiPlus"
              @click="isDescriptionVisible = true"
            />
          </v-col>
          <v-col
            v-if="formData.type === checkTypes.MEASUREMENT"
            id="check-unit-column"
            cols="12"
            md="4"
            class="px-1 mb-2"
          >
            <evocon-v-input
              id="check-unit"
              v-model.trim="formData.unit"
              :rules="[unitRule]"
              required
              validate-on-blur
              max-length="10"
              :placeholder="$t('Unit')"
              :hint="$t('E.g. pcs, kg, litre')"
            />
          </v-col>
          <v-col
            v-if="formData.type === checkTypes.MEASUREMENT"
            id="check-min-val-column"
            cols="12"
            md="4"
            class="px-1 mb-2"
          >
            <evocon-number-input
              v-if="formData.type === checkTypes.MEASUREMENT"
              id="check-min-val"
              v-model="formData.minVal"
              :rules="[minValRule]"
              allow-negative
              required
              :placeholder="$t('Min')"
              :hint="$t('Minimum value')"
            />
          </v-col>
          <v-col
            v-if="formData.type === checkTypes.MEASUREMENT"
            id="check-max-val-column"
            cols="12"
            md="4"
            class="px-1 mb-2"
          >
            <evocon-number-input
              id="check-max-val"
              v-model="formData.maxVal"
              :rules="[maxValRule]"
              allow-negative
              required
              :placeholder="$t('Max')"
              :hint="$t('Maximum value')"
            />
          </v-col>
          <v-col
            v-if="[checkTypes.MEASUREMENT, checkTypes.YES_NO].includes(formData.type)"
            id="check-warning-message-column"
            cols="12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              id="check-warning-message"
              v-model="formData.warningMessage"
              :placeholder="$t('Message')"
              :hint="`${warningMessageHint} (${$t('Optional').toLowerCase()})`"
              max-length="200"
            />
          </v-col>
          <v-col
            v-if="[checkTypes.SELECTION].includes(formData.type)"
            cols="12"
            class="px-1 mb-2"
          >
            <draggable-list
              v-model="formData.selectionOptions"
              :disabled="formData.selectionOptions.length < 2"
              :handle="'.handle'"
            >
              <template #item="{ index }">
                <div class="d-flex mb-2">
                  <v-hover
                    v-slot="{ isHovering, props }"
                    :disabled="formData.selectionOptions.length < 2"
                  >
                    <span class="handle" v-bind="props">
                      <v-icon v-if="isHovering" class="mt-4" color="tertiary-dark">
                        {{ mdiDragVertical }}
                      </v-icon>
                      <div v-else class="number-container">
                        <ordering-number :number="index + 1" />
                      </div>
                    </span>
                  </v-hover>
                  <evocon-v-input
                    v-model="formData.selectionOptions[index].value"
                    class="mx-2"
                    :max-length="200"
                    :rules="[(val) => !!val || $t('Option')]"
                    :hint="$t('Option')"
                  />
                  <evocon-v-button
                    :icon="mdiDelete"
                    :disabled="formData.selectionOptions.length <= 1"
                    :class="{ 'mt-2': !isMobileView }"
                    @click="formData.selectionOptions.splice(index, 1)"
                  />
                </div>
              </template>
            </draggable-list>
            <evocon-v-button
              type="primary-light"
              :icon="mdiPlus"
              :text="$t('Option')"
              :disabled="formData.selectionOptions.length >= 30"
              class="ml-8"
              @click="formData.selectionOptions.push({ value: '' })"
            />
            <span class="ml-4 text-body-small text-secondary-dark">
              {{ $t('Maximum') + ': 30' }}
            </span>
          </v-col>
          <v-col
            v-if="formData.type"
            cols="12"
            class="px-1 mt-4"
          >
            <multi-line-switch
              id="not-applicable-switch"
              v-model="formData.notApplicableEnabled"
              :main-text="notApplicableString"
              :help-text="$t('When enabled, operators can mark this task as not applicable.')"
            />
          </v-col>
          <v-col
            v-if="formData.type"
            cols="12"
            class="px-1 my-2"
          >
            <multi-line-switch
              v-model="formData.attachmentsEnabled"
              :main-text="$t('Allow adding images')"
            />
          </v-col>
          <v-col
            v-if="[checkTypes.MEASUREMENT, checkTypes.YES_NO].includes(formData.type)"
            cols="12"
            class="px-1 mb-2"
          >
            <multi-line-switch
              v-model="formData.multipleSelection"
              :main-text="$t('Allow multiple sample entries')"
              :help-text="formData.type === checkTypes.YES_NO ? $t('When enabled, operators can add multiple answers') : $t('When enabled, operators can add multiple measurements')"
            >
              <template #label-additions>
                <new-indicator shown-until="2026-04-26T00:00:00" class="ml-2" />
              </template>
              <template #enabled-input>
                <evocon-number-input
                  v-model="formData.requiredSampleCount"
                  :rules="[requiredSampleCountRule]"
                  :placeholder="$t('Required sample count')"
                  :hint="`${$t('Set number of samples required')} (${$t('Optional').toLowerCase()}).`"
                  class="mt-2"
                />
              </template>
            </multi-line-switch>
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <delete-button
        v-if="dialogData.itemData && !dialogData.isDuplicated"
        id="delete-button"
        @click="onDeleteClick()"
      />
      <evocon-v-tooltip-wrap
        v-if="dialogData.itemData && !dialogData.isDuplicated"
        :text="$t('Duplicate')"
      >
        <template #activator="{ props }">
          <evocon-v-button
            id="copy-button"
            :icon="mdiContentDuplicate"
            v-bind="props"
            @click="onCopyClick()"
          />
        </template>
      </evocon-v-tooltip-wrap>
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        type="secondary"
        :text="$t('Cancel')"
        @click="closeDialog()"
      />
      <evocon-v-button
        id="save-button"
        type="primary-light"
        :text="$t('Apply')"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiInformationOutline, mdiRuler, mdiContrastCircle, mdiTextShort, mdiCheckCircleOutline,
  mdiContentDuplicate, mdiFormatListChecks, mdiDelete, mdiPlus, mdiDragVertical,
} from '@mdi/js';

import useGenericDialogStore from '@/stores/genericDialog';
import useDeviceStore from '@/stores/device';
import { checkTypes, getCheckTypesArray } from '@/constants/checklistsConstants';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import OrderingNumber from '@/components/atoms/OrderingNumber/index.vue';
import DraggableList from '@/components/molecules/DraggableList/index.vue';
import NewIndicator from '@/components/atoms/NewIndicator/index.vue';

const vectorIcons = {
  mdiInformationOutline,
  mdiRuler,
  mdiContrastCircle,
  mdiTextShort,
  mdiCheckCircleOutline,
  mdiContentDuplicate,
  mdiFormatListChecks,
  mdiDelete,
  mdiPlus,
  mdiDragVertical,
};

export default {
  name: 'SettingsChecklistItemEdit',
  components: {
    MultiLineSwitch,
    FormDialogTemplate,
    EvoconNumberInput,
    EvoconVInput,
    EvoconVButton,
    EvoconVTooltipWrap,
    SelectionInput,
    OrderingNumber,
    DraggableList,
    EvoconVTextarea,
    DeleteButton,
    NewIndicator,
  },
  data() {
    return {
      ...vectorIcons,
      checkTypes,
      valid: true,
      internalType: undefined,
      formData: {
        type: undefined,
        name: '',
        description: '',
        unit: '',
        minVal: undefined,
        maxVal: undefined,
        notApplicableEnabled: false,
        warningMessage: '',
        selectionOptions: [],
        multipleSelection: false,
        attachmentsEnabled: false,
        requiredSampleCount: null,
      },
      notApplicableString: this.$t('Allow "not applicable" as an option'),
      isDescriptionVisible: false,
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useDeviceStore, ['isMobileView']),
    dialogTitle() {
      if (this.dialogData.itemData) return this.$t('Task');
      return `${this.$t('New')}: ${this.$t('Task')}`;
    },
    types() {
      return getCheckTypesArray();
    },
    typeRule() {
      return !!this.formData.type || this.$t('Type');
    },
    nameRule() {
      return !!this.formData.name || (this.formData.type === checkTypes.MEASUREMENT ? this.$t('What has to be measured?') : this.$t('What has to be checked?'));
    },
    unitRule() {
      return !!this.formData.unit || this.$t('E.g. pcs, kg, litre');
    },
    maxValRule() {
      return ((!!this.formData.maxVal || this.formData.maxVal === 0) && (Number(this.formData.maxVal) > Number(this.formData.minVal) || !this.formData.minVal)) || this.$t('Maximum value');
    },
    minValRule() {
      return ((!!this.formData.minVal || this.formData.minVal === 0) && (Number(this.formData.minVal) < Number(this.formData.maxVal) || !this.formData.maxVal)) || this.$t('Minimum value');
    },
    requiredSampleCountRule() {
      if (!this.formData.requiredSampleCount) return true;
      if (this.formData.requiredSampleCount < 2 || this.formData.requiredSampleCount > 100) {
        return this.$t('Value must be between {min} and {max}', { min: 2, max: 100 });
      }
      return true;
    },
    warningMessageHint() {
      if (this.formData.type === checkTypes.YES_NO) {
        return this.$t('Message to operators when the answer is No');
      }
      return this.$t('Message to operators when measurement is out of range');
    },
  },
  mounted() {
    if (this.dialogData.itemData) this.setData(this.dialogData.itemData);
    this.isDescriptionVisible = this.formData.description?.length > 0;
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    async validate() {
      this.$refs.form.validate();
    },
    async onSaveClick() {
      await this.validate();
      if (this.valid) {
        const payload = { ...this.formData };

        if ([checkTypes.MEASUREMENT, checkTypes.YES_NO].includes(payload.type) && !payload.multipleSelection) {
          payload.requiredSampleCount = null;
        }

        this.dialogData.action(payload);
        this.closeDialog();
      }
    },
    onCopyClick() {
      this.dialogData.duplicate(this.formData);
    },
    onDeleteClick() {
      this.dialogData.delete();
      this.closeDialog();
    },
    setData(data) {
      this.formData = { ...data };
      if (this.formData.type === checkTypes.SELECTION) {
        this.internalType = data.multipleSelection ? checkTypes.MULTI_SELECT : checkTypes.SINGLE_SELECT;
      } else {
        this.internalType = this.formData.type;
      }
    },
    onTypeChange([type]) {
      this.internalType = type;
      if ([checkTypes.SINGLE_SELECT, checkTypes.MULTI_SELECT].includes(type)) {
        if (this.formData.type !== checkTypes.SELECTION) this.formData.selectionOptions = [{ value: '' }]; // do not reset when switching between single and multi select
        this.formData.type = checkTypes.SELECTION;
        this.formData.multipleSelection = type === checkTypes.MULTI_SELECT;
      } else {
        this.formData.type = type;
      }
      this.resetFormValues(this.formData.type);
      this.isDescriptionVisible = this.formData.description?.length > 0;
    },
    resetFormValues(type) {
      if (type !== checkTypes.MEASUREMENT) {
        this.formData.unit = '';
        this.formData.minVal = null;
        this.formData.maxVal = null;
      }
      if (![checkTypes.MEASUREMENT, checkTypes.YES_NO].includes(type)) {
        this.formData.requiredSampleCount = null;
        this.formData.warningMessage = '';
      }
      if (type !== checkTypes.SELECTION) {
        this.formData.selectionOptions = [];
      }
      if (![checkTypes.MULTI_SELECT, checkTypes.MEASUREMENT, checkTypes.YES_NO].includes(this.internalType)) {
        this.formData.multipleSelection = false;
      }
    },
  },
};
</script>

<style scoped>
.number-container {
  height: 56px;
  width: 24px;
  display: flex;
  align-items: center;
}
</style>
