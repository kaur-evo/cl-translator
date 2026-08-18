<template>
  <v-expansion-panels v-if="isMobileView" eager>
    <v-expansion-panel>
      <v-expansion-panel-title height="48px" min-height="48px">
        <slot name="header" />
      </v-expansion-panel-title>
      <v-expansion-panel-text class="expansion-panel-text">
        <div class="d-grid">
          <slot name="content" />
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
  <div v-else>
    <div class="d-flex align-center mb-2 mx-2">
      <slot name="header" />
    </div>
    <v-card class="px-3 py-1 d-flex align-center flex-wrap">
      <slot name="content" />
    </v-card>
  </div>
</template>

<script setup name="ResponsiveConditionsBlock">
import { computed } from 'vue';

import useDeviceStore from '@/stores/device';

const deviceStore = useDeviceStore();

const isMobileView = computed(() => deviceStore.isMobileView);

</script>

<style scoped lang="scss">
.expansion-panel-text {
  :deep(.v-expansion-panel-text__wrapper) {
    padding: 4px 16px 16px;
  }
}
</style>
