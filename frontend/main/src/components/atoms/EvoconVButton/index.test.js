import { shallowMount } from '@vue/test-utils';
import { mdiPlus } from '@mdi/js';
import { createTestingPinia } from '@pinia/testing';

import EvoconVButton from './index.vue';

const defaultProps = {
  icon: '',
  text: 'button text',
  type: 'primary',
  color: 'primary',
};

const createWrapper = (props = {}, piniaStateOverrides = {}) => shallowMount(EvoconVButton, {
  global: {
    plugins: [createTestingPinia({ createSpy: vi.fn, initialState: piniaStateOverrides })],
  },
  props: { ...defaultProps, ...props },
});

// screen: { width: 300, height: 500 } → portrait + narrow → isMobileView: true
const mobileScreenState = { device: { screen: { width: 300, height: 500 } } };

describe('EvoconVButton', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with icon', () => {
    const wrapper = createWrapper({ icon: mdiPlus });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if button type is secondary', () => {
    const wrapper = createWrapper({ type: 'secondary', color: 'grey' });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if button type is primary-light', () => {
    const wrapper = createWrapper({ type: 'primary-light' });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when icon button is disabled', () => {
    const wrapper = shallowMount(EvoconVButton, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
      props: { ...defaultProps, icon: mdiPlus, text: '' },
      attrs: { disabled: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = createWrapper({ icon: mdiPlus, text: '' }, mobileScreenState);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view as icon button', () => {
    const wrapper = createWrapper({ icon: mdiPlus, text: '' }, mobileScreenState);

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('iconSrc prop', () => {
    it('renders img element when iconSrc is provided', () => {
      const wrapper = createWrapper({ iconSrc: '/icons/test.png', text: '' });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe('/icons/test.png');
    });

    it('uses iconSrcSize for image dimensions when provided', () => {
      const wrapper = createWrapper({ iconSrc: '/icons/test.png', iconSrcSize: 32, text: '' });

      const img = wrapper.find('img');
      expect(img.attributes('width')).toBe('32');
      expect(img.attributes('height')).toBe('32');
    });

    it('is treated as icon button when iconSrc is provided without text', () => {
      const wrapper = createWrapper({ iconSrc: '/icons/test.png', text: '' });

      const btn = wrapper.find('#evocon-button');
      expect(btn.attributes('icon')).toBe('true');
    });

    it('applies mr-2 class to img when text is also present', () => {
      const wrapper = createWrapper({ iconSrc: '/icons/test.png', text: 'Click me' });

      const img = wrapper.find('img');
      expect(img.classes()).toContain('mr-2');
    });
  });
});
