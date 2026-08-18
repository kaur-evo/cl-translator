<template>
  <div
    class="d-flex flex-column align-center full-width"
    :class="{ 'mt-0': isMobileView, 'mt-10': !isMobileView }"
  >
    <v-card
      v-for="(section, sectionIndex) in sections"
      :key="section.titleKey"
      max-width="900px"
      width="100%"
      :min-height="isLoading ? 600 : null"
      :class="{ 'mb-2': sectionIndex < sections.length - 1 }"
    >
      <loading-view v-if="isLoading" />
      <template v-else>
        <v-card-title :class="titleClass">
          {{ section.title }}
          <slot name="title-append" :title="section.title" />
        </v-card-title>
        <v-divider v-if="showDivider" />
        <slot name="items" :items="section.items" />
      </template>
    </v-card>
  </div>
</template>
<script setup name="SettingsSecurityWrapper">
import { computed } from 'vue';

import { useDeviceStore } from '@/stores/index';
import LoadingView from '@/components/atoms/LoadingView/index.vue';

const deviceStore = useDeviceStore();

defineProps({
  sections: { type: Array, required: true },
  isLoading: { type: Boolean },
  titleClass: { type: String, default: 'd-flex justify-center align-center' },
  showDivider: { type: Boolean },
});

const isMobileView = computed(() => deviceStore.isMobileView);
</script>
