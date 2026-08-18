import { defineAsyncComponent } from 'vue';

export default {
  component: defineAsyncComponent(() => import('../../components/organisms/shiftview/EditTeamDialog/index.vue')),
  width: 700,
};
