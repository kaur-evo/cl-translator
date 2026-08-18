<template>
  <evocon-v-button
    v-bind="attrs"
    :color="isMobileView ? '' : 'error'"
    :text="isMobileView ? '' : $t('Delete')"
    :icon="isMobileView ? mdiDelete : ''"
    type="secondary"
  />
</template>

<script setup name="DeleteButton">
import { mdiDelete } from '@mdi/js';
import { computed, useAttrs } from 'vue';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useDeviceStore from '@/stores/device';

const deviceStore = useDeviceStore();
const attrs = useAttrs();

const isMobileView = computed(() => deviceStore.isMobileView);
</script>
