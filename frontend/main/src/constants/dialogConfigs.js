import { defineAsyncComponent } from 'vue';

import useShiftviewSelectionStore from '@/stores/shiftviewSelection';
const onClickOutside = () => useShiftviewSelectionStore().clearSliceSelection();
const shiftviewDialogs = {
  SHIFT_SELECT: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/ShiftSelectDialog/index.vue')),
    width: 330,
  },
  STATION_SELECT: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/StationSelectDialog/index.vue')),
    width: 700,
  },
  MESSAGES: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/ShiftviewMessageDialog/index.vue')),
    width: 1000,
  },
  CHANGEOVER: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/ShiftviewChangeoverDialog/index.vue')),
    width: 1100,
    onClickOutside,
  },

  COMMENT_DOWNTIME: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/CommentDowntimeDialog/index.vue')),
    width: 1100,
    onClickOutside,
  },

  COMMENT_SPEED_LOSS: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/CommentSpeedLossDialog/index.vue')),
    width: 1100,
    onClickOutside,
  },

  MODIFY_SHIFT: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/ShiftManagementDialog/index.vue')),
    width: 732,
    data: { isStartShift: false },
  },
  START_SHIFT: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/ShiftManagementDialog/index.vue')),
    width: 732,
    data: { isStartShift: true },
  },

  SIGNAL_EDIT: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/EditSignalDialog/index.vue')),
    width: 700,
    onClickOutside,
  },
  MANUAL_CHECKLIST: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/ManualChecklistDialog/index.vue')),
    width: 1100,
    onClickOutside,
  },
  VIEW_SETTINGS: {
    component: defineAsyncComponent(() => import('../components/organisms/shiftview/ShiftViewUserSettings/index.vue')),
    width: 732,
    onClickOutside,
  },
};

export default { ...shiftviewDialogs };
