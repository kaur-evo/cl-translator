import { defineAsyncComponent } from 'vue';

export default {
  component: defineAsyncComponent(() => import('../../components/organisms/shiftview/SpeedLossOverviewDialog/index.vue')),
  width: 1100,
};
