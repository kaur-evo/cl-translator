import { defineAsyncComponent } from 'vue';

export default {
  component: defineAsyncComponent(() => import('../../components/organisms/shiftview/ChecklistOverviewDialog/index.vue')),
  componentName: 'ChecklistOverviewDialog',
  width: 1100,
};
