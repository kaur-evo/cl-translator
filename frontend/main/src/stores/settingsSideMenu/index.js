import { defineStore } from 'pinia';

const useSettingsSideMenuStore = defineStore('settingsSideMenu', {
  state: () => ({
    isCollapsed: false,
  }),
  actions: {
    setIsCollapsed(value) {
      this.isCollapsed = value;
    },
  },
});

export default useSettingsSideMenuStore;
