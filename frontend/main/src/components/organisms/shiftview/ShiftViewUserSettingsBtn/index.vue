<template>
  <span>
    <v-tooltip
      :open-delay="500"
      location="bottom"
    >
      <template #activator="{ props }">
        <div
          v-bind="props"
          class="container bg-black rounded"
          :class="{ 'container--large': large }"
        >
          <evocon-v-button
            :icon="mdiCog"
            color="white"
            :size="large ? 'large' : 'default'"
            @click="openUserSettings"
          />
        </div>
      </template>
      <span>{{ $t('View settings') }}</span>
    </v-tooltip>
  </span>
</template>
<script>
import { mapActions } from 'pinia';
import { mdiCog } from '@mdi/js';

import { useGenericDialogStore } from '@/stores/index';
import shiftviewDialogs from '@/constants/dialogConfigs';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiCog };

export default {
  name: 'ShiftViewUserSettingsBtn',
  components: {
    EvoconVButton,
  },
  props: {
    large: {
      type: Boolean,
    },
  },
  data() {
    return {
      ...icons,
    };
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    openUserSettings() {
      this.openDialog(shiftviewDialogs.VIEW_SETTINGS);
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  &--large {
    height: 64px;
    width: 64px;
    min-width: 64px;
    max-width: 64px;
  }
}
</style>
