import { createApp } from 'vue';
import { Amplify } from 'aws-amplify';
import { createPinia } from 'pinia';

import './styles/layers.css';
import './styles/vuetify-layer-fallback';
import './services/WorkerService';

import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import vuetify from './plugins/vuetify';
import i18n from './services/i18n';

import logApi from '@/api/logApi';
import { useProfileStore } from '@/stores/index';
import awsconfig from '@/aws-exports';
import '@fontsource/roboto-mono';
import '@fontsource/roboto-mono/700.css';
import '@fontsource/open-sans'; // Defaults to weight 400 with normal variant.
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';

import './styles/vuetify-tweaks.scss';
import './styles/global-tweaks.scss';
import './styles/global-styles.scss';
import './styles/colors.scss';


Amplify.configure(awsconfig);

const pinia = createPinia();

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.use(i18n);
app.use(pinia);
app.mount('#app');

/* ERROR HANDLING */
let concurrentErrorRequests = 0;
let errorRequestTimeout = null;
const maxErrorRequestsInSec = 1;

function sendErrorRequest(body) {
  if (concurrentErrorRequests < maxErrorRequestsInSec) {
    concurrentErrorRequests += 1;
    logApi.postConsoleError([body]);
  }

  clearTimeout(errorRequestTimeout);

  errorRequestTimeout = setTimeout(() => {
    concurrentErrorRequests = 0;
  }, 1000);
}

function onVueError(error, vm, info) {
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    const { currentUser } = useProfileStore();

    const component = vm?.$?.type?.name;
    if (['VOverlay', 'VListItem'].includes(component)) return; // temp. ignore vuetify overlay errors, errors occur in outdated browsers

    if (error.name === 'AxiosError' && error.code === 'ECONNABORTED') return; // ignore timeout errors

    sendErrorRequest({
      type: 'vue error',
      message: `${error.stack};
        component: ${component},
        info: ${info},
        path: {${vm.$route.path}},
        fullPath: {${vm.$route.fullPath}},
        endpoint: ${error.config?.url || ''},
        body: ${error.config?.data || ''}
        userAgent: ${window.navigator.userAgent},
      `,
      username: currentUser?.username ?? 'unknown',
      tenantId: currentUser?.tenantId ?? 'unknown',
    });
  }

  console.error(error);
}

function onFunctionError(message, source, lineNo, colNo, error) {
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    sendErrorRequest({
      type: 'window error',
      message: `
        message: ${message};
        source: ${source} (line: ${lineNo}, col: ${colNo}), 
        path: {${this.$route.path}}, 
        fullPath: {${this.$route.fullPath}}, 
        error: ${error}, 
        userAgent: ${window.navigator.userAgent},
      `,
    });
  }

  console.error(error);
}

app.config.errorHandler = onVueError;

window.onerror = onFunctionError;
