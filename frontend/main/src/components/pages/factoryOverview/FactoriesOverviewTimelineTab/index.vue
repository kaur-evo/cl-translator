<template>
  <v-snackbar
    :model-value="notificationVisible"
    timeout="-1"
    location="top right"
  >
    <span class="px-4 text-white">
      {{ $t('You will be redirected to live view in {count} seconds', { count: notificationCountDown }) }}
    </span>
    <template #actions>
      <evocon-v-button
        color="white"
        type="secondary"
        :text="$t('Cancel')"
        @click="clearNotificationTimeout()"
      />
    </template>
  </v-snackbar>

  <div v-if="isMounted" class="allfactories-container">
    <div :class="isHandheldDevice ? 'pa-4' : 'pa-6'">
      <v-expansion-panels
        v-model="factoryPanelsOpen"
        multiple
        class="d-block"
        :variant="isHandheldDevice && 'accordion'"
      >
        <draggable-list
          :items="stationsByFactoriesAndGroups"
          :disabled="isHandheldDevice"
          class="col pa-0"
          :handle="'.handle'"
          hide-hover
          @order-change="modifyTimelineFactoryOrdering"
        >
          <template #item="factory">
            <v-expansion-panel
              class="rounded elevation-2"
              :class="isMobileView ? 'mb-2' : 'mb-4'"
            >
              <v-expansion-panel-title class="pa-4">
                <template #actions="{ expanded }">
                  <span
                    v-if="expanded && !isHandheldDevice"
                    class="date-label mr-15 text-label-small"
                  >
                    {{ getDateLabel(factory.item.timezones[0]) }}
                  </span>
                  <v-icon :size="isHandheldDevice ? 16 : 24">
                    {{ expanded ? mdiChevronUp : mdiChevronDown }}
                  </v-icon>
                </template>
                <div class="d-flex align-center">
                  <v-icon
                    v-if="!isHandheldDevice"
                    size="24"
                    :color="stationsByFactoriesAndGroups.length > 1 ? 'white' : 'transparent'"
                    class="ml-3 mr-2 handle"
                    :class="stationsByFactoriesAndGroups.length > 1 ? 'grabbable' : ''"
                  >
                    {{ mdiDragVertical }}
                  </v-icon>
                  <div>
                    <span class="mr-1" :class="isHandheldDevice ? 'text-body-large' : 'text-headline-medium' ">
                      {{ factory.item.name }}
                    </span>
                    <span :class="isHandheldDevice ? 'text-body-small' : 'text-body-large'">
                      {{ Array.from(factory.item.timezoneOffsets).join(", ") }}
                    </span>
                    <small class="text-tertiary-dark">
                      <template v-if="factory.item.stationCount > 1">
                        ({{ factory.item.stationCount }} {{ $t("stations-case") }})
                      </template>
                      <template v-else>
                        ({{ factory.item.stationCount }} {{ $t("station").toLowerCase() }})
                      </template>
                    </small>
                  </div>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div :class="isHandheldDevice ? 'mx-n3' : 'mx-n1'">
                  <draggable-list
                    :items="factory.item.stationGroups"
                    :disabled="isHandheldDevice"
                    :handle="'.handle'"
                    hide-hover
                    @order-change="modifyTimelineStationGroupOrdering"
                  >
                    <template #item="stationGroup">
                      <div>
                        <factories-overview-timelines-chart
                          v-if="timelinesStatColumn"
                          :id="stationGroup.item.id"
                          :group-name="stationGroup.item.groupName"
                          :measure="timelinesStatColumn"
                          :items="stationGroup.item.stations"
                          :time-zones="Array.from(factory.item.timezoneOffsets)"
                          :tooltip-h-t-m-l-func="tooltipHTMLFunc"
                          :is-drag-disabled="factory.item.stationGroups.length === 1"
                        />
                      </div>
                    </template>
                  </draggable-list>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </template>
        </draggable-list>
      </v-expansion-panels>
    </div>
  </div>
  <v-progress-linear v-else indeterminate />
</template>

<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDragVertical,
  mdiCircleMedium,
  mdiMessageReplyText,
} from '@mdi/js';
import { DateTime } from 'luxon';
import { isEqual } from 'lodash';

import FactoriesOverviewTimelinesChart from '@/components/organisms/factoriesOverview/FactoriesOverviewTimelinesChart/index.vue';
import humanizeDuration from '@/helpers/time/humanizeDuration';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import DraggableList from '@/components/molecules/DraggableList/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import CentrifugeService from '@/services/CentrifugeService';
import { formatDate } from '@/helpers/date/formatDate';
import colorConstants from '@/constants/colorConstants';
import timelineAbbreviations from '@/constants/timelineAbbreviations';
import { RANDOM_BIG_NUMBER } from '@/constants/randomNumber';
import {
  useFactoryOverviewConfigStore,
  useStationStore,
  useFactoryStore,
  usePositionStore,
  usePerfCommentStore,
  useDeviceStore,
  useProfileStore,
} from '@/stores';

const vectorIcons = { mdiDragVertical, mdiChevronDown, mdiChevronUp };
export default {
  name: 'FactoriesOverviewTimelineTab',
  components: { FactoriesOverviewTimelinesChart, DraggableList, EvoconVButton },
  data() {
    return {
      ...vectorIcons,
      factoryPanelsOpen: [],
      isMounted: false,
    };
  },
  computed: {
    ...mapState(useFactoryOverviewConfigStore, [
      'timelinesInterval',
      'timelinesStatColumn',
      'timelinesOrdering',
      'timelinesStationGroupOrdering',
      'timelinesFactoryOrdering',
      'initialized',
      'timelinesIntervalEndTime',
      'notificationVisible',
      'notificationCountDown',
      'factoryViewStations',
      'factoryViewVisibleStationIds',
    ]),
    ...mapState(useStationStore, { stationGroupsMap: 'stationGroupsRealMap' }),
    ...mapState(useFactoryStore, ['factoriesMap']),
    ...mapState(usePositionStore, ['positionsMap']),
    ...mapState(usePerfCommentStore, ['perfCommentsMap']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useProfileStore, ['currentUser']),
    stationsByFactoriesAndGroups() {
      // note that reactivity does not always trigger from super deep chain of functions
      // thus the ordering objects are sent from inside getter to ensure visual change of ordering
      return this.groupStationsByFactoriesAndGroups(this.factoriesMap, this.factoryViewStations, {
        stationGroup: this.timelinesStationGroupOrdering,
        factory: this.timelinesFactoryOrdering,
        station: this.timelinesOrdering,
      });
    },
    isHandheldDevice() {
      return this.$vuetify.display.smAndDown;
    },
    showAlternativeUnit() {
      return this.timelinesStatColumn === 'Good quantity alternative';
    },
  },
  watch: {
    factoryViewStations(val, prevVal) {
      if (val.length > prevVal.length) {
        this.factoryPanelsOpen = this.stationsByFactoriesAndGroups.map((_, i) => i);
      }
    },
    async timelinesInterval() {
      if (this.isMounted) this.connect();
    },
    async factoryViewVisibleStationIds(newVal, oldVal) {
      if (this.isMounted && !isEqual(newVal, oldVal)) this.connect();
    },
  },
  async mounted() {
    this.factoryPanelsOpen = this.stationsByFactoriesAndGroups.map((_, i) => i);
    window.factoryViewTimelineCentrifugeService = new CentrifugeService(this.currentUser.tenantId);
    if (!this.initialized) {
      await this.fetchFactoryViewRequirements();
    }
    await this.connect();
    this.isMounted = true;
  },
  unmounted() {
    this.disconnectFromFactoryViewRollingTimelines();
    this.clearNotificationTimeout();
    this.setTimelinesIntervalEndTime(null);
  },
  methods: {
    ...mapActions(useFactoryOverviewConfigStore, [
      'fetchFactoryViewRequirements',
      'disconnectFromFactoryViewRollingTimelines',
      'modifyTimelineFactoryOrdering',
      'modifyTimelineStationGroupOrdering',
      'clearNotificationTimeout',
      'setTimelinesIntervalEndTime',
    ]),
    isYellowSlice(slice) {
      return ['PRODUCT_SLOW_UNCOMMENTED', 'PRODUCT_SLOW_COMMENTED'].includes(slice.processedType);
    },
    isChangeoverIcon(slice) {
      return slice.pChg && slice.icon;
    },
    getOrder(a, b, orderingMap) {
      const orderedA = orderingMap ? orderingMap[a.id] : 0;
      const orderedB = orderingMap ? orderingMap[b.id] : 0;
      if (orderedA || orderedB) {
        const normalizedA = Number(orderedA) || RANDOM_BIG_NUMBER;
        const normalizedB = Number(orderedB) || RANDOM_BIG_NUMBER;
        if (normalizedA < normalizedB) {
          return -1;
        }
        if (normalizedA > normalizedB) {
          return 1;
        }
      }
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    },
    groupStationsByFactoriesAndGroups(factories, stations = [], ordering = {}) {
      const stationList = [...stations].sort((a, b) => this.getOrder(a, b, ordering.station));
      const result = stationList.reduce((map, station) => {
        const timeZone = DateTime.local().setZone(station.zoneId).toFormat('ZZ');
        const mapCopy = { ...map };
        if (mapCopy[station.factoryId] === undefined) {
          mapCopy[station.factoryId] = {
            id: station.factoryId,
            name: factories[station.factoryId] ? factories[station.factoryId].name : '',
            timezoneOffsets: new Set(),
            stationGroups: {},
            stationCount: 0,
            timezones: new Set(),
          };
        }
        if (mapCopy[station.factoryId].stationGroups[station.groupId] === undefined) {
          mapCopy[station.factoryId].stationGroups[station.groupId] = {
            id: station.groupId,
            groupName: this.stationGroupsMap.get(station.groupId)?.name || '',
            stations: [],
          };
        }
        mapCopy[station.factoryId].stationCount += 1;
        mapCopy[station.factoryId].timezoneOffsets.add(timeZone);
        mapCopy[station.factoryId].timezones.add(station.zoneId);
        mapCopy[station.factoryId].stationGroups[station.groupId].stations.push(station);
        return mapCopy;
      }, {});
      const factoriesList = Object.values(result);
      factoriesList.sort((a, b) => this.getOrder(a, b, ordering.factory));
      factoriesList.forEach((factory, index) => {
        const stationGroupsList = Object.values(factory.stationGroups);
        stationGroupsList.sort((a, b) => this.getOrder(a, b, ordering.stationGroup));
        factoriesList[index].stationGroups = stationGroupsList;
      });
      return factoriesList;
    },
    getDotLabel(d) {
      if (this.isChangeoverIcon(d)) return this.$t('Changeover');
      if (['STOPPAGE_COMMENTED', 'STOPPAGE_UNCOMMENTED', 'STANDBY_EXCL_OEE', 'STANDBY_INCL_OEE'].includes(d.processedType)) return this.$t('Downtime');
      if (this.isYellowSlice(d)) return this.$t('Speed loss');
      if (d.processedType === 'PRODUCT_FAST') return this.$t('quantity');
      return '';
    },
    getTooltipName(d) {
      if (d.processedType === 'PRODUCT_FAST' || d.icon) {
        const productNameArr = [];
        if (d[timelineAbbreviations.orderNumber]) { // order-number
          productNameArr.push(d[timelineAbbreviations.orderNumber]);
        }
        const productName = d[timelineAbbreviations.productName] || this.$t('Unknown product');
        productNameArr.push(productName);

        return productNameArr.join(' - ');
      }
      if (['PRODUCT_SLOW_COMMENTED', 'PRODUCT_SLOW_UNCOMMENTED'].includes(d.processedType)) {
        return this.perfCommentsMap[d[timelineAbbreviations.performanceLossComment]]?.name || this.$t('Unknown');
      }
      if (d.processedType === 'NO_SHIFT') {
        return this.$t('No active shift');
      }
      return d.sliceLabel || this.$t('Uncommented');
    },
    getPositionName(positionId) {
      const position = this.positionsMap[positionId];
      return position ? position.name : this.$t('Unknown');
    },
    getQuantityLabel(d) {
      const qty = this.showAlternativeUnit ? d[timelineAbbreviations.altQty] : d.qty;
      const unit = this.showAlternativeUnit && d[timelineAbbreviations.altUnitId] ? d[timelineAbbreviations.altUnitId] : d[timelineAbbreviations.unitId];
      if (qty !== undefined) {
        const label = `${this.formatNumber(qty)}`;
        return { key: this.$t('Total quantity'), value: `${label} ${unit}` };
      }
      return null;
    },
    getTargetLabel(d) {
      const target = d[timelineAbbreviations.batchPlannedQty];
      const unit = d[timelineAbbreviations.unitId];
      if (target) {
        const label = `${this.formatNumber(target)}`;
        const value = unit ? `${label} ${unit}` : label;
        return { key: this.$t('Target'), value };
      }
      return null;
    },
    getTooltipDotRow(d) {
      const dotLabel = this.getDotLabel(d);
      const dotColor = this.isChangeoverIcon(d) ? colorConstants.dark['lw-blue'] : d.sliceColor;
      if (dotLabel) {
        const dot = `<span class="d-flex ma-n2 pr-2">${vIconRawTemplate(mdiCircleMedium, 24, dotColor, '')}</span>`;
        return `<div class="v-row align-center flex-nowrap">${dot}<span class="text-label-small">${dotLabel}</span></div>`;
      }
      return null;
    },
    getTooltipStartValue(d) {
      const startTime = formatTimeInZone(d.stTmISO, d.zoneId);
      const stTm = DateTime.fromISO(d.stTmISO, { zone: d.zoneId });
      const enTm = DateTime.fromISO(d.enTmISO, { zone: d.zoneId });
      const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
      const durationString = d.icon ? '' : ` (${humanizeDuration(duration, { largest: 'hour' })})`;
      return `${startTime}${durationString}`;
    },
    getTooltipParamsRows(d) {
      const paramsRows = [];
      if (this.isYellowSlice(d) && !this.isChangeoverIcon(d)) {
        paramsRows.push({
          key: this.$t('Product'),
          value: d[timelineAbbreviations.productName],
        });
      }
      paramsRows.push({
        key: this.$t('Start'),
        value: this.getTooltipStartValue(d),
      });
      const quantityLabel = this.getQuantityLabel(d);
      if (quantityLabel) paramsRows.push(quantityLabel);
      if (d[timelineAbbreviations.positionId]) {
        paramsRows.push({ key: this.$t('Machine location'), value: this.getPositionName(d[timelineAbbreviations.positionId]) });
      }
      if (d.icon) {
        const targetLabel = this.getTargetLabel(d);
        if (targetLabel) paramsRows.push(targetLabel);
      }
      return paramsRows.map(({ key, value }) => `<div class="text-label-small font-weight-regular align-center d-flex">
              <span class="text-tertiary-dark font-weight-regular">${key}:&nbsp;</span>
              <span class="text-body-small font-weight-regular text-none">${value}</span>
              </div>`).join('');
    },
    async tooltipHTMLFunc(d) {
      const dotRow = this.getTooltipDotRow(d) || '';
      const primaryLabelRow = `<div class="text-body-large font-weight-medium">${this.getTooltipName(d)}</div>`;
      const params = this.getTooltipParamsRows(d);
      const note = d[timelineAbbreviations.note] || d[timelineAbbreviations.performanceLossNote] || (this.isChangeoverIcon(d) && d[timelineAbbreviations.changeoverNote]) || '';
      const noteRow = note ? `<div class="mt-1 text-body-small align-center flex-nowrap"><span class="mr-2">${vIconRawTemplate(mdiMessageReplyText, 12)}</span><span>${note}</span></div>` : '';
      const tooltipTemplate = `<div class="v-row align-center text-white"><v-col class="pb-2 pt-1">
        ${dotRow}
        ${primaryLabelRow}
        ${params}
        ${noteRow}
        </v-col></div>`;
      return tooltipTemplate;
    },
    formatNumber,
    getDateLabel(timezone) {
      const end = this.timelinesIntervalEndTime || DateTime.now().toUTC();
      const startLocal = end.minus({ hours: this.timelinesInterval }).setZone(timezone);
      const endLocal = end.setZone(timezone);
      if (endLocal.hasSame(startLocal, 'day')) {
        return formatDate(startLocal.toJSDate(), 'short');
      }
      return `${formatDate(startLocal.toJSDate(), 'short')} - ${formatDate(endLocal.toJSDate(), 'short')}`;
    },
    async connect() {
      if (!this.initialized) return;
      await window.factoryViewTimelineCentrifugeService.connectToRollingStations(this.factoryViewVisibleStationIds, this.timelinesInterval);
    },
  },
};
</script>

<style lang="scss" scoped>
.date-label {
  padding: 2px 4px;
  background-color: var(--color-12-light);
  display: flex;
  align-items: center;
  border-radius: 4px;
}
</style>
