<template>
  <div class="chip-container text-center">
    <evocon-v-chip
      v-for="(item, index) in items"
      :key="index"
      type="primary"
      class="ma-1"
      :active="item.value === modelValue"
      :label="item.title"
      @click="selectItem(item, true)"
    />
  </div>
</template>
<script>
import { format } from 'date-fns';

import defaults from './defaults';

import listToKeyMap from '@/helpers/list/listToKeyMap';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import parseDateStr from '@/helpers/date/parseDateStr';

export default {
  name: 'PeriodSelectionList',
  components: { EvoconVChip },
  props: {
    modelValue: { type: String, default: '' },
    dateRange: { type: Array, default: () => [] },
    items: {
      type: Array,
      default: () => defaults,
    },
  },
  emits: ['change'],
  computed: {
    itemValueMap() {
      return listToKeyMap(this.items, 'value');
    },
  },
  watch: {
    modelValue() {
      this.setBySelectionType();
    },
  },
  mounted() {
    if (this.modelValue) {
      this.setBySelectionType();
    }
  },
  methods: {
    selectItem(item, byClick = false) {
      if (!item) return;
      let range;
      if (item.value === 'custom') {
        range = this.dateRange;
      } else {
        range = item.range;
      }
      if (!range.length) {
        this.$emit('change', { dateRange: [], value: item.value });
      } else if (range.length === 1) {
        let dateRange;
        if (byClick) {
          dateRange = [
            format(parseDateStr(range[0]), 'yyyy-MM-dd'),
            format(parseDateStr(range[0]), 'yyyy-MM-dd'),
          ];
        } else {
          dateRange = [
            format(parseDateStr(range[0]), 'yyyy-MM-dd'),
          ];
        }
        this.$emit('change', {
          dateRange,
          value: item.value,
        });
      } else {
        this.$emit('change', {
          dateRange: [
            format(parseDateStr(range[0]), 'yyyy-MM-dd'),
            format(parseDateStr(range[1]), 'yyyy-MM-dd'),
          ],
          value: item.value,
        });
      }
    },
    setBySelectionType() {
      const item = this.itemValueMap[this.modelValue];
      this.selectItem(item);
    },
  },
};
</script>
<style lang="scss" scoped>
.chip-container {
  max-width: 600px;
}
</style>
