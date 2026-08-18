<template>
  <div class="text-center py-5 mx-auto">
    <img
      id="empty-state__img"
      :src="imgSrc"
      :style="{ width: imgWidth }"
      :class="{ 'empty-state__image': !imgWidth }"
      alt="empty-view-img"
    >
    <div
      id="empty-state__header"
      class="font-weight-regular mb-2 empty-view-text"
      :class="small ? 'text-body-large mt-2' : 'text-headline-small mt-6'"
    >
      {{ header }}
    </div>
    <div
      id="empty-state__description"
      class="text-secondary-text"
      :class="small ? 'text-body-small mb-4' : 'text-body-medium mb-6'"
    >
      <span v-if="description">{{ description }}</span>
      <p
        v-for="(row, i) in descriptionRows"
        :key="`description-${i}`"
        class="ma-0"
      >
        {{ row }}
      </p>
    </div>
    <evocon-v-button
      v-if="tertiaryBtn"
      id="empty-state__tertiary-button"
      class="mx-1"
      :icon="tertiaryBtnIcon"
      :text="tertiaryBtn"
      @click="$emit('tertiary-btn-clicked')"
    />
    <evocon-v-button
      v-if="secondaryBtn"
      id="empty-state__secondary-button"
      class="mx-1"
      :color="secondaryBtnColor || 'quaternary-dark'"
      :icon="secondaryBtnIcon"
      :text="secondaryBtn"
      :type="secondaryBtnType || 'primary'"
      @click="$emit('secondary-btn-clicked')"
    />
    <evocon-v-button
      v-if="primaryBtn"
      id="empty-state__primary-button"
      class="mx-1"
      color="quaternary-dark"
      :icon="primaryBtnIcon"
      :text="primaryBtn"
      @click="$emit('button-clicked')"
    />
  </div>
</template>
<script>
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { getImageAsset } from '@/helpers/file/getAsset';

export default {
  name: 'EmptyView',
  components: { EvoconVButton },
  props: {
    header: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    descriptionRows: {
      type: Array,
      default: () => [],
    },
    imgUrl: {
      type: String,
      default: 'detective-black-and-white',
    },
    primaryBtn: {
      type: String,
      default: '',
    },
    primaryBtnIcon: {
      type: String,
      default: '',
    },
    secondaryBtn: {
      type: String,
      default: '',
    },
    secondaryBtnIcon: {
      type: String,
      default: '',
    },
    tertiaryBtn: {
      type: String,
      default: '',
    },
    tertiaryBtnIcon: {
      type: String,
      default: '',
    },
    imgWidth: {
      type: String,
      default: '',
    },
    secondaryBtnColor: {
      type: String,
      default: '',
    },
    secondaryBtnType: {
      type: String,
      default: null,
    },
    small: {
      type: Boolean,
    },
  },
  emits: ['button-clicked', 'secondary-btn-clicked', 'tertiary-btn-clicked'],
  computed: {
    imgSrc() {
      const file = `empty-state-${this.imgUrl}.png`;
      return getImageAsset(file);
    },
  },
};
</script>
<style lang="less" scoped>
.empty-state__image {
  max-height: 330px;
  max-width: 100%;
}
@media only screen and (max-width: 1360px) {
  .empty-state__image {
    max-height: 200px;
  }
}
@media only screen and (max-width: 767px) {
  .empty-state__image {
    max-height: 150px;
  }
}
</style>
