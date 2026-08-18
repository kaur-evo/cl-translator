<template>
  <v-card
    class="selector-card"
    :class="{ 'selection-error': showError }"
    :style="{ '--max-height': height }"
  >
    <template v-if="title">
      <v-card-title class="text-body-large font-weight-medium" :class="{ 'mb-1 d-flex flex-column align-start': additionalText }">
        {{ title }}
        <span
          v-if="additionalText"
          class="text-body-small text-secondary"
        >
          {{ additionalText }}
        </span>
      </v-card-title>
      <v-divider />
    </template>
    <v-card-subtitle class="py-2">
      <span
        class="text-label-small"
        :class="{ 'text-error': showError }"
      >
        {{ subtitle }}
      </span>
    </v-card-subtitle>
    <v-card-text class="px-2 py-0">
      <v-list
        v-if="items.length > 0"
        :selected="[modelValue]"
        class="pt-0"
        :disabled="disabled"
        :mandatory="mandatory"
        select-strategy="single-independent"
        @update:selected="onChange"
      >
        <v-list-item
          v-for="(item) in items"
          :key="`select-item-${item[itemValue]}`"
          :ref="`select-item-${item[itemValue]}`"
          :value="item[itemValue]"
          class="rounded overflow-hidden"
          active-class="font-weight-medium text-primary"
          :disabled="disabled"
        >
          <list-item-contents
            :primary-text="item[itemText]"
            :secondary-text="itemSubtitleFn ? itemSubtitleFn(item) : item[itemSubtitleKey]"
            :input-value="item[itemValue] === modelValue"
            :dark="false"
            :class="{ 'py-2': itemSubtitleKey }"
          />
          <template #append>
            <slot name="append" :item="item" />
            <v-list-item-action v-if="itemAppendIcon">
              <v-icon>{{ itemAppendIcon }}</v-icon>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
      <div v-else class="d-flex justify-center py-4">
        {{ $t('No data available') }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';

export default {
  name: 'ShiftviewSelect',
  components: { ListItemContents },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    itemAppendIcon: {
      type: String,
      default: '',
    },
    itemText: {
      type: String,
      default: 'name',
    },
    itemValue: {
      type: String,
      default: 'id',
    },
    height: {
      type: String,
      default: '',
    },
    itemSubtitleKey: {
      type: String,
      default: '',
    },
    itemSubtitleFn: {
      type: Function,
      default: null,
    },
    mandatory: {
      type: Boolean,
    },
    showError: {
      type: Boolean,
    },
    additionalText: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
    },
  },
  emits: ['update:modelValue'],
  updated() {
    this.scrollIntoView();
  },
  methods: {
    scrollIntoView() {
      const selectedItem = this.$refs[`select-item-${this.modelValue}`];
      if (!selectedItem || !selectedItem.length) return;
      const element = selectedItem[0];
      // use 'instant' because 'smooth' is buggy if there are multiple components on the page
      element.$el.scrollIntoView({ behavior: 'instant', block: 'center' });
    },
    onChange(val) {
      this.$emit('update:modelValue', val[0]);
    },
  },
};
</script>

<style lang="less" scoped>
.selector-card {
  max-height: var(--max-height);
  overflow-y: auto;
}

.selection-error {
  border: 1px solid rgb(var(--v-theme-error)) !important;
}
</style>
