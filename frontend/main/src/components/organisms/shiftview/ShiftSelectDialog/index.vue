<template>
  <div>
    <dialog-toolbar
      :title="$t('Select shift')"
      :title-icon="mdiCalendarClock"
    />
    <v-card-text class="d-flex flex-column dialog-content py-0" :class="{ 'dialog-content--mobile': isMobileView, 'dialog-content--fullscreen': showFullscreenDialogs }">
      <v-progress-linear
        v-if="loading"
        indeterminate
      />
      <v-row v-else>
        <v-col class="d-flex justify-center" :cols="useHorizontalLayout ? 6 : 12">
          <evocon-v-date-picker
            v-model:model-value="selectedDate"
            v-model:picker-date="pickerDate"
            :min="firstShiftOfShiftviewStation.shiftDate"
            :max="currentDate"
            :get-allowed-dates="getAllowedDates"
            show-adjacent-months
            :small="isMobileView"
            max-width="max-content"
          />
        </v-col>
        <v-col :cols="useHorizontalLayout ? 6 : 12">
          <div>
            <p
              class="font-weight-bold text-center my-4"
              :class="isMobileView ? 'text-body-medium' : 'text-body-large'"
            >
              {{ $t('Shifts') }}
            </p>
            <v-chip-group
              v-if="selectedDateShifts"
              :model-value="shift.id"
              column
              class="centered"
            >
              <evocon-v-chip
                v-for="(option, i) in selectedDateShifts"
                :key="`shift-${i}`"
                :label="option.shiftName"
                :icon="shift.id === option.id ? mdiCheckboxMarkedCircle : mdiRadioboxBlank"
                type="primary"
                :size="isMobileView ? 'small' : 'default'"
                :active="shift.id === option.id"
                :dark="false"
                class="ma-1"
                @select="selectShift(option.id)"
              />
            </v-chip-group>
            <div v-else class="text-center">
              <span class="text-secondary-text">{{ $t('No shifts to display, please choose a date.') }}</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs && allowFullscreen }">
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog"
      />
    </v-card-actions>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { format, endOfMonth } from 'date-fns';
import { mdiCalendarClock, mdiCheckboxMarkedCircle, mdiRadioboxBlank } from '@mdi/js';

import {
  useShiftStore,
  useStationStore,
  useDeviceStore,
  useGenericDialogStore,
} from '@/stores/index';
import shiftApi from '@/api/shiftApi';
import parseDateStr from '@/helpers/date/parseDateStr';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVDatePicker from '@/components/atoms/EvoconVDatePicker/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiCalendarClock, mdiCheckboxMarkedCircle, mdiRadioboxBlank };

export default {
  name: 'ShiftSelectDialog',
  components: {
    EvoconVChip,
    DialogToolbar,
    EvoconVDatePicker,
    EvoconVButton,
  },
  data() {
    return {
      ...icons,
      selectedDate: undefined,
      pickerDate: undefined,
      availableShiftsMap: {},
      loading: true,
    };
  },
  computed: {
    ...mapState(useShiftStore, ['shift', 'firstShiftOfShiftviewStation']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useDeviceStore, ['isMobileView', 'isMobileLandscape', 'showFullscreenDialogs']),
    ...mapState(useGenericDialogStore, ['allowFullscreen']),
    selectedDateShifts() {
      return this.availableShiftsMap[this.pickerDate] && this.availableShiftsMap[this.pickerDate][this.selectedDate];
    },
    currentDate() {
      return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
    },
    useHorizontalLayout() {
      return this.isMobileLandscape && !this.$vuetify.display.xs;
    },
  },
  watch: {
    pickerDate() {
      this.setVisibleMonthShifts();
    },
    isMobileView(val) {
      this.setAllowFullscreen(val);
    },
  },
  mounted() {
    this.selectedDate = this.shift.shiftDate;
    this.pickerDate = this.shift.shiftDate.slice(0, 7);
    this.setVisibleMonthShifts();
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['setAllowFullscreen', 'closeDialog']),
    async setVisibleMonthShifts() {
      if (this.availableShiftsMap[this.pickerDate]?.length || this.pickerDate?.length !== 7) return;
      this.loading = true;
      const parsedPickerDate = parseDateStr(`${this.pickerDate}-01`);
      const shifts = await shiftApi.getShifts({
        stationId: this.lineviewStation.id,
        startDate: `${this.pickerDate}-01`,
        endDate: format(endOfMonth(parsedPickerDate), 'yyyy-MM-dd'),
      });

      this.addAvailableShifts(shifts);
      this.loading = false;
    },
    selectShift(shiftId) {
      if (!shiftId || this.shift.id === shiftId) return;
      this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId } }).catch((e) => e);
      this.closeDialog();
    },
    addAvailableShifts(shifts) {
      if (!shifts) return;
      const datesMapped = shifts.reduce((acc, shift) => {
        if (acc[shift.shiftDate]) acc[shift.shiftDate].push(shift);
        else acc[shift.shiftDate] = [shift];
        return acc;
      }, {});

      this.availableShiftsMap[this.pickerDate] = datesMapped;
    },
    getAllowedDates(dateObj, view) {
      if (view === 'month') {
        const date = format(dateObj, 'yyyy-MM-dd');
        return this.availableShiftsMap[this.pickerDate] && !!this.availableShiftsMap[this.pickerDate][date];
      }
      return true;
    },
  },
};
</script>
<style lang="less" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 0.9px - 116px);
  overflow-y: auto;

  &--fullscreen:not(.dialog-content--mobile), &--mobile.dialog-content--fullscreen {
    max-height: calc(var(--app-height) * 1px - 116px);
  }

  &--mobile:not(.dialog-content--fullscreen) {
    max-height: calc(var(--app-height) * 0.9px - 97px);
  }
}
</style>
