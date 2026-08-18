import { defineStore } from 'pinia';

import i18n from '@/services/i18n';
import truncateText from '@/helpers/text/truncateText';

const ITEM_NAME_CHAR_LIMIT = 40;
const DEFAULT_TIMEOUT = 5000;

const useGenericNotificationStore = defineStore('genericNotification', {
  state: () => ({
    isOpen: false,
    text: null,
    secondaryText: null,
    timeout: -1,
    type: '',
    onClose: null,
    actionText: '',
    actionFn: null,
    location: 'top right',
    titleText: null,
    classStr: '',
  }),
  getters: {
    isNotificationOpen: (state) => state.isOpen,
    notificationType: (state) => state.type,
  },
  actions: {
    openNotification(payload = {}) {
      this.text = payload.text || null;
      this.type = payload.type || '';
      this.timeout = payload.timeout || DEFAULT_TIMEOUT;
      this.actionText = payload.actionText || '';
      this.actionFn = payload.actionFn || null;
      this.location = payload.location || 'top right';
      this.titleText = payload.titleText || null;
      this.secondaryText = payload.secondaryText || null;
      this.classStr = payload.classStr || '';
      this.onClose = payload.onClose || null;
      this.isOpen = true;
    },
    async closeNotification() {
      const { default: useGenericDialogStore } = await import('@/stores/genericDialog');
      const genericDialogStore = useGenericDialogStore();

      if (genericDialogStore.persistent === false) {
        await genericDialogStore.setDialogPersistence(true);
        genericDialogStore.setDialogPersistence(false);
      }
      this.isOpen = false;
      if (this.onClose) {
        this.onClose();
      }
    },
    notifySaved(value) {
      this.openNotification({
        text: i18n.global.t('{value} saved', { value: truncateText(value, ITEM_NAME_CHAR_LIMIT) }),
        type: 'success',
      });
    },
    notifyAdded(value) {
      this.openNotification({
        text: i18n.global.t('{value} added', { value: truncateText(value, ITEM_NAME_CHAR_LIMIT) }),
        type: 'success',
      });
    },
    notifyUpdated(value) {
      this.openNotification({
        text: i18n.global.t('{value} updated', { value: truncateText(value, ITEM_NAME_CHAR_LIMIT) }),
        type: 'success',
      });
    },
    notifyDeleted(value) {
      this.openNotification({
        text: i18n.global.t('{value} deleted', { value: truncateText(value, ITEM_NAME_CHAR_LIMIT) }),
        type: 'success',
      });
    },
    notifyError(text) {
      this.openNotification({
        text: truncateText(i18n.global.t(text), 100),
        type: 'error',
      });
    },
    notifyWarning({ text, timeout = DEFAULT_TIMEOUT }) {
      this.openNotification({
        text,
        type: 'warning',
        timeout,
      });
    },
    notifySuccess(text) {
      this.openNotification({
        text,
        type: 'success',
      });
    },
    notifyInformation(text) {
      this.openNotification({ text });
    },
    setOpen(val) {
      this.isOpen = val;
    },
  },
});

export default useGenericNotificationStore;
