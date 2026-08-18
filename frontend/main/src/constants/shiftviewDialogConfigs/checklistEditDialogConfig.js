import { defineAsyncComponent } from 'vue';

export default {
  component: defineAsyncComponent(() => import('../../components/organisms/shiftview/ChecklistEditDialog/index.vue')),
  componentName: 'ChecklistEditDialog',
  width: 1100,
};
