import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import EvoconVSnackbar from './index.vue';

const createWrapper = (props = {}) => shallowMount(EvoconVSnackbar, {
  props,
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      initialState: { device: { screen: { width: 1200, height: 800 } } },
    })],
  },
});

describe('EvoconVSnackbar', () => {
  it('renders correctly if type is success', () => {
    const wrapper = createWrapper({
      type: 'success',
      label: 'Success message',
      description: 'Success description',
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is error', () => {
    const wrapper = createWrapper({
      type: 'error',
      label: 'Error message',
      description: 'Error description',
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is warning', () => {
    const wrapper = createWrapper({
      type: 'warning',
      label: 'Warning message',
      description: 'Warning description',
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is not given', () => {
    const wrapper = createWrapper({ label: 'Message' });
    expect(wrapper.element).toMatchSnapshot();
  });
});
