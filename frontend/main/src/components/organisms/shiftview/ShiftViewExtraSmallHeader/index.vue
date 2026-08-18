<template>
  <v-row>
    <v-col :cols="isPortrait ? 12 : 6" class="d-flex">
      <shift-view-evocon-logo-btn class="ma-1" />
      <shift-view-station-select title-class="text-body-medium" class="ma-1 flex-grow-1" />
      <shift-view-user-settings-btn class="ma-1" />
    </v-col>
    <v-col :cols="isPortrait ? 12 : 6" class="d-flex">
      <shift-view-shift-select
        v-if="shiftExists"
        class="ma-1 flex-grow-1"
        title-class="text-body-medium"
        :status="status"
        compact
        compact-offline
      />
      <shift-view-widgets-button class="ma-1 flex-shrink-0" @click="openWidgetsSheet" />
    </v-col>
  </v-row>
  <mobile-shift-stats-row />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useShiftStore, useDeviceStore, useBottomSheetStore } from '@/stores/index';
import ShiftViewEvoconLogoBtn from '@/components/organisms/shiftview/ShiftViewEvoconLogoBtn/index.vue';
import ShiftViewStationSelect from '@/components/organisms/shiftview/ShiftViewStationSelect/index.vue';
import ShiftViewShiftSelect from '@/components/organisms/shiftview/ShiftViewShiftSelect/index.vue';
import ShiftViewWidgetsButton from '@/components/organisms/shiftview/ShiftViewWidgetsButton/index.vue';
import ShiftViewUserSettingsBtn from '@/components/organisms/shiftview/ShiftViewUserSettingsBtn/index.vue';
import MobileShiftStatsRow from '@/components/organisms/shiftview/MobileShiftStatsRow/index.vue';
import MobileShiftViewWidgetsDialog from '@/components/organisms/shiftview/MobileShiftViewWidgetsDialog/index.vue';

export default {
  name: 'ShiftViewExtraSmallHeader',
  components: {
    ShiftViewEvoconLogoBtn,
    ShiftViewStationSelect,
    ShiftViewShiftSelect,
    ShiftViewWidgetsButton,
    ShiftViewUserSettingsBtn,
    MobileShiftStatsRow,
  },
  props: {
    status: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(useShiftStore, ['shiftExists']),
    ...mapState(useDeviceStore, ['isPortrait']),
  },
  methods: {
    ...mapActions(useBottomSheetStore, ['openBottomSheet']),
    openWidgetsSheet() {
      this.openBottomSheet({
        component: MobileShiftViewWidgetsDialog,
      });
    },
  },
};
</script>
