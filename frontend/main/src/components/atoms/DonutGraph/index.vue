<template>
  <div :ref="`donut-chart${i}`" class="donut-chart fill-height" />
</template>

<script>
import DonutGraph from './DonutGraph';

export default {
  name: 'DonutGraph',
  props: {
    i: {
      type: [String, Number],
      required: true,
    },
    donutsData: {
      type: Array,
      default: () => [],
    },
    innerCircleData: {
      type: Object,
      default: () => {},
    },
    updateTrigger: {
      type: Number,
      default: 0,
    },
    tooltipHTMLFunc: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      donutGraph: null,
    };
  },
  watch: {
    updateTrigger() {
      this.drawGraph();
    },
    donutsData() {
      this.drawGraph();
    },
  },
  mounted() {
    this.drawGraph();
  },
  unmounted() {
    if (this.donutGraph) {
      this.donutGraph.destroy();
      this.donutGraph = null;
    }
  },
  methods: {
    drawGraph() {
      this.donutGraph = new DonutGraph({
        data: this.donutsData,
        element: this.$refs[`donut-chart${this.i}`],
        innerCircleData: this.innerCircleData,
        tooltipHTMLFunc: this.tooltipHTMLFunc,
      });
    },
  },
};
</script>
