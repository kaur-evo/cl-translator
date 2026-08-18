<template>
  <div class="bg-primary-dark fill-height full-width parent-container">
    <div
      class="d-flex flex-column justify-center align-center fill-height py-4 px-8"
    >
      <img
        :src="imgPath"
        class="mb-6"
        alt="entity-removed"
      >
      <span class="text-center">{{ $t('This content no longer exists or may have been moved.') }}</span>
    </div>
  </div>
</template>
<script setup name="RemovedEntityView">
import { computed } from 'vue';

import { getImageAsset } from '@/helpers/file/getAsset';

const imgPath = computed(() => getImageAsset('mr-evocon-no-visibility.svg'));
</script>
<style lang="scss" scoped>
.parent-container {
  position: absolute;
  top: 0;
}
</style>
