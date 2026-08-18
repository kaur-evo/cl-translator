import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import HourTargets from './index.vue';

import {
  useDeviceStore,
  useStationStore,
  useUserPreferencesStore,
} from '@/stores/index';

const route = {
  $route: {
    query: {},
  },
};

const createWrapper = ({ props = {}, viewSettings = { useShiftGoodQty: true, usePrimaryUnit: true } } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.isXXLView = false;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = {
    oeeGoalSad: 40,
    oeeGoalHappy: 60,
  };

  const userPreferencesStore = useUserPreferencesStore(pinia);
  userPreferencesStore.viewSettings = viewSettings;

  return mount(HourTargets, {
    global: {
      plugins: [pinia],
      mocks: { ...route },
    },
    props,
  });
};

const propsDefault = {
  shiftHours: [
    {
      quantity: 100,
      quantityAlt: 10,
      scrapQty: 10,
      scrapAltQty: 1,
      idealQty: 100,
      idealAltQty: 10,
      dateTime: '2022-02-22T12:00:00',
    },
    {
      quantity: 60,
      quantityAlt: 6,
      scrapQty: 10,
      scrapAltQty: 1,
      idealQty: 100,
      idealAltQty: 10,
      dateTime: '2022-02-22T13:00:00',
    },
    {
      quantity: 40,
      quantityAlt: 4,
      scrapQty: 10,
      scrapAltQty: 1,
      idealQty: 100,
      idealAltQty: 10,
      dateTime: '2022-02-22T14:00:00',
    },
  ],
};

describe('HourTargets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when primary unit and good qty are shown', () => {
    const wrapper = createWrapper({ props: propsDefault });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if primary unit and total quantity is shown', () => {
    const wrapper = createWrapper({
      props: propsDefault,
      viewSettings: { useShiftGoodQty: false, usePrimaryUnit: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if secondary unit and good quantity is shown', () => {
    const wrapper = createWrapper({
      props: propsDefault,
      viewSettings: { useShiftGoodQty: true, usePrimaryUnit: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if secondary unit and total quantity is shown', () => {
    const wrapper = createWrapper({
      props: propsDefault,
      viewSettings: { useShiftGoodQty: false, usePrimaryUnit: false },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
