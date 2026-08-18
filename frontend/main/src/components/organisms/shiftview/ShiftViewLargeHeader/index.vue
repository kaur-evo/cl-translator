<template>
  <v-row
    :class="{
      'header-row--extra-large': isExtraLarge,
      'header-row--large': isLarge,
      'header-row--medium': isMedium,
    }"
  >
    <v-col cols="5" class="d-flex flex-column max-height-100">
      <div class="d-flex">
        <shift-view-evocon-logo-btn class="ma-1" />
        <shift-view-station-select :title-class="fontClass" class="ma-1 flex-grow-1" />
      </div>
      <v-row v-if="shiftExists" :class="{ 'flex-grow-0': !isShiftLoading }">
        <v-col cols="5" class="d-flex flex-column">
          <shift-view-shift-quantity-block
            class="ma-1"
            :target-class="quantityTargetClass"
            :min-shift-total-font-size="scalableFontSize.min"
            :max-shift-total-font-size="scalableFontSize.max"
            :loading="isShiftLoading"
          />
        </v-col>
        <v-col cols="7" class="d-flex flex-column">
          <shift-view-current-batch-block
            class="ma-1 flex-grow-1"
            :value-class="isExtraLarge ? 'text-body-large' : 'text-body-medium'"
            :progress-type="isMedium ? 'circle' : 'bar'"
            :show-flag-icon="!isMedium"
            :loading="isShiftLoading"
          />
        </v-col>
      </v-row>
      <shift-view-batch-widget-block
        v-if="shiftExists"
        class="overflow-hidden ma-1"
        :value-class="isExtraLarge ? 'text-body-large' : 'text-body-medium'"
        :button-size="isMedium ? 'small' : 'default'"
        :loading="isShiftLoading"
        @click:expand="onExpandBatchOverview"
      />
    </v-col>
    <v-col cols="7" class="d-flex max-height-100">
      <v-row class="overflow-hidden">
        <v-col cols="8" class="d-flex flex-column max-height-100">
          <shift-view-shift-select
            :title-class="fontClass"
            :status="status"
            :compact-offline="isMedium"
            class="ma-1"
          />
          <widget-holder
            v-if="shiftExists"
            class="ma-1 flex-grow-1"
            :widget-value-class="widgetValueClass"
            :open-in-bottom-sheet="isMedium"
            :loading="isShiftLoading"
          />
        </v-col>
        <v-col cols="4" class="d-flex flex-column max-height-100">
          <div class="d-flex">
            <time-component class="ma-1" :time-class="fontClass" />
            <shift-view-user-settings-btn class="ma-1" />
          </div>
          <oee-component
            v-if="shiftExists"
            class="ma-1"
            :oee-class="oeeClass.value"
            :oee-components-class="oeeClass.components"
            :min-oee-font-size="scalableFontSize.min"
            :max-oee-font-size="scalableFontSize.max"
            :loading="isShiftLoading"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { defineAsyncComponent } from 'vue';

import { useShiftStore, useShiftViewStore, useDeviceStore, useGenericDialogStore, useBottomSheetStore } from '@/stores/index';
import TimeComponent from '@/components/organisms/shiftview/Time/index.vue';
import ShiftViewEvoconLogoBtn from '@/components/organisms/shiftview/ShiftViewEvoconLogoBtn/index.vue';
import ShiftViewStationSelect from '@/components/organisms/shiftview/ShiftViewStationSelect/index.vue';
import ShiftViewShiftSelect from '@/components/organisms/shiftview/ShiftViewShiftSelect/index.vue';
import WidgetHolder from '@/components/organisms/shiftview/WidgetHolder/index.vue';
import ShiftViewUserSettingsBtn from '@/components/organisms/shiftview/ShiftViewUserSettingsBtn/index.vue';
import ShiftViewShiftQuantityBlock from '@/components/organisms/shiftview/ShiftViewShiftQuantityBlock/index.vue';
import ShiftViewCurrentBatchBlock from '@/components/organisms/shiftview/ShiftViewCurrentBatchBlock/index.vue';
import ShiftViewBatchWidgetBlock from '@/components/organisms/shiftview/ShiftViewBatchWidgetBlock/index.vue';
import OeeComponent from '@/components/organisms/shiftview/OeeComponent/index.vue';
import BatchOverviewContent from '@/components/organisms/shiftview/BatchOverviewContent/index.vue';

export default {
  name: 'ShiftViewLargeHeader',
  components: {
    WidgetHolder,
    TimeComponent,
    ShiftViewEvoconLogoBtn,
    ShiftViewStationSelect,
    ShiftViewShiftSelect,
    ShiftViewUserSettingsBtn,
    ShiftViewShiftQuantityBlock,
    ShiftViewCurrentBatchBlock,
    ShiftViewBatchWidgetBlock,
    OeeComponent,
  },
  props: {
    status: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      customBreakpoint: 1450,
    };
  },
  computed: {
    ...mapState(useShiftStore, ['shiftExists']),
    ...mapState(useShiftViewStore, ['isShiftLoading']),
    ...mapState(useDeviceStore, ['screenWidth']),
    isMedium() {
      return this.$vuetify.display.md;
    },
    isLarge() {
      return this.$vuetify.display.lgAndUp && this.screenWidth < this.customBreakpoint;
    },
    isExtraLarge() {
      return this.$vuetify.display.lgAndUp && this.screenWidth >= this.customBreakpoint;
    },
    fontClass() {
      if (this.isMedium) return 'text-body-large';
      if (this.isLarge) return 'text-headline-small';
      if (this.isExtraLarge) return 'text-headline-medium';
      return '';
    },
    quantityTargetClass() {
      if (this.isMedium) return 'text-body-medium';
      if (this.isLarge) return 'text-body-large';
      if (this.isExtraLarge) return 'text-headline-small';
      return '';
    },
    widgetValueClass() {
      return this.isLarge ? 'text-headline-large' : 'text-display-small';
    },
    oeeClass() {
      if (this.isMedium) return { value: 'text-headline-large', components: 'text-label-small' };
      if (this.isLarge) return { value: 'text-headline-large', components: 'text-body-medium' };
      if (this.isExtraLarge) return { value: 'text-display-small', components: 'text-body-medium' };
      return { value: '', components: '' };
    },
    scalableFontSize() {
      if (this.isMedium) return { min: 14, max: 24 };
      if (this.isLarge) return { min: 16, max: 34 };
      if (this.isExtraLarge) return { min: 20, max: 48 };
      return { min: null, max: null };
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useBottomSheetStore, ['openBottomSheet']),
    onExpandBatchOverview(tab) {
      if (this.isMedium) {
        this.openBottomSheet({
          component: BatchOverviewContent,
          componentProps: { tab },
          title: this.$t('Batches overview'),
          theme: 'light',
        });
        return;
      }
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
  &--extra-large {
    height: 292px;
  }
  &--large {
    height: 274px;
  }
  &--medium {
    height: 268px;
  }
}
</style>
