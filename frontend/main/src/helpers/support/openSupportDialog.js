import { defineAsyncComponent } from 'vue';

import useGenericDialogStore from '@/stores/genericDialog';

export default function openSupportDialog() {
  const genericDialogStore = useGenericDialogStore();
  genericDialogStore.openDialog({
    component: defineAsyncComponent(() => import('@/components/organisms/SupportFormDialog/index.vue')),
    width: 900,
  });
}
