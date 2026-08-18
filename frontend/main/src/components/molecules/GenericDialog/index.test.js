import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import GenericDialog from './index.vue';

document.body.setAttribute('data-app', true);

describe('GenericDialog', () => {
  const $route = {
    name: 'route name',
    meta: { title: 'Route title' },
  };

  const mountFunction = (options) => mount(GenericDialog, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })],
      mocks: {
        $route,
      },
    },
    ...options,
  });
  const defaultPropsData = {
    modelValue: true,
    title: 'title',
    message: 'message',
    secondaryActionText: 'secondary',
    primaryActionText: 'primary',
    primaryActionColor: 'secondary',
  };
  describe('Render', () => {
    it('renders correctly', async () => {
      const wrapper = mountFunction({
        props: { ...defaultPropsData },
      });
      expect(wrapper.element).toMatchSnapshot();
    });
    it('renders correctly when value is false', () => {
      const wrapper = mountFunction({
        props: { ...defaultPropsData, modelValue: false },
      });
      expect(wrapper.element).toMatchSnapshot();
    });
    it('does not render dialog title when title prop is not set', () => {
      const wrapper = mountFunction({
        props: { ...defaultPropsData, title: '' },
      });
      expect(wrapper.find('#generic-dialog-title').exists()).toBeFalsy();
    });
    it('does not render dialog message when message prop is not set', () => {
      const wrapper = mountFunction({
        props: { ...defaultPropsData, message: '' },
      });
      expect(wrapper.find('#generic-dialog-message').exists()).toBeFalsy();
    });

    it('does not render secondary action button when secondary-action-text prop is not set', () => {
      const wrapper = mountFunction({
        props: { ...defaultPropsData, secondaryActionText: '' },
      });
      expect(wrapper.find('#generic-dialog-secondary-btn').exists()).toBeFalsy();
    });
    it('does not render primary action button when primary-action-text prop is not set', () => {
      const wrapper = mountFunction({
        props: { ...defaultPropsData, primaryActionText: '' },
      });
      expect(wrapper.find('#generic-dialog-primary-btn').exists()).toBeFalsy();
    });
  });
});
