<template>
  <main-app-toolbar />
  <div class="bg-primary-dark fill-height d-flex flex-column justify-center align-center px-8">
    <img src="@/assets/images/denied.svg" :width="isMobileView ? '100%' : '510px'" alt="denied">
    <span class="mt-6 text-align-center">{{ $t('Sorry, you do not have permission to view this page.') }}</span>
  </div>
</template>
<script setup name="DeniedView">
import { computed } from 'vue';

import MainAppToolbar from '@/components/organisms/MainAppToolbar/index.vue';
import { useDeviceStore } from '@/stores/index';

const deviceStore = useDeviceStore();
const isMobileView = computed(() => deviceStore.isMobileView);
</script>
