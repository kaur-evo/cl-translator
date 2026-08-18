<template>
  <div class="full-width fill-height">
    <div
      class="wrapper full-width"
      :class="{ 'wrapper--extra-small': isMobileView, 'wrapper--medium': $vuetify.display.md }"
    >
      <span class="mb-4">{{ isReadOnly ? $t('No shift found') : $t('No shift to display, please start new shift') }}</span>
      <v-btn
        v-if="!isReadOnly"
        color="primary"
        @click="addNewShift"
      >
        {{ $t('Start shift') }}
      </v-btn>
      <svg class="custom-shift" />
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useGenericDialogStore, useDeviceStore, useProfileStore } from '@/stores/index';
import shiftviewDialogs from '@/constants/dialogConfigs';

export default {
  name: 'AddCustomShift',
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useProfileStore, ['isReadOnly']),
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    addNewShift() {
      this.openDialog(shiftviewDialogs.START_SHIFT);
    },
  },
};
</script>
<style lang="less" scoped>
.full-width {
  width: 100%;
}

.custom-shift {
  height: 191px;
  width: 171px
}

.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60%;
  &.wrapper--extra-small {
    height: 90%;
  }
  &.wrapper--medium {
    height: 80%;
  }
  .custom-shift {
    background-image: url('start-shift.svg');
  }
}
</style>
