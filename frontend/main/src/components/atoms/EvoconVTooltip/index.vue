<template>
  <div class="d-flex flex-column py-2 evocon-v-tooltip">
    <span>
      <v-icon
        v-if="iconColor"
        size="10"
        :color="iconColor"
        class="mr-1"
      >
        {{ mdiCircle }}
      </v-icon>
      <span class="text-label-small font-weight-regular">{{ type }}</span>
    </span>
    <span>
      <v-icon
        v-if="titleIcon"
        class="mr-1"
        :color="titleIconColor"
      >
        {{ titleIcon }}
      </v-icon>
      <span class="tooltip-title font-weight-medium mb-1">
        {{ title }}
      </span>
    </span>
    <span
      v-for="(row, i) in rows.filter((row) => row.value)"
      :key="`row-${i}`"
      class="tooltip-value-row"
      :class="{ 'text-no-wrap overflow-hidden text-overflow-ellipsis d-flex align-center': !row.allowTextWrap }"
    >
      <v-icon
        v-if="row.dotColor"
        size="8"
        :color="row.dotColor"
        class="mr-1"
      >
        {{ mdiCircle }}
      </v-icon>
      <span class="text-quaternary-dark-2 tooltip-value-row text-label-small font-weight-regular white-space-nowrap">{{ row.key }}:&nbsp;</span>
      <span
        class="tooltip-value-row text-body-small"
        :class="{ 'text-no-wrap overflow-hidden text-overflow-ellipsis': !row.allowTextWrap }"
      >
        <span :class="row.valueClass">{{ row.value }}</span>
        <span v-if="row.secondaryValue" :class="row.secondaryClass">{{ row.secondaryValue }}</span>
        <span v-if="row.tertiaryValue" :class="row.tertiaryClass">{{ row.tertiaryValue }}</span>
      </span>
    </span>
  </div>
</template>

<script>
import { mdiCircle } from '@mdi/js';

const icons = { mdiCircle };
export default {
  name: 'EvoconVTooltip',
  props: {
    iconColor: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    rows: {
      type: Array,
      default: () => [],
    },
    titleIcon: {
      type: String,
      default: '',
    },
    titleIconColor: {
      type: String,
      default: 'white',
    },
  },
  data() {
    return {
      ...icons,
    };
  },
};
</script>

<style>
/* Let every cursor event fall straight through the tooltip layer so the
   overlay can't steal hover from the activator (which causes flicker).
   Walking up to .v-overlay via :has() covers both EvoconVTooltipWrap and
   raw v-tooltip usages, and catches any intermediate wrappers. */
.v-tooltip .v-overlay__content,
.v-tooltip .v-overlay__content * {
  pointer-events: none !important;
}
</style>
