<template>
  <div
    :id="`oee-horizontal-graph${i}`"
    :ref="`oee-horizontal-graph${i}`"
    class="oee-horizontal-graph fill-height full-width"
  />
</template>
<script>
import OeeHorizontalGraph from './OeeHorizontalGraph';

export default {
  name: 'OeeHorizontalGraph',
  props: {
    i: {
      type: [String, Number],
      required: true,
    },
    graphData: {
      type: Array,
      default: () => [],
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
      oeeHorizontalGraph: null,
    };
  },
  watch: {
    updateTrigger() {
      this.drawGraph();
    },
    graphData() {
      this.drawGraph();
    },
  },
  mounted() {
    this.drawGraph();
  },
  unmounted() {
    if (this.oeeHorizontalGraph) {
      this.oeeHorizontalGraph = null;
    }
  },
  methods: {
    drawGraph() {
      const element = this.$refs[`oee-horizontal-graph${this.i}`];
      this.oeeHorizontalGraph = new OeeHorizontalGraph({
        data: this.graphData,
        element,
        tooltipHTMLFunc: this.tooltipHTMLFunc,
      });
    },
  },
};
</script>
