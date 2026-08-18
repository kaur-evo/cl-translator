import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import EvoconEmailInput from './index.vue';

describe('EvoconEmailInput', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(EvoconEmailInput, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
      props: {
        modelValue: [],
        placeholder: 'placeholder',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with valid input', () => {
    const wrapper = shallowMount(EvoconEmailInput, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
      props: {
        modelValue: ['adss@das.ee', 'asdsttt@test.com'],
        placeholder: 'placeholder',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with invalid input', () => {
    const wrapper = shallowMount(EvoconEmailInput, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
      props: {
        modelValue: ['valid@email.com', 'invalid-email'],
        placeholder: 'placeholder',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
