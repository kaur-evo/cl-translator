import { defineStore } from 'pinia';

const useBottomSheetStore = defineStore('bottomSheet', {
  state: () => ({
    isOpen: false,
    component: null,
    componentProps: {},
    title: '',
    theme: 'dark',
    height: null,
  }),
  actions: {
    openBottomSheet(config) {
      this.component = config.component ?? null;
      this.componentProps = config.componentProps ?? {};
      this.title = config.title ?? '';
      this.theme = config.theme ?? 'dark';
      this.height = config.height ?? null;
      this.isOpen = true;
    },
    closeBottomSheet() {
      this.isOpen = false;
      this.component = null;
      this.componentProps = {};
      this.title = '';
      this.theme = 'dark';
      this.height = null;
    },
  },
});

export default useBottomSheetStore;
