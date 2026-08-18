<template>
  <v-menu
    v-model="isOpen"
    :close-on-content-click="false"
    transition="scale-transition"
    offset="-20"
    min-width="290"
    max-width="290"
  >
    <template #activator="{ props }">
      <evocon-v-input
        :model-value="formattedValue"
        v-bind="{ ...$attrs, ...props }"
        :placeholder="$t('Select date')"
        :append-inner-icon="icon"
        :required="required"
        :disabled="disabled"
        readonly
        :clearable="clearable"
        :persistent-hint="persistentHint"
        @click:clear="clearInput"
      />
    </template>
    <component
      :is="componentName"
      :model-value="modelValue"
      :min="min"
      :max="max"
      @update:model-value="onDateInput"
      @change="onDateChange"
    >
      <template #actions>
        <v-spacer />
        <evocon-v-button
          v-if="clearable"
          type="secondary"
          :text="$t('Clear')"
          @click="clearInput"
        />
        <evocon-v-button
          :disabled="!modelValue && required"
          type="primary-light"
          :text="$t('Save')"
          @click="onSaveClick"
        />
      </template>
    </component>
  </v-menu>
</template>
<script>
import { mdiCalendar, mdiCalendarRange } from '@mdi/js';

import EvoconVDatePicker from '@/components/atoms/EvoconVDatePicker/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import DateRangePicker from '@/components/molecules/DateRangePicker/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { formatDate } from '@/helpers/date/formatDate';

export default {
  name: 'EvoconDateInput',
  components: {
    EvoconVDatePicker, EvoconVInput, DateRangePicker, EvoconVButton,
  },
  props: {
    modelValue: { type: [String, Array], default: null },
    formatFn: {
      type: Function,
      default: null,
    },
    min: {
      type: String,
      default: '',
    },
    max: {
      type: String,
      default: '',
    },
    persistentHint: {
      type: Boolean,
      default: true,
    },
    required: {
      type: Boolean,
    },
    range: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    clearable: {
      type: Boolean,
    },
  },
  emits: ['update:model-value', 'change'],
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    formattedValue() {
      if (!this.modelValue) return '';
      if (this.formatFn) return this.formatFn(this.modelValue);
      return formatDate(this.modelValue, 'long');
    },
    icon() {
      if (this.range) return mdiCalendarRange;
      return mdiCalendar;
    },
    componentName() {
      if (this.range) return 'DateRangePicker';
      return 'EvoconVDatePicker';
    },
  },
  methods: {
    onDateInput(val) {
      this.$emit('update:model-value', val);
    },
    onDateChange(val) {
      this.$emit('change', val);
    },
    clearInput() {
      if (this.range) {
        this.$emit('update:model-value', []);
      } else {
        this.$emit('update:model-value', null);
      }
      this.isOpen = false;
    },
    onSaveClick() {
      this.isOpen = false;
    },
  },
};
</script>
