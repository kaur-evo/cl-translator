<template>
  <v-row class="header-row">
    <v-col cols="4" class="d-flex flex-column max-height-100">
      <div class="d-flex">
        <shift-view-evocon-logo-btn class="ma-1" large />
        <shift-view-station-select class="ma-1 flex-grow-1" title-class="text-headline-large" large />
      </div>
      <v-row v-if="shiftExists" :class="{ 'flex-grow-0': !isShiftLoading }">
        <v-col cols="6" class="d-flex flex-column">
          <shift-view-shift-quantity-block
            class="ma-1"
            target-class="text-headline-medium"
            :min-shift-total-font-size="28"
            :max-shift-total-font-size="96"
            large
            :loading="isShiftLoading"
          />
        </v-col>
        <v-col cols="6" class="d-flex flex-column">
          <shift-view-current-batch-block
            class="ma-1 flex-grow-1"
            value-class="text-headline-medium"
            show-flag-icon
            large
            :loading="isShiftLoading"
          />
        </v-col>
      </v-row>
      <shift-view-batch-widget-block
        v-if="shiftExists"
        class="overflow-hidden ma-1"
        value-class="text-headline-medium"
        header-bottom-margin-class="mb-2"
        large
        :loading="isShiftLoading"
        @click:expand="openBatchOverview"
      />
    </v-col>
    <v-col cols="6" class="d-flex flex-column">
      <shift-view-shift-select
        :status="status"
        class="ma-1"
        title-class="text-headline-large"
        large
      />
      <v-row v-if="shiftExists">
        <v-col cols="6" class="d-flex flex-column">
          <widget-holder
            class="ma-1 flex-grow-1"
            large
            widget-value-class="text-display-large"
            :loading="isShiftLoading"
          />
        </v-col>
        <v-col cols="6" class="d-flex flex-column">
          <widget-holder
            class="ma-1 flex-grow-1"
            :widget-key="1"
            :default-active-tab="1"
            large
            widget-value-class="text-display-large"
            :loading="isShiftLoading"
          />
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="2" class="d-flex flex-column">
      <div class="d-flex">
        <time-component class="ma-1" large time-class="text-headline-large" />
        <shift-view-user-settings-btn class="ma-1" large />
      </div>
      <oee-component
        v-if="shiftExists"
        class="ma-1"
        oee-class="text-display-large"
        oee-components-class="text-headline-medium"
        label-class="large-label"
        :min-oee-font-size="28"
        :max-oee-font-size="96"
        :loading="isShiftLoading"
      />
    </v-col>
  </v-row>
</template>
<script>
import { defineAsyncComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { useShiftStore, useShiftViewStore, useGenericDialogStore } from '@/stores/index';
import TimeComponent from '@/components/organisms/shiftview/Time/index.vue';
import ShiftViewEvoconLogoBtn from '@/components/organisms/shiftview/ShiftViewEvoconLogoBtn/index.vue';
import ShiftViewStationSelect from '@/components/organisms/shiftview/ShiftViewStationSelect/index.vue';
import ShiftViewShiftSelect from '@/components/organisms/shiftview/ShiftViewShiftSelect/index.vue';
import WidgetHolder from '@/components/organisms/shiftview/WidgetHolder/index.vue';
import ShiftViewCurrentBatchBlock from '@/components/organisms/shiftview/ShiftViewCurrentBatchBlock/index.vue';
import ShiftViewBatchWidgetBlock from '@/components/organisms/shiftview/ShiftViewBatchWidgetBlock/index.vue';
import ShiftViewUserSettingsBtn from '@/components/organisms/shiftview/ShiftViewUserSettingsBtn/index.vue';
import ShiftViewShiftQuantityBlock from '@/components/organisms/shiftview/ShiftViewShiftQuantityBlock/index.vue';
import OeeComponent from '@/components/organisms/shiftview/OeeComponent/index.vue';

export default {
  name: 'ShiftViewExtraLargeHeader',
  components: {
    WidgetHolder,
    TimeComponent,
    ShiftViewEvoconLogoBtn,
    ShiftViewStationSelect,
    ShiftViewShiftSelect,
    ShiftViewCurrentBatchBlock,
    ShiftViewBatchWidgetBlock,
    ShiftViewUserSettingsBtn,
    ShiftViewShiftQuantityBlock,
    OeeComponent,
  },
  props: {
    status: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(useShiftStore, ['shiftExists']),
    ...mapState(useShiftViewStore, ['isShiftLoading']),
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    openBatchOverview(tab) {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('@/components/organisms/shiftview/BatchOverviewDialog/index.vue')),
        width: 900,
        data: { tab },
      };
      this.openDialog(dialogConfig);
    },
  },
};
</script>
<style lang="scss" scoped>
.header-row {
  height: 432px;
}
</style>
