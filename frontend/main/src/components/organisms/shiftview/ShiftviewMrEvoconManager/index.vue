<template>
  <mr-evocon
    v-model:animation-name="animationName"
    class="mr-evocon-lottie"
    :repeat-interval-seconds="repeatInterval"
    @click="onMrEvoconClick"
    @animation-end="onAnimationEnd"
  />
</template>
<script>
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import MrEvocon from '@/components/molecules/MrEvocon/index.vue';
import { eventBus } from '@/eventBus';
import { useShiftStore, useStationStore } from '@/stores';

export default {
  name: 'MrEvoconManager',
  components: { MrEvocon },
  data() {
    return {
      isFirstLoad: true,
      clickTimeout: null,
      idleTimeout: null,
      oeeLimitForRollEyes: 105,
      idleWaitSecondsLookAround: 60,
      currentAnimation: 'entrance',
      shiftEndTimeout: null,
      firstLoadTimeout: null,
    };
  },
  computed: {
    ...mapState(useShiftStore, ['statistics', 'shift']),
    ...mapState(useStationStore, ['lineviewStation']),
    animationName() {
      if (this.isFirstLoad) return 'entrance';
      if (!this.currentAnimation || this.currentAnimation === 'entrance') return this.oeeStatus;
      return this.currentAnimation;
    },
    repeatInterval() {
      if (this.currentAnimation === 'lookAround') return this.idleWaitSecondsLookAround;
      return -1;
    },
    totalOee() {
      if (!this.statistics || !this.statistics.shiftTotal) return 0;
      return (this.statistics.shiftTotal?.oee ?? 0) * 100;
    },
    totalQuantity() {
      if (!this.statistics || !this.statistics.shiftTotal) return 0;
      return this.statistics.shiftTotal?.quantity;
    },
    currentHourStats() {
      const currentHour = DateTime.now().setZone(this.lineviewStation.zoneId).set({ minutes: 0, seconds: 0, milliseconds: 0 }).toISO();
      return { ...this.statistics.hourStatistics[currentHour], dateTime: currentHour };
    },
    hasGoodShiftPerformance() {
      const overPerformance = 1.05;
      return Object.values(this.statistics.hourStatistics).every((hourStat) => hourStat.quantity === 0 || hourStat.performance < overPerformance);
    },
    isWorldClassOEE() {
      const worldClassOEE = 0.85;
      return this.totalOee >= worldClassOEE && this.hasGoodShiftPerformance;
    },
    oeeStatus() {
      if (this.totalQuantity === 0 && this.statistics.shiftTotal.delaysTime === 0) return 'meditate';
      if (this.totalQuantity === 0 || this.totalOee >= this.oeeLimitForRollEyes) return 'loopyRollEyes';
      if (this.totalOee < this.lineviewStation.oeeGoalSad) return 'negative';
      if (this.totalOee < this.lineviewStation.oeeGoalHappy) return 'neutral';
      return 'positive';
    },
  },
  watch: {
    animationName(val, prev) {
      if (val !== prev) {
        clearTimeout(this.idleTimeout);
        if (this.oeeStatus === 'positive') {
          this.idleTimeout = setTimeout(() => {
            if (this.oeeStatus === 'positive') {
              this.currentAnimation = 'lookAround';
            } else {
              clearTimeout(this.idleTimeout);
            }
          }, this.idleWaitSecondsLookAround * 1000);
        }
      }
    },
    oeeStatus(val, prev) {
      if (val !== prev) {
        if (val === 'positive') {
          this.currentAnimation = 'wink';
        } else if (val === 'neutral') {
          this.currentAnimation = 'shakeHead';
        } else if (val === 'negative') {
          this.currentAnimation = 'angry';
        } else {
          this.currentAnimation = val;
        }
      }
    },
    shift() {
      this.setShiftEndTimeout();
    },
    currentHourStats(newVal, prevVal) {
      const isNewHour = newVal.dateTime && prevVal.dateTime && newVal.dateTime !== prevVal.dateTime;
      if (!isNewHour) return;
      const worldClassHourTarget = 0.9;
      const isQtyTargetReached = prevVal.quantity / prevVal.idealQty >= worldClassHourTarget;
      if (isQtyTargetReached && this.hasGoodShiftPerformance) this.currentAnimation = 'worldClassOEE';
    },
  },
  created() {
    eventBus.$on('scrap-saved', this.onScrapSave);
    eventBus.$on('stop-reason-saved', this.onStopReasonSaved);
    eventBus.$on('changeover-saved', this.onChangeoverSaved);
    eventBus.$on('team-saved', this.onTeamSaved);
    eventBus.$on('checklist-saved', this.onChecklistSaved);
    eventBus.$on('batch-target-reached', this.onBatchTargetReached);
  },
  mounted() {
    this.firstLoadTimeout = setTimeout(() => {
      this.isFirstLoad = false;
    }, 1000);
    this.setShiftEndTimeout();
  },
  beforeUnmount() {
    clearTimeout(this.firstLoadTimeout);
    clearTimeout(this.shiftEndTimeout);
    this.shiftEndTimeout = null;
    clearTimeout(this.clickTimeout);
    this.clickTimeout = null;
    clearTimeout(this.idleTimeout);
    this.idleTimeout = null;
    eventBus.$off('scrap-saved', this.onScrapSave);
    eventBus.$off('stop-reason-saved', this.onStopReasonSaved);
    eventBus.$off('changeover-saved', this.onChangeoverSaved);
    eventBus.$off('team-saved', this.onTeamSaved);
    eventBus.$off('checklist-saved', this.onChecklistSaved);
    eventBus.$off('batch-target-reached', this.onBatchTargetReached);
  },
  methods: {
    onMrEvoconClick() {
      this.currentAnimation = 'wave';
      clearTimeout(this.clickTimeout);
      const delay = 3000;
      this.clickTimeout = setTimeout(() => {
        this.currentAnimation = this.oeeStatus;
      }, delay);
    },
    onAnimationEnd() {
      this.currentAnimation = '';
    },
    onScrapSave() {
      this.currentAnimation = 'rollEyes';
      clearTimeout(this.clickTimeout);
      this.clickTimeout = setTimeout(() => {
        this.currentAnimation = this.oeeStatus;
      }, 200);
    },
    onStopReasonSaved() {
      const randInt = Math.floor(Math.random() * 3);
      if (randInt === 0) this.currentAnimation = 'thumbsUp';
      else this.currentAnimation = 'wink';
    },
    onChangeoverSaved() {
      this.currentAnimation = 'wink';
    },
    onTeamSaved() {
      this.currentAnimation = 'wave';
    },
    onChecklistSaved() {
      this.currentAnimation = 'thumbsUp';
    },
    onBatchTargetReached() {
      this.currentAnimation = 'thumbsUp';
    },
    setShiftEndTimeout() {
      clearTimeout(this.shiftEndTimeout);
      this.shiftEndTimeout = null;
      const minutesToShiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zone: this.lineviewStation.zoneId })
        .diffNow('minutes')
        .minutes;
      const showMinutesBeforeShiftEnd = 45;
      if (minutesToShiftEnd > showMinutesBeforeShiftEnd) { // show 45 min before shift end
        this.shiftEndTimeout = setTimeout(() => {
          if (this.isWorldClassOEE) this.currentAnimation = 'worldClassOEE';
        }, (minutesToShiftEnd - showMinutesBeforeShiftEnd) * 60 * 1000);
      }
    },
  },
};
</script>
