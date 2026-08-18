<template>
  <header-block-button
    :title="lineviewStation.name"
    :title-class="titleClass"
    :large="large"
    @click="openStationDialog"
  >
    <template #navigation-arrows>
      <station-nav v-if="stations.length > 1" :large="large" />
    </template>
  </header-block-button>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useStationStore, useGenericDialogStore } from '@/stores/index';
import shiftviewDialogs from '@/constants/dialogConfigs';
import HeaderBlockButton from '@/components/molecules/HeaderBlockButton/index.vue';
import StationNav from '@/components/organisms/shiftview/StationNav/index.vue';

export default {
  name: 'ShiftViewStationSelect',
  components: {
    HeaderBlockButton,
    StationNav,
  },
  props: {
    titleClass: { type: String, default: '' },
    large: { type: Boolean, default: false },
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation', 'stations']),
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    openStationDialog() {
      this.openDialog(shiftviewDialogs.STATION_SELECT);
    },
  },
};
</script>
