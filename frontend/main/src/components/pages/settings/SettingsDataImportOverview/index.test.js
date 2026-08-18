import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsDataImportOverview from './index.vue';

import useDeviceStore from '@/stores/device';

const createPinia = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  useDeviceStore(pinia).isMobileView = false;
  return pinia;
};

describe('SettingsDataImportOverview', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsDataImportOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route: { name: '_dataImport', query: { reportName: 'ProductExport' } } },
        stubs: { 'form-page-template': false },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('is invisible if route name is not data import', () => {
    const wrapper = shallowMount(SettingsDataImportOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route: { name: 'test', query: {} } },
      },
    });

    expect(wrapper.find('#data-import-overview').exists()).toBeFalsy();
  });

  test('that report name is empty if $route query is empty', () => {
    const wrapper = shallowMount(SettingsDataImportOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route: { name: '_dataImport', query: {} } },
      },
    });
    expect(wrapper.vm.reportName).toEqual('');
  });

  test('that report name is equal to $route query reportName param', () => {
    const wrapper = shallowMount(SettingsDataImportOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route: { name: '_dataImport', query: { reportName: 'ProductExport' } } },
      },
    });
    expect(wrapper.vm.reportName).toEqual('ProductExport');
  });

  describe('guideLink', () => {
    it('returns correct link for StopReasonExport', () => {
      const wrapper = shallowMount(SettingsDataImportOverview, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { name: '_dataImport', query: { reportName: 'StopReasonExport' } } },
        },
      });

      expect(wrapper.vm.guideLink).toBe('https://support.evocon.com/Stop-reasons-export-import-177dae0ba80280d0a94ec2a55f3aeaa4');
    });

    it('returns correct link for ProductExport', () => {
      const wrapper = shallowMount(SettingsDataImportOverview, {
        global: {
          plugins: [createPinia()],
          mocks: { $route: { name: '_dataImport', query: { reportName: 'ProductExport' } } },
        },
      });

      expect(wrapper.vm.guideLink).toBe('https://support.evocon.com/Product-data-export-import-136dae0ba8028033bd83f843d31f0c6c');
    });
  });
});
