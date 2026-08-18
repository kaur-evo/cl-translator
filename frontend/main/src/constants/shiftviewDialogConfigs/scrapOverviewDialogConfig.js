import { defineAsyncComponent } from 'vue';

export default {
  component: defineAsyncComponent(() => import('../../components/organisms/shiftview/ScrapOverviewDialog/index.vue')),
  width: 1100,
};
