export default class ServiceWorkerService {
  refreshing = false;

  registration = null;

  async subscribeToServiceWorker() {
    if (!window.navigator.serviceWorker) return;
    this.registration = await window.navigator.serviceWorker.ready;
    window.navigator.serviceWorker.addEventListener('controllerchange', this.onControllerChange);
  }

  onControllerChange() {
    if (this.refreshing) {
      return;
    }
    this.refreshing = true;
    window.location.reload();
  }

  async updateServiceWorkerIfAvailable() {
    if (!this.registration || !this.registration.waiting) return;
    this.registration.waiting.postMessage('skipWaiting');
  }

  unsubscribeServiceWorker() {
    window.navigator.serviceWorker.removeEventListener('controllerchange', this.onControllerChange);
    window.document.removeEventListener('swUpdated', this.setRegistration);
  }
}
