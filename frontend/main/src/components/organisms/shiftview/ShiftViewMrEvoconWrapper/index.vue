<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <div
        v-bind="props"
        class="d-flex justify-center flex-grow-1"
        :class="hasFixedHeight ? 'fixed-height' : 'fill-height'"
      >
        <shiftview-mr-evocon
          v-if="useSpecialVersion"
          :is-special="useSpecialVersion"
          max-height="100%"
          max-width="100%"
          @click="onMrEvoconClick"
        />
        <mr-evocon-manager v-else />
      </div>
    </template>
    <evocon-v-tooltip
      title="Mr Evocon"
      :rows="[
        { key: $t('Happy OEE'), value: `${lineviewStation.oeeGoalHappy}%` },
        { key: $t('Unhappy OEE'), value: `${lineviewStation.oeeGoalSad}%` },
      ]"
    />
  </v-tooltip>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useUserPreferencesStore, useStationStore, useGenericDialogStore } from '@/stores/index';
import ShiftviewMrEvocon from '@/components/organisms/shiftview/MrEvocon/index.vue';
import MrEvoconManager from '@/components/organisms/shiftview/ShiftviewMrEvoconManager/index.vue';
import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import shiftviewDialogs from '@/constants/dialogConfigs';

export default {
  name: 'ShiftViewMrEvoconWrapper',
  components: {
    ShiftviewMrEvocon,
    MrEvoconManager,
    EvoconVTooltip,
  },
  props: {
    hasFixedHeight: Boolean,
  },
  computed: {
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    ...mapState(useStationStore, ['lineviewStation']),
    useSpecialVersion() {
      if (this.viewSettings.useStandardEvocon) return false;
      return new Date() >= new Date('2026-02-24T00:00:00.000Z') && new Date() < new Date('2026-02-25T00:00:00.000Z');
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    onMrEvoconClick() {
      if (!this.useSpecialVersion) return;
      this.openDialog(shiftviewDialogs.VIEW_SETTINGS);
    },
  },
};
</script>

<style lang="scss" scoped>
$mr-evocon-fixed-height: 104px; // fixed height for Mr Evocon in mobile widget dialog

.fixed-height {
  height: $mr-evocon-fixed-height;
}
</style>
