<template>
  <evocon-v-button
    v-show="canGoBack"
    id="reports-back-btn"
    class="mb-2"
    :icon="mdiArrowLeft"
    :text="$vuetify.display.lgAndUp ? $t('Back') : ''"
    @click="onGoBack()"
  />
</template>
<script>
import { mdiArrowLeft } from '@mdi/js';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import logApi from '@/api/logApi';

const svgIcons = { mdiArrowLeft };
export default {
  name: 'ReportsBackBtn',
  components: {
    EvoconVButton,
  },
  data() {
    return {
      ...svgIcons,
      history: [],
    };
  },
  computed: {
    canGoBack() {
      if (this.history.length === 1 && this.history[0] === '/reports2') {
        return false;
      }
      return !!this.history.length;
    },
  },
  watch: {
    $route(val, prev) {
      this.onRouteChange(val, prev);
    },
  },
  methods: {
    onRouteChange(val, prev) {
      const lastPath = this.history[this.history.length - 1];
      if (val.fullPath === lastPath) {
        this.history.pop();
      } else {
        this.history.push(prev.fullPath);
      }
    },
    onGoBack() {
      logApi.logEvent([{
        type: 'reports back button clicked',
        message: JSON.stringify({ height: window.innerHeight, width: window.innerWidth }),
      }]);
      this.$router.go(-1);
    },
  },
};
</script>
