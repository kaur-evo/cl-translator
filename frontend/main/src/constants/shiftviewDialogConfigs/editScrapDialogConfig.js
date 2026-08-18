import { defineAsyncComponent } from 'vue';

import useShiftviewSelectionStore from '@/stores/shiftviewSelection';
const onClickOutside = () => {
  useShiftviewSelectionStore().clearSliceSelection();
};
export default {
  component: defineAsyncComponent(() => import('../../components/organisms/shiftview/EditScrapDialog/index.vue')),
  width: 1100,
  onClickOutside,
};
