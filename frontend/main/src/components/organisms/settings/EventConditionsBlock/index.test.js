import { shallowMount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { describe } from 'vitest';

import EventConditionsBlock from './index.vue';

import { alertTypes } from '@/constants/alerts';
import { checklistTypes } from '@/constants/checklistsConstants';
import productApi from '@/api/productApi';
import createGlobalHelper from '@/helpers/createGlobal';

vi.mock('@/api/productApi');
productApi.getProducts = vi.fn();

const defaultPiniaState = {
  shiftTemplate: {
    shiftTemplates: [
      { id: 1, name: 'Morning Shift', stationIds: [1, 2] },
      { id: 2, name: 'Night Shift', stationIds: [2] },
    ],
  },
  factory: {
    factories: [{ id: 1, name: 'factory1' }, { id: 2, name: 'factory2' }],
  },
  station: {
    stations: [
      { id: 1, name: 'station1', factoryId: 1 },
      { id: 2, name: 'station2', factoryId: 2 },
    ],
  },
  operator: {
    operatorsList: [
      {
        id: 0, name: 'Unknown', stationIds: [], factoryIds: [],
      },
      {
        id: 1, name: 'operator1', stationIds: [1, 2], factoryIds: [1, 2],
      },
      {
        id: 1, name: 'operator1', stationIds: [1], factoryIds: [1],
      },
    ],
  },
  position: {
    positions: [
      { id: 1, primaryName: 'Position A', stationIds: [1] },
      { id: 2, primaryName: 'Position B', stationIds: [2] },
    ],
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
  },
};

const createGlobal = (piniaOverrides = {}) => createGlobalHelper({
  piniaOptions: {
    initialState: cloneDeep({ ...defaultPiniaState, ...piniaOverrides }),
  },
});

describe('EventConditionsBlock', () => {
  describe('alert type', () => {
    const wrapper = shallowMount(EventConditionsBlock, {
      global: createGlobal(),
      props: {
        eventType: 'alert',
        secondaryTitle: 'Trigger',
        requirements: {
          factoryIds: [1],
          stationIds: [1, 2],
          productIds: [3, 4],
          operatorIds: [1, 2],
          commentIds: [1, 2, 3],
          type: alertTypes.STOPREASON,
          setpoint: (2 * 60 * 60) + (30 * 60),
        },
        savedRequirements: {
          factoryIds: [1],
          stationIds: [1],
          productIds: [],
          operatorIds: [],
          commentIds: [1],
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
        },
      },
    });
    it('renders correctly', async () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    test('resetFilters', () => {
      wrapper.vm.resetFilters();
      expect(wrapper.emitted()['update:requirements'][0][0]).toEqual({
        factoryIds: [1],
        stationIds: [1],
        productIds: [],
        operatorIds: [],
      });
    });
  });

  describe('visibleStations', () => {
    test('returns stations based on stationsOverwrite if provided', () => {
      const stations = [
        { id: 1, name: 'station1', factoryId: 1 },
        { id: 2, name: 'station2', factoryId: 2 },
        { id: 3, name: 'station3', factoryId: 3 },
      ];
      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ station: { stations } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          stationsOverwrite: [1, 3],
          requirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      expect(wrapper.vm.visibleStations).toEqual([
        { id: 1, name: 'station1', factoryId: 1 },
        { id: 3, name: 'station3', factoryId: 3 },
      ]);
    });

    test('returns all stations if stationsOverwrite is not provided', () => {
      const stations = [
        { id: 1, name: 'station1', factoryId: 1 },
        { id: 2, name: 'station2', factoryId: 2 },
        { id: 3, name: 'station3', factoryId: 3 },
      ];
      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ station: { stations } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      expect(wrapper.vm.visibleStations).toEqual(stations);
    });
  });

  describe('filteredStations', () => {
    test('returns stations filtered by selected factories if factory is selected', () => {
      const stations = [
        { id: 1, name: 'station1', factoryId: 1 },
        { id: 2, name: 'station2', factoryId: 2 },
        { id: 3, name: 'station3', factoryId: 3 },
      ];
      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ station: { stations } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [1],
            stationIds: [1, 2],
            productIds: [3, 4],
            operatorIds: [1, 2],
            commentIds: [1, 2, 3],
            type: alertTypes.STOPREASON,
            setpoint: (2 * 60 * 60) + (30 * 60),
          },
          savedRequirements: {
            factoryIds: [1],
            stationIds: [1],
            productIds: [],
            operatorIds: [],
            commentIds: [1],
            type: alertTypes.STOPREASON,
            setpoint: 60 * 60,
          },
        },
      });
      expect(wrapper.vm.filteredStations).toEqual([{ id: 1, name: 'station1', factoryId: 1 }]);
    });

    test('returns all stations if factory is not selected', () => {
      const stations = [
        { id: 1, name: 'station1', factoryId: 1 },
        { id: 2, name: 'station2', factoryId: 2 },
        { id: 3, name: 'station3', factoryId: 3 },
      ];
      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ station: { stations } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [3, 4],
            operatorIds: [1, 2],
            commentIds: [1, 2, 3],
            type: alertTypes.STOPREASON,
            setpoint: (2 * 60 * 60) + (30 * 60),
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [1],
            type: alertTypes.STOPREASON,
            setpoint: 60 * 60,
          },
        },
      });
      expect(wrapper.vm.filteredStations).toEqual(stations);
    });
  });

  describe('filteredOperators', () => {
    const operatorsList = [
      {
        id: 1, name: 'operator1', stationIds: [1, 2], factoryIds: [1, 2],
      },
      {
        id: 2, name: 'operator2', stationIds: [3], factoryIds: [3],
      },
    ];

    it('returns operators filtered by selected factories if factory is selected', () => {
      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ operator: { operatorsList } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [1],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      // Pinia operatorsIncludeNotSpecified adds Unknown with stationIds: [], which gets filtered by station
      expect(wrapper.vm.filteredOperators).toEqual([
        { id: 1, name: 'operator1', stationIds: [1, 2], factoryIds: [1, 2] },
      ]);
    });

    it('returns operators filtered by selected stations if station is selected', () => {
      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ operator: { operatorsList } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [],
            stationIds: [3],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      expect(wrapper.vm.filteredOperators).toEqual([
        { id: 2, name: 'operator2', stationIds: [3], factoryIds: [3] },
      ]);
    });

    it('returns all operators if factory and station are not selected', () => {
      const stations = [
        { id: 1, name: 'station1', factoryId: 1 },
        { id: 2, name: 'station2', factoryId: 2 },
        { id: 3, name: 'station3', factoryId: 3 },
      ];

      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ station: { stations }, operator: { operatorsList } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      // Pinia Unknown operator has stationIds: [] which is truthy, so it gets filtered by station check
      expect(wrapper.vm.filteredOperators).toEqual(operatorsList);
    });
  });

  describe('filteredShiftTemplates', () => {
    const shiftTemplates = [
      { id: 1, name: 'Morning Shift', stationIds: [1, 2] },
      { id: 2, name: 'Night Shift', stationIds: [3] },
    ];

    it('returns shift templates filtered by selected stations', () => {
      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ shiftTemplate: { shiftTemplates } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [],
            stationIds: [1],
            productIds: [],
            operatorIds: [],
            shiftTemplateIds: [],
            positionIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            shiftTemplateIds: [],
            positionIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      expect(wrapper.vm.filteredShiftTemplates).toEqual([
        { id: 1, name: 'Morning Shift', stationIds: [1, 2] },
      ]);
    });

    it('returns all shift templates if no stations are selected', () => {
      const stations = [
        { id: 1, name: 'station1', factoryId: 1 },
        { id: 2, name: 'station2', factoryId: 2 },
        { id: 3, name: 'station3', factoryId: 3 },
      ];

      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ shiftTemplate: { shiftTemplates }, station: { stations } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            shiftTemplateIds: [],
            positionIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            shiftTemplateIds: [],
            positionIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      expect(wrapper.vm.filteredShiftTemplates).toEqual(shiftTemplates);
    });
  });

  describe('filteredPositions', () => {
    const positions = [
      { id: 1, primaryName: 'Position A', stationIds: [1, 2] },
      { id: 2, primaryName: 'Position B', stationIds: [3] },
    ];

    it('returns positions filtered by selected stations', () => {
      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ position: { positions } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [],
            stationIds: [1],
            productIds: [],
            operatorIds: [],
            shiftTemplateIds: [],
            positionIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            shiftTemplateIds: [],
            positionIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      expect(wrapper.vm.filteredPositions).toEqual([
        { id: 1, primaryName: 'Position A', stationIds: [1, 2] },
      ]);
    });

    it('returns all positions if no stations are selected', () => {
      const stations = [
        { id: 1, name: 'station1', factoryId: 1 },
        { id: 2, name: 'station2', factoryId: 2 },
        { id: 3, name: 'station3', factoryId: 3 },
      ];

      const wrapper = shallowMount(EventConditionsBlock, {
        global: createGlobal({ station: { stations }, position: { positions } }),
        props: {
          eventType: 'alert',
          secondaryTitle: 'Trigger',
          requirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            shiftTemplateIds: [],
            positionIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
          savedRequirements: {
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            shiftTemplateIds: [],
            positionIds: [],
            commentIds: [],
            type: alertTypes.STOPREASON,
            setpoint: 0,
          },
        },
      });
      expect(wrapper.vm.filteredPositions).toEqual(positions);
    });
  });

  test('isFilterResetDisabled when filters are the same', () => {
    const requirements = {
      factoryIds: [1],
      stationIds: [1, 2],
      productIds: [3, 4],
      operatorIds: [1, 2],
      commentIds: [1, 2, 3],
      type: alertTypes.STOPREASON,
      setpoint: (2 * 60 * 60) + (30 * 60),
    };
    const wrapper = shallowMount(EventConditionsBlock, {
      global: createGlobal(),
      props: {
        eventType: 'alert',
        requirements,
        savedRequirements: requirements,
      },
    });

    expect(wrapper.vm.isFilterResetDisabled).toBe(true);
  });

  test('isFilterResetDisabled when requirements are not the same', () => {
    const wrapper = shallowMount(EventConditionsBlock, {
      global: createGlobal(),
      props: {
        eventType: 'alert',
        requirements: {
          factoryIds: [1],
          stationIds: [1, 2],
          productIds: [3, 4],
          operatorIds: [1, 2],
          commentIds: [1, 2, 3],
          type: alertTypes.STOPREASON,
          setpoint: (2 * 60 * 60) + (30 * 60),
        },
        savedRequirements: {
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          type: alertTypes.STOPREASON,
          setpoint: 3600,
        },
      },
    });

    expect(wrapper.vm.isFilterResetDisabled).toBe(false);
  });

  test('requirements-ready emit', async () => {
    const wrapper = shallowMount(EventConditionsBlock, {
      global: createGlobal(),
      props: {
        eventType: 'alert',
        secondaryTitle: 'Trigger',
        requirements: {
          factoryIds: [1],
          stationIds: [1, 2],
          productIds: [3, 4],
          operatorIds: [1, 2],
          commentIds: [1, 2, 3],
          type: alertTypes.STOPREASON,
          setpoint: (2 * 60 * 60) + (30 * 60),
        },
        savedRequirements: {
          factoryIds: [1],
          stationIds: [1],
          productIds: [],
          operatorIds: [],
          commentIds: [1],
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
        },
      },
    });

    expect(wrapper.emitted()['update:requirements-ready']).toBeFalsy();
    await wrapper.setData({ isTriggerComplete: true, hasTriggerError: false });
    expect(wrapper.emitted()['update:requirements-ready'][0]).toEqual([true]);
    await wrapper.setData({ isTriggerComplete: true, hasTriggerError: true });
    expect(wrapper.emitted()['update:requirements-ready'][1]).toEqual([false]);
    await wrapper.setData({ isTriggerComplete: false, hasTriggerError: true });
    expect(wrapper.emitted()['update:requirements-ready'][2]).toEqual([false]);
    await wrapper.setData({ isTriggerComplete: false, hasTriggerError: false });
    expect(wrapper.emitted()['update:requirements-ready'][3]).toEqual([false]);
  });

  describe('checklist type', () => {
    const wrapper = shallowMount(EventConditionsBlock, {
      global: createGlobal(),
      props: {
        eventType: 'checklist',
        filters: ['factoryIds', 'stationIds', 'productIds'],
        requirements: {
          factoryIds: [1],
          stationIds: [1, 2],
          productIds: [3, 4],
          operatorIds: [1, 2],
          commentIds: [1, 2, 3],
          type: checklistTypes.STOPREASON,
          setpoint: (2 * 60 * 60) + (30 * 60),
        },
        savedRequirements: {
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          type: alertTypes.STOPREASON,
          setpoint: 3600,
        },
        secondaryTitle: 'Frequency',
      },
    });
    it('renders correctly', async () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    test('resetFilters', () => {
      wrapper.vm.resetFilters();
      expect(wrapper.emitted()['update:requirements'][0][0]).toEqual({
        factoryIds: [],
        stationIds: [],
        productIds: [],
      });
    });
  });
});
