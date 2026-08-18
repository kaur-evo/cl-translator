import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementTrackingSection from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const defaultPropsData = {
  formData: {
    factoryId: 1,
    stationIds: [],
    productIds: [],
    commentIds: [],
    positionIds: [],
  },
  stopDuration: {},
};

const defaultPiniaState = {
  factory: {
    factories: [{ id: 1, name: 'Factory1', stations: [1, 2] }, { id: 2, name: 'Factory2', stations: [3, 4] }],
    hasMultipleFactories: true,
  },
  station: {
    stations: [{ id: 1, name: 'Station1', factoryId: 1 }, { id: 2, name: 'Station2', factoryId: 1 }, { id: 3, name: 'Station3', factoryId: 2 }, { id: 4, name: 'Station4', factoryId: 2 }],
    stationsMap: {
      1: { name: 'Station1', factoryId: 1 },
      2: { name: 'Station2', factoryId: 1 },
      3: { name: 'Station3', factoryId: 2 },
      4: { name: 'Station4', factoryId: 2 },
    },
  },
  comment: {
    commentGroupsList: [{ id: 1, name: 'CommentGroup1', factoryIds: [1, 2] }, { id: 2, name: 'CommentGroup2', factoryIds: [1, 2] }],
    commentsList: [{
      id: 1, name: 'Comment1', groupId: 1, stationIds: [1, 2, 3, 4],
    }, {
      id: 2, name: 'Comment2', groupId: 2, stationIds: [1, 2, 3, 4],
    }],
    isLoading: false,
  },
  position: {
    positions: [{ id: 1, name: 'Position1', stationIds: [1, 2, 3, 4] }, { id: 2, name: 'Position2', stationIds: [1, 2, 3, 4] }],
  },
  product: {
    products: [{ id: 1, name: 'Product1', stationIds: [1, 2, 3, 4] }, { id: 2, name: 'Product2', stationIds: [1, 2, 3, 4] }],
  },
  profile: {},
};

const global = createGlobal({
  piniaOptions: {
    initialState: { ...defaultPiniaState },
  },
});

const createWrapper = (options) => shallowMount(ImprovementTrackingSection, {
  global: { ...global },
  ...options,
});

describe('ImprovementTrackingSection', () => {
  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...defaultPropsData },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...defaultPropsData },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with single factory', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        factory: {
          ...defaultPiniaState.factory,
          hasMultipleFactories: false,
        },
      },
    });
    const wrapper = createWrapper({
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if period average is 0', () => {
    const wrapper = createWrapper({
      props: { ...defaultPropsData, stopDuration: { periodAverage: 0 } },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that "onFactoryChange" method emits "form-data-changed" event for stations, comments, products and positions', async () => {
    const wrapper = createWrapper({
      props: { ...defaultPropsData },
    });

    await wrapper.vm.onFactoryChange(44);
    expect(wrapper.emitted()['form-data-changed']).toBeTruthy();
    expect(wrapper.emitted()['form-data-changed'][0][0]).toEqual({
      factoryId: 44,
      stationIds: [],
      productIds: [],
      commentIds: [],
      positionIds: [],
    });
  });

  test('that filteredStations returns all stations when factory is not selected', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        station: {
          ...defaultPiniaState.station,
          stations: [{ id: 1, name: 'Station1', factoryId: 1 }, { id: 2, name: 'Station2', factoryId: 1 }],
        },
      },
    });
    const wrapper = createWrapper({
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.filteredStations).toEqual([{ id: 1, name: 'Station1', factoryId: 1 }, { id: 2, name: 'Station2', factoryId: 1 }]);
  });

  test('that filteredStations returns filtered array when factory is selected', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        station: {
          ...defaultPiniaState.station,
          stations: [{ id: 1, name: 'Station1', factoryId: 1 }, { id: 2, name: 'Station2', factoryId: 12 }],
        },
      },
    });
    const wrapper = createWrapper({
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.filteredStations).toEqual([{ id: 1, name: 'Station1', factoryId: 1 }]);
  });

  test('that filteredComments includes uncommented comment and these comments, which stationIds are in formData', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        station: {
          ...defaultPiniaState.station,
          stations: [
            { id: 1, name: 'Station1', factoryId: 1 },
            { id: 2, name: 'Station2', factoryId: 1 },
            { id: 3, name: 'Station3', factoryId: 2 },
            { id: 4, name: 'Station4', factoryId: 2 },
          ],
        },
        comment: {
          ...defaultPiniaState.comment,
          commentsList: [
            { id: 0, name: 'Uncommented', groupId: -1 },
            { id: 1, name: 'Comment1', stationIds: [1] },
            { id: 2, name: 'Comment2', stationIds: [1, 2] },
            { id: 3, name: 'Comment3', stationIds: [3] },
            { id: 4, name: 'Comment4', stationIds: [4] },
          ],
        },
      },
    });
    const wrapper = createWrapper({
      props: { ...defaultPropsData, formData: { ...defaultPropsData.formData, stationIds: [1, 2] } },
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.filteredComments).toEqual([{ id: 0, name: 'Uncommented', groupId: -1 }, { id: 1, name: 'Comment1', stationIds: [1] }, { id: 2, name: 'Comment2', stationIds: [1, 2] }]);
  });
});
