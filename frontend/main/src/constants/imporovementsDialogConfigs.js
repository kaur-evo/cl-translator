import { defineAsyncComponent } from 'vue';

import i18n from '@/services/i18n';

export function getImprovementsFileFormConfig({
  canEdit, isEdit, project, steps, file,
}) {
  return {
    title: i18n.global.t('File'),
    component: defineAsyncComponent(() => import('../components/organisms/improvements/ImprovementFileForm/index.vue')),
    allowFullscreen: false,
    width: 606,
    data: {
      canEdit,
      isEdit,
      isDialogOpen: true,
      project,
      steps,
      item: file,
    },
  };
}

export function getImprovementsImagePreviewConfig({ img }) {
  return {
    component: defineAsyncComponent(() => import('../components/organisms/improvements/ImprovementImagePreview/index.vue')),
    allowFullscreen: false,
    width: 'auto',
    data: {
      item: img,
    },
  };
}
