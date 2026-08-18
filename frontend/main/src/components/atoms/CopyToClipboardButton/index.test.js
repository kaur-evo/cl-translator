import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CopyToClipboardButton from './index.vue';

window.prompt = vi.fn();
navigator.clipboard = {
  writeText: vi.fn(),
};

describe('CopyToClipboardButton', () => {
  const createWrapper = (options = {}) => mount(CopyToClipboardButton, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })],
      stubs: { 'evocon-v-tooltip-wrap': false, 'evocon-v-button': true },
    },
    ...options,
  });

  const propsDefault = {
    shorten: false,
    isText: true,
    content: 'content',
  };

  it('renders', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly if link should be copied', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, isText: false } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if text should be copied', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that when button is clicked and text should be copied, then copyToClipboard is called', async () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    const copyToClipboardSpy = vi.spyOn(wrapper.vm, 'copyToClipboard');
    await wrapper.find('#share-button').trigger('click', copyToClipboardSpy);
    expect(wrapper.vm.copyToClipboard).toHaveBeenCalledTimes(1);
  });

  test('that when button is clicked and url should be copied, then copyShareLink is called', async () => {
    const wrapper = createWrapper({ props: { ...propsDefault, isText: false } });
    const copyShareLinkSpy = vi.spyOn(wrapper.vm, 'copyShareLink');
    await wrapper.find('#share-button').trigger('click', copyShareLinkSpy);
    expect(wrapper.vm.copyShareLink).toHaveBeenCalledTimes(1);
  });

  test('that when shorten is true, then copyShareLink calls getShortenedUrl', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, isText: false, shorten: true } });
    const getShortenedUrlSpy = vi.spyOn(wrapper.vm, 'getShortenedUrl');
    wrapper.vm.copyShareLink();
    expect(getShortenedUrlSpy).toHaveBeenCalledTimes(1);
  });
});
