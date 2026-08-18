import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftTimeline from '@/components/organisms/shiftview/ShiftTimeline/index.vue';
import {
  useCommentStore,
  useShiftStore,
  useDeviceStore,
  useStationStore,
} from '@/stores/index';

const route = {
  $route: {
    query: {},
  },
};

const defaultStatistics = {
  hourStatistics: {
    '2020-01-01T12:00:00.000Z': {
      quantityAlt: 12,
      idealAltQty: 10,
      idealQty: 100,
      quantity: 1.2,
      scrapAltQty: 0,
      scrapQty: 0,
    },
    '2020-01-01T13:00:00.000Z': {
      quantityAlt: 1123,
      idealAltQty: 4534,
      idealQty: 1233,
      quantity: 12312,
      scrapAltQty: 12,
      scrapQty: 1234,
    },
    '2020-01-01T14:00:00.000Z': {
      quantityAlt: 1123,
      idealAltQty: 4534,
      idealQty: 1233,
      quantity: 12312,
      scrapAltQty: 122,
      scrapQty: 12222,
    },
    '2020-01-01T15:00:00.000Z': {
      quantityAlt: 0,
      idealAltQty: 3600,
      idealQty: 360,
      quantity: 0,
      scrapAltQty: 0,
      scrapQty: 0,
    },
    '2020-01-01T16:00:00.000Z': {
      quantityAlt: 5,
      idealAltQty: 3600,
      idealQty: 360,
      quantity: 50,
      scrapAltQty: 3,
      scrapQty: 30,
    },
  },
};

const createWrapper = ({ statistics = defaultStatistics } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const commentStore = useCommentStore(pinia);
  commentStore.commentsRealMap = new Map();

  const shiftStore = useShiftStore(pinia);
  shiftStore.shift = { startTimeISO: '2020-01-01T12:00:00.000Z', endTimeISO: '2020-01-01T17:00:00.000Z' };
  shiftStore.statistics = statistics;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = false;
  deviceStore.isXXLView = false;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'UTC' };

  return shallowMount(ShiftTimeline, {
    global: { plugins: [pinia] },
    mocks: { ...route },
  });
};

describe('ShiftTimeline', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that shiftHours returns correctly mapped data', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.shiftHours).toStrictEqual([
      {
        quantityAlt: 12,
        idealAltQty: 10,
        idealQty: 100,
        quantity: 1.2,
        scrapAltQty: 0,
        scrapQty: 0,
        dateTime: '2020-01-01T12:00:00.000Z',
      },
      {
        quantityAlt: 1123,
        idealAltQty: 4534,
        idealQty: 1233,
        quantity: 12312,
        scrapAltQty: 12,
        scrapQty: 1234,
        dateTime: '2020-01-01T13:00:00.000Z',
      },
      {
        quantityAlt: 1123,
        idealAltQty: 4534,
        idealQty: 1233,
        quantity: 12312,
        scrapAltQty: 122,
        scrapQty: 12222,
        dateTime: '2020-01-01T14:00:00.000Z',
      },
      {
        quantityAlt: 0,
        idealAltQty: 3600,
        idealQty: 360,
        quantity: 0,
        scrapAltQty: 0,
        scrapQty: 0,
        dateTime: '2020-01-01T15:00:00.000Z',
      },
      {
        quantityAlt: 5,
        idealAltQty: 3600,
        idealQty: 360,
        quantity: 50,
        scrapAltQty: 3,
        scrapQty: 30,
        dateTime: '2020-01-01T16:00:00.000Z',
      },
    ]);
  });

  test('that shiftHours returns correctly mapped data in case there are less tha 5 hours present', () => {
    const wrapper = createWrapper({
      statistics: {
        hourStatistics: {
          '2020-01-01T12:00:00.000Z': {
            quantityAlt: 12,
            idealAltQty: 10,
            idealQty: 100,
            quantity: 1.2,
            scrapAltQty: 0,
            scrapQty: 0,
          },
        },
      },
    });

    expect(wrapper.vm.shiftHours).toStrictEqual([
      {
        quantityAlt: 12,
        idealAltQty: 10,
        idealQty: 100,
        quantity: 1.2,
        scrapAltQty: 0,
        scrapQty: 0,
        dateTime: '2020-01-01T12:00:00.000Z',
      },
      {
        quantityAlt: 0,
        idealAltQty: 0,
        idealQty: 0,
        quantity: 0,
        scrapAltQty: 0,
        scrapQty: 0,
        dateTime: '2020-01-01T13:00:00.000Z',
      },
      {
        quantityAlt: 0,
        idealAltQty: 0,
        idealQty: 0,
        quantity: 0,
        scrapAltQty: 0,
        scrapQty: 0,
        dateTime: '2020-01-01T14:00:00.000Z',
      },
      {
        quantityAlt: 0,
        idealAltQty: 0,
        idealQty: 0,
        quantity: 0,
        scrapAltQty: 0,
        scrapQty: 0,
        dateTime: '2020-01-01T15:00:00.000Z',
      },
      {
        quantityAlt: 0,
        idealAltQty: 0,
        idealQty: 0,
        quantity: 0,
        scrapAltQty: 0,
        scrapQty: 0,
        dateTime: '2020-01-01T16:00:00.000Z',
      },
    ]);
  });
});
