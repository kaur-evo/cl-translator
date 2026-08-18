import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementEdit from './index.vue';

import improvementsProjectApi from '@/api/improvementsProjectApi';
import productApi from '@/api/productApi';

vi.mock('@/api/improvementsProjectApi');
improvementsProjectApi.getProject = () => [];
improvementsProjectApi.saveProject = vi.fn();
improvementsProjectApi.createProject = vi.fn();

vi.mock('@/api/productApi');
productApi.getProducts = () => [];

const defaultPiniaState = {
  factory: {
    factories: [{ id: 1 }, { id: 2 }, { id: 3 }],
    hasMultipleFactories: true,
    factoriesMap: { 1: { id: 1, name: 'test factory' }, 2: { id: 2, name: 'test factory 2' }, 3: { id: 3, name: 'test factory 3' } },
  },
  station: {
    stations: [{ id: 1 }],
    stationsMap: { 1: { id: 1, name: 'test station' } },
  },
  profile: {
    currentUser: {},
  },
  improvementsProject: {
    projects: [
      { id: 1, name: 'project1' },
      { id: 2, name: 'project2' },
    ],
  },
};

describe('ImprovementEdit', () => {
  vi.useFakeTimers().setSystemTime(new Date('2023-01-01T12:34:33'));
  it('renders correctly', () => {
    const $route = { name: 'improvementEdit' };
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: { ...defaultPiniaState },
    });
    const wrapper = shallowMount(ImprovementEdit, {
      global: {
        plugins: [pinia],
        stubs: ['router-link', 'router-view'],
        mocks: {
          $route,
        },
      },

    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that "onFactoryChange" method sets project data to default and changes factoryId value', async () => {
    const $route = { params: { id: 2 }, name: 'improvementEdit' };
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: { ...defaultPiniaState },
    });
    const wrapper = shallowMount(ImprovementEdit, {
      global: {
        stubs: ['router-link', 'router-view'],
        plugins: [pinia],
        mocks: { $route },
      },
    });

    await flushPromises();
    await wrapper.setData({
      formData: {
        factoryId: 1,
        stationIds: [1, 2],
        commentIds: [11, 12],
        productIds: [11, 12],
        positionIds: [11, 12],
        eventType: 'STOP_REASON',
        targetType: 'REDUCE_STOP_REASON_TO_TIME',
      },
    });
    expect(wrapper.vm.formData.stationIds).toEqual([1, 2]);
    expect(wrapper.vm.formData.commentIds).toEqual([11, 12]);
    expect(wrapper.vm.formData.productIds).toEqual([11, 12]);
    expect(wrapper.vm.formData.positionIds).toEqual([11, 12]);
    expect(wrapper.vm.formData.eventType).toEqual('STOP_REASON');
    expect(wrapper.vm.formData.targetType).toEqual('REDUCE_STOP_REASON_TO_TIME');
    await wrapper.vm.onFactoryChange(3);
    expect(wrapper.vm.formData.factoryId).toEqual(3);
    expect(wrapper.vm.formData.stationIds).toEqual([]);
    expect(wrapper.vm.formData.commentIds).toEqual([]);
    expect(wrapper.vm.formData.productIds).toEqual([]);
    expect(wrapper.vm.formData.positionIds).toEqual([]);
    expect(wrapper.vm.formData.eventType).toEqual('NO_TRACKING_DATA');
    expect(wrapper.vm.formData.targetType).toEqual(null);
  });

  test('that computedStations returns all stations when factory is not selected', async () => {
    const $route = { name: 'improvementEdit' };
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        station: {
          stations: [{ id: 1, name: 'Station1', factoryId: 1 }, { id: 2, name: 'Station2', factoryId: 1 }],
          stationsMap: defaultPiniaState.station.stationsMap,
        },
      },
    });
    const wrapper = shallowMount(ImprovementEdit, {
      global: {
        stubs: ['router-link', 'router-view'],
        plugins: [pinia],
        mocks: { $route },
      },
    });

    await wrapper.setData({ formData: { factoryId: 1 } });
    expect(wrapper.vm.computedStations).toEqual([{ id: 1, name: 'Station1', factoryId: 1 }, { id: 2, name: 'Station2', factoryId: 1 }]);
  });

  test('that computedStations returns filtered array when factory is selected', async () => {
    const $route = { name: 'improvementEdit' };
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        station: {
          stations: [{ id: 1, name: 'Station1', factoryId: 1 }, { id: 2, name: 'Station2', factoryId: 12 }],
          stationsMap: defaultPiniaState.station.stationsMap,
        },
      },
    });
    const wrapper = shallowMount(ImprovementEdit, {
      global: {
        stubs: ['router-link', 'router-view'],
        plugins: [pinia],
        mocks: { $route },
      },
    });

    await wrapper.setData({ formData: { factoryId: 1 } });
    expect(wrapper.vm.computedStations).toEqual([{ id: 1, name: 'Station1', factoryId: 1 }]);
  });

  describe('hasOneFactory', () => {
    let $route;
    let piniaState;

    beforeEach(() => {
      $route = { name: 'improvementEdit' };
      piniaState = {
        ...defaultPiniaState,
        factory: {
          ...defaultPiniaState.factory,
          hasMultipleFactories: false,
          factories: [{ id: 1 }],
        },
      };
    });

    it('renders correctly', () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        initialState: { ...piniaState },
      });
      const wrapper = shallowMount(ImprovementEdit, {
        global: {
          stubs: ['router-link', 'router-view'],
          plugins: [pinia],
          mocks: { $route },
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    test('that factoryId is set to first factory', async () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        initialState: { ...piniaState },
      });
      const wrapper = shallowMount(ImprovementEdit, {
        global: {
          stubs: ['router-link', 'router-view'],
          plugins: [pinia],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.formData.factoryId).toEqual(1);
    });
  });

  describe('no factories available', () => {
    let $route;
    let piniaState;

    beforeEach(() => {
      $route = { name: 'improvementEdit' };
      piniaState = {
        ...defaultPiniaState,
        factory: {
          ...defaultPiniaState.factory,
          hasMultipleFactories: false,
          factories: [],
        },
      };
    });

    it('renders correctly', () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        initialState: { ...piniaState },
      });
      const wrapper = shallowMount(ImprovementEdit, {
        global: {
          stubs: ['router-link', 'router-view'],
          plugins: [pinia],
          mocks: { $route },
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    test('that factoryId is set to 0', async () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        initialState: { ...piniaState },
      });
      const wrapper = shallowMount(ImprovementEdit, {
        global: {
          stubs: ['router-link', 'router-view'],
          plugins: [pinia],
          mocks: { $route },
        },
      });

      expect(wrapper.vm.formData.factoryId).toEqual(0);
    });
  });
});
