import { shallowMount } from '@vue/test-utils';

import InteractiveWeekdayAxis from '@/components/molecules/InteractiveWeekdayAxis';

describe('InteractiveWeekdayAxis', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(InteractiveWeekdayAxis);
    expect(wrapper.exists()).toBe(true);
  });
  it('renders the correct number of weekday chips', () => {
    const dates = [
      new Date('2023-01-01T00:00:00Z'),
      new Date('2023-01-02T00:00:00Z'),
      new Date('2023-01-03T00:00:00Z'),
    ];
    const wrapper = shallowMount(InteractiveWeekdayAxis, {
      props: {
        language: 'en-US',
        dates,
      },
    });
    const chips = wrapper.findAllComponents({ name: 'EvoconVChip' });
    expect(chips.length).toBe(dates.length);
  });

  it('formats the tick label correctly', () => {
    const dates = [new Date('2023-10-30T00:00:00Z')]; // A Monday
    const wrapper = shallowMount(InteractiveWeekdayAxis, {
      props: {
        language: 'en-US',
        dates,
        zoneId: 'UTC',
      },
    });
    const chip = wrapper.findComponent({ name: 'EvoconVChip' });
    expect(chip.props('label')).toBe('30 Mon');
  });

  it('emits weekdayClick with the correct date when a chip is clicked', async () => {
    const dateToClick = new Date('2023-01-02');
    const dates = [
      new Date('2023-01-01'),
      dateToClick,
      new Date('2023-01-03'),
    ];
    const wrapper = shallowMount(InteractiveWeekdayAxis, {
      props: {
        language: 'en-US',
        dates,
      },
    });

    const chips = wrapper.findAllComponents({ name: 'EvoconVChip' });
    await chips[1].vm.$emit('click');

    expect(wrapper.emitted()).toHaveProperty('weekdayClick');
    expect(wrapper.emitted('weekdayClick')[0][0].toJSDate()).toEqual(dateToClick);
  });

  it('sets the active prop to true for today\'s date', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dates = [yesterday, today];
    const wrapper = shallowMount(InteractiveWeekdayAxis, {
      props: {
        language: 'en-US',
        dates,
      },
    });

    const chips = wrapper.findAllComponents({ name: 'EvoconVChip' });
    expect(chips[0].props('active')).toBe(false);
    expect(chips[1].props('active')).toBe(true);
  });

  it('does not set any chip as active if today is not in the dates list', () => {
    const dates = [
      new Date('2023-01-01T00:00:00Z'),
      new Date('2023-01-02T00:00:00Z'),
      new Date('2023-01-03T00:00:00Z'),
    ];
    const wrapper = shallowMount(InteractiveWeekdayAxis, {
      props: {
        language: 'en-US',
        dates,
      },
    });

    const chips = wrapper.findAllComponents({ name: 'EvoconVChip' });
    chips.forEach((chip) => {
      expect(chip.props('active')).toBe(false);
    });
  });

  it('renders no chips when the dates prop is an empty array', () => {
    const wrapper = shallowMount(InteractiveWeekdayAxis, {
      props: {
        language: 'en-US',
        dates: [],
      },
    });
    const chips = wrapper.findAllComponents({ name: 'EvoconVChip' });
    expect(chips.length).toBe(0);
  });

  it('formats the tick label correctly for a different language', () => {
    const dates = [new Date('2023-10-30T00:00:00Z')]; // A Monday
    const wrapper = shallowMount(InteractiveWeekdayAxis, {
      props: {
        language: 'de-DE',
        dates,
      },
    });
    const chip = wrapper.findComponent({ name: 'EvoconVChip' });
    expect(chip.props('label')).toBe('Mo., 30.');
  });
});
