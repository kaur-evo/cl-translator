<template>
  <div>
    <div class="d-flex flex-wrap">
      <template
        v-for="(item, index) in data"
        :key="`legend-${index}`"
      >
        <slot
          v-if="item.customSlot"
          :name="item.customSlot"
          :item="item"
          :index="index"
        />
        <div
          v-else
          class="mr-4 my-0 prevent-select"
          :class="{ 'cursor-pointer': item[itemValue] }"
          @click="toggleItem(item)"
        >
          <v-icon
            :color="item[itemColor]"
            :size="item[itemIconSize] || 18"
          >
            {{ getItemIcon(item) }}
          </v-icon>
          <span class="text-body-small ml-1 text-primary-text">
            {{ item[itemText] }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { mdiSquareRounded, mdiSquareRoundedOutline } from '@mdi/js';

export default {
  name: 'GraphLegend',
  props: {
    data: { type: Array, default: () => [] },
    itemColor: { type: String, default: 'color' },
    itemText: { type: String, default: 'text' },
    itemIcon: { type: String, default: 'icon' },
    itemIconSize: { type: String, default: 'iconSize' },
    itemValue: { type: String, default: 'value' },
    modelValue: { type: Array, default: () => [] },
  },
  emits: ['update:model-value'],
  computed: {
    valueSet() {
      return new Set(this.modelValue);
    },
  },
  methods: {
    isItemSelected(item) {
      return this.valueSet.has(item[this.itemValue]);
    },
    isSelectableItem(item) {
      return item[this.itemValue] !== undefined;
    },
    getItemIcon(item) {
      if (item[this.itemIcon] !== undefined) return item[this.itemIcon];
      if (!this.isSelectableItem(item) || this.isItemSelected(item)) return mdiSquareRounded;
      return mdiSquareRoundedOutline;
    },
    toggleItem(item) {
      const value = item[this.itemValue];
      if (value === undefined) return;
      const valueSetCopy = new Set(this.valueSet);
      if (valueSetCopy.has(value)) {
        valueSetCopy.delete(value);
      } else {
        valueSetCopy.add(item[this.itemValue]);
      }
      this.$emit('update:model-value', Array.from(valueSetCopy));
    },
  },
};
</script>
