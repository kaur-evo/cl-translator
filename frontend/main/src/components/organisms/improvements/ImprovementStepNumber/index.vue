<template>
  <v-tooltip
    v-if="hasTooltip"
    color="black"
    location="top"
  >
    <template #activator="{ props }">
      <v-avatar
        class="avatar-border my-3 mr-2"
        :class="additionalClass"
        :size="size"
        v-bind="props"
      >
        <span class="text-h7 font-weight-medium">
          {{ stepNumber + 1 }}
        </span>
      </v-avatar>
    </template>
    <div class="py-3">
      <div class="text-label-small text-tertiary-dark">
        {{ $t("Action") }}
      </div>
      <div
        v-if="step.deadline"
        class="text-label-small text-white"
      >
        {{ formatDate(step.deadline, 'long') }}
      </div>
      <div class="text-body-large text-white step-description">
        {{ step.description }}
      </div>
    </div>
  </v-tooltip>
  <v-avatar
    v-else
    class="avatar-border my-3 mx-2"
    :class="additionalClass"
    :size="size"
  >
    <span class="text-h7 font-weight-medium">
      {{ stepNumber + 1 }}
    </span>
  </v-avatar>
</template>
<script>
import { formatDate } from '@/helpers/date/formatDate';

export default {
  name: 'ImprovementStepNumber',
  props: {
    step: {
      type: Object,
      default: () => {},
    },
    size: {
      type: [String, Number],
      default: 24,
    },
    hasTooltip: {
      type: Boolean,
      default: false,
    },
    stepNumber: {
      type: Number,
      default: 0,
    },
    additionalClass: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    formatDate,
  },
};
</script>
<style lang="less">
.step-description {
  width: 200px;
}
.v-avatar.avatar-border {
  border-color: black !important;
  border-style: solid;
  &.complete {
    border-color: rgb(var(--v-theme-primary)) !important;
    color: rgb(var(--v-theme-white)) !important;
    background-color: rgb(var(--v-theme-primary)) !important;
  }
  &.incomplete {
    border-color: rgb(var(--v-theme-secondary)) !important;
    color: rgb(var(--v-theme-secondary)) !important;
    background-color: transparent !important;
  }
}
</style>
