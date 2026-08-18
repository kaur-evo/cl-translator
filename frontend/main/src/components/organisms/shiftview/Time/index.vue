<template>
  <div
    class="time-component d-flex align-center justify-center flex-nowrap bg-black rounded flex-grow-1"
    :class="{'time-component--large': large}"
  >
    <div class="d-flex">
      <span :class="timeClass" class="font-weight-medium">
        {{ formattedTime }}
      </span>
      <span class="ml-1 text-tertiary-dark text-body-small">
        {{ timeAddition }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import { useStationStore, useProfileStore } from '@/stores/index';
import CustomInterval from '@/helpers/interval/CustomInterval';
import { timeFormats } from '@/constants/formattingConstants';

export default {
  name: 'TimeComponent',
  props: {
    timeClass: {
      type: String,
      default: 'text-body-large',
    },
    large: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      time: new Date(),
      timer: null,
    };
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['currentUser']),
    timeFormat() {
      return this.currentUser.timeFormat;
    },
    formattedTime() {
      const format = this.timeFormat === timeFormats['12H'] ? 'h:mm' : 'HH:mm';
      return DateTime.fromJSDate(this.time).setZone(this.lineviewStation.zoneId).toFormat(format);
    },
    timeAddition() {
      const format = this.timeFormat === timeFormats['12H'] ? 'a' : ':ss';
      return DateTime.fromJSDate(this.time).setZone(this.lineviewStation.zoneId).toFormat(format);
    },
  },
  created() {
    this.getTime();
    this.timer = CustomInterval.createInterval(this.getTime, 1000);
  },
  beforeUnmount() {
    if (this.timer) this.timer = this.timer.clear();
  },
  methods: {
    getTime() {
      this.time = new Date();
    },
  },
};
</script>

<style scoped lang="scss">
.time-component {
  height: 48px;

  &--large {
    height: 64px;
  }
}
</style>
