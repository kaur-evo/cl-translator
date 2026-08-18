<template>
  <v-row
    :class="{ 'edit-mode': editMode }"
    class="pa-2"
  >
    <v-col
      :class="{
        'large-items': view === 'large',
        'small-items': view === 'small',
      }"
    >
      <draggable
        v-model="stationsReorderingClone"
        group="stations"
        class="v-row ma-0"
        ghost-class="ghost"
        item-key="id"
        :disabled="isMobileView"
        :options="draggableOptions"
        :delay="400"
        :delay-on-touch-only="true"
        @end="onDragEnd"
      >
        <template #header>
          <v-col
            xxl="2"
            xl="3"
            lg="4"
            md="6"
            sm="6"
            cols="12"
            class="pa-2"
          >
            <summary-card :size="view" :height="cardHeight" />
          </v-col>
        </template>
        <template #item="{ element: station }">
          <v-col
            :class="{ 'draggable-item': $vuetify.display.mdAndUp }"
            class="pa-2"
            xxl="2"
            xl="3"
            lg="4"
            md="6"
            sm="6"
            cols="12"
          >
            <station-card
              :id="`grid-${station.id}`"
              :station-data="station"
              :size="view"
              :quantity-element-visible="quantityElementVisible"
              :height="cardHeight"
            />
          </v-col>
        </template>
      </draggable>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import draggable from 'vuedraggable';

import CustomInterval from '@/helpers/interval/CustomInterval';
import SummaryCard from '@/components/organisms/factoriesOverview/FactoriesOverviewSummaryCard/index.vue';
import StationCard from '@/components/organisms/factoriesOverview/FactoriesOverviewStationCard/index.vue';
import CentrifugeService from '@/services/CentrifugeService';
import { useFactoryOverviewConfigStore, useDeviceStore, useProfileStore } from '@/stores';

export default {
  name: 'AllFactoriesComponent',
  components: {
    SummaryCard,
    StationCard,
    draggable,
  },
  props: {
    view: { type: String, default: 'large' },
  },
  data() {
    return {
      windowWidth: 0,
      editMode: false,
      quantityElementVisible: true,
      draggableOptions: {
        draggable: '.draggable-item',
      },
      stationsReorderingClone: [],
      qtyInterval: null,
    };
  },

  computed: {
    ...mapState(useFactoryOverviewConfigStore, ['filteredFactoryOverviewStations']),
    ...mapState(useDeviceStore, ['isBrowserTabActive', 'isMobileView']),
    ...mapState(useProfileStore, ['currentUser']),
    cardHeight() {
      if (this.isMobileView) return '246px';
      if (this.$vuetify.display.lgAndDown) return '261px';
      return '288px';
    },
  },
  watch: {
    filteredFactoryOverviewStations(val) {
      this.stationsReorderingClone = [...val];
    },
    isBrowserTabActive(val, prevVal) {
      if (val && val !== prevVal) this.setQtyInterval();
      else this.clearInterval();
    },
  },
  beforeUnmount() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('resize', this.onResize, { passive: true });
    window.factoryViewLiveCentrifugeService.unsubscribeFactoryViewStations();
    this.clearInterval();
  },
  mounted() {
    window.factoryViewLiveCentrifugeService = new CentrifugeService(this.currentUser.tenantId);
    this.onResize();
    window.addEventListener('resize', this.onResize, { passive: true });

    this.stationsReorderingClone = [...this.filteredFactoryOverviewStations];
    this.setQtyInterval();
    this.subscribeToFactoryViewStations();
  },
  methods: {
    ...mapActions(useFactoryOverviewConfigStore, ['saveFactoryViewStationsOrder', 'subscribeToFactoryViewStations']),
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    onDragEnd() {
      this.saveFactoryViewStationsOrder(this.stationsReorderingClone);
    },
    toggleQuantityElementVisibility() {
      this.quantityElementVisible = !this.quantityElementVisible;
    },
    setQtyInterval() {
      const intervalSeconds = 15;
      this.qtyInterval = new CustomInterval(this.toggleQuantityElementVisibility, intervalSeconds * 1000).set();
    },
    clearInterval() {
      if (this.qtyInterval) this.qtyInterval = this.qtyInterval.clear();
    },
  },
};
</script>
