import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftViewShiftQuantityBlock from './index.vue';

import {
  useShiftviewTimelineStore,
  useUserPreferencesStore,
  useShiftStore,
} from '@/stores/index';

const defaultBatches = new Set([
  {
    id: 1, unitId: 'tk', alternativeUnitId: 'pcs', startTimeISO: '2020-01-01T07:00:00.000Z', endTimeISO: '2020-01-01T13:00:00.000Z',
  },
  {
    id: 2, unitId: 'tk', alternativeUnitId: 'pcs', startTimeISO: '2020-01-01T03:00:00.000Z', endTimeISO: '2020-01-01T15:00:00.000Z',
  },
]);

const propsDefault = {
  targetClass: 'target-class',
  valueClass: 'value-class',
};

const createWrapper = ({
  props = propsDefault,
  viewSettings = { useShiftGoodQty: true, usePrimaryUnit: true },
  batches = defaultBatches,
} = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const timelineStore = useShiftviewTimelineStore(pinia);
  timelineStore.shiftScrapDisplayValue = 12;
  timelineStore.shiftTotalDisplayValue = 1244;
  timelineStore.batches = batches;

  const userPreferencesStore = useUserPreferencesStore(pinia);
  userPreferencesStore.viewSettings = viewSettings;

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { id: 1, startTimeISO: '2020-01-01T08:00:00.000Z', endTimeISO: '2020-01-01T12:00:00.000Z' };
  shiftStore.statistics = { shiftTotal: { idealQty: 1244, idealAltQty: 12.44 } };

  return shallowMount(ShiftViewShiftQuantityBlock, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('ShiftViewShiftQuantityBlock', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, loading: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if good + scrap quantity is used', () => {
    const wrapper = createWrapper({
      props: {},
      viewSettings: { useShiftGoodQty: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if batches have different units', () => {
    const wrapper = createWrapper({ props: {} });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if alt unit is used and batches have different units', () => {
    const wrapper = createWrapper({
      props: {},
      viewSettings: { usePrimaryUnit: false },
      batches: new Set([
        {
          id: 1, unitId: 'tk', alternativeUnitId: 'pcs', startTimeISO: '2020-01-01T07:00:00.000Z', endTimeISO: '2020-01-01T09:00:00.000Z',
        },
        {
          id: 2, unitId: 'kg', alternativeUnitId: 'l', startTimeISO: '2020-01-01T09:00:00.000Z', endTimeISO: '2020-01-01T15:00:00.000Z',
        },
      ]),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with alternative qty when unit isnt shown', () => {
    const wrapper = createWrapper({
      props: propsDefault,
      viewSettings: { usePrimaryUnit: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in compact mode', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, compact: true } });
    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('paddingClass', () => {
    it('returns empty string when loading is true', () => {
      const wrapper = createWrapper({ props: { ...propsDefault, loading: true } });

      expect(wrapper.vm.paddingClass).toBe('');
    });

    it('returns "px-2 py-4" when loading is false and large is true', () => {
      const wrapper = createWrapper({ props: { ...propsDefault, loading: false, large: true } });

      expect(wrapper.vm.paddingClass).toBe('px-2 py-4');
    });

    it('returns "px-2 py-2" when loading is false and large is false', () => {
      const wrapper = createWrapper({ props: { ...propsDefault, loading: false, large: false } });

      expect(wrapper.vm.paddingClass).toBe('px-2 py-2');
    });
  });
});
