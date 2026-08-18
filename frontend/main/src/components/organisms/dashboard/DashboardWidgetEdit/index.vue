<template>
  <div>
    <dialog-toolbar :title="isEdit ? $t('Edit') : $t('Add widget')" />
    <v-card-text
      class="dialog-content py-0"
      :class="{
        'dialog-content--mobile': isMobileView,
        'dialog-content--fullscreen': showFullscreenDialogs,
      }"
    >
      <div
        class="d-flex align-center widget-type-container"
        :class="{ 'widget-type-container--no-arrows': !areScrollingArrowsVisible }"
      >
        <evocon-v-button
          v-if="areScrollingArrowsVisible"
          :icon="mdiChevronLeft"
          :disabled="!leftArrowEnabled"
          color="secondary-dark"
          size="small"
          @click="moveLeft"
        />
        <v-row
          ref="typeSelectionContainer"
          class="type-selection py-4 flex-nowrap"
        >
          <v-col
            v-for="(widgetType, index) in widgetTypes"
            :id="`widget-type-${widgetType.value}`"
            :key="index"
            class="mx-2"
          >
            <image-card-button
              :img="widgetType.img"
              :title="widgetType.title"
              :selected="widgetType.value === formData.type"
              :new-indicator-shown-until="widgetType.newIndicatorShownUntil"
              min-width="110"
              @click="onWidgetTypeChange(widgetType.value)"
            />
          </v-col>
        </v-row>
        <evocon-v-button
          v-if="areScrollingArrowsVisible"
          :icon="mdiChevronRight"
          :disabled="!rightArrowEnabled"
          color="secondary-dark"
          size="small"
          @click="moveRight"
        />
      </div>
      <v-form
        ref="form"
        v-model="valid"
      >
        <div
          v-if="formData.type === OEE_CHART"
          key="measure"
          class="pb-2"
        >
          <selection-input
            :model-value="[measureState]"
            :items="getMeasuresList()"
            :placeholder="$t('Indicator')"
            :hint="$t('Indicator')"
            :dark="false"
            is-single-select
            hide-search
            required
            item-text="display"
            item-value="name"
            @update:model-value="onMeasureChange"
          />
        </div>
        <evocon-v-input
          v-model="formData.widgetName"
          :placeholder="$t('Name')"
          :hint="$t('Name')"
          :rules="[(v) => !!v || $t('Name')]"
          max-length="50"
          class="pb-2"
        />
        <div key="period" class="pb-2">
          <selection-input
            :model-value="[formData.periodName]"
            :items="getPeriodsList()"
            :items-map="getPeriodsMap()"
            :placeholder="$t('Period')"
            :hint="$t('Period')"
            :dark="false"
            is-single-select
            hide-search
            required
            item-text="display"
            item-value="name"
            @update:model-value="formData.periodName = $event[0]"
          />
        </div>
        <double-date-range-menu
          v-if="formData.periodName === CUSTOM"
          v-model:date-range="dateRange"
          v-model:selection-type="CUSTOM"
          :show-period-selection="false"
          :placeholder="$t('Select range')"
          :hint="$t('Select range')"
          class="pb-2"
        />
        <v-row class="pb-2">
          <v-col
            v-if="hasMultipleFactories"
            :class="{ 'pr-1': !isMobileView, 'pb-2': isMobileView }"
            :cols="isMobileView ? 12 : 6"
          >
            <selection-input
              v-model="formData.factoryIds"
              :items="shownFactories"
              :placeholder="$t('Factories')"
              :hint="$t('Factories')"
              :dark="false"
              remove-non-existent-selections
            />
          </v-col>
          <v-col
            :class="{ 'pl-1': hasMultipleFactories && !isMobileView }"
            :cols="isMobileView || !hasMultipleFactories ? 12 : 6"
          >
            <selection-input
              v-model="formData.stationIds"
              v-model:some-selected="someStationsSelected"
              :items="filteredStations"
              :groups="stationGroups"
              :placeholder="$t('Stations')"
              :hint="$t('Stations')"
              :dark="false"
              is-grouped-select
              required
              empty-equals-all-selected
              remove-non-existent-selections
            />
          </v-col>
        </v-row>
        <v-row
          v-if="!loading"
          class="pb-2"
        >
          <v-col
            :class="{ 'pr-1': !isMobileView, 'pb-2': isMobileView }"
            :cols="isMobileView || (!unitSelectVisible && formData.type !== CHECKLIST_WIDGET) ? 12 : 6"
          >
            <selection-input
              v-if="[SPEEDLOSS_CHART, SCRAP_CHART, DELAYS_CHART, CHECKLIST_WIDGET].includes(formData.type)"
              v-model="formData.entityIds"
              v-model:some-selected="someEntitiesSelected"
              :items="dynamicItems"
              :groups="dynamicGroups"
              :placeholder="dynamicLabel"
              :hint="dynamicLabel"
              :dark="false"
              :empty-equals-all-selected="dynamicItems.length > 0"
              is-grouped-select
              required
              remove-non-existent-selections
            />
            <evocon-number-input
              v-else-if="[OEE_CHART, OEE_DONUT].includes(formData.type)"
              v-model="formData.target"
              :placeholder="$t('Target')"
              :hint="targetHint"
              :suffix="targetSuffix"
            />
          </v-col>
          <v-col
            v-if="unitSelectVisible"
            :class="{ 'pl-1': !isMobileView }"
            :cols="isMobileView ? 12 : 6"
          >
            <selection-input
              :model-value="[formData.useAlternativeUnit]"
              :items="unitOptions"
              :items-map="unitOptionsMap"
              :hint="$t('Unit')"
              :prepend-inner-icon="mdiRuler"
              :dark="false"
              is-single-select
              hide-search
              item-value="value"
              required
              @update:model-value="onUnitChange"
            />
          </v-col>
          <v-col
            v-if="formData.type === CHECKLIST_WIDGET"
            :class="{ 'pl-1': !isMobileView }"
            :cols="isMobileView ? 12 : 6"
          >
            <selection-input
              :model-value="[formData.displayType]"
              :items="displayTypes"
              icon-key="icon"
              :hint="$t('Display mode')"
              :dark="false"
              required
              is-single-select
              item-text="text"
              item-value="mode"
              @update:model-value="formData.displayType = $event[0]"
            />
          </v-col>
        </v-row>
        <v-row
          v-if="[SPEEDLOSS_CHART, SCRAP_CHART, DELAYS_CHART].includes(formData.type) || formData.displayType === displayModes.CHECKLIST"
          class="pb-2"
        >
          <v-col
            :class="{ 'pr-1': !isMobileView, 'pb-2': isMobileView }"
            :cols="isMobileView ? 12 : 6"
          >
            <selection-input
              :model-value="[formData.viewBy]"
              :items="viewByOptions"
              :placeholder="$t('View by')"
              :hint="$t('View by')"
              :dark="false"
              is-single-select
              hide-search
              required
              item-text="display"
              item-value="name"
              @update:model-value="formData.viewBy = $event[0]"
            />
          </v-col>
          <v-col
            :class="{ 'pl-1': !isMobileView }"
            :cols="isMobileView ? 12 : 6"
          >
            <selection-input
              :model-value="[formData.top]"
              :items="topItemsArray"
              :placeholder="`${$t('Show top')} (1-10)`"
              :hint="`${$t('Show top')} (1-10)`"
              :dark="false"
              is-single-select
              hide-search
              required
              @update:model-value="formData.top = $event[0]"
            />
          </v-col>
        </v-row>
        <div class="pb-2">
          <div v-if="formData.type === OEE_CHART && includeNoDataDatapoints" class="my-2">
            <multi-line-switch
              v-model="formData.trendEnabled"
              :main-text="$t('Add trendline to chart')"
              :dark="false"
              :density="isMobileView ? 'compact' : 'default'"
            />
          </div>
          <dashboard-comparison-selection
            v-if="[SPEEDLOSS_CHART, DELAYS_CHART, SCRAP_CHART, OEE_CHART].includes(formData.type)"
            v-model="formData.comparisonType"
            :widget-type="formData.type"
            :period-name="formData.periodName"
            :date-range="dateRange"
            :is-edit="isEdit"
          />
        </div>
      </v-form>
    </v-card-text>
    <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs }">
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog"
      />
      <evocon-v-button
        :text="$t('Save')"
        color="primary"
        @click="onSaveClick"
      />
    </v-card-actions>
  </div>
</template>
<script>
import { nextTick } from 'vue';
import { mapState, mapActions } from 'pinia';
import { mdiRuler, mdiChevronLeft, mdiChevronRight, mdiPoll, mdiAlignHorizontalLeft } from '@mdi/js';
import { format } from 'date-fns';

import filterItemsApi from '@/api/filterItemsApi';
import {
  OEE_CHART, DELAYS_CHART, OEE_DONUT, SPEEDLOSS_CHART, SCRAP_CHART, CHECKLIST_WIDGET,
} from '@/constants/dashboardWidgetTypes';
import { TODAY, CUSTOM } from '@/constants/predefinedTimePeriodNames';
import { REASON, GROUP, POSITION, CHECKLIST } from '@/constants/widgetViewTypes';
import displayModes from '@/constants/checklistWidgetDisplayModes';
import { getMeasuresList, getMeasuresMap } from '@/constants/getMeasures';
import { getPeriodsList, getPeriodsMap } from '@/constants/getPeriods';
import { getComparisonType } from '@/constants/dashboardComparisonType';
import { getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';
import BarChartGreyAndGreen from '@/assets/images/charts/VerticalBarChartGreyAndGreen.svg';
import DonutChart from '@/assets/images/charts/DonutChart.svg';
import HorizontalBarChart2 from '@/assets/images/charts/HorizontalBarChart2.svg';
import HorizontalBarYellowBlue from '@/assets/images/charts/HorizontalBarChartYellowBlue.svg';
import HorizontalBarOrangeYellow from '@/assets/images/charts/HorizontalBarChartOrangeYellow.svg';
import ChecklistChart from '@/assets/images/charts/ChecklistChart.svg';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import ImageCardButton from '@/components/molecules/ImageCardButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import DashboardComparisonSelection from '@/components/organisms/dashboard/DashboardComparisonSelection/index.vue';
import DoubleDateRangeMenu from '@/components/molecules/DoubleDateRangeMenu/index.vue';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import {
  useGenericDialogStore, useProfileStore, useDeviceStore, useFactoryStore,
  useStationStore, useCommentStore, usePerfCommentStore, useScrapReasonStore,
  usePositionStore, useConfigurationStore, useChecklistTemplateStore, useDashboardConfigStore,
} from '@/stores/index';

const icons = { mdiRuler, mdiChevronLeft, mdiChevronRight };

const timePeriodNames = { CUSTOM };

const widgetTypeNames = {
  OEE_CHART, DELAYS_CHART, OEE_DONUT, SPEEDLOSS_CHART, SCRAP_CHART, CHECKLIST_WIDGET,
};
const measureAltUnitMap = {
  qty: 'altqty',
  goodqty: 'goodaltqty',
  scrapqty: 'scrapaltqty',
};
const altUnitMeasureMap = {
  altqty: 'qty',
  goodaltqty: 'goodqty',
  scrapaltqty: 'scrapqty',
};

export default {
  name: 'DashboardWidgetEdit',
  components: {
    DialogToolbar,
    EvoconVInput,
    EvoconVButton,
    EvoconNumberInput,
    MultiLineSwitch,
    ImageCardButton,
    SelectionInput,
    DashboardComparisonSelection,
    DoubleDateRangeMenu,
  },
  data() {
    return {
      ...icons,
      ...timePeriodNames,
      ...widgetTypeNames,
      displayModes,
      formData: {},
      dateRange: [format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')],
      someStationsSelected: true,
      someEntitiesSelected: true,
      currentWidget: {},
      valid: true,
      reasonEntityList: [],
      loading: false,
      measureState: null,
      typeSelectionContainer: null,
      scrollPosition: 0,
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useProfileStore, ['firstDayOfWeek']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useFactoryStore, ['factories', 'hasMultipleFactories']),
    ...mapState(useStationStore, ['stations', 'stationGroups']),
    ...mapState(useCommentStore, ['commentGroupsWithOrdering']),
    ...mapState(usePerfCommentStore, ['perfCommentGroupsWithOrdering']),
    ...mapState(useScrapReasonStore, ['scrapReasonGroupsWithOrdering']),
    ...mapState(usePositionStore, ['positions']),
    ...mapState(useConfigurationStore, ['includeNoDataDatapoints', 'checklistFactories', 'checklistStations']),
    ...mapState(useChecklistTemplateStore, ['checklistTemplates', 'checklistGroups']),
    unitSelectVisible() {
      const isScrapChart = this.formData.type === SCRAP_CHART;
      const isOeeChart = this.formData.type === OEE_CHART;
      const isQtyMeasure = measureAltUnitMap[this.measureState] !== undefined
        || altUnitMeasureMap[this.measureState] !== undefined;

      return isScrapChart || (isOeeChart && isQtyMeasure);
    },
    areScrollingArrowsVisible() {
      if (this.$vuetify.display.mdAndDown) return false;

      const container = this.typeSelectionContainer;
      const parentContainer = container?.parentElement;

      if (!container || !parentContainer) return false;

      return container.scrollWidth > parentContainer.offsetWidth;
    },
    leftArrowEnabled() {
      return this.scrollPosition > 0;
    },
    rightArrowEnabled() {
      const container = this.typeSelectionContainer;
      if (!container) return false;
      const maxScroll = Math.round(container.scrollWidth - container.offsetWidth);
      return this.scrollPosition < maxScroll;
    },
    unitOptions() {
      return [
        { value: false, name: this.$t('Primary unit') },
        { value: true, name: this.$t('Alternative unit') },
      ];
    },
    unitOptionsMap() {
      return listToKeyMap(this.unitOptions, 'value');
    },
    isEdit() {
      return this.currentWidget && !String(this.currentWidget.i).startsWith('new');
    },
    filteredStations() {
      const passesFactoryFilter = (station) => !this.formData.factoryIds?.length || this.formData.factoryIds.includes(station.factoryId);
      const passesStationFilter = (station) => this.formData.type !== CHECKLIST_WIDGET || this.checklistStations.includes(station.id);
      return this.stations.filter((station) => passesFactoryFilter(station) && passesStationFilter(station));
    },
    shownFactories() {
      return this.formData.type === CHECKLIST_WIDGET ? this.checklistFactories : this.factories;
    },
    widgetTypes() {
      const widgets = [
        { value: this.OEE_DONUT, title: this.$t('OEE overview'), img: DonutChart },
        { value: this.OEE_CHART, title: this.$t('Production data'), img: BarChartGreyAndGreen },
        { value: this.DELAYS_CHART, title: this.$t('Downtime'), img: HorizontalBarChart2 },
        { value: this.SPEEDLOSS_CHART, title: this.$t('Speed loss'), img: HorizontalBarYellowBlue },
        { value: this.SCRAP_CHART, title: this.$t('Scrap'), img: HorizontalBarOrangeYellow },
      ];
      if (this.checklistStations.length > 0) {
        widgets.push({ value: this.CHECKLIST_WIDGET, title: this.$t('Checklists'), img: ChecklistChart, newIndicatorShownUntil: '2026-04-01' });
      }
      return widgets;
    },
    viewByOptions() {
      if (this.formData.type === CHECKLIST_WIDGET) {
        return [
          { name: CHECKLIST, display: this.$t('Checklist name') },
          { name: GROUP, display: this.$t('Checklist groups') },
        ];
      }
      const viewByOptions = [
        { name: REASON, display: this.$t('Reasons') },
        { name: GROUP, display: this.$t('Groups') },
      ];
      const allowedTypes = new Set([SPEEDLOSS_CHART, DELAYS_CHART]);
      const hasPositions = this.positions.length > 0;
      if (hasPositions && allowedTypes.has(this.formData.type)) {
        viewByOptions.push({ name: POSITION, display: this.$t('Machine locations') });
      }
      return viewByOptions;
    },
    topItemsArray() {
      return [
        { id: 1, name: '1' },
        { id: 2, name: '2' },
        { id: 3, name: '3' },
        { id: 4, name: '4' },
        { id: 5, name: '5' },
        { id: 6, name: '6' },
        { id: 7, name: '7' },
        { id: 8, name: '8' },
        { id: 9, name: '9' },
        { id: 10, name: '10' },
      ];
    },
    dynamicLabel() {
      const widgetLabelTypeMap = {
        [DELAYS_CHART]: this.$t('Stop reasons'),
        [SPEEDLOSS_CHART]: this.$t('Speed loss'),
        [SCRAP_CHART]: this.$t('Scrap reasons'),
        [CHECKLIST_WIDGET]: this.$t('Checklists'),
      };
      return widgetLabelTypeMap[this.formData.type] || '';
    },
    dynamicItems() {
      const matchesFactory = (val) => !this.formData.factoryIds || !this.formData.factoryIds.length || !val || !val.length || val.some((id) => this.formData.factoryIds.includes(id));
      const matchesStation = (val) => !this.formData.stationIds || !this.formData.stationIds.length || val.some((id) => this.formData.stationIds.includes(id));
      if (this.formData.type === CHECKLIST_WIDGET) {
        return this.checklistTemplates.filter(((template) => matchesFactory(template.factoryIds) && matchesStation(template.stationIds)));
      }
      return this.reasonEntityList?.reduce((acc, entity) => {
        if (entity.id > 0 && !matchesFactory(entity.factoryIds)) return acc;
        if (entity.id > 0 && !matchesStation(entity.stationIds)) return acc;
        const accClone = [...acc];
        if (entity.groupId === -1) {
          // translating only technical stop reasons (Uncommented)
          accClone.push({ ...entity, name: this.$t(entity.name) });
        } else {
          accClone.push(entity);
        }
        return accClone;
      }, []);
    },
    dynamicGroups() {
      const uncommentedGroup = {
        factoryIds: [],
        id: -1,
        name: this.$t('Uncommented'),
        ordering: -1,
      };
      const groupWidgetTypeMap = {
        [DELAYS_CHART]: [uncommentedGroup, ...this.commentGroupsWithOrdering],
        [SPEEDLOSS_CHART]: [uncommentedGroup, ...this.perfCommentGroupsWithOrdering],
        [SCRAP_CHART]: [uncommentedGroup, ...this.scrapReasonGroupsWithOrdering],
        [CHECKLIST_WIDGET]: this.checklistGroups,
      };
      return groupWidgetTypeMap[this.formData.type] || [];
    },
    computedFetchReasonsArgs() {
      if (![SPEEDLOSS_CHART, DELAYS_CHART, SCRAP_CHART].includes(this.formData.type)) return null;
      const dateRange = this.formData.periodName === CUSTOM ? this.dateRange : getCurrentPeriod(this.formData.periodName, { weekStartsOn: this.firstDayOfWeek });
      const queryParams = {
        stationId: this.formData.stationIds,
        factoryId: this.formData.factoryIds,
      };
      if (dateRange) {
        const [startDate, endDate] = dateRange;
        queryParams.startDate = startDate;
        queryParams.endDate = endDate;
      }
      const entityWidgetTypeMap = {
        [DELAYS_CHART]: 'comments',
        [SPEEDLOSS_CHART]: 'performancelosses',
        [SCRAP_CHART]: 'scrapreasons',
      };
      const entity = entityWidgetTypeMap[this.formData.type];
      return [entity, queryParams];
    },
    targetSuffix() {
      if (this.formData.type === OEE_DONUT) return '%';
      if (this.formData.type === OEE_CHART) {
        return ['oee', 'availability', 'quality', 'performance', 'technical', 'technicalavailability'].includes(this.formData.measure) ? '%' : '';
      }
      return '';
    },
    targetHint() {
      let measureDisplay = getMeasuresMap()[this.formData.measure]?.display ? `${getMeasuresMap()[this.formData.measure].display} %` : this.$t('qty');
      if (this.formData.type === OEE_DONUT) measureDisplay = `${this.$t('OEE')} %`;
      if (['qty', 'goodqty', 'scrapqty'].includes(this.formData.measure)) measureDisplay = this.$t('qty');
      return `${this.$t('Please enter target')}: ${measureDisplay} (${this.$t('Optional').toLowerCase()})`;
    },
    widgetNameMap() {
      return {
        [this.OEE_DONUT]: this.$t('OEE'),
        [this.DELAYS_CHART]: this.$t('Downtime'),
        [this.SPEEDLOSS_CHART]: this.$t('Speed loss'),
        [this.SCRAP_CHART]: this.$t('Scrap reasons'),
        [this.OEE_CHART]: getMeasuresMap(),
        [this.CHECKLIST_WIDGET]: this.$t('Checklists'),
      };
    },
    displayTypes() {
      return [
        { mode: displayModes.CHECKLIST, text: this.$t('Individual checklists'), icon: mdiAlignHorizontalLeft },
        { mode: displayModes.TIMELINE, text: this.$t('Timeline'), icon: mdiPoll },
      ];
    },
  },
  watch: {
    computedFetchReasonsArgs() {
      this.fetchReasonEntities();
    },
    viewByOptions() {
      const isViewByAllowed = this.viewByOptions.some((option) => option.name === this.formData.viewBy);
      if (!isViewByAllowed) {
        this.formData.viewBy = this.viewByOptions[0].name;
      }
    },
  },
  async mounted() {
    if (this.checklistStations.length > 0) {
      this.fetchChecklists();
      this.fetchChecklistGroups();
    }
    await nextTick();
    this.typeSelectionContainer = this.$refs.typeSelectionContainer?.$el;
    this.setFormData();
    this.scrollSelectedWidgetTypeIntoView();

    if (this.typeSelectionContainer) {
      this.typeSelectionContainer.addEventListener('scroll', this.updateScrollPosition);
      this.updateScrollPosition();
    }
  },
  beforeUnmount() {
    this.typeSelectionContainer?.removeEventListener('scroll', this.updateScrollPosition);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useDashboardConfigStore, ['saveWidget']),
    ...mapActions(useChecklistTemplateStore, ['fetchChecklists', 'fetchChecklistGroups']),
    getMeasuresList,
    getPeriodsList,
    getPeriodsMap,
    updateScrollPosition() {
      this.scrollPosition = Math.round(this.typeSelectionContainer?.scrollLeft || 0);
    },
    setMeasureStateFromReqMeasure(reqMeasure) {
      if (altUnitMeasureMap[reqMeasure] === undefined) {
        this.measureState = reqMeasure;
      } else {
        this.formData.useAlternativeUnit = true;
        this.measureState = altUnitMeasureMap[reqMeasure];
      }
    },
    setFormData() {
      this.currentWidget = { config: {}, ...this.dialogData.widget };
      const widgetType = this.currentWidget.type || this.widgetTypes[0].value;

      this.formData = {
        measure: this.currentWidget.config.measure || '',
        entityIds: this.currentWidget.config.entityIds || [],
        factoryIds: this.currentWidget.config.factoryId?.length ? this.currentWidget.config.factoryId : this.factories.map((f) => f.id),
        stationIds: this.currentWidget.config.stationId || [],
        periodName: this.currentWidget.config.periodName || TODAY,
        viewBy: this.currentWidget.config.viewBy || REASON,
        target: this.currentWidget.config.target || null,
        widgetName: this.currentWidget.config.widgetName || (widgetType === OEE_CHART ? this.widgetNameMap[widgetType][this.currentWidget.config.measure].display : this.widgetNameMap[widgetType]),
        type: widgetType,
        top: this.currentWidget.config.top || 10,
        comparisonType: getComparisonType({
          includeComparison: this.currentWidget.config.includeComparison,
          _periodType: this.currentWidget.config.periodName,
          _widgetType: this.currentWidget.type,
          _comparisonType: this.currentWidget.config.comparisonType,
        }),
        trendEnabled: typeof this.currentWidget.config.trendEnabled === 'boolean' ? this.currentWidget.config.trendEnabled : true,
        useAlternativeUnit: this.currentWidget.config.useAlternativeUnit || false,
        displayType: this.currentWidget.config.displayType || null,
      };
      if (this.formData.periodName === CUSTOM) {
        const { range } = this.currentWidget.config;
        this.dateRange = Object.keys(range).length ? [range.start, range.end] : [format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')];
      }
      this.setMeasureStateFromReqMeasure(this.currentWidget.config.measure);
    },
    async onSaveClick() {
      await this.$refs.form.validate();
      if (this.valid) {
        if (this.formData.periodName === CUSTOM) {
          const range = this.dateRange.length === 1 ? { start: this.dateRange[0], end: this.dateRange[0] } : { start: this.dateRange[0], end: this.dateRange[1] };
          this.saveWidget({ formData: { ...this.formData, range }, currentWidget: this.currentWidget });
        } else {
          this.saveWidget({ formData: this.formData, currentWidget: this.currentWidget });
        }
        this.closeDialog();
      }
    },
    async fetchReasonEntities() {
      this.loading = true;
      let ret = [];
      if (this.computedFetchReasonsArgs !== null) {
        try {
          ret = await filterItemsApi.getFilterItems(...this.computedFetchReasonsArgs);
        } catch {
          ret = [];
        }
      }
      this.reasonEntityList = ret;
      this.loading = false;
    },
    onWidgetTypeChange(type) {
      if ([SPEEDLOSS_CHART, SCRAP_CHART, DELAYS_CHART, CHECKLIST_WIDGET].includes(type) && this.formData.type !== type) this.formData.entityIds = [];
      const prevType = this.formData.type;
      this.formData.type = type;
      this.setNewWidgetName(prevType, this.formData.measure);
      this.formData.displayType = this.formData.type === CHECKLIST_WIDGET ? displayModes.CHECKLIST : null;
      this.scrollSelectedWidgetTypeIntoView();
    },
    scrollSelectedWidgetTypeIntoView() {
      const selectedEl = document.getElementById(`widget-type-${this.formData.type}`);
      selectedEl?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    },
    calculateRequestMeasure(measure) {
      if (this.formData.useAlternativeUnit === true && measureAltUnitMap[measure]) {
        return measureAltUnitMap[measure];
      }
      return measure;
    },
    onMeasureChange([measure]) {
      const prevMeasure = this.measureState;
      this.measureState = measure;
      this.formData.measure = this.calculateRequestMeasure(measure);
      this.setNewWidgetName(this.formData.type, prevMeasure);
    },
    onUnitChange([useAlternativeUnit]) {
      this.formData.useAlternativeUnit = useAlternativeUnit;
      this.formData.measure = this.calculateRequestMeasure(this.measureState);
    },
    scroll(direction) {
      const container = this.typeSelectionContainer;
      if (!container) return;

      const maxScroll = container.scrollWidth - container.offsetWidth;
      const targetScroll = container.scrollLeft + (container.offsetWidth * direction);
      const scrollWithinBounds = Math.max(0, Math.min(targetScroll, maxScroll));

      container.scrollTo({ left: scrollWithinBounds, behavior: 'smooth' });
    },
    moveLeft() {
      this.scroll(-1);
    },
    moveRight() {
      this.scroll(1);
    },
    setNewWidgetName(prevType, prevMeasure) {
      const prevDefault = prevType === OEE_CHART ? this.widgetNameMap[prevType][prevMeasure]?.display : this.widgetNameMap[prevType];
      if (this.formData.widgetName !== prevDefault) return;
      if (this.formData.type === OEE_CHART) {
        this.formData.widgetName = this.widgetNameMap[this.formData.type][this.formData.measure]?.display;
      } else {
        this.formData.widgetName = this.widgetNameMap[this.formData.type];
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 0.9px - 124px);
  overflow-y: auto;
  overflow-x: hidden;

  &--fullscreen {
    max-height: calc(var(--app-height) * 1px - 124px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 116px);
  }
}

.widget-type-container {
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 8px;
  }

  &::before {
    left: 32px;
    background: linear-gradient(90deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%);
  }

  &::after {
    right: 32px;
    background: linear-gradient(270deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%);
  }

  &--no-arrows {
    &::before {
      left: 0;
    }

    &::after {
      right: 0;
    }
  }
}

.type-selection {
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
