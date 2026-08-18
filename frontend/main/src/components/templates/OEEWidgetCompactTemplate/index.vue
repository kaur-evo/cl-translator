<template>
  <div class="d-flex flex-column fill-height">
    <div class="flex-shrink-1 flex-grow-0">
      <slot name="compact-header" />
    </div>
    <div class="flex-grow-1 flex-shrink-0">
      <slot name="chart" />
    </div>
    <div class="flex-shrink-1 flex-grow-0">
      <div class="d-flex justify-space-around">
        <div
          v-if="targetValue || targetValue === 0"
          class="text-center pa-1"
        >
          <slot
            name="target-label"
            :target-value="targetValue"
          />
        </div>
        <div
          v-for="(label, index) in labelsData"
          :key="index"
          class="text-center pa-1"
          :class="label.class"
        >
          <slot
            name="label"
            :label-data="label"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'OEEWidgetCompactTemplate',
  props: {
    labelsData: {
      type: Array,
      required: true,
    },
    targetValue: {
      type: [String, Number],
      default: null,
    },
  },
};
</script>
