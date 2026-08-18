<template>
  <GenericDialogTemplate
    v-model="dialogState"
    :width="width"
    :title="title"
    :message="text"
    :primary-action-text="confirmText"
    :secondary-action-text="cancelText"
    :primary-action-color="color"
    :component-name="component"
    :persistent="persistent"
    :allow-fullscreen="allowFullscreen"
    :save-on-enter="saveOnEnter"
    primary-button-type="primary"
    @secondary-action="closeDialog"
    @primary-action="primaryAction"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import GenericDialogTemplate from '@/components/molecules/GenericDialog/index.vue';
import useGenericDialogStore from '@/stores/genericDialog';

export default {
  name: 'GlobalGenericDialog',
  components: { GenericDialogTemplate },
  computed: {
    ...mapState(useGenericDialogStore, [
      'isOpen',
      'title',
      'text',
      'cancelText',
      'confirmText',
      'width',
      'color',
      'component',
      'persistent',
      'allowFullscreen',
      'saveOnEnter',
    ]),
    dialogState: {
      get() {
        return this.isOpen;
      },
      set(val) {
        this.setOpen(val);
      },
    },
  },
  watch: {
    $route() {
      if (!this.persistent) {
        this.closeDialog();
      }
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'primaryAction', 'setOpen']),
  },
};
</script>
