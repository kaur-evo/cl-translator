import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsSecurityProfileEditDialog from './index.vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useSecurityProfileStore from '@/stores/securityProfile';
import useConfirmDialogStore from '@/stores/confirmDialog';

const defaultDialogData = {
  item: {
    id: '123-asd',
    name: 'Default Profile',
    singleSignOnRequired: false,
    twoFactorAuthenticationRequired: false,
    absoluteTimeoutMinutes: 0,
  },
};

const adminDialogData = {
  item: {
    id: '456-fgh',
    name: 'Admin Profile',
    singleSignOnRequired: true,
    twoFactorAuthenticationRequired: false,
    absoluteTimeoutMinutes: 2880,
  },
};

const createPinia = (dialogData = defaultDialogData) => createTestingPinia({
  initialState: {
    genericDialog: {
      dialogData,
    },
    securityProfile: {
      securityProfiles: [],
      loading: [],
    },
  },
  createSpy: vi.fn,
  stubActions: false,
});

describe('SettingsSecurityProfileEditDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
      global: {
        plugins: [createPinia()],
        stubs: { 'form-dialog-template': false },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when editing existing profile', async () => {
    const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
      global: {
        plugins: [createPinia()],
        stubs: { 'form-dialog-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when creating new profile', async () => {
    const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
      global: {
        plugins: [createPinia({})],
        stubs: { 'form-dialog-template': false },
      },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when has absolute timeout error', async () => {
    const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
      global: {
        plugins: [createPinia(adminDialogData)],
        stubs: { 'form-dialog-template': false },
      },
    });

    await flushPromises();
    wrapper.vm.absoluteTimeoutDays = 0;
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('isEdit', () => {
    it('returns true when editing existing profile', () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia()],
          stubs: { 'form-dialog-template': false },
        },
      });

      expect(wrapper.vm.isEdit).toBe(true);
    });

    it('returns false when creating new profile', () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia({})],
          stubs: { 'form-dialog-template': false },
        },
      });

      expect(wrapper.vm.isEdit).toBe(false);
    });
  });

  describe('hasAbsoluteTimeoutError', () => {
    it('returns false when absolute timeout is disabled', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia()],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();

      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(false);
      expect(wrapper.vm.hasAbsoluteTimeoutError).toBe(false);
    });

    it('returns false when absolute timeout is enabled and value is null', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia()],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();

      wrapper.vm.onAbsoluteTimeoutToggle(true);
      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(true);
      expect(wrapper.vm.absoluteTimeoutDays).toBeNull();
      expect(wrapper.vm.hasAbsoluteTimeoutError).toBe(false);
    });

    it('returns false when absolute timeout is enabled and value is between 1 and 365', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia(adminDialogData)],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();

      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(true);
      expect(wrapper.vm.absoluteTimeoutDays).toBe(2);
      expect(wrapper.vm.hasAbsoluteTimeoutError).toBe(false);
    });

    it('returns true when absolute timeout is enabled and value is 0', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia(adminDialogData)],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();
      wrapper.vm.absoluteTimeoutDays = 0;

      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(true);
      expect(wrapper.vm.hasAbsoluteTimeoutError).toBe(true);
    });

    it('returns true when absolute timeout is enabled and value is 366', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia(adminDialogData)],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();
      wrapper.vm.absoluteTimeoutDays = 366;

      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(true);
      expect(wrapper.vm.hasAbsoluteTimeoutError).toBe(true);
    });
  });

  describe('onAbsoluteTimeoutToggle', () => {
    it('sets isAbsoluteTimeoutEnabled to false and clears absoluteTimeoutDays when toggled off', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia(adminDialogData)],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();

      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(true);
      expect(wrapper.vm.absoluteTimeoutDays).toBe(2);

      wrapper.vm.onAbsoluteTimeoutToggle(false);

      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(false);
      expect(wrapper.vm.absoluteTimeoutDays).toBeNull();
    });

    it('sets isAbsoluteTimeoutEnabled to true when toggled on', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia()],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();

      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(false);
      expect(wrapper.vm.absoluteTimeoutDays).toBeNull();

      wrapper.vm.onAbsoluteTimeoutToggle(true);

      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(true);
    });
  });

  test('that onSSOToggle sets twoFactorAuthenticationRequired to false when SSO is enabled', () => {
    const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
      global: {
        plugins: [createPinia()],
        stubs: { 'form-dialog-template': false },
      },
    });

    wrapper.vm.formData.twoFactorAuthenticationRequired = true;

    wrapper.vm.onSSOToggle(true);

    expect(wrapper.vm.formData.twoFactorAuthenticationRequired).toBe(false);
  });

  describe('onMounted', () => {
    it('initializes form data from store when editing existing profile', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia(adminDialogData)],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();

      expect(wrapper.vm.formData.id).toBe('456-fgh');
      expect(wrapper.vm.formData.name).toBe('Admin Profile');
      expect(wrapper.vm.formData.singleSignOnRequired).toBe(true);
      expect(wrapper.vm.formData.twoFactorAuthenticationRequired).toBe(false);
      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(true);
      expect(wrapper.vm.formData.absoluteTimeoutMinutes).toBe(2880);
      expect(wrapper.vm.absoluteTimeoutDays).toBe(2);
    });

    it('does not initialize from store when creating new profile', async () => {
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [createPinia({})],
          stubs: { 'form-dialog-template': false },
        },
      });

      await flushPromises();

      expect(wrapper.vm.formData.name).toBe('');
      expect(wrapper.vm.formData.singleSignOnRequired).toBe(false);
      expect(wrapper.vm.formData.twoFactorAuthenticationRequired).toBe(false);
      expect(wrapper.vm.isAbsoluteTimeoutEnabled).toBe(false);
      expect(wrapper.vm.formData.absoluteTimeoutMinutes).toBe(0);
      expect(wrapper.vm.absoluteTimeoutDays).toBeNull();
    });
  });

  test('that closeDialog calls Pinia genericDialog closeDialog action', () => {
    const pinia = createPinia();
    const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
      global: {
        plugins: [pinia],
        stubs: { 'form-dialog-template': false },
      },
    });

    const gdStore = useGenericDialogStore(pinia);
    const closeDialogSpy = vi.spyOn(gdStore, 'closeDialog');

    wrapper.vm.closeDialog();

    expect(closeDialogSpy).toHaveBeenCalledTimes(1);
  });

  describe('onSave', () => {
    it('does not call saveSecurityProfile when form is invalid', async () => {
      const pinia = createPinia({});
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [pinia],
          stubs: { 'form-dialog-template': false },
        },
      });

      const securityProfileStore = useSecurityProfileStore(pinia);
      const saveSecurityProfileSpy = vi.spyOn(securityProfileStore, 'saveSecurityProfile');

      wrapper.vm.form.validate = () => {
        wrapper.vm.isFormValid = false;
      };

      await wrapper.vm.onSave();

      expect(saveSecurityProfileSpy).not.toHaveBeenCalled();
    });

    it('does not call saveSecurityProfile when absolute timeout is enabled and value is null', async () => {
      const pinia = createPinia({});
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [pinia],
          stubs: { 'form-dialog-template': false },
        },
      });

      const securityProfileStore = useSecurityProfileStore(pinia);
      const saveSecurityProfileSpy = vi.spyOn(securityProfileStore, 'saveSecurityProfile');

      wrapper.vm.form.validate = () => {
        wrapper.vm.isFormValid = true;
      };

      wrapper.vm.isAbsoluteTimeoutEnabled = true;
      wrapper.vm.absoluteTimeoutDays = null;

      await wrapper.vm.onSave();

      expect(saveSecurityProfileSpy).not.toHaveBeenCalled();
    });

    it('does not call saveSecurityProfile when absolute timeout has error', async () => {
      const pinia = createPinia({});
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [pinia],
          stubs: { 'form-dialog-template': false },
        },
      });

      const securityProfileStore = useSecurityProfileStore(pinia);
      const saveSecurityProfileSpy = vi.spyOn(securityProfileStore, 'saveSecurityProfile');

      wrapper.vm.form.validate = () => {
        wrapper.vm.isFormValid = true;
      };

      wrapper.vm.isAbsoluteTimeoutEnabled = true;
      wrapper.vm.absoluteTimeoutDays = 366;

      await wrapper.vm.onSave();

      expect(saveSecurityProfileSpy).not.toHaveBeenCalled();
    });

    it('calls Pinia store actions when form is valid', async () => {
      const pinia = createPinia();
      const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
        global: {
          plugins: [pinia],
          stubs: { 'form-dialog-template': false },
        },
      });

      const securityProfileStore = useSecurityProfileStore(pinia);
      const gdStore = useGenericDialogStore(pinia);
      const saveSecurityProfileSpy = vi.spyOn(securityProfileStore, 'saveSecurityProfile').mockResolvedValue();
      const closeDialogSpy = vi.spyOn(gdStore, 'closeDialog');

      wrapper.vm.form.validate = () => {
        wrapper.vm.isFormValid = true;
      };

      await wrapper.vm.onSave();

      expect(saveSecurityProfileSpy).toHaveBeenCalledWith({
        id: '123-asd',
        name: 'Default Profile',
        singleSignOnRequired: false,
        twoFactorAuthenticationRequired: false,
        absoluteTimeoutMinutes: 0,
      });
      expect(closeDialogSpy).toHaveBeenCalledTimes(1);
    });
  });

  test('that onDelete calls Pinia confirmDialog openConfirmDialog action with correct config', async () => {
    const pinia = createPinia({});
    const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
      global: {
        plugins: [pinia],
        stubs: { 'form-dialog-template': false },
      },
    });

    const confirmDialogStore = useConfirmDialogStore(pinia);
    const openConfirmDialogSpy = vi.spyOn(confirmDialogStore, 'openConfirmDialog').mockResolvedValue();

    await wrapper.vm.onDelete();

    expect(openConfirmDialogSpy).toHaveBeenCalledWith({
      title: 'Confirmation',
      text: 'Are you sure you want to delete {value}?',
      action: expect.any(Function),
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  });

  test('that deleteProfile calls Pinia securityProfile deleteSecurityProfile action', async () => {
    const pinia = createPinia({});
    const wrapper = shallowMount(SettingsSecurityProfileEditDialog, {
      global: {
        plugins: [pinia],
        stubs: { 'form-dialog-template': false },
      },
    });

    const deleteSecurityProfileSpy = vi.spyOn(useSecurityProfileStore(pinia), 'deleteSecurityProfile').mockResolvedValue();

    await wrapper.vm.deleteProfile();

    expect(deleteSecurityProfileSpy).toHaveBeenCalledWith(wrapper.vm.formData);
  });
});
