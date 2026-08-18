<template>
  <div class="bg-quaternary-dark fill-height full-width">
    <v-card
      :max-width="maxWidth"
      :min-height="isLoading ? 600 : null"
      class="mx-auto mb-10"
      :class="{ 'mt-0': isMobileView, 'mt-10': !isMobileView }"
    >
      <loading-view v-if="isLoading" />
      <slot name="title-segment" />
      <v-card-title
        v-if="primarySegmentTitle"
        id="primary-title"
        class="justify-center d-flex white-space-wrap text-center"
        :class="{ 'pb-0': primarySegmentSubtitle }"
      >
        {{ primarySegmentTitle }}
      </v-card-title>
      <v-card-subtitle
        v-if="primarySegmentSubtitle"
        id="primary-subtitle"
        class="d-flex justify-center px-4 pb-4 text-body-medium"
      >
        {{ primarySegmentSubtitle }}
      </v-card-subtitle>
      <div class="px-3">
        <slot name="primary-segment" />
      </div>
      <v-row
        v-if="hasSecondarySegmentSlot"
        class="ma-4"
      >
        <v-col class="text-center">
          <div
            id="secondary-title"
            class="text-body-large font-weight-bold position-relative text-align-center full-width"
          >
            <span class="segment-title"> {{ secondarySegmentTitle }} </span>
            <icon-with-tooltip
              v-if="secondarySegmentIcon"
              additional-classes="ml-1 position-absolute"
              :icon="secondarySegmentIcon"
              :tooltip-text="$t('Learn more')"
              :icon-clicked-fn="() => $emit('secondary-icon-click')"
            />
            <slot name="secondary-segment-title-append" />
          </div>
          <div
            id="secondary-subtitle"
            class="text-body-medium text-secondary-text"
          >
            {{ secondarySegmentSubtitle }}
          </div>
        </v-col>
      </v-row>
      <div
        v-if="hasSecondarySegmentSlot"
        class="px-3"
      >
        <slot name="secondary-segment" />
      </div>
      <v-row
        v-if="hasTertiarySegmentSlot"
        class="ma-4"
      >
        <v-col class="text-center">
          <div
            id="tertiary-title"
            class="text-body-large font-weight-bold position-relative text-align-center full-width"
          >
            <span class="segment-title"> {{ tertiarySegmentTitle }} </span>
            <icon-with-tooltip
              v-if="tertiarySegmentIcon"
              additional-classes="ml-1 position-absolute"
              :icon="tertiarySegmentIcon"
              :tooltip-text="$t('Learn more')"
              :icon-clicked-fn="() => $emit('tertiary-icon-click')"
            />
          </div>
          <div
            id="tertiary-subtitle"
            class="text-body-medium text-secondary-text"
          >
            {{ tertiarySegmentSubtitle }}
          </div>
        </v-col>
      </v-row>
      <div
        v-if="hasTertiarySegmentSlot"
        class="px-3"
      >
        <slot name="tertiary-segment" />
      </div>
      <v-card-actions v-if="hasActionsSlot">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
import { mapState } from 'pinia';

import { useDeviceStore } from '@/stores/index';
import LoadingView from '@/components/atoms/LoadingView/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';

export default {
  name: 'FormPageTemplate',
  components: {
    LoadingView,
    IconWithTooltip,
  },
  props: {
    primarySegmentTitle: {
      type: String,
      default: '',
    },
    primarySegmentSubtitle: {
      type: String,
      default: '',
    },
    secondarySegmentTitle: {
      type: String,
      default: '',
    },
    secondarySegmentSubtitle: {
      type: String,
      default: '',
    },
    secondarySegmentIcon: {
      type: String,
      default: '',
    },
    tertiarySegmentTitle: {
      type: String,
      default: '',
    },
    tertiarySegmentSubtitle: {
      type: String,
      default: '',
    },
    tertiarySegmentIcon: {
      type: String,
      default: '',
    },
    isLoading: {
      type: Boolean,
    },
  },
  emits: ['secondary-icon-click', 'tertiary-icon-click'],
  computed: {
    ...mapState(useDeviceStore, ['isMobileView', 'screenWidth']),
    hasSecondarySegmentSlot() {
      return !!this.$slots['secondary-segment'];
    },
    hasTertiarySegmentSlot() {
      return !!this.$slots['tertiary-segment'];
    },
    hasActionsSlot() {
      return !!this.$slots.actions;
    },
    maxWidth() {
      // eslint-disable-next-line no-magic-numbers
      return this.isMobileView ? this.screenWidth - 32 : 900;
    },
  },
};
</script>
<style lang="scss" scoped>
.segment-title {
  line-height: 28px;
}
</style>
