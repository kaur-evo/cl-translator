import { mount } from '@vue/test-utils';

import IconWithTooltip from './index.vue';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const propsDefault = {
  icon: 'string',
  tooltipText: 'string',
  additionalClasses: 'ml-4',
};

describe('IconWithTooltip', () => {
  it('renders', () => {
    const wrapper = mount(IconWithTooltip, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = mount(IconWithTooltip, {
      shallow: true,
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that icon is visible if iconClickedFn is missing', () => {
    const wrapper = mount(IconWithTooltip, {
      props: { ...propsDefault },
    });

    expect(wrapper.find('#icon').isVisible()).toBe(true);
    expect(wrapper.findComponent(EvoconVButton).exists()).toBe(false);
  });

  test('that icon button is visible if iconClickedFn is present', () => {
    const wrapper = mount(IconWithTooltip, {
      props: { ...propsDefault, iconClickedFn: vi.fn(), iconId: 'test-icon' },
    });

    expect(wrapper.find('#test-icon').isVisible()).toBe(true);
    expect(wrapper.find('#icon').exists()).toBe(false);
  });

  test('that static img is rendered when iconSrc is provided without iconClickedFn', () => {
    const wrapper = mount(IconWithTooltip, {
      props: { ...propsDefault, iconSrc: '/test-icon.png' },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/test-icon.png');
    expect(wrapper.findComponent(EvoconVButton).exists()).toBe(false);
    expect(wrapper.find('#icon').exists()).toBe(false);
  });

  test('that static img applies additionalClasses', () => {
    const wrapper = mount(IconWithTooltip, {
      props: { ...propsDefault, iconSrc: '/test-icon.png', additionalClasses: 'my-2' },
    });

    const img = wrapper.find('img');
    expect(img.classes()).toContain('my-2');
  });

  test('that clicking the button invokes iconClickedFn callback', async () => {
    const clickHandler = vi.fn();
    const wrapper = mount(IconWithTooltip, {
      props: { ...propsDefault, iconClickedFn: clickHandler },
    });

    const button = wrapper.findComponent(EvoconVButton);
    await button.trigger('click');

    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  describe('buttonSize prop', () => {
    test('that EvoconVButton defaults to extra-small size', () => {
      const wrapper = mount(IconWithTooltip, {
        props: { ...propsDefault, iconClickedFn: () => {} },
      });

      const button = wrapper.findComponent(EvoconVButton);
      expect(button.vm.$attrs.size).toBe('extra-small');
    });

    test('that EvoconVButton uses provided buttonSize', () => {
      const wrapper = mount(IconWithTooltip, {
        props: { ...propsDefault, iconClickedFn: () => {}, buttonSize: 'small' },
      });

      const button = wrapper.findComponent(EvoconVButton);
      expect(button.vm.$attrs.size).toBe('small');
    });
  });
});
