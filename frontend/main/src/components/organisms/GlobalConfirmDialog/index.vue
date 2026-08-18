<template>
  <GenericDialogTemplate
    v-model="dialogState"
    :width="400"
    :title="title"
    :message="text"
    :allow-fullscreen="false"
    :primary-action-text="confirmText"
    :secondary-action-text="cancelText"
    :primary-action-color="color"
    :primary-button-type="primaryButtonType"
    :primary-action-icon="primaryIcon"
    :secondary-button-type="secondaryButtonType"
    :secondary-action-color="secondaryColor"
    :secondary-action-icon="secondaryIcon"
    :persistent="persistent"
    :primary-loading="loading"
    @secondary-action="closeConfirmDialog"
    @primary-action="confirmDialogAction"
    @click:outside="onClickOutside"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import GenericDialogTemplate from '@/components/molecules/GenericDialog/index.vue';
import useConfirmDialogStore from '@/stores/confirmDialog';

export default {
  name: 'GlobalConfirmDialog',
  components: { GenericDialogTemplate },
  computed: {
    ...mapState(useConfirmDialogStore, [
      'isOpen',
      'title',
      'text',
      'cancelText',
      'confirmText',
      'color',
      'persistent',
      'secondaryButtonType',
      'secondaryColor',
      'secondaryIcon',
      'primaryIcon',
      'loading',
    ]),
    dialogState: {
      get() {
        return this.isOpen;
      },
      set(val) {
        if (!val) this.closeConfirmDialog();
      },
    },
    primaryButtonType() {
      return this.color === 'error' ? 'secondary' : 'primary';
    },
  },
  methods: {
    ...mapActions(useConfirmDialogStore, ['closeConfirmDialog', 'confirmDialogAction']),
    onClickOutside() {
      if (!this.persistent) this.closeConfirmDialog();
    },
  },
};
</script>
