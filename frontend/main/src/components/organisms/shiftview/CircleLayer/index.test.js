import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CircleLayer from '@/components/organisms/shiftview/CircleLayer/index.vue';
import {
  useShiftStore,
  useShiftviewSelectionStore,
  useFeatureStore,
  useDeviceStore,
  useStationStore,
} from '@/stores/index';

document.body.setAttribute('data-app', true);

const route = {
  $route: {
    query: {},
  },
};

const createWrapper = (props = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { endTimeISO: '2020-02-02T12:00:00.000Z' };

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.bracketRange = {};
  shiftviewSelectionStore.shiftviewSelectionType = null;

  const featureStore = useFeatureStore(pinia);
  featureStore.factoryFeatures = [];

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC' };

  return mount(CircleLayer, {
    global: { plugins: [pinia], mocks: { ...route } },
    props,
  });
};

describe('CircleLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('that click calls requestOperator and not selectSlice when requestOperator prop is true', async () => {
    const wrapper = createWrapper({ requireOperator: true });

    const spy1 = vi.spyOn(wrapper.vm, 'requestOperator');
    const spy2 = vi.spyOn(wrapper.vm, 'selectSlice');
    wrapper.vm.click();

    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(0);
  });

  test('that click calls selectSlice and not requestOperator when requestOperator prop is false', async () => {
    const wrapper = createWrapper({ requireOperator: false });

    const spy1 = vi.spyOn(wrapper.vm, 'requestOperator');
    const spy2 = vi.spyOn(wrapper.vm, 'selectSlice');

    wrapper.vm.click();

    expect(spy1).toBeCalledTimes(0);
    expect(spy2).toBeCalledTimes(1);
  });
});
