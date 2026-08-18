import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import cloneDeep from 'lodash/cloneDeep';

import SettingsDataImportUpload from './index.vue';

import useDeviceStore from '@/stores/device';

const createPinia = (initialState) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState,
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.screenWidth = 1920;
  deviceStore.showFullscreenDialogs = false;
  deviceStore.screen = {};
  return pinia;
};

describe('SettingsDataImportUpload', () => {
  const defaultPiniaState = {
    genericNotification: {},
    confirmDialog: {},
    settingsFileUpload: {
      loading: [],
      import: {
        result: {},
        status: 'started',
      },
      failed: {},
    },
  };

  let pinia;

  let piniaState;

  beforeEach(() => {
    piniaState = cloneDeep(defaultPiniaState);
    pinia = createPinia(piniaState);
  });

  it('renders correctly', () => {
    const $route = { name: '_dataImportUpload', query: { reportName: 'ProductExport' } };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('is invisible if route name is not dataImportUpload', () => {
    const $route = { name: 'test' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.find('#data-import-overview').exists()).toBeFalsy();
  });

  it('renders correctly when file is chosen', async () => {
    const file = new File(['foo'], 'fileName.xlsx', { type: 'application/vnd.ms-excel' });
    const $route = { name: '_dataImportUpload' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    await wrapper.vm.pickFile([file]);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('pick file triggers validation and selects file', async () => {
    const file = new File(['foo'], 'fileName.xlsx', { type: 'application/vnd.ms-excel' });
    const $route = { name: '_dataImportUpload' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.vm.isFileChosen).toEqual(false);

    const spy = vi.spyOn(wrapper.vm, 'getFileValidationError');
    await wrapper.vm.pickFile([file]);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.fileToImport).toEqual({
      currentFile: file,
      fileName: 'fileName.xlsx',
      size: 3,
      title: undefined,
      type: 'application/vnd.ms-excel',
    });
    expect(wrapper.vm.isFileChosen).toEqual(true);
  });

  it('file validation returns error if file size bigger than 10MB', async () => {
    const file = { name: 'file.name.xlsx', size: 10485761 };
    const $route = { name: '_dataImportUpload' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    const validationError = wrapper.vm.getFileValidationError(file);
    expect(validationError).toEqual('File size too big! Limit 10MB');
  });

  it('file validation returns error if file extension is not xlsx', async () => {
    const file = { name: 'file.pdf', size: 10485760 };
    const $route = { name: '_dataImportUpload' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    const validationError = wrapper.vm.getFileValidationError(file);
    expect(validationError).toEqual('File format wrong! Only .xlsx files supported.');
  });

  it('file validation returns empty if file does not exists', async () => {
    const $route = { name: '_dataImportUpload' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    const validationError = wrapper.vm.getFileValidationError(undefined);
    expect(validationError).toEqual('');
  });

  it('file validation returns empty if file size and extension is correct', async () => {
    const file = { name: 'file.xlsx', size: 10485760 };
    const $route = { name: '_dataImportUpload' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    const validationError = wrapper.vm.getFileValidationError(file);
    expect(validationError).toEqual('');
  });

  test('that has correct upload message if import is failed with error status code 422', async () => {
    piniaState.settingsFileUpload.failed = { error: { response: { status: 422 } } };
    pinia = createPinia(piniaState);

    const $route = { name: '_dataImportUpload' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.vm.uploadMessages[0].description).toEqual('The imported file does not meet our format requirements. Please fix it and try again.');
  });

  describe('successful update message is computed properly', () => {
    it('displays correct message when only updatedRowsLength > 0 and no "no changes made" message', () => {
      piniaState.settingsFileUpload.import = {
        result: {
          updated: 5, created: 0, deleted: 0, failed: 0,
        },
        status: 'started',
      };
      pinia = createPinia(piniaState);

      const $route = { name: '_dataImportUpload' };
      const wrapper = mount(SettingsDataImportUpload, {
        global: {
          plugins: [pinia],
          mocks: { $route },
          stubs: ['router-link', 'router-view'],
        },
      });

      expect(wrapper.vm.uploadMessages[0].message).toEqual('5 items successfully updated');

      const noChangesMessage = wrapper.vm.uploadMessages.find((msg) => msg.message === 'Import successful - no changes made');
      expect(noChangesMessage).toBeUndefined();
    });

    it('displays correct message when only createdRowsLength > 0 and no "no changes made" message', () => {
      piniaState.settingsFileUpload.import = {
        result: {
          updated: 0, created: 3, deleted: 0, failed: 0,
        },
        status: 'started',
      };
      pinia = createPinia(piniaState);

      const $route = { name: '_dataImportUpload' };
      const wrapper = mount(SettingsDataImportUpload, {
        global: {
          plugins: [pinia],
          mocks: { $route },
          stubs: ['router-link', 'router-view'],
        },
      });

      expect(wrapper.vm.uploadMessages[0].message).toEqual('3 items successfully updated');

      const noChangesMessage = wrapper.vm.uploadMessages.find((msg) => msg.message === 'Import successful - no changes made');
      expect(noChangesMessage).toBeUndefined();
    });

    it('displays correct message when both updatedRowsLength > 0 and createdRowsLength > 0 and no "no changes made" message', () => {
      piniaState.settingsFileUpload.import = {
        result: {
          updated: 4, created: 6, deleted: 0, failed: 0,
        },
        status: 'started',
      };
      pinia = createPinia(piniaState);

      const $route = { name: '_dataImportUpload' };
      const wrapper = mount(SettingsDataImportUpload, {
        global: {
          plugins: [pinia],
          mocks: { $route },
          stubs: ['router-link', 'router-view'],
        },
      });

      expect(wrapper.vm.uploadMessages[0].message).toEqual('10 items successfully updated');

      const noChangesMessage = wrapper.vm.uploadMessages.find((msg) => msg.message === 'Import successful - no changes made');
      expect(noChangesMessage).toBeUndefined();
    });
  });

  test('that updatedRowsLength is the sum of created, updated and failed rows', () => {
    piniaState.settingsFileUpload.import = {
      result: {
        updated: 4, created: 6, deleted: 1, failed: 0,
      },
      status: 'started',
    };
    pinia = createPinia(piniaState);

    const $route = { name: '_dataImportUpload' };
    const wrapper = mount(SettingsDataImportUpload, {
      global: {
        plugins: [pinia],
        mocks: { $route },
        stubs: ['router-link', 'router-view'],
      },
    });

    expect(wrapper.vm.updatedRowsLength).toEqual(11);
  });
});
