<template>
  <info-block
    v-if="stationsToBeRemoved.length"
    :body="notificationText"
    :icon="mdiInformationOutline"
    :color="colorConstants.dark['lw-orange']"
    class="mx-1 mb-3"
  />
</template>

<script>
import { mdiInformationOutline } from '@mdi/js';
import { mapState } from 'pinia';

import useStationStore from '@/stores/station';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import colorConstants from '@/constants/colorConstants';


export default {
  name: 'StationDifferenceNotification',
  components: {
    InfoBlock,
  },
  props: {
    stationsToBeRemoved: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      mdiInformationOutline,
      colorConstants,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsMap']),
    notificationText() {
      const stationNames = this.stationsToBeRemoved.map(
        (stationId) => this.stationsMap[stationId].name,
      );
      return `${this.$t('By changing the group, following stations will be removed:')} ${stationNames.join(', ')}`;
    },
  },
};
</script>
