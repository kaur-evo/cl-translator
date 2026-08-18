<template>
  <v-snackbar
    :model-value="shiftNotificationVisible"
    timeout="-1"
    location="top right"
  >
    <span class="px-4 text-white">
      {{ $t('You will be directed to current shift in {count} seconds', { count: redirectTimer }) }}
    </span>
    <template #actions>
      <evocon-v-button
        color="white"
        type="secondary"
        :text="$t('Cancel')"
        @click="cancelTimer()"
      />
    </template>
  </v-snackbar>
</template>

<script>
import { mapState, mapActions } from 'pinia';

import { useProfileStore, useStationStore, useShiftNotificationStore } from '@/stores/index';
import timelineApi from '@/api/timelineApi';
import CustomInterval from '@/helpers/interval/CustomInterval';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import logApi from '@/api/logApi';

export default {
  name: 'ShiftNotification',
  components: {
    EvoconVButton,
  },
  data() {
    return {
      redirectTimer: 180,
      timer: null,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['shiftviewStationUserRole']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftNotificationStore, ['shiftNotificationVisible']),
  },
  watch: {
    shiftNotificationVisible(newVal) {
      if (newVal) this.startTimer();
    },
    redirectTimer(val) {
      if (val === 0) {
        this.clearTimerInterval();
        this.redirectToLatestShift();
      }
    },
  },
  beforeUnmount() {
    this.clearTimerInterval();
  },
  methods: {
    ...mapActions(useShiftNotificationStore, ['resetShiftNotificationTimer', 'cancelShiftNotificationTimer']),
    cancelTimer() {
      this.clearTimerInterval();
      if (this.shiftviewStationUserRole === 'LINEVIEW_USER') {
        this.resetShiftNotificationTimer();
      } else {
        this.cancelShiftNotificationTimer();
      }
    },
    async redirectToLatestShift() {
      const timelineResponse = await timelineApi.getCurrent(this.lineviewStation.id);
      this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId: timelineResponse.shift.id } }).catch((e) => {
        logApi.postConsoleError([{ type: 'redirect error - notification', message: JSON.stringify(e) }]);
      });
    },
    decreaseTimerTime() {
      this.redirectTimer -= 1;
    },
    startTimer() {
      this.redirectTimer = 180;
      this.timer = CustomInterval.createInterval(this.decreaseTimerTime, 1000);
    },
    clearTimerInterval() {
      if (this.timer) this.timer = this.timer.clear();
    },
  },
};
</script>
