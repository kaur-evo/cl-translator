import { shallowMount, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import DashboardPageForm from './index.vue';

const createPinia = (dialogData = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    genericDialog: {
      dialogData,
      onPrimaryAction: vi.fn(),
    },
  },
});

describe('DashboardPageForm', () => {
  it('renders', () => {
    const wrapper = shallowMount(DashboardPageForm, {
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(DashboardPageForm, {
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onSaveClick', () => {
    it('doesnt call onPrimaryAction if form is invalid', async () => {
      const wrapper = mount(DashboardPageForm, {
        global: {
          plugins: [createPinia()],
        },
      });

      const onPrimaryAction = vi.spyOn(wrapper.vm, 'onPrimaryAction');

      await wrapper.vm.onSaveClick();
      expect(onPrimaryAction).not.toHaveBeenCalled();
    });

    it('calls onPrimaryAction', async () => {
      const wrapper = mount(DashboardPageForm, {
        global: {
          plugins: [createPinia({ page: { name: 'tab' } })],
        },
      });

      const onPrimaryAction = vi.spyOn(wrapper.vm, 'onPrimaryAction');

      await wrapper.vm.onSaveClick();
      expect(onPrimaryAction).toHaveBeenCalled();
      expect(onPrimaryAction).toHaveBeenCalledWith({ name: 'tab' });
    });
  });
});
