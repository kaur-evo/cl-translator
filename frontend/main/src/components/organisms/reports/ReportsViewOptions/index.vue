<template>
  <evocon-v-button
    v-if="isDev"
    :icon="mdiCog"
    class="ma-1 "
    @click="onViewOptionsClick"
  />
</template>
<script>
import { mapActions } from 'pinia';
import { mdiCog } from '@mdi/js';

import { useGenericDialogStore } from '@/stores';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import dialogConfig from '@/stores/reportsConfig/configurations/dialogConfig';

const vectorIcons = {
  mdiCog,
};
export default {
  name: 'ReportsViewOptions',
  components: { EvoconVButton },
  data() {
    return { ...vectorIcons };
  },
  computed: {
    isDev() {
      return import.meta.env.VITE_VUE_APP_SYSTEM_NAME === 'DEV';
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    onViewOptionsClick() {
      this.openDialog(dialogConfig.REPORTS_VIEW_OPTIONS);
    },
  },
};
</script>
