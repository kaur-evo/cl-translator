<template>
  <div class="header-row">
    <div class="d-flex">
      <shift-view-evocon-logo-btn class="ma-1" />
      <shift-view-station-select title-class="text-body-large" class="ma-1 flex-grow-1" />
      <shift-view-user-settings-btn class="ma-1" />
    </div>
    <div class="d-flex">
      <shift-view-shift-select
        title-class="text-body-large"
        :status="status"
        class="ma-1 flex-grow-1"
        compact-offline
      />
      <shift-view-widgets-button v-if="shiftExists" class="ma-1 flex-shrink-0" @click="openWidgetsSheet" />
    </div>
    <v-row v-if="shiftExists" class="quantity-widgets-row">
      <v-col cols="3" class="d-flex max-height-100">
        <shift-view-shift-quantity-block
          class="ma-1"
          target-class="text-body-medium"
          :min-shift-total-font-size="14"
          :max-shift-total-font-size="24"
          :loading="isShiftLoading"
        />
      </v-col>
      <v-col cols="6" class="d-flex max-height-100">
        <shift-view-batch-widget-block
          class="overflow-hidden ma-1"
          value-class="text-body-medium"
          header-bottom-margin-class="mb-0"
          button-size="small"
          show-current-batch
          :loading="isShiftLoading"
          @click:expand="onExpandBatchOverview"
        />
      </v-col>
      <v-col cols="3" class="d-flex max-height-100">
        <oee-component
          class="ma-1"
          oee-class="text-headline-medium"
          oee-components-class="text-label-small"
          :min-oee-font-size="14"
          :max-oee-font-size="24"
          :loading="isShiftLoading"
        />
      </v-col>
    </v-row>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useShiftStore, useShiftViewStore, useBottomSheetStore } from '@/stores/index';
import ShiftViewShiftQuantityBlock from '@/components/organisms/shiftview/ShiftViewShiftQuantityBlock/index.vue';
import ShiftViewEvoconLogoBtn from '@/components/organisms/shiftview/ShiftViewEvoconLogoBtn/index.vue';
import ShiftViewStationSelect from '@/components/organisms/shiftview/ShiftViewStationSelect/index.vue';
import ShiftViewShiftSelect from '@/components/organisms/shiftview/ShiftViewShiftSelect/index.vue';
import ShiftViewWidgetsButton from '@/components/organisms/shiftview/ShiftViewWidgetsButton/index.vue';
import ShiftViewBatchWidgetBlock from '@/components/organisms/shiftview/ShiftViewBatchWidgetBlock/index.vue';
import ShiftViewWidgetsBottomSheet from '@/components/organisms/shiftview/ShiftViewWidgetsBottomSheet/index.vue';
import ShiftViewUserSettingsBtn from '@/components/organisms/shiftview/ShiftViewUserSettingsBtn/index.vue';
import OeeComponent from '@/components/organisms/shiftview/OeeComponent/index.vue';
import BatchOverviewContent from '@/components/organisms/shiftview/BatchOverviewContent/index.vue';

export default {
  name: 'ShiftViewSmallHeader',
  components: {
    ShiftViewEvoconLogoBtn,
    ShiftViewStationSelect,
    ShiftViewShiftSelect,
    ShiftViewWidgetsButton,
    ShiftViewShiftQuantityBlock,
    ShiftViewBatchWidgetBlock,
    ShiftViewUserSettingsBtn,
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
    ...mapActions(useBottomSheetStore, ['openBottomSheet']),
    openWidgetsSheet() {
      this.openBottomSheet({
        component: ShiftViewWidgetsBottomSheet,
        componentProps: { widgetKey: 0 },
        title: this.$t('Metrics'),
        height: 360,
      });
    },
    onExpandBatchOverview(tab) {
      this.openBottomSheet({
        component: BatchOverviewContent,
        componentProps: { tab },
        title: this.$t('Batches overview'),
        theme: 'light',
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.header-row {
  height: 252px;
  display: flex;
  flex-direction: column;
}
.quantity-widgets-row {
  min-height: 0;
}
</style>
