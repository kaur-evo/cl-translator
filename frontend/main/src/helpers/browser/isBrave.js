import i18n from '@/services/i18n';
import isLocalStorageAvailable from '@/helpers/localStorage/isLocalStorageAvailable';
import { useGenericNotificationStore } from '@/stores/index';
export function isBrave() {
  return !!navigator?.brave && typeof navigator.brave.isBrave === 'function' && navigator.brave.isBrave();
}
export function showBraveBrowserWarning() {
  if (hasWarningBeenRead()) {
    return;
  }
  useGenericNotificationStore().openNotification({
    type: 'warning',
    text: i18n.global.t('Brave browser detected'),
    secondaryText: i18n.global.t('The Brave browser may interfere with certain functionalities of this application. Please try disabling Brave Shields or using a different browser for the best experience.'),
    timeout: -1,
    onClose: () => {
      markWarningRead();
    },
  });
}

export function showBraveBrowserWarningIfNeeded() {
  if (isBrave()) {
    showBraveBrowserWarning();
  }
}

function markWarningRead() {
  if (isLocalStorageAvailable()) {
    localStorage.setItem('braveBrowserWarningRead', 'true');
  }
}

function hasWarningBeenRead() {
  if (isLocalStorageAvailable()) {
    return localStorage.getItem('braveBrowserWarningRead') === 'true';
  }
  return false;
}
