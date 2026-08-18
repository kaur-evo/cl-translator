<template>
  <main-app-toolbar has-back-button />
  <div
    v-if="$route.name === 'improvements'"
    class="py-10 fill-height bg-quaternary-dark"
  >
    <v-container
      :fluid="$vuetify.display.lgAndDown"
      :class="$vuetify.display.lgAndUp && $vuetify.display.name !== 'xl' ? 'desktop-size' : 'px-6'"
    >
      <div class="d-flex justify-space-between align-center mb-8">
        <span class="text-headline-large text-high-emphasis">
          {{ $t('Improvements overview') }}
        </span>
        <evocon-v-button
          color="primary"
          :icon="mdiPlus"
          :text="$t('Improvement')"
          @click="createNewProject"
        />
      </div>
      <improvements-overview />
    </v-container>
  </div>
  <router-view v-else />
</template>
<script>
import { mdiPlus } from '@mdi/js';

import ImprovementsOverview from '@/components/organisms/improvements/ImprovementsOverview/index.vue';
import MainAppToolbar from '@/components/organisms/MainAppToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiPlus };

export default {
  name: 'ImprovementsMain',
  components: {
    ImprovementsOverview,
    MainAppToolbar,
    EvoconVButton,
  },
  data() {
    return {
      ...icons,
    };
  },
  methods: {
    createNewProject() {
      this.$router.push({ name: 'newImprovementProject' });
    },
  },
};
</script>
<style lang="less" scoped>
.desktop-size {
  padding: 0 148px;
}
</style>
