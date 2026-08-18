<template>
  <div class="position-relative">
    <template v-if="type === 'number'">
      <evocon-number-input
        :model-value="modelValue"
        v-bind="$attrs"
        :suffix="items.length === 1 ? items[0].name : undefined"
        @update:model-value="$emit('update:model-value', $event)"
      >
        <template
          v-if="items.length > 1"
          #append-inner
        >
          <div :style="{ width: selectWidth }" />
        </template>
      </evocon-number-input>
      <div class="input-selector">
        <div :style="{ width: selectWidth }">
          <selection-input
            v-if="items.length > 1"
            :model-value="[selectedItem]"
            class="input-selector"
            :items="items"
            is-single-select
            hide-search
            required
            @update:model-value="$emit('selection', $event[0])"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <evocon-v-input
        :model-value="modelValue"
        v-bind="$attrs"
        :suffix="items.length === 1 ? items[0] : undefined"
        @update:model-value="$emit('update:model-value', $event)"
      >
        <template
          v-if="items.length > 1"
          #append-inner
        >
          <div :style="{ width: selectWidth }" />
        </template>
      </evocon-v-input>
      <div class="input-selector">
        <div :style="{ width: selectWidth }">
          <selection-input
            v-if="items.length > 1"
            :model-value="[selectedItem]"
            :items="items"
            is-single-select
            hide-search
            required
            @update:model-value="$emit('selection', $event[0])"
            @click.stop=""
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { getTextWidth } from '@/helpers/d3Helpers';

export default {
  name: 'EvoconVInputWithSelector',
  components: {
    EvoconVInput,
    EvoconNumberInput,
    SelectionInput,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: [Number, String],
      default: '',
    },
    selectedItem: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
  },
  emits: ['update:model-value', 'selection'],
  data() {
    return {
      selectWidth: '100px',
    };
  },
  watch: {
    items(newVal) {
      this.calculateSelectWidth(newVal);
    },
  },
  mounted() {
    this.calculateSelectWidth(this.items);
  },
  methods: {
    async calculateSelectWidth(items) {
      setTimeout(() => {
        let longestItem = '';
        items.forEach((item) => {
          const displayText = item.name || item;
          if (displayText.length > longestItem.length) longestItem = displayText;
        });
        // eslint-disable-next-line no-magic-numbers
        this.selectWidth = `${getTextWidth(longestItem, 16, 'Open Sans, sans-serif') + 24 + 36 + 6 + 6}px`; // 24 = arrow; 36 = spacing; 6 = padding; 6 = for safery as getTextWidth is not accurate
      }, 200);
    },
  },
};
</script>

<style lang="less" scoped>
.input-selector :deep(.v-field--variant-filled .v-field__overlay) {
  display: none;
}
.input-selector :deep(.v-field__outline) {
  display: none;
}

.input-selector {
  position: absolute;
  right: 0;
  top: 0;
}
.position-relative {
  position: relative;
}
</style>
