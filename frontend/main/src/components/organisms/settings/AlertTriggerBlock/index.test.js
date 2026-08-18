import { shallowMount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';

import AlertTriggerBlock from './index.vue';

import { alertTypes, alertSubtypes } from '@/constants/alerts';
import createGlobalHelper from '@/helpers/createGlobal';

const defaultPiniaState = {
  checklistTemplate: {
    checklistTemplates: [{
      id: 1, groupId: 11, stationIds: [11, 12], frequency: { productIds: [1, 2, 3], type: 'CHANGEOVER' },
    }],
    checklistGroups: [{ id: 11, name: 'group-1' }],
  },
  comment: {
    commentsList: [
      {
        id: 0, name: 'uncommented', factoryIds: [], stationIds: [], groupId: -1,
      },
      {
        id: 1, name: 'comment1', factoryIds: [1], stationIds: [2], groupId: 1,
      },
      {
        id: 2, name: 'comment2', factoryIds: [2], stationIds: [3], groupId: 2,
      },
    ],
    commentGroupsList: [{ id: -1, name: 'uncommented' }, { id: 1, name: 'group1', local: true }, { id: 2, name: 'group2', local: true }],
  },
  scrapReason: {
    scrapReasonsList: [
      {
        id: 0, name: 'uncommented', factoryIds: [], stationIds: [], groupId: -1,
      },
      {
        id: 1, name: 'scrapreason1', factoryIds: [1], stationIds: [2], groupId: 1,
      },
      {
        id: 2, name: 'scrapreason2', factoryIds: [2], stationIds: [3], groupId: 2,
      },
    ],
    scrapReasonGroupsList: [{ id: -1, name: 'uncommented' }, { id: 1, name: 'scrapgroup1', local: true }, { id: 2, name: 'scrapgroup2', local: false }],
  },
  feature: {
    checklists: false,
  },
  factory: {
    factories: [],
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
  },
  station: {
    stations: [],
  },
};

const createGlobal = (piniaOverrides = {}) => createGlobalHelper({
  piniaOptions: {
    initialState: cloneDeep({ ...defaultPiniaState, ...piniaOverrides }),
  },
});

describe('AlertTriggerBlock', () => {
  it('renders correctly if type is null and checklists are enabled', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: null,
          setpoint: null,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: null,
          setpoint: null,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal({ feature: { checklists: true } }),
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });
  it('renders correctly CHECKLIST type', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
        savedRequirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });
  it('renders correctly STOPREASON type when duration is 3600', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly STOPREASON type with duration error', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly STOPREASON type when duration is null', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: null,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: null,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly STOPREASON type when count is 1 and duration is 0', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 0,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 0,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly STOPREASON type when count is bigger than 2 and duration is 0', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 0,
          count: 3,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 0,
          count: 3,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });
  test('isTriggerComplete', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: null,
          setpoint: null,
          count: null,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: null,
          setpoint: null,
          count: null,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    expect(wrapper.vm.isTriggerComplete).toBe(false);
    await wrapper.setProps({
      requirements: {
        type: alertTypes.CHECKLIST,
        factoryIds: [],
        stationIds: [],
        productIds: [],
        operatorIds: [],
        checklistStatuses: [],
        checklistIds: [],
      },
    });
    expect(wrapper.vm.isTriggerComplete).toBe(true);
    await wrapper.setProps({
      requirements: {
        type: alertTypes.STOPREASON,
        setpoint: null,
        count: null,
        factoryIds: [],
        stationIds: [],
        productIds: [],
        operatorIds: [],
        commentIds: [],
      },
    });
    await wrapper.setData({ alertSubtype: alertSubtypes.EXCEEDS });
    expect(wrapper.vm.isTriggerComplete).toBe(false);
    await wrapper.setProps({
      requirements: {
        type: alertTypes.STOPREASON,
        setpoint: 60 * 60,
        count: null,
        factoryIds: [],
        stationIds: [],
        productIds: [],
        operatorIds: [],
        commentIds: [],
      },
    });
    expect(wrapper.vm.isTriggerComplete).toBe(true);
    await wrapper.setData({ alertSubtype: alertSubtypes.REPEATS });
    expect(wrapper.vm.isTriggerComplete).toBe(false);
    await wrapper.setProps({
      requirements: {
        type: alertTypes.STOPREASON,
        setpoint: null,
        count: 6,
        factoryIds: [],
        stationIds: [],
        productIds: [],
        operatorIds: [],
        commentIds: [],
      },
    });
    expect(wrapper.vm.isTriggerComplete).toBe(true);
  });

  test('onAlertTypeChange', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: null,
          setpoint: null,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: null,
          setpoint: null,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();

    wrapper.vm.onAlertTypeChange(alertTypes.CHECKLIST);
    expect(wrapper.vm.alertSubtype).toBe(null);
    expect(wrapper.emitted()['update:requirements'][0][0].type).toBe(alertTypes.CHECKLIST);
    wrapper.vm.resetTrigger();
    expect(wrapper.emitted()['update:requirements'][1][0].type).toBe(null);
    wrapper.vm.onAlertTypeChange(alertTypes.STOPREASON);
    expect(wrapper.vm.alertSubtype).toBe(alertSubtypes.EXCEEDS);
    expect(wrapper.emitted()['update:requirements'][2][0].type).toBe(alertTypes.STOPREASON);
  });

  test('hasStopReasonCountError', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 0,
          count: 3,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 0,
          count: 3,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();

    expect(wrapper.vm.hasStopReasonCountError).toBe(false);
    expect(wrapper.emitted()['update:has-trigger-error']).toBeFalsy();
    await wrapper.setProps({
      requirements: {
        type: alertTypes.STOPREASON,
        setpoint: 0,
        count: 1,
        factoryIds: [],
        stationIds: [],
        productIds: [],
        operatorIds: [],
        commentIds: [],
      },
    });
    expect(wrapper.vm.hasStopReasonCountError).toBe(true);
    expect(wrapper.emitted()['update:has-trigger-error']).toBeTruthy();
  });

  test('alertSubtypesArray if alert type is STOPREASON', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();

    expect(wrapper.vm.alertSubtypesArray).toEqual([
      {
        id: alertSubtypes.EXCEEDS, name: 'Lasts longer than', durationDefault: null, countDefault: 1,
      },
      {
        id: alertSubtypes.ADDED, name: 'Is added', durationDefault: 0, countDefault: 1,
      },
      {
        id: alertSubtypes.REPEATS, name: 'Repeats', durationDefault: 0, countDefault: null,
      },
    ]);
  });

  test('filteredComments', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [1],
          stationIds: [2],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [1],
          stationIds: [2],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();

    expect(wrapper.vm.filteredComments).toEqual([
      {
        id: 0, name: 'uncommented', factoryIds: [], stationIds: [], groupId: -1,
      },
      {
        id: 1, name: 'comment1', factoryIds: [1], stationIds: [2], groupId: 1,
      },
    ]);
  });

  test('filteredScrapReasons', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.SCRAPREASON,
          intervalQty: 10,
          factoryIds: [1],
          stationIds: [2],
          productIds: [],
          operatorIds: [],
          scrapReasonIds: [],
        },
        savedRequirements: {
          type: alertTypes.SCRAPREASON,
          intervalQty: 10,
          factoryIds: [1],
          stationIds: [2],
          productIds: [],
          operatorIds: [],
          scrapReasonIds: [],
        },
      },
      global: createGlobal(),
    });

    await flushPromises();
    expect(wrapper.vm.filteredScrapReasons).toEqual([
      {
        id: 0, name: 'uncommented', factoryIds: [], stationIds: [], groupId: -1,
      },
      {
        id: 1, name: 'scrapreason1', factoryIds: [1], stationIds: [2], groupId: 1,
      },
    ]);

    await wrapper.setProps({
      requirements: {
        type: alertTypes.SCRAPREASON,
        intervalQty: 10,
        factoryIds: [2],
        stationIds: [2],
        productIds: [],
        operatorIds: [],
        scrapReasonIds: [],
      },
    });

    expect(wrapper.vm.filteredScrapReasons).toEqual([
      {
        id: 0, name: 'uncommented', factoryIds: [], stationIds: [], groupId: -1,
      },
    ]);

    await wrapper.setProps({
      requirements: {
        type: alertTypes.SCRAPREASON,
        intervalQty: 10,
        factoryIds: [2],
        stationIds: [3],
        productIds: [],
        operatorIds: [],
        scrapReasonIds: [],
      },
    });

    expect(wrapper.vm.filteredScrapReasons).toEqual([
      {
        id: 0, name: 'uncommented', factoryIds: [], stationIds: [], groupId: -1,
      },
      {
        id: 2, name: 'scrapreason2', factoryIds: [2], stationIds: [3], groupId: 2,
      },
    ]);
  });

  test('onAlertSubtypeChange', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    expect(wrapper.vm.alertSubtype).toBe(alertSubtypes.EXCEEDS);
    wrapper.vm.onAlertSubtypeChange([alertSubtypes.ADDED]);
    expect(wrapper.vm.alertSubtype).toBe(alertSubtypes.ADDED);
    let emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 2][0].setpoint).toBe(0);
    expect(emitted[emitted.length - 2][0].count).toBe(1);
    expect(emitted[emitted.length - 1][0].commentIds).toEqual([1, 2]);
    wrapper.vm.onAlertSubtypeChange([alertSubtypes.EXCEEDS]);
    emitted = wrapper.emitted()['update:requirements'];
    expect(wrapper.vm.alertSubtype).toBe(alertSubtypes.EXCEEDS);
    expect(emitted[emitted.length - 1][0].setpoint).toBe(null);
    expect(emitted[emitted.length - 1][0].count).toBe(1);
    wrapper.vm.onAlertSubtypeChange([alertSubtypes.REPEATS]);
    emitted = wrapper.emitted()['update:requirements'];
    expect(wrapper.vm.alertSubtype).toBe(alertSubtypes.REPEATS);
    expect(emitted[emitted.length - 2][0].count).toBe(null);
    expect(emitted[emitted.length - 2][0].setpoint).toBe(0);
    expect(emitted[emitted.length - 1][0].commentIds).toEqual([0, 1, 2]);
  });

  test('resetTrigger', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60,
          count: 5,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [1],
          positionIds: [1, 2],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 60 * 60,
          count: 3,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          positionIds: [],
        },
      },
      global: createGlobal(),
    });
    await flushPromises();
    wrapper.vm.resetTrigger();
    const emitted = wrapper.emitted()['update:requirements'];
    expect(emitted[emitted.length - 1][0]).toEqual({
      type: alertTypes.STOPREASON,
      commentIds: [],
      setpoint: 60 * 60,
      count: 3,
      positionIds: [],
    });
  });

  test('isTriggerResetDisabled returns false when positionIds differ for STOPREASON', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 3600,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          positionIds: [1, 2],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 3600,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          positionIds: [],
        },
        filteredPositions: [
          { id: 1, primaryName: 'Position A', stationIds: [1] },
          { id: 2, primaryName: 'Position B', stationIds: [2] },
        ],
      },
      global: createGlobal(),
    });
    await flushPromises();

    // Reset should be enabled because positionIds differ
    expect(wrapper.vm.isTriggerResetDisabled).toBe(false);
  });

  test('isTriggerResetDisabled returns true when all fields including positionIds match for STOPREASON', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 3600,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          positionIds: [1],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 3600,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          positionIds: [1],
        },
        filteredPositions: [
          { id: 1, primaryName: 'Position A', stationIds: [1] },
        ],
      },
      global: createGlobal(),
    });
    await flushPromises();

    // Reset should be disabled because all fields match
    expect(wrapper.vm.isTriggerResetDisabled).toBe(true);
  });

  describe('filteredPositionsByComments', () => {
    const positions = [
      { id: 1, primaryName: 'Position A', commentIds: [], commentsEnabled: true, stationIds: [1] },
      { id: 2, primaryName: 'Position B', commentIds: [1], commentsEnabled: true, stationIds: [1] },
      { id: 3, primaryName: 'Position C', commentIds: [2], commentsEnabled: true, stationIds: [1] },
      { id: 4, primaryName: 'Position D', commentIds: [1, 2], commentsEnabled: true, stationIds: [1] },
    ];

    const createWrapper = (commentIds) => shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 3600,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds,
          positionIds: [],
        },
        savedRequirements: {
          type: alertTypes.STOPREASON,
          setpoint: 3600,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          positionIds: [],
        },
        filteredPositions: positions,
      },
      global: createGlobal(),
    });

    it('returns all positions when no commentIds are selected', async () => {
      const wrapper = createWrapper([]);
      await flushPromises();
      expect(wrapper.vm.filteredPositionsByComments).toEqual(positions);
    });

    it('filters positions by selected commentIds, keeping positions with empty commentIds', async () => {
      const wrapper = createWrapper([1]);
      await flushPromises();
      expect(wrapper.vm.filteredPositionsByComments).toEqual([
        positions[0], // commentIds: [] — always shown
        positions[1], // commentIds: [1] — matches
        positions[3], // commentIds: [1, 2] — matches
      ]);
    });

    it('shows only matching positions and unrestricted positions', async () => {
      const wrapper = createWrapper([2]);
      await flushPromises();
      expect(wrapper.vm.filteredPositionsByComments).toEqual([
        positions[0], // commentIds: [] — always shown
        positions[2], // commentIds: [2] — matches
        positions[3], // commentIds: [1, 2] — matches
      ]);
    });

    it('excludes positions with commentsEnabled false', async () => {
      const positionsWithDisabled = [
        ...positions,
        { id: 5, primaryName: 'Position E', commentIds: [], commentsEnabled: false, stationIds: [1] },
      ];
      const wrapper = shallowMount(AlertTriggerBlock, {
        props: {
          requirements: {
            type: alertTypes.STOPREASON,
            setpoint: 3600,
            count: 1,
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [1],
            positionIds: [],
          },
          savedRequirements: {
            type: alertTypes.STOPREASON,
            setpoint: 3600,
            count: 1,
            factoryIds: [],
            stationIds: [],
            productIds: [],
            operatorIds: [],
            commentIds: [],
            positionIds: [],
          },
          filteredPositions: positionsWithDisabled,
        },
        global: createGlobal(),
      });
      await flushPromises();
      expect(wrapper.vm.filteredPositionsByComments).not.toContainEqual(
        expect.objectContaining({ id: 5 }),
      );
    });

    it('returns all positions when commentIds changes from non-empty to empty', async () => {
      const wrapper = createWrapper([1]);
      await flushPromises();
      expect(wrapper.vm.filteredPositionsByComments).toHaveLength(3);

      await wrapper.setProps({
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 3600,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [],
          positionIds: [],
        },
      });
      expect(wrapper.vm.filteredPositionsByComments).toEqual(positions);
    });

    it('updates when commentIds selection changes', async () => {
      const wrapper = createWrapper([1]);
      await flushPromises();
      expect(wrapper.vm.filteredPositionsByComments).toHaveLength(3);

      await wrapper.setProps({
        requirements: {
          type: alertTypes.STOPREASON,
          setpoint: 3600,
          count: 1,
          factoryIds: [],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          commentIds: [2],
          positionIds: [],
        },
      });
      expect(wrapper.vm.filteredPositionsByComments).toEqual([
        positions[0],
        positions[2],
        positions[3],
      ]);
    });
  });

  test('filteredChecklistTemplates if getFactoryIdsByStationIds returns empty array', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [1],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
        savedRequirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [1],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
      },
      global: createGlobal({ feature: { checklists: true } }),
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklistTemplates).toStrictEqual([]);
  });

  test('filteredChecklistTemplates if getFactoryIdsByStationIds does not return empty array', async () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [1],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
        savedRequirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [1],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
      },
      global: createGlobal({
        feature: { checklists: true },
        factory: { factories: [{ id: 1, name: 'factory1' }] },
        station: { stations: [{ id: 11, factoryId: 1 }, { id: 12, factoryId: 1 }] },
      }),
    });
    await flushPromises();
    expect(wrapper.vm.filteredChecklistTemplates).toStrictEqual([{
      id: 1, groupId: 11, stationIds: [11, 12], frequency: { productIds: [1, 2, 3], type: 'CHANGEOVER' },
    }]);
  });
  test('that validate does not emit update:has-trigger-error if type is set in requirements', () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [1],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
        savedRequirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [1],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
      },
      global: createGlobal(),
    });
    wrapper.vm.validate();
    expect(wrapper.emitted()['update:has-trigger-error']).toBeFalsy();
  });

  test('that validate emits update:has-trigger-error with true if type is not set in requirements', () => {
    const wrapper = shallowMount(AlertTriggerBlock, {
      props: {
        requirements: {
          type: null,
          factoryIds: [1],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
        savedRequirements: {
          type: alertTypes.CHECKLIST,
          factoryIds: [1],
          stationIds: [],
          productIds: [],
          operatorIds: [],
          checklistIds: [],
          checklistStatuses: [],
        },
      },
      global: createGlobal(),
    });
    wrapper.vm.validate();
    expect(wrapper.emitted()['update:has-trigger-error']).toEqual([[true]]);
  });
});
