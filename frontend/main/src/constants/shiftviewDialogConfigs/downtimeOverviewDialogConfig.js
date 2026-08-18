import { defineAsyncComponent } from 'vue';

export default {
  component: defineAsyncComponent(() => import('../../components/organisms/shiftview/DowntimeOverviewDialog/index.vue')),
  width: 1100,
};
