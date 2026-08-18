import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftNav from './index.vue';

import { useShiftStore } from '@/stores/index';

const defaultPiniaState = {
  shift: { shift: { id: 12 }, currentShift: { id: 12 }, firstShiftOfShiftviewStation: { id: 13 } },
  station: { lineviewStation: {} },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const shiftStore = useShiftStore(pinia);
  shiftStore.shiftExists = overrides.shift?.shiftExists ?? false;

  return pinia;
};

const createWrapper = (overrides = {}, options = {}) => mount(ShiftNav, {
  global: { plugins: [createPinia(overrides)] },
  ...options,
});

describe('ShiftNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when large is true', () => {
    const wrapper = createWrapper({}, { props: { large: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that next shift button and current shift button are disabled if current shift is selected', () => {
    const wrapper = createWrapper({ shift: { shift: { id: 123 }, currentShift: { id: 123 }, firstShiftOfShiftviewStation: { id: 13 } } });

    expect(wrapper.find('#current-shift-btn').attributes('disabled')).toBe('');
    expect(wrapper.find('#next-shift-btn').attributes('disabled')).toBe('');
  });

  test('that next shift button and last shift button are not disabled if some historical shift is selected', () => {
    const wrapper = createWrapper({ shift: { shift: { id: 100 }, currentShift: { id: 123 }, firstShiftOfShiftviewStation: { id: 13 } } });

    expect(wrapper.find('#current-shift-btn').attributes('disabled')).toBe(undefined);
    expect(wrapper.find('#next-shift-btn').attributes('disabled')).toBe(undefined);
  });

  test('that previous shift button is disabled if first shift is selected', () => {
    const wrapper = createWrapper({ shift: { shift: { id: 88 }, currentShift: { id: 12 }, firstShiftOfShiftviewStation: { id: 88 } } });

    expect(wrapper.find('#prev-shift-btn').attributes('disabled')).toBe('');
  });

  test('that previous shift button is enabled if first shift is not selected', () => {
    const wrapper = createWrapper({ shift: { shift: { id: 88 }, currentShift: { id: 12 }, firstShiftOfShiftviewStation: { id: 1 } } });

    expect(wrapper.find('#prev-shift-btn').attributes('disabled')).toBe(undefined);
  });
});
