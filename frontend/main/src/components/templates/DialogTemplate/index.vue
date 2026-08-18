<template>
  <div>
    <dialog-toolbar
      :color="color"
      :title="title"
      :icon-color="iconColor"
      :title-icon="titleIcon"
    />
    <v-card-text
      class="pb-0 dialog-content"
      :class="{
        'dialog-content--mobile': isMobileView,
        'dialog-content--tablet': showFullscreenDialogs && !isMobileView,
        'px-2 pt-2': !isMobileView,
        'px-4 pt-0': isMobileView,
      }"
    >
      <slot name="content" />
    </v-card-text>
    <v-card-actions
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs && allowFullscreen }"
    >
      <slot name="actions" />
    </v-card-actions>
  </div>
</template>
<script>
import { mapState } from 'pinia';

import { useDeviceStore, useGenericDialogStore } from '@/stores/index';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';

export default {
  name: 'DialogTemplate',
  components: { DialogToolbar },
  props: {
    title: {
      type: String,
      default: '',
    },
    titleIcon: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'white',
    },
    iconColor: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useGenericDialogStore, ['allowFullscreen']),
  },

};
</script>
<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 0.9px - 124px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 124px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 116px);
    min-height: calc(var(--app-height) * 1px - 116px);
  }
}
</style>
