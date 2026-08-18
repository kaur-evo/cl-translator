<template>
  <div class="image-prev-container">
    <div class="content-overlay close-image ma-3">
      <evocon-v-button
        :icon="mdiClose"
        color="white"
        @click="closeDialog()"
      />
    </div>
    <img
      class="image"
      :src="dialogData.item.imgSrc"
      alt="img-preview"
    >
    <span class="content-overlay image-title pa-2">{{ imgTitle }}</span>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiClose } from '@mdi/js';

import { useGenericDialogStore } from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = { mdiClose };

export default {
  name: 'ImprovementImagePreview',
  components: { EvoconVButton },
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    imgTitle() {
      return this.dialogData.item.imgTitle || this.getNameFromUrl(this.dialogData.item.imgUrl);
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    getNameFromUrl(fileUrl) {
      const modifiedUrl = fileUrl.split('/');
      return modifiedUrl[modifiedUrl.length - 1];
    },
  },
};
</script>
<style lang="less" scoped>
.image-prev-container {
  background: rgb(var(--v-theme-secondary-dark));
  &:hover {
    .close-image, .image-title {
      opacity: 1;
    }
  }
}

.image {
  max-height: 80vh;
  max-width: 80vw;
}

.content-overlay {
  position: absolute;
  opacity: 0;
  background: rgb(var(--v-theme-tertiary-dark));
  transition: all 0.4s ease-in-out 0s;
  &.close-image {
    top: 0;
    right: 0;
    border-radius: 50%;
  }
  &.image-title {
    bottom: 0;
    left: 0;
    width: 100%;
    color: white;
    border-radius: 0 0 4px 4px;
  }
}
</style>
