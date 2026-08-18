import { defineStore } from 'pinia';

import i18n from '@/services/i18n';

const useConfirmDialogStore = defineStore('confirmDialog', {
  state: () => ({
    isOpen: false,
    title: '',
    text: '',
    action: null,
    closeAction: null,
    confirmText: '',
    cancelText: '',
    color: 'error',
    confirmed: false,
    response: null,
    persistent: false,
    secondaryButtonType: 'secondary',
    secondaryColor: '',
    secondaryIcon: '',
    primaryIcon: '',
    confirmPromise: null,
    hasLoading: false,
    loading: false,
  }),
  actions: {
    waitForConfirm({ resolve, reject }) {
      if (this.confirmed && !this.isOpen) return resolve(this.response);
      if (!this.confirmed && !this.isOpen) return reject(this.response);
      return setTimeout(() => {
        this.waitForConfirm({ resolve, reject });
      }, 300);
    },
    openConfirmDialog(payload = {}) {
      this.confirmed = false;
      this.response = null;
      this.title = payload.title || i18n.global.t('Confirmation');
      this.text = payload.text || '';
      this.action = payload.action || null;
      this.closeAction = payload.closeAction || null;
      this.confirmText = payload.confirmText || '';
      this.cancelText = payload.cancelText || '';
      this.color = payload.color || 'error';
      this.persistent = payload.persistent || false;
      this.secondaryButtonType = payload.secondaryButtonType || 'secondary';
      this.secondaryColor = payload.secondaryColor || '';
      this.secondaryIcon = payload.secondaryIcon || '';
      this.primaryIcon = payload.primaryIcon || '';
      this.hasLoading = payload.hasLoading || false;
      this.isOpen = true;
      return new Promise((resolve, reject) => {
        this.waitForConfirm({ resolve, reject });
      });
    },
    async confirmDialogAction() {
      if (this.action) {
        try {
          const actionPromise = this.action();
          this.confirmPromise = actionPromise;
          if (this.hasLoading) {
            this.loading = true;
          }
          const actionResponse = await actionPromise;
          this.confirmed = true;
          this.response = actionResponse;
          this.isOpen = false;
        } catch (err) {
          this.confirmed = false;
          this.response = err;
        } finally {
          this.loading = false;
        }
      }
    },
    async closeConfirmDialog() {
      if (this.closeAction) {
        await this.closeAction();
      }
      this.isOpen = false;
    },
  },
});

export default useConfirmDialogStore;
