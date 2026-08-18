import { defineStore } from 'pinia';

const useShiftNotificationStore = defineStore('shiftNotification', {
  state: () => ({
    shiftNotificationVisible: false,
    timer: undefined,
  }),
  actions: {
    showShiftNotification() {
      this.shiftNotificationVisible = true;
    },
    hideShiftNotification() {
      this.shiftNotificationVisible = false;
    },
    async resetShiftNotificationTimer() {
      const { default: useProfileStore } = await import('@/stores/profile');
      const profileStore = useProfileStore();
      const userRole = profileStore.shiftviewStationUserRole;
      const lineviewUserBase = 1200000;
      const standardUserBase = 1800000;
      const intervalTime = 300000;
      const baseInterval = userRole === 'LINEVIEW_USER' ? lineviewUserBase : standardUserBase;
      const randomInterval = Math.floor(Math.random() * intervalTime);
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.showShiftNotification();
      }, baseInterval + randomInterval);
    },
    cancelShiftNotificationTimer() {
      this.hideShiftNotification();
      clearTimeout(this.timer);
    },
  },
});

export default useShiftNotificationStore;
