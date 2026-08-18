import { shallowMount } from '@vue/test-utils';

import ShiftviewCardsList from './index.vue';

const propsDefault = {
  items: [
    {
      id: 'asd-123', name: 'name', doneBy: 'Test User', dueString: '08:21', doneString: '11:20', frequencyString: 'frequencyString',
    },
    {
      id: 'asd-456', name: 'name2', doneBy: 'Test User2', dueString: '06:00', doneString: '12:00', frequencyString: 'frequencyString2',
    },
    {
      id: 'asd-789', name: 'name3', doneBy: 'Test User3', dueString: '13:53', doneString: '19:43', frequencyString: 'frequencyString3',
    },
  ],
  titleTextKey: 'name',
  subtitleTextKey: [{ subtitleIcon: 'ICON' }, 'due', 'done', 'frequency'],
  subtitleSuffixKey: ['doneBy', 'dueString', 'doneString', 'frequencyString'],
  primaryActionIcon: 'string',
  primaryActionText: 'string',
  secondaryActionIcon: 'mdiPencil',
  secondaryActionText: 'string',
  tertiaryActionText: 'string',
  tertiaryActionIcon: 'mdiDelete',
  icon: 'string',
  iconColorKey: 'string',
  subtitleIcon: 'string',
  subtitleIconCondition: 'string',
  iconFn: () => '',
  iconColorFn: () => '',
  disabled: false,
};

describe('ShiftviewCardsList', () => {
  it('renders', () => {
    const wrapper = shallowMount(ShiftviewCardsList, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ShiftviewCardsList, {
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when disabled', () => {
    const wrapper = shallowMount(ShiftviewCardsList, {
      props: { ...propsDefault, disabled: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('getSecondaryActionIcon', () => {
    it('returns function result when secondaryActionIcon props is function', () => {
      const wrapper = shallowMount(ShiftviewCardsList, {
        props: { ...propsDefault, secondaryActionIcon: () => 'stringFromFunc' },
      });

      expect(wrapper.vm.getSecondaryActionIcon()).toBe('stringFromFunc');
    });

    it('returns string when secondaryActionIcon props is string', () => {
      const wrapper = shallowMount(ShiftviewCardsList, {
        props: { ...propsDefault, secondaryActionIcon: 'string' },
      });

      expect(wrapper.vm.getSecondaryActionIcon()).toBe('string');
    });
  });
});
