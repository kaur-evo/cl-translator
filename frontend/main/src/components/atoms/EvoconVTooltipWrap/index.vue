<template>
  <v-tooltip
    :location="location"
    :open-delay="openDelay"
    v-bind="$attrs"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-tooltip>
</template>
<script>
export default {
  name: 'EvoconVTooltipWrap',
  props: {
    location: { type: String, default: 'top' },
    openDelay: { type: Number, default: 500 },
  },
};
</script>
