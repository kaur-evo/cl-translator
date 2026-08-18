<template>
  <evocon-v-snackbar
    v-model="notificationState"
    location="top right"
    :timeout="timeout"
    :type="type"
    :label="text"
    :description="secondaryText"
    @close="closeNotification"
  />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import EvoconVSnackbar from '@/components/atoms/EvoconVSnackbar/index.vue';
import useGenericNotificationStore from '@/stores/genericNotification';

export default {
  name: 'GenericNotification',
  components: {
    EvoconVSnackbar,
  },
  computed: {
    ...mapState(useGenericNotificationStore, ['isOpen', 'text', 'type', 'timeout', 'secondaryText']),
    notificationState: {
      get() {
        return this.isOpen;
      },
      set(val) {
        this.setOpen(val);
      },
    },
  },
  methods: {
    ...mapActions(useGenericNotificationStore, ['closeNotification', 'setOpen']),
  },
};
</script>
