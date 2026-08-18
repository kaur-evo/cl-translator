import axios from 'axios';
import axiosRetry from 'axios-retry';
import { signOut, fetchAuthSession } from 'aws-amplify/auth';


import i18n from '@/services/i18n';
import { ERROR_UNAUTHORIZED } from '@/constants/error';

async function openConfirmDialog(val) {
  const { default: useConfirmDialogStore } = await import('@/stores/confirmDialog');
  const confirmDialogStore = useConfirmDialogStore();
  return confirmDialogStore.openConfirmDialog(val);
}
axios.defaults.withCredentials = true;

const request = axios.create({
  baseURL: import.meta.env.VITE_VUE_APP_BASE_API_URL,
  timeout: 20000,
  withCredentials: true,
});
axiosRetry(request, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

function getDuplicateFieldValue(error) {
  const alreadyInUse = error.response.data.validationErrors.find((err) => err.type === 'duplicate');
  const data = JSON.parse(error.config.data);
  return data[alreadyInUse.field] || data.name;
}

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED') { // timeout
      throw error;
    }

    if (error.response) { // request was made and server responded
      if (error.response.status === ERROR_UNAUTHORIZED) {
        await signOut();
        localStorage.setItem('redirectUrl', window.location.href);
        const url = error.response.data.url || `${window.location.origin}/login/`;
        window.location.assign(url);
      }

      if (error.response.data && error.response.data.type === 'confirmation') {
        const value = getDuplicateFieldValue(error);

        const promiseOfConfirmation = await openConfirmDialog({
          title: i18n.global.t('{value} already exists', { value }),
          text: i18n.global.t('{value} already exists but was deleted. Do you want to restore?', { value }),
          confirmText: i18n.global.t('Restore'),
          cancelText: i18n.global.t('Cancel'),
          color: 'primary',
          action: () => {
            const errorClone = { ...error };
            errorClone.config.params = { forced: true };
            return axios.request(errorClone.config);
          },
          closeAction: () => error,
        });

        try {
          const response = await promiseOfConfirmation;
          return Promise.resolve(response);
        } catch (err) {
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(error);
  },
);

request.interceptors.request.use(
  async (config) => {
    const ret = { ...config };
    const session = await fetchAuthSession();
    const accessToken = session?.tokens?.accessToken?.toString?.();
    if (accessToken) ret.headers.Authorization = `Bearer ${accessToken}`;
    ret.paramsSerializer = { indexes: null, ...config.paramsSerializer };
    return ret;
  },
  (error) => {
    Promise.reject(error);
  },
);

export default request;
