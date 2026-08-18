import { defineAsyncComponent } from 'vue';

export default {
  component: defineAsyncComponent(() => import('../../components/organisms/shiftview/TeamOverviewDialog/index.vue')),
  width: 700,
};
