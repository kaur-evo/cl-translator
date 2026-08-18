<template>
  <v-row class="fill-height align-center">
    <div
      :id="`axis-${id}`"
      :ref="`axis-${id}`"
      class="flex-grow-1 flex-shrink-0"
    />
  </v-row>
</template>
<script>
import * as d3 from 'd3';
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import useFactoryOverviewConfigStore from '@/stores/factoryOverviewConfig';
import useProfileStore from '@/stores/profile';

export default {
  name: 'TimelineAxis',
  props: {
    xScale: {
      type: Function,
      required: true,
    },
    id: {
      type: [Number, String],
      required: true,
    },
    timeZones: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState(useFactoryOverviewConfigStore, ['timelinesInterval']),
    ...mapState(useProfileStore, ['currentUser', 'timeFormat']),
  },
  watch: {
    xScale() {
      this.drawGraph();
    },
  },
  methods: {
    getHourWidth(element) {
      return element.node().getBoundingClientRect().width / this.timelinesInterval;
    },
    getFontSize(element) {
      const max = 14;
      const min = 8;
      const hourWidth = this.getHourWidth(element);
      const chars = this.currentUser.timeFormat === 12 ? 7 : 5;
      // eslint-disable-next-line no-magic-numbers
      const fontSize = (hourWidth * 1.618) / chars;
      if (fontSize > max) {
        return max;
      }
      if (fontSize < min) {
        return min;
      }
      return fontSize;
    },
    drawGraph() {
      const element = this.$refs[`axis-${this.id}`];
      const d3Element = d3.select(element);
      const fontSize = this.getFontSize(d3Element);
      /* eslint-disable no-magic-numbers */
      const everyNthTick = this.getHourWidth(d3Element) > 40 ? 1 : 2;
      d3Element.selectAll('svg').remove('*');
      const xAxis = d3
        .axisTop()
        .ticks(d3.timeHour.every(everyNthTick))
        .tickFormat((d) => DateTime.fromJSDate(d).setZone(this.timeZones[0]).toFormat(this.timeFormat.luxonShort));
      xAxis.scale(this.xScale);

      const axisContainer = d3Element
        .append('svg')
        .attr('height', `${fontSize + 2}px`)
        .attr('width', '100%');

      axisContainer
        .append('g')
        .attr('transform', `translate(0, ${fontSize})`)
        .attr('class', 'x axis')
        .style('font-size', () => `${fontSize}px`)
        .style('line-height', () => `${fontSize + 2}px`)
        .call(xAxis)
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('.tick line').remove())
        .selectAll('.tick text')
        .attr('y', 0);
    },
  },
};
</script>
