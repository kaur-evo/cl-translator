<template>
  <static-mr-evocon
    id="static-mr-evocon"
    :state="oeeStatus"
    :img-folder="imgFolder"
    :max-width="maxWidth"
    :max-height="maxHeight"
  />
</template>
<script>

import { mapState } from 'pinia';

import StaticMrEvocon from '@/components/atoms/StaticMrEvocon/index.vue';
import { useShiftStore, useStationStore } from '@/stores';

export default {
  name: 'HeaderMrEvocon',
  components: { StaticMrEvocon },
  props: {
    maxWidth: {
      type: [String],
      default: '240px',
    },
    maxHeight: {
      type: [String],
      default: '240px',
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftStore, ['statistics']),
    imgFolder() {
      if (this.isSpecial) return 'special';
      return 'regular';
    },
    totalOee() {
      if (!this.statistics || !this.statistics.shiftTotal) return 0;
      return (this.statistics.shiftTotal?.oee ?? 0) * 100;
    },
    totalQuantity() {
      if (!this.statistics || !this.statistics.shiftTotal) return 0;
      return this.statistics.shiftTotal?.quantity;
    },
    oeeStatus() {
      if (this.totalQuantity === 0 && this.statistics.shiftTotal.delaysTime === 0) return 'noshift';
      if (this.totalQuantity === 0) return 'rollEyes';
      if (this.totalOee < this.lineviewStation.oeeGoalSad) return 'negative';
      if (this.totalOee < this.lineviewStation.oeeGoalHappy) return 'neutral';
      return 'positive';
    },
  },
};
</script>
<style lang="less" scoped></style>
