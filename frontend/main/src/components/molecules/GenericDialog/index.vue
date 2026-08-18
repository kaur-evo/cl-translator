<template>
  <v-dialog
    :model-value="modelValue"
    :width="showFullscreenDialogs && allowFullscreen ? '' : width"
    persistent
    :fullscreen="showFullscreenDialogs && allowFullscreen"
    theme="light"
    class="overflow-hidden"
    @update:model-value="onStateChange"
    @click:outside="clickOutside"
  >
    <v-card
      id="generic-dialog"
      class="py-0 max-height-100-pct overflow-hidden rounded"
      :class="{ 'rounded-0': showFullscreenDialogs }"
    >
      <v-card-title
        v-if="title"
        id="generic-dialog-title"
        class="py-4 px-6 d-flex align-center text-wrap"
      >
        {{ title }}
      </v-card-title>
      <component
        :is="componentFile"
        v-if="componentName && modelValue"
        ref="dialog-component"
      />
      <slot />
      <v-card-text
        v-if="message"
        id="generic-dialog-message"
        class="px-6 py-2 text-body-large"
      >
        {{ message }}
      </v-card-text>
      <v-card-actions
        v-if="secondaryActionText || primaryActionText"
        id="generic-dialog-actions"
      >
        <v-spacer />
        <evocon-v-button
          v-if="secondaryActionText"
          id="generic-dialog-secondary-btn"
          :color="secondaryActionColor"
          :text="secondaryActionText"
          :type="secondaryButtonType"
          :icon="secondaryActionIcon"
          @click="$emit('secondary-action')"
        />
        <evocon-v-button
          v-if="primaryActionText"
          id="generic-dialog-primary-btn"
          :color="primaryActionColor"
          :text="primaryActionText"
          :type="primaryButtonType"
          :icon="primaryActionIcon"
          :loading="primaryLoading"
          @click="$emit('primary-action')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mdiClose } from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import { useDeviceStore, useGenericDialogStore } from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = { mdiClose };
export default {
  name: 'GenericDialog',
  components: { EvoconVButton },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    width: {
      type: [Number, String],
      default: 500,
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    primaryActionText: {
      type: String,
      default: '',
    },
    primaryButtonType: {
      type: String,
      default: 'secondary',
    },
    primaryActionIcon: {
      type: String,
      default: '',
    },
    secondaryActionText: {
      type: String,
      default: '',
    },
    secondaryButtonType: {
      type: String,
      default: 'secondary',
    },
    primaryActionColor: {
      type: String,
      default: 'primary',
    },
    secondaryActionColor: {
      type: String,
      default: '',
    },
    secondaryActionIcon: {
      type: String,
      default: '',
    },
    componentName: {
      type: Function,
      default: null,
    },
    persistent: {
      type: Boolean,
    },
    allowFullscreen: {
      type: Boolean,
      default: true,
    },
    saveOnEnter: {
      type: Boolean,
      default: true,
    },
    primaryLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:model-value', 'primary-action', 'secondary-action'],
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['showFullscreenDialogs']),
    componentFile() {
      if (this.componentName) {
        return this.componentName;
      }
      return '';
    },
  },
  watch: {
    componentName(newVal, oldVal) {
      if (oldVal) window.removeEventListener('keydown', this.checkEnterPress);
      if (newVal) window.addEventListener('keydown', this.checkEnterPress);
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['onClickOutsideAction']),
    onStateChange(val) {
      this.$emit('update:model-value', val);
    },
    clickOutside() {
      if (this.persistent) return;
      const menuElems = document.getElementsByClassName('v-menu__content');
      const isMenuOpen = Array.from(menuElems).some((element) => Array.from(element.classList).includes('menuable__content__active'));
      if (isMenuOpen) return;
      this.onClickOutsideAction();
    },
    checkEnterPress($event) {
      if (!this.saveOnEnter) return;
      if ($event.key === 'Enter') this.saveDialogData();
    },
    saveDialogData() {
      if (this.$refs['dialog-component'] && this.$refs['dialog-component'].onSave) this.$refs['dialog-component'].onSave();
    },
  },
};
</script>
<style>
.max-height-100-pct {
  max-height: 100%;
}
#generic-dialog-message {
  white-space: pre-wrap;
}
</style>
