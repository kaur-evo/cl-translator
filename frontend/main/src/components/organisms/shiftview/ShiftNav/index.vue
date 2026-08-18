<template>
  <v-row
    class="justify-end flex-nowrap flex-shrink-1 flex-grow-0"
    :class="{ disabled: !shiftExists }"
  >
    <v-tooltip
      :open-delay="500"
      location="bottom"
    >
      <template #activator="{ props }">
        <evocon-v-button
          id="prev-shift-btn"
          :icon="mdiChevronLeft"
          :disabled="shift.id === firstShiftOfShiftviewStation.id"
          color="white"
          :size="large ? 'large' : 'default'"
          v-bind="props"
          @click.stop="navigateToShift('previous')"
        />
      </template>
      <span class="flex-nowrap">{{ $t('Previous shift') }}</span>
    </v-tooltip>
    <v-tooltip
      :open-delay="500"
      location="bottom"
    >
      <template #activator="{ props }">
        <evocon-v-button
          id="next-shift-btn"
          :icon="mdiChevronRight"
          :disabled="currentShift.id === shift.id"
          color="white"
          :size="large ? 'large' : 'default'"
          v-bind="props"
          @click.stop="navigateToShift('next')"
        />
      </template>
      <span class="flex-nowrap">{{ $t('Next shift') }}</span>
    </v-tooltip>
    <v-tooltip
      :open-delay="500"
      location="bottom"
    >
      <template #activator="{ props }">
        <evocon-v-button
          id="current-shift-btn"
          :icon="mdiPageLast"
          :disabled="currentShift.id === shift.id"
          color="white"
          :size="large ? 'large' : 'default'"
          v-bind="props"
          @click.stop="navigateToShift('current')"
        />
      </template>
      <span class="flex-nowrap">{{ $t('Current shift') }}</span>
    </v-tooltip>
  </v-row>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiChevronLeft, mdiChevronRight, mdiPageLast } from '@mdi/js';

import timelineApi from '@/api/timelineApi';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { useShiftStore, useStationStore, useGenericNotificationStore } from '@/stores/index';

const vectorIcons = { mdiChevronLeft, mdiChevronRight, mdiPageLast };
export default {
  name: 'ShiftNav',
  components: {
    EvoconVButton,
  },
  props: {
    large: { type: Boolean, default: false },
  },
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useShiftStore, ['shift', 'shiftExists', 'currentShift', 'firstShiftOfShiftviewStation']),
    ...mapState(useStationStore, ['lineviewStation']),
  },
  methods: {
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    async navigateToShift(type) {
      let timelineResponse;
      try {
        if (type === 'previous') {
          timelineResponse = await timelineApi.selectPrevious(this.shift.id);
        } else if (type === 'next') {
          timelineResponse = await timelineApi.selectNext(this.shift.id);
        } else if (type === 'current') {
          timelineResponse = await timelineApi.getCurrent(this.lineviewStation.id);
        }
        this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId: timelineResponse.shift.id } }).catch((e) => e);
      } catch {
        this.notifyError(this.$t('No shift found'));
      }
    },
  },
};
</script>
