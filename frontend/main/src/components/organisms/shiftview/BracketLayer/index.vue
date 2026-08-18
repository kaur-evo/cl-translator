<template>
  <brackets
    v-if="bracketRange.selectedRange && bracketRange.selectedRange.length"
    class="brackets"
    :shift-hours="shiftHours"
    @cancel="onBracketCancel"
    @selection-updated="onSelectionChanged"
  />
</template>

<script>
import { mapActions, mapState } from 'pinia';

import Brackets from '@/components/organisms/shiftview/Brackets/index.vue';
import { useShiftviewSelectionStore } from '@/stores';

export default {
  name: 'BracketLayer',
  components: {
    Brackets,
  },
  props: {
    shiftHours: { type: Array, default: () => [] },
  },
  computed: {
    ...mapState(useShiftviewSelectionStore, ['bracketRange']),
  },
  methods: {
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection', 'setBracketRange']),
    onBracketCancel() {
      this.clearSliceSelection();
    },
    onSelectionChanged(range) {
      this.setBracketRange({
        ...this.bracketRange, endTime: range[0], startTime: range[1], selectedRange: range,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.brackets {
  z-index: 99
}
</style>
