<template>
  <div class="chart-wrapper">
    <improvements-chart
      :data="chartData"
      :project="project"
      :stats="stats"
      :screen-width="screenWidth"
      :completed-actions="completedActionsByDateList"
      :solutions="currentVisibleSolutionsByDateList"
      :chart-y-key="chartYKey"
      :chart-colors="colors"
      :all-dates="allFormattedDates"
      :is-per-stop-chart="perStopChart"
      :is-project-data-measured-by-time="projectDataMeasuredByTime"
      :target-val="project.targetValue"
      :baseline-average="stats.initialDailyAverage"
      :chart-max-val="chartMaxVal"
      :tick-interval="tickInterval"
      :bar-tooltip-h-t-m-l-func="barTooltipHTMLFunc"
      :average-tooltip-h-t-m-l-func="averageTooltipHTMLFunc"
      :measure-tooltip-h-t-m-l-func="measureTooltipHTMLFunc"
    />
  </div>
</template>
<script>
/* eslint-disable no-magic-numbers */
import { max } from 'd3';
import { mapState } from 'pinia';
import { format, addDays } from 'date-fns';

import { useDeviceStore } from '@/stores/index';
import {
  REDUCE_TO_TIME, REDUCE_BY_PCT, PER_STOP,
} from '@/constants/improvementsDataTrackingTypes';
import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';
import { formatDate } from '@/helpers/date/formatDate';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import groupByFilterRule from '@/helpers/improvementsGroupByFilterRule';
import groupMapToList from '@/helpers/improvementsGroupMapToList';
import ImprovementsChart from '@/components/organisms/improvements/ImprovementsBarChart/ImprovementsChart.vue';
import getMonthMiddleDates from '@/helpers/list/getMonthMiddleDates';
import { formatNumber } from '@/helpers/numbers/formatNumber';

export default {
  name: 'ImprovementsBarChart',
  components: {
    ImprovementsChart,
  },
  props: {
    project: { type: Object, default: () => {} },
    stats: { type: Object, default: () => {} },
    actions: { type: Array, default: () => [] },
    solutions: { type: Array, default: () => [] },
  },
  computed: {
    ...mapState(useDeviceStore, ['screenWidth']),
    colors() {
      return colorConstants[this.$vuetify.theme.name];
    },
    mappedBaselineData() {
      return this.stats.baselineData.map((data) => ({ ...data, type: 'baseline' }));
    },
    mappedCurrentData() {
      return this.stats.currentData.map((data) => ({ ...data, type: 'current' }));
    },
    projectData() {
      return [...this.mappedBaselineData, ...this.mappedCurrentData];
    },
    delaysAndMeasuresData() {
      // find actions that are completed, but the completionDate is not in projectData array
      const actions = this.actions.filter((d) => d.completionDate && !this.projectData.some((delay) => delay.date === d.completionDate));
      // change date var name, to sort concatenatedArray later
      const actionsDateValues = actions.map(({ completionDate: date }) => ({ date }));
      // find solutions that have startDate, but the startDate is not in projectData array
      const solutions = this.solutions.filter((d) => d.startDate && !this.projectData.some((delay) => delay.date === d.startDate));
      // change date var name, to sort concatenatedArray later
      const solutionsDateValues = solutions.map(({ startDate: date }) => ({ date }));
      const concatenatedArray = [...actionsDateValues, ...solutionsDateValues, ...this.projectData];
      return concatenatedArray.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    projectDataMeasuredByTime() {
      return this.project.targetType === REDUCE_TO_TIME || this.project.targetType === REDUCE_BY_PCT;
    },
    perStopChart() {
      return this.project.periodType === PER_STOP && this.projectDataMeasuredByTime;
    },
    chartMaxVal() {
      if (this.projectDataMeasuredByTime) {
        return Math.max(60, this.stats.initialDailyAverage, max(this.data.map((x) => x.duration)));
      }
      return Math.max(5, this.stats.initialDailyAverage, max(this.data.map((x) => x.count)));
    },
    chartYKey() {
      return this.projectDataMeasuredByTime ? 'duration' : 'count';
    },
    tickInterval() {
      if (this.projectDataMeasuredByTime) {
        return this.getTickIntervalPerTime(this.chartMaxVal);
      }
      return this.getTickIntervalPerCount(this.chartMaxVal);
    },
    data() {
      return this.perStopChart ? this.delaysAndMeasuresData : this.projectData;
    },
    dates() {
      const currentData = [...this.mappedCurrentData];
      const baselineDates = this.mappedBaselineData.map((elem) => elem.date);
      const currentDataDates = this.getDates(currentData[0].date, currentData[currentData.length - 1].date);
      return baselineDates.concat(currentDataDates);
    },
    allFormattedDates() {
      return this.dates.reduce((list, elem) => {
        const existingItem = this.data.find((item) => item.date === elem);
        const map = {
          xAxisLabel: formatDate(elem, 'dd'),
          secondaryLabel: this.secondaryLabels.includes(elem) ? formatDate(elem, 'MMMM yyyy') : '',
          date: new Date(elem),
          count: existingItem?.count,
          duration: existingItem ? existingItem.duration : 0,
          type: existingItem ? existingItem.type : 'no-production',
          color: existingItem ? this.getColor(existingItem, 'allDates') : this.colors['quaternary-dark'],
          isDot: existingItem && existingItem.duration === 0 && !this.project.excludeNoDataDays,
        };
        list.push(map);
        return list;
      }, []);
    },
    chartData() {
      return this.data.reduce((list, elem) => {
        const map = {
          xAxisLabel: formatDate(elem.date, 'dd'),
          secondaryLabel: this.secondaryLabels.includes(elem.date) ? formatDate(elem.date, 'MMMM yyyy') : '',
          date: new Date(elem.date),
          count: elem.count,
          duration: elem.duration,
          type: elem.type,
          color: this.getColor(elem),
        };
        list.push(map);
        return list;
      }, []);
    },
    completedActionsByDate() {
      return groupByFilterRule({
        list: this.actions,
        groupBy: 'completionDate',
        filterRule: (val) => (val.completed && this.dates.indexOf(val.completionDate) > -1),
      });
    },
    completedActionsByDateList() {
      const actionsByDateList = groupMapToList({
        map: this.completedActionsByDate,
        groupName: 'date',
        itemsName: 'actions',
      });
      return actionsByDateList.reduce((list, elem) => {
        const map = {
          ...elem,
          date: new Date(elem.date),
        };
        list.push(map);
        return list;
      }, []);
    },
    currentVisibleSolutions() {
      return groupByFilterRule({
        list: this.solutions,
        groupBy: 'startDate',
        filterRule: (val) => (val.startDate && this.dates.indexOf(val.startDate) > -1),
      });
    },
    currentVisibleSolutionsByDateList() {
      const visibleSolutionsByDateList = groupMapToList({
        map: this.currentVisibleSolutions,
        groupName: 'date',
        itemsName: 'solutions',
      });
      return visibleSolutionsByDateList.reduce((list, elem) => {
        const map = {
          ...elem,
          date: new Date(elem.date),
        };
        list.push(map);
        return list;
      }, []);
    },
    secondaryLabels() {
      return getMonthMiddleDates(this.data.map((el) => el.date));
    },
  },
  methods: {
    getDates(startDate, stopDate) {
      const dateArray = [];
      let current = new Date(startDate);
      const stop = new Date(stopDate);
      while (current <= stop) {
        dateArray.push(format(current, 'yyyy-MM-dd'));
        current = addDays(current, 1);
      }
      return dateArray;
    },
    getTickIntervalPerTime(maxVal) {
      if (maxVal <= 60) { // tick after every 15 seconds
        return 15;
      }
      if (maxVal <= 300) { // tick after every minute
        return 60;
      }
      if (maxVal <= 1500) { // tick after every 5 minutes
        return 300;
      }
      if (maxVal <= 3000) { // tick after every 10 minutes
        return 600;
      }
      if (maxVal <= 4500) { // tick after every 15 minutes
        return 900;
      }
      if (maxVal <= 9000) { // tick after every 30 minutes
        return 1800;
      }
      if (maxVal <= 18000) { // tick every hour
        return 3600;
      }
      if (maxVal <= 36000) { // tick every second hour
        return 7200;
      }
      return 18000; // tick every fifth hour
    },
    getTickIntervalPerCount(maxVal) {
      if (maxVal <= 5) { // tick after every stop
        return 1;
      }
      if (maxVal <= 15) { // tick after every 5 stops
        return 5;
      }
      if (maxVal <= 50) { // tick after every 10 stops
        return 10;
      }
      if (maxVal <= 100) { // tick after every 25 stops
        return 25;
      }
      if (maxVal <= 1000) { // tick after every 250 stops
        return 250;
      }
      if (maxVal <= 2000) { // tick after every 500 stops
        return 500;
      }
      return 1000; // tick after every 1000 stops
    },
    getColor(item, chartType) {
      if (chartType && item.duration === 0 && this.project.excludeNoDataDays) {
        return 'none';
      }
      if (item.type === 'baseline') {
        return this.colors['lw-gray'];
      }
      if (item[this.chartYKey] > this.project.targetValue) {
        return graphColors['improvement-above-target'];
      }
      return graphColors['improvement-below-target'];
    },
    barTooltipHTMLFunc(d) {
      const rows = [];
      if (d.duration) {
        rows.push(`
          <span class="text-quaternary-dark-2 tooltip-value-row text-label-small font-weight-regular">${this.$t('duration')}: </span>
          <span class="text-white text-body-medium">${formatSecondsFriendly(d.duration)}</span>
        `);
      }
      if (d.count) {
        rows.push(`
        <span class="text-quaternary-dark-2 tooltip-value-row text-label-small font-weight-regular">${this.$t('count')}: </span>
        <span class="text-white text-body-medium">${this.formatNumber(d.count)}</span>
        `);
      }
      return rows.join('<br>');
    },
    averageTooltipHTMLFunc(d) {
      const tooltipVal = this.projectDataMeasuredByTime ? formatSecondsFriendly(d.averageLineData) : this.formatNumber(d.averageLineData);
      return `<span class="text-tertiary-dark overline">${d.type === 'baseline' ? this.$t('Baseline average') : this.$t('Target average')}: </span><span class="text-white">${tooltipVal}</span>`;
    },
    measureTooltipHTMLFunc(d) {
      if (d.actions) {
        const actionRows = [];
        d.actions.forEach((action) => {
          actionRows.push(`<div>
          <div>
            <span class="text-tertiary-dark text-body-small font-weight-medium">${this.$t('Action')} ${action.ordering + 1}</span>
            <span class="text-white overline">${formatDate(action.completionDate, 'short')}</span>
          </div>
          <span class="text-white">${action.description}</span>
          </div>`);
        });
        return actionRows.join('');
      }
      const solutionRows = [];
      d.solutions.forEach((solution) => {
        solutionRows.push(`<div>
          <div>
            <span class="text-tertiary-dark text-body-small font-weight-medium">${this.$t('Solution')}</span>
            <span class="text-white overline">${formatDate(solution.startDate, 'short')}</span>
          </div>
          <span class="text-white">${solution.description}</span>
          </div>`);
      });
      return solutionRows.join('');
    },
    formatNumber(number) {
      return formatNumber(number);
    },
  },
};
</script>
<style lang="scss" scoped>
.chart-wrapper {
  margin-top: 4px;
  height: 470px;
  width: 100%;
}
</style>
