import { defineStore } from 'pinia';

const DEFAULT_WIDTH = 700;

const useGenericDialogStore = defineStore('genericDialog', {
  state: () => ({
    isOpen: false,
    title: '',
    text: '',
    onPrimaryAction: null,
    onSecondaryAction: null,
    confirmText: '',
    cancelText: '',
    width: DEFAULT_WIDTH,
    color: 'primary',
    component: null,
    componentName: null,
    lastComponent: null,
    dialogData: {},
    previousState: {},
    persistent: false,
    persistenceTimeout: null,
    allowFullscreen: true,
    onClickOutside: null,
    saveOnEnter: true,
  }),
  getters: {
    isDialogOpened: (state) => state.isOpen,
    openedDialogComponent: (state) => state.component,
  },
  actions: {
    openDialog(payload = {}) {
      if (this.isOpen) {
        this.rememberPrevious();
      }
      this.setOptions(payload);
      this.isOpen = true;
    },
    openPreviousDialog() {
      this.openDialog({ ...this.previousState, data: this.previousState.dialogData });
    },
    primaryAction(payload) {
      if (this.onPrimaryAction) {
        this.onPrimaryAction(payload);
      }
      this.isOpen = false;
      this.component = null;
      this.componentName = null;
    },
    secondaryAction(payload) {
      if (this.onSecondaryAction) {
        this.onSecondaryAction(payload);
      }
      this.isOpen = false;
      this.component = null;
      this.componentName = null;
    },
    closeDialog() {
      this.isOpen = false;
      this.component = null;
      this.componentName = null;
      this.previousState = {};
    },
    setDialogPersistence(val) {
      clearTimeout(this.persistenceTimeout);
      if (val !== this.persistent) {
        if (val) {
          this.persistent = true;
        } else {
          this.persistenceTimeout = setTimeout(
            () => {
              this.persistent = false;
            },
            300,
          );
        }
      }
    },
    onClickOutsideAction() {
      if (this.onClickOutside) this.onClickOutside();
      this.closeDialog();
    },
    updateDialogData(data) {
      this.dialogData = { ...this.dialogData, ...data };
    },
    setOptions(payload) {
      this.lastComponent = this.component || null;
      this.component = payload.component || null;
      this.componentName = payload.componentName || null;
      this.title = payload.title || '';
      this.text = payload.text || '';
      this.onPrimaryAction = payload.onPrimaryAction || null;
      this.onSecondaryAction = payload.onSecondaryAction || null;
      this.confirmText = payload.confirmText || '';
      this.cancelText = payload.cancelText || '';
      this.width = payload.width || DEFAULT_WIDTH;
      this.color = payload.color || 'primary';
      this.dialogData = { ...payload.data };
      this.allowFullscreen = payload.allowFullscreen !== false;
      this.onClickOutside = payload.onClickOutside;
      this.persistent = payload.persistent || false;
      this.saveOnEnter = 'saveOnEnter' in payload ? payload.saveOnEnter : true;
    },
    rememberPrevious() {
      this.previousState = {
        title: this.title,
        text: this.text,
        onPrimaryAction: this.onPrimaryAction,
        onSecondaryAction: this.onSecondaryAction,
        confirmText: this.confirmText,
        cancelText: this.cancelText,
        width: this.width,
        color: this.color,
        component: this.component,
        componentName: this.componentName,
        dialogData: this.dialogData,
        previousState: this.previousState,
        allowFullscreen: this.allowFullscreen,
        onClickOutside: this.onClickOutside,
        saveOnEnter: this.saveOnEnter,
      };
    },
    forgetPrevious() {
      this.previousState = {};
    },
    setOpen(val) {
      this.isOpen = val;
    },
    setAllowFullscreen(val) {
      this.allowFullscreen = val;
    },
  },
});

export default useGenericDialogStore;
