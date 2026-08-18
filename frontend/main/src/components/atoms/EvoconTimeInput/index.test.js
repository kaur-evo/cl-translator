import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import EvoconTimeInput from './index.vue';

import { timeFormats } from '@/constants/formattingConstants';

const createWrapper = (timeFormat = timeFormats['24H'], extraProps = {}) => shallowMount(EvoconTimeInput, {
  props: { modelValue: '12:12', ...extraProps },
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      initialState: { profile: { currentUser: { timeFormat } } },
    })],
  },
});

describe('EvoconTimeInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T12:34:33'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly in 24h format', () => {
    const wrapper = createWrapper(timeFormats['24H']);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in 12h format', () => {
    const wrapper = createWrapper(timeFormats['12H']);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly as chip', () => {
    const wrapper = createWrapper(timeFormats['24H'], { useChip: true });
    expect(wrapper.element).toMatchSnapshot();
  });
});
