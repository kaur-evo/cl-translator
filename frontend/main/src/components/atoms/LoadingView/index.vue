<template>
  <div class="loading-container pa-4">
    <v-progress-linear indeterminate color="primary" />
    <div class="fill-height d-flex justify-center align-center">
      <div>
        <v-img
          id="loading-view__img"
          :src="imgSrc"
          alt="loading-view-img"
          cover
          eager
          class="mb-4"
        />
        <span class="text-body-large">
          {{ $t('Loading... Please wait') }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import { getImageAsset } from '@/helpers/file/getAsset';

export default {
  name: 'LoadingView',
  props: {
    imgUrl: {
      type: String,
      default: 'loading-data',
    },
  },
  computed: {
    imgSrc() {
      return getImageAsset(`loading-view-${this.imgUrl}.svg`);
    },
  },
};
</script>
<style lang="scss" scoped>
.loading-container {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #FFF;
  z-index: 100;
}
</style>
