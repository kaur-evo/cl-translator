import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewUserSettingsBtn from './index.vue';

const createWrapper = (options = {}) => shallowMount(ShiftViewUserSettingsBtn, {
  global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
  ...options,
});

describe('ShiftViewUserSettings', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });
});
