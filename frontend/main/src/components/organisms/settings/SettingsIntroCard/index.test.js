import { shallowMount } from '@vue/test-utils';

import SettingsIntroCard from './index.vue';

const propsDefault = {
  cardTitle: 'string',
  introText: 'string',
  imgId: 'string',
  routeTo: 'routeTo',
};

describe('SettingsIntroCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(SettingsIntroCard, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsIntroCard, {
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with new indicator', () => {
    const wrapper = shallowMount(SettingsIntroCard, {
      props: { ...propsDefault, newIndicatorShownUntil: '2020-01-01T00:00:00' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('navigates to the correct route when settings intro card is clicked', async () => {
    const wrapper = shallowMount(SettingsIntroCard, {
      props: { ...propsDefault },
      global: { mocks: { $router: { push: vi.fn() } } },
    });

    const spy = vi.spyOn(wrapper.vm, 'onClick');
    await wrapper.find('#settings-intro-card').trigger('click', spy);
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/settings/routeTo');
  });

  it('does not navigate to the correct route when settings intro card is clicked, but routeTo prop is missing', async () => {
    const wrapper = shallowMount(SettingsIntroCard, {
      props: { ...propsDefault, routeTo: '' },
      global: { mocks: { $router: { push: vi.fn() } } },
    });

    const spy = vi.spyOn(wrapper.vm, 'onClick');
    await wrapper.find('#settings-intro-card').trigger('click', spy);
    expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(0);
  });
});
