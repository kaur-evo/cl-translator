import { shallowMount } from '@vue/test-utils';
import { mdiDelete, mdiPencil, mdiPlus } from '@mdi/js';

import EmptyView from './index.vue';

const propsData = {
  header: 'Header',
  description: 'description',
  imgUrl: 'alerts',
  primaryBtn: 'primary',
  primaryBtnIcon: mdiPlus,
  secondaryBtn: 'secondary',
  secondaryBtnIcon: mdiDelete,
  tertiaryBtn: 'tertiary',
  tertiaryBtnIcon: mdiPencil,
};

describe('EmptyView', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(EmptyView, {
      props: { ...propsData },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('renders correctly in small version', () => {
    const wrapper = shallowMount(EmptyView, {
      props: { ...propsData, small: true },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that clicking on tertiary button emits tertiary-btn-clicked event', async () => {
    const wrapper = shallowMount(EmptyView, {
      props: { ...propsData },
    });

    await wrapper.find('#empty-state__tertiary-button').trigger('click');
    expect(wrapper.emitted('tertiary-btn-clicked')).toBeTruthy();
  });

  test('that clicking on secondary button emits secondary-btn-clicked event', async () => {
    const wrapper = shallowMount(EmptyView, {
      props: { ...propsData },
    });

    await wrapper.find('#empty-state__secondary-button').trigger('click');
    expect(wrapper.emitted('secondary-btn-clicked')).toBeTruthy();
  });

  test('that clicking on primary button emits button-clicked event', async () => {
    const wrapper = shallowMount(EmptyView, {
      props: { ...propsData },
    });

    await wrapper.find('#empty-state__primary-button').trigger('click');
    expect(wrapper.emitted('button-clicked')).toBeTruthy();
  });
});
