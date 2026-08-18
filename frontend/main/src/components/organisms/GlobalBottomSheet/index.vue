<template>
  <bottom-sheet-template
    :title="title"
    :theme="theme"
    :height="height"
  >
    <component :is="component" v-bind="componentProps" />
  </bottom-sheet-template>
</template>
<script setup name="GlobalBottomSheet">
import { storeToRefs } from 'pinia';

import BottomSheetTemplate from '@/components/templates/BottomSheetTemplate/index.vue';
import useBottomSheetStore from '@/stores/bottomSheet';

const bottomSheetStore = useBottomSheetStore();
const { component, componentProps, title, theme, height } = storeToRefs(bottomSheetStore);
</script>
