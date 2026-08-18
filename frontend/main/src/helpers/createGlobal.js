// eslint-disable-next-line import/no-extraneous-dependencies
import { createTestingPinia } from '@pinia/testing';
import merge from 'lodash/merge';

export default function createGlobal({ pinia, piniaOptions, router } = {}) {
  const piniaPlugin = pinia || createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    ...piniaOptions,
  });
  const $t = (msg) => msg;
  const routerMocks = {
    $router: {},
    $route: {
      query: {},
    },
  };
  merge(routerMocks, router);
  return {
    plugins: [piniaPlugin],
    mocks: {
      ...routerMocks,
      $t,
    },
    stubs: ['router-link', 'router-view'],
  };
}
