<template>
  <dialog-toolbar
    v-if="primarySegmentTitle"
    :title="primarySegmentTitle"
    :subtitle="primarySegmentSubtitle"
  />
  <v-card class="elevation-0">
    <div
      class="dialog-content"
      :class="{
        'dialog-content--tablet': showFullscreenDialogs && allowFullscreen && !isMobileView,
        'dialog-content--mobile': showFullscreenDialogs && allowFullscreen && isMobileView,
      }"
    >
      <div class="px-3">
        <slot name="primary-segment" />
      </div>
      <div v-if="secondarySegmentTitle" class="text-center pa-4">
        <div
          id="secondaty-title"
          class="text-body-large font-weight-bold"
        >
          {{ secondarySegmentTitle }}
        </div>
        <div
          v-if="secondarySegmentSubtitle"
          id="secondary-subtitle"
          class="text-body-medium text-secondary-text position-relative text-align-center full-width"
        >
          <span class="secondary-segment-title"> {{ secondarySegmentSubtitle }} </span>
          <icon-with-tooltip
            v-if="secondarySegmentSubtitleIcon"
            additional-classes="ml-1 position-absolute"
            :icon="secondarySegmentSubtitleIcon"
            :tooltip-text="$t('Learn more')"
            :icon-clicked-fn="() => $emit('secondary-icon-click')"
          />
        </div>
      </div>
      <div class="px-3">
        <slot name="secondary-segment" />
      </div>
    </div>
    <v-card-actions
      v-if="hasActionsSlot"
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs && allowFullscreen }"
    >
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>
<script>
import { mapState } from 'pinia';

import { useDeviceStore, useGenericDialogStore } from '@/stores/index';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';

export default {
  name: 'FormDialogTemplate',
  components: { IconWithTooltip, DialogToolbar },
  props: {
    primarySegmentTitle: {
      type: String,
      required: true,
    },
    primarySegmentSubtitle: {
      type: String,
      default: null,
    },
    secondarySegmentTitle: {
      type: String,
      default: '',
    },
    secondarySegmentSubtitle: {
      type: String,
      default: '',
    },
    secondarySegmentSubtitleIcon: {
      type: String,
      default: '',
    },
  },
  emits: ['secondary-icon-click'],
  computed: {
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useGenericDialogStore, ['allowFullscreen']),
    hasActionsSlot() {
      return !!this.$slots.actions;
    },
  },
};
</script>
<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 0.9px - 124px);
  overflow-y: auto;

  &--tablet {
    min-height: calc(var(--app-height) * 1px - 124px);
    max-height: calc(var(--app-height) * 1px - 124px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 128px);
    min-height: calc(var(--app-height) * 1px - 128px);
  }
}

.secondary-segment-title {
  line-height: 28px;
}
</style>
