import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import EvoconTextEditor from './index.vue';

const createWrapper = (isMobileView = false, props = {}) => shallowMount(EvoconTextEditor, {
  props,
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      initialState: { device: { screen: { width: isMobileView ? 400 : 1200, height: 800 } } },
    })],
  },
});

const defaultProps = {
  modelValue: 'test value with {variable}',
  hint: 'hint',
  rows: 5,
  allowedVariables: ['{variable}'],
};

describe('EvoconTextEditor', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper(false, defaultProps);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', () => {
    const wrapper = createWrapper(true, defaultProps);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with text formatting options', () => {
    const wrapper = createWrapper(false, { ...defaultProps, hasTextStyling: true, hasHighlight: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('getContent', () => {
    const wrapper = createWrapper(false, { ...defaultProps, hasTextStyling: true });
    const content = wrapper.vm.getContent();
    expect(content).toEqual('test value with <mark>{variable}</mark>');
  });

  test('onInput with text styling', () => {
    const wrapper = createWrapper(false, { ...defaultProps, hasTextStyling: true });
    wrapper.vm.editor.getHtml = vi.fn(() => 'test value with <mark class="text-editor-variable">{variable}</mark>');
    wrapper.vm.onInput();
    expect(wrapper.emitted()['update:model-value'][0][0]).toEqual('<p>test value with {variable}</p>');
  });

  test('onInput without text styling', () => {
    const wrapper = createWrapper(false, { ...defaultProps, hasTextStyling: false });
    wrapper.vm.editor.getHtml = vi.fn(() => 'test value with <mark class="text-editor-variable">{variable}</mark>');
    wrapper.vm.onInput();
    expect(wrapper.emitted()['update:model-value'][0][0]).toEqual('test value with {variable}');
  });
});
