import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsSecurityOverview from './index.vue';

import useConfirmDialogStore from '@/stores/confirmDialog';

const $route = {
  name: 'securityOverview',
};

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    profile: { currentUser: { roles: { 0: 'COMPANY_ADMIN' } } },
  },
});

describe('SettingsSecurityOverview', () => {
  it('renders', () => {
    const wrapper = shallowMount(SettingsSecurityOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsSecurityOverview, {
      global: {
        plugins: [createPinia()],
        mocks: { $route },
        stubs: { 'settings-security-wrapper': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onListItemClick', () => {
    it('calls openConfirmDialog when dialogConfig is present', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(SettingsSecurityOverview, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });

      const dialogConfig = { title: 'Dialog title', text: 'Dialog text' };
      const confirmDialogStore = useConfirmDialogStore();
      const spy = vi.spyOn(confirmDialogStore, 'openConfirmDialog');

      wrapper.vm.onListItemClick({ dialogConfig });
      expect(spy).toHaveBeenCalledWith(dialogConfig);
    });

    it('does not call openConfirmDialog when dialogConfig is not present', () => {
      const pinia = createPinia();
      const wrapper = shallowMount(SettingsSecurityOverview, {
        global: {
          plugins: [pinia],
          mocks: { $route },
        },
      });

      const confirmDialogStore = useConfirmDialogStore();
      const spy = vi.spyOn(confirmDialogStore, 'openConfirmDialog');

      wrapper.vm.onListItemClick({});
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
