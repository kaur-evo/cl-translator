import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftHours from '@/components/organisms/shiftview/ShiftHours/index.vue';
import { timeFormatMap } from '@/constants/formattingConstants';
import {
  useDeviceStore,
  useStationStore,
  useProfileStore,
} from '@/stores/index';

const createWrapper = ({ props = {}, timeFormat = timeFormatMap[24] } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.isXXLView = false;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC' };

  const profileStore = useProfileStore(pinia);
  profileStore.timeFormat = timeFormat;

  return shallowMount(ShiftHours, {
    global: { plugins: [pinia] },
    props,
  });
};

const propsDefault = {
  shiftHours: [
    { dateTime: '2020-01-01T12:00:00.000Z' },
    { dateTime: '2020-01-01T13:00:00.000Z' },
    { dateTime: '2020-01-01T14:00:00.000Z' },
    { dateTime: '2020-01-01T15:00:00.000Z' },
    { dateTime: '2020-01-01T16:00:00.000Z' },
  ],
};

describe('ShiftHours', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({ props: propsDefault });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({ props: propsDefault });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with 12h time version', () => {
    const wrapper = createWrapper({
      props: propsDefault,
      timeFormat: timeFormatMap[12],
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
