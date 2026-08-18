<template>
  <header-block-button
    :title="shiftDateAndName"
    :title-class="titleClass"
    :large="large"
    @click="openShiftDialog"
  >
    <template #navigation-arrows>
      <shift-nav :large="large" />
    </template>
    <template #live-indicator>
      <div v-if="isShiftRunning" class="d-flex my-auto" :class="compact ? 'ml-2' : 'ml-3'">
        <div
          v-if="status === deviceStatus.ONLINE"
          class="pulse my-auto"
          :class="{ 'pulse--small': compact }"
        />
        <div v-else-if="compactOffline">
          <v-avatar color="red" size="16">
            <v-icon size="12">
              {{ mdiRouterWirelessOff }}
            </v-icon>
          </v-avatar>
        </div>
        <div
          v-else
          class="live-indicator text-label-small font-weight-bold bg-error"
        >
          <v-icon>
            {{ mdiRouterWirelessOff }}
          </v-icon>
          {{ $t('Offline') }}
        </div>
      </div>
    </template>
  </header-block-button>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiCalendarRange, mdiRouterWirelessOff } from '@mdi/js';

import { useDeviceStore, useProfileStore, useShiftStore, useGenericDialogStore } from '@/stores/index';
import { firstUpper } from '@/helpers/string-formatting';
import shiftviewDialogs from '@/constants/dialogConfigs';
import HeaderBlockButton from '@/components/molecules/HeaderBlockButton/index.vue';
import ShiftNav from '@/components/organisms/shiftview/ShiftNav/index.vue';
import { formatDate } from '@/helpers/date/formatDate';
import { formatWeekday } from '@/helpers/date/formatLocaleDate';
import deviceStatus from '@/constants/deviceStatus';

const vectorIcons = { mdiCalendarRange, mdiRouterWirelessOff };

export default {
  name: 'ShiftViewShiftSelect',
  components: {
    HeaderBlockButton,
    ShiftNav,
  },
  props: {
    titleClass: { type: String, default: '' },
    status: { type: String, default: deviceStatus.ONLINE },
    large: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
    compactOffline: { type: Boolean, default: false },
  },
  data() {
    return {
      ...vectorIcons,
      deviceStatus,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useProfileStore, ['language']),
    ...mapState(useShiftStore, ['shift', 'isShiftRunning']),
    formattedShiftDate() {
      const shiftDate = new Date(`${this.shift.shiftDate}T00:00:00`);
      const weekdayFormat = this.compact ? 'narrow' : 'long';
      const isCurrentYear = shiftDate.getFullYear() === new Date().getFullYear();
      const dateLength = this.compact || isCurrentYear ? 'short' : 'long';

      const weekdayName = formatWeekday(shiftDate, this.language, weekdayFormat);

      return `${weekdayName} ${formatDate(shiftDate, dateLength)}`;
    },
    shiftDateAndName() {
      return `${firstUpper(this.formattedShiftDate)} - ${this.shift.shiftName}`;
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    openShiftDialog() {
      this.openDialog({
        ...shiftviewDialogs.SHIFT_SELECT,
        allowFullscreen: this.isMobileView,
        width: 330,
      });
    },
  },
};
</script>
<style lang="less" scoped>
.live-indicator {
  padding: 2px 4px;
  border-radius: 4px;
  height: max-content;
}
</style>
