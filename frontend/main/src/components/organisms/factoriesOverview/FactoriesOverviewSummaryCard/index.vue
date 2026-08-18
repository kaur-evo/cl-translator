<template>
  <v-card
    color="lw-gray"
    :height="height"
    class="pa-4"
  >
    <v-row class="fill-height">
      <v-col class="fill-height" cols="5">
        <div class="d-flex flex-column justify-space-around fill-height">
          <v-sheet class="fill-height mb-1 d-flex align-center justify-center">
            <div class="text-center">
              <div class="text-body-small">
                {{ $t("Stations") }}
              </div>
              <div class="text-headline-medium font-weight-medium">
                {{ stationCount }}
              </div>
            </div>
          </v-sheet>
          <v-sheet class="fill-height my-1 d-flex align-center justify-center">
            <div class="text-center">
              <div class="text-body-small">
                {{ $t("Operating") }}
              </div>
              <div class="text-headline-medium font-weight-medium">
                <span class="text-lw-green">
                  {{ formatNumber(statusCounts?.[factoryOverviewStatuses.GOOD_PRODUCTION]) }}
                </span>
                +
                <span class="text-lw-yellow">
                  {{ formatNumber(statusCounts?.[factoryOverviewStatuses.SLOW_PRODUCTION]) }}
                </span>
              </div>
            </div>
          </v-sheet>
          <v-sheet class="fill-height mt-1 d-flex align-center justify-center">
            <div class="text-center">
              <div class="text-body-small">
                {{ $t("Stopped") }}
              </div>
              <div class="text-headline-medium font-weight-medium">
                <span class="text-lw-red">
                  {{ formatNumber(negativeCount) }}
                </span>
                +
                <span class="text-tertiary-dark">
                  {{ formatNumber(plannedCount) }}
                </span>
              </div>
            </div>
          </v-sheet>
        </div>
      </v-col>
      <v-col cols="7" class="pl-4 d-flex align-center justify-center">
        <div
          class="d-block mr-evocon-container"
          :class="{
            small: $vuetify.display.smAndDown,
            [pulseColorClass]: true,
          }"
        >
          <div class="pulse" />
          <div class="frame d-flex">
            <mr-evocon
              id="mr-evocon-animation"
              :key="$vuetify.display.smAndDown"
              class="align-self-center"
              :animation-name="animationName"
              :size="$vuetify.display.smAndDown ? 100 : 120"
            />
          </div>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { mapState } from 'pinia';

import MrEvocon from '@/components/molecules/MrEvocon/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import factoryOverviewStatuses from '@/constants/factoryOverviewStatuses';
import { useFactoryOverviewConfigStore } from '@/stores';

export default {
  name: 'FirstElementComponent',
  components: {
    MrEvocon,
  },
  props: {
    height: {
      type: String,
      default: '246px',
    },
  },
  data() {
    return {
      factoryOverviewStatuses,
      loadingTimout: null,
      loading: true,
    };
  },
  computed: {
    ...mapState(useFactoryOverviewConfigStore, ['timelines', 'filteredFactoryOverviewStations']),
    stationCount() {
      return this.formatNumber(this.filteredFactoryOverviewStations.length);
    },
    total() {
      return this.positiveCount + this.negativeCount + (this.statusCounts?.[factoryOverviewStatuses.SLOW_PRODUCTION] || 0);
    },
    plannedCount() {
      return (this.statusCounts?.[factoryOverviewStatuses.PLANNED_STOP_INCL_OEE] || 0)
        + (this.statusCounts?.[factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE] || 0);
    },
    positiveCount() {
      return (this.statusCounts?.[factoryOverviewStatuses.GOOD_PRODUCTION] || 0) + this.plannedCount;
    },
    negativeCount() {
      return (this.statusCounts?.[factoryOverviewStatuses.UNCOMMENTED_STOP] || 0)
        + (this.statusCounts?.[factoryOverviewStatuses.UNPLANNED_STOP] || 0);
    },
    emotion() {
      const positivePct = (this.positiveCount / this.total) * 100;
      const neutralPct = (this.statusCounts[factoryOverviewStatuses.SLOW_PRODUCTION] / this.total) * 100;
      const negativePct = (this.negativeCount / this.total) * 100;
      if (!this.loading) {
        if (this.total === 0 && this.statusCounts?.[factoryOverviewStatuses.NO_SHIFT] > 0) {
          return 'noshift';
        }
        if (positivePct >= neutralPct && positivePct >= negativePct) {
          return 'positive';
        }
        if (neutralPct >= positivePct && neutralPct >= negativePct) {
          return 'neutral';
        }
        if (negativePct >= positivePct && negativePct >= neutralPct) {
          return 'negative';
        }
      }
      return 'positive';
    },
    animationName() {
      const emotionMap = {
        noshift: 'meditate',
        negative: 'angry',
      };
      if (emotionMap[this.emotion] !== undefined) {
        return emotionMap[this.emotion];
      }
      return this.emotion;
    },
    pulseColorClass() {
      const colorMap = {
        noshift: 'state-green meditate',
        negative: 'state-red',
        neutral: 'state-yellow',
        positive: 'state-green',
      };
      return colorMap[this.emotion] || 'state-green';
    },
    statusCounts() {
      const emptyState = {
        [factoryOverviewStatuses.NO_SHIFT]: 0,
        [factoryOverviewStatuses.UNCOMMENTED_STOP]: 0,
        [factoryOverviewStatuses.UNPLANNED_STOP]: 0,
        [factoryOverviewStatuses.PLANNED_STOP_INCL_OEE]: 0,
        [factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE]: 0,
        [factoryOverviewStatuses.SLOW_PRODUCTION]: 0,
        [factoryOverviewStatuses.GOOD_PRODUCTION]: 0,
      };
      return this.filteredFactoryOverviewStations.reduce((acc, station) => {
        const timeline = this.timelines[station.id];
        if (!timeline) return acc;
        const types = timeline.statusTypes || [];
        types.forEach((type) => {
          acc[type] = (acc[type] || 0) + 1;
        });
        return acc;
      }, emptyState) || emptyState;
    },
  },
  mounted() {
    clearTimeout(this.loadingTimout);
    this.loadingTimout = setTimeout(() => {
      this.loading = false;
    }, 5 * 1000);
  },
  methods: {
    formatNumber(val) {
      return formatNumber(val);
    },
  },
};
</script>

<style lang="scss" scoped>

.mr-evocon-container {
  --container-size: 150px;
  &.small {
    --container-size: 120px;
  }
  --frame-border-size: 8px;
  display: block;
  position: relative;
  height: var(--container-size);
  width: var(--container-size);

  &.state-green {
    --state-color: rgb(var(--v-theme-lw-green));
    --pulse-shadow-color: rgba(10, 172,0, 0.9);
    --pulse-shadow-off-color: rgba(10, 172,0, 0);
    --pulse-duration: 3s;
    &.meditate {
      --pulse-duration: 4s;
    }
  }
  &.state-yellow {
    --state-color: rgb(var(--v-theme-lw-yellow-bg));
    --pulse-shadow-color: rgba(253, 213, 5, 0.9);
    --pulse-shadow-off-color: rgba(253, 213, 5, 0);
    --pulse-duration: 2s;
  }
  &.state-red {
    --state-color: rgb(var(--v-theme-lw-red));
    --pulse-shadow-color: rgba(224, 28, 33, 0.9);
    --pulse-shadow-off-color: rgba(224, 28, 33, 0);
    --pulse-duration: 1.5s;
  }

  .frame {
    height: var(--container-size);
    width: var(--container-size);
    background: black;
    border-radius: 50%;
    position: absolute;
    left: var(--frame-border-size);
    top: var(--frame-border-size);
    background-size: 100%;
    background-position: 50% 50%;
    box-sizing: unset;
    &:after {
      content: "";
      height: var(--container-size);
      width: var(--container-size);
      position: absolute;
      border-radius: 50%;
      top: calc(var(--frame-border-size) * -1);
      left: calc(var(--frame-border-size) * -1);
      box-sizing: unset;
      border: var(--frame-border-size) solid var(--state-color);
    }
  }
  .pulse {
    top: 0;
    position: absolute;
    height: calc(var(--container-size) + (var(--frame-border-size) * 2));
    width: calc(var(--container-size) + (var(--frame-border-size) * 2));
    border-radius: 50%;
    background-size: 100%;
    background-position: 50% 50%;
    box-sizing: unset;
    transform: scale(1);
    animation-duration: var(--pulse-duration);
    animation-iteration-count: infinite;
    animation-name: pulse;
    opacity: 0.5;
    background: var(--state-color);
  }

}
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 var(--pulse-shadow-color);
  }

  70% {
    transform: scale(1.12);
    box-shadow: 0 0 0 16px var(--pulse-shadow-off-color);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 var(--pulse-shadow-off-color);
  }
}
</style>
