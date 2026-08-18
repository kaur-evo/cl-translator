import { shallowMount } from '@vue/test-utils';
import { addDays, subDays, format } from 'date-fns';

import NewIndicator from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(NewIndicator, {
  global: { ...global },
  ...options,
});

describe('NewIndicator', () => {
  it('renders correctly if shownUntil is null', () => {
    const wrapper = createWrapper({
      propsData: {
        shownUntil: null,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if shownUntil is in the future', () => {
    const shownUntil = format(addDays(new Date(), 3), "yyyy-MM-dd'T'00:00:00");
    const wrapper = createWrapper({
      propsData: {
        shownUntil,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if shownUntil is in the past', () => {
    const shownUntil = format(subDays(new Date(), 3), "yyyy-MM-dd'T'00:00:00");

    const wrapper = createWrapper({
      propsData: {
        shownUntil,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly as small', () => {
    const wrapper = createWrapper({
      propsData: {
        shownUntil: null,
        small: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when text is provided', () => {
    const wrapper = createWrapper({
      propsData: {
        shownUntil: null,
        text: 'Try for free',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
