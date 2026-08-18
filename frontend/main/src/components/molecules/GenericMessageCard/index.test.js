import { mount } from '@vue/test-utils';
import { mdiCheckCircle } from '@mdi/js';

import GenericMessageCard from './index.vue';

describe('GenericMessageCard', () => {
  test('that prop values are set by default', () => {
    const wrapper = mount(GenericMessageCard, {

    });
    expect(wrapper.vm.icon).toEqual(mdiCheckCircle);
    expect(wrapper.vm.iconColor).toEqual('primary');
    expect(wrapper.vm.message).toEqual('');
    expect(wrapper.vm.description).toEqual('');
  });

  test('that message and description is invisible and icon is visible by default', () => {
    const wrapper = mount(GenericMessageCard, {

    });
    expect(wrapper.find('#generic-message-icon').isVisible()).toBe(true);
    expect(wrapper.find('#generic-message').exists()).toBe(false);
    expect(wrapper.find('#generic-message-description').exists()).toBe(false);
  });

  test('that message is visible if present', () => {
    const wrapper = mount(GenericMessageCard, {
      props: { message: 'Upload successful' },
    });
    expect(wrapper.find('#generic-message').isVisible()).toBe(true);
    expect(wrapper.find('#generic-message').text()).toBe('Upload successful');
  });

  test('that description is visible if present', () => {
    const wrapper = mount(GenericMessageCard, {
      props: { description: 'Upload successful description' },
    });
    expect(wrapper.find('#generic-message-description').isVisible()).toBe(true);
    expect(wrapper.find('#generic-message-description').text()).toBe('Upload successful description');
  });
});
