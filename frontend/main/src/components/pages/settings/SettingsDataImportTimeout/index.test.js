import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsDataImportTimeout from './index.vue';

import useDeviceStore from '@/stores/device';

const createPinia = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  useDeviceStore(pinia).isMobileView = false;
  return pinia;
};

describe('SettingsDataImportTimeout', () => {
  it('renders correctly', () => {
    const $route = { name: '_dataImportTimeout', query: { reportName: 'ProductExport' } };
    const wrapper = mount(SettingsDataImportTimeout, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when retried', () => {
    const $route = { name: '_dataImportTimeout', query: { reportName: 'ProductExport' }, params: { retry: true } };
    const wrapper = mount(SettingsDataImportTimeout, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('visibility', () => {
    it('is invisible if route name is not dataImportTimeout', () => {
      const $route = { name: 'test' };
      const wrapper = mount(SettingsDataImportTimeout, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
          stubs: ['router-link', 'router-view'],
        },
      });

      expect(wrapper.find('#data-import-timeout').exists()).toBeFalsy();
    });

    it('is visible if route name is dataImportTimeout', () => {
      const $route = { name: '_dataImportTimeout' };
      const wrapper = mount(SettingsDataImportTimeout, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
          stubs: ['router-link', 'router-view'],
        },
      });

      expect(wrapper.find('#data-import-timeout').exists()).toBeTruthy();
    });
  });

  describe('Empty state', () => {
    test('that empty state titles are correct when timeout is not retried', async () => {
      const $route = { name: '_dataImportTimeout' };
      const wrapper = mount(SettingsDataImportTimeout, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
          stubs: ['router-link', 'router-view'],
        },
      });

      const emptyView = await wrapper.findComponent({ name: 'empty-view' });
      const {
        header, description, imgUrl, primaryBtn, secondaryBtn,
      } = emptyView.vm.$props;

      expect(wrapper.find('#empty-state').exists()).toBeTruthy();
      expect(header).toEqual('Timeout');
      expect(description).toEqual('Something went wrong. Please try again.');
      expect(imgUrl).toEqual('settings-timeout-1');
      expect(primaryBtn).toEqual('Retry');
      expect(secondaryBtn).toEqual('');
    });

    test('that empty state titles are correct when timeout is retried', async () => {
      const $route = { name: '_dataImportTimeout', params: { retry: true } };
      const wrapper = mount(SettingsDataImportTimeout, {
        global: {
          plugins: [createPinia()],
          mocks: { $route },
          stubs: ['router-link', 'router-view'],
        },
      });

      const emptyView = await wrapper.findComponent({ name: 'empty-view' });
      const {
        header, description, imgUrl, primaryBtn, secondaryBtn,
      } = emptyView.vm.$props;

      expect(wrapper.find('#empty-state').exists()).toBeTruthy();
      expect(header).toEqual('Problem loading data');
      expect(description).toEqual('Something went wrong. Please try again.');
      expect(imgUrl).toEqual('settings-timeout-2');
      expect(primaryBtn).toEqual('');
      expect(secondaryBtn).toEqual('Contact support');
    });
  });
});
