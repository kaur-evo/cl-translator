import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import PinTooltip from './index.vue';

import {
  useShiftviewTimelineStore,
  useOperatorStore,
  useStationStore,
} from '@/stores/index';

const createPinia = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.batches = new Map([[1, {
    id: 1, productName: 'test product', productSku: 'SKU', unitId: 'test unit',
  }]]);

  const operatorStore = useOperatorStore(pinia);
  operatorStore.operatorsList = [{ id: 1, name: 'operator 1' }, { id: 2, name: 'operator 2' }];

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { id: 1, name: 'station 1', zoneId: 'Europe/Tallinn' };

  return pinia;
};

const createWrapper = (options = {}) => shallowMount(PinTooltip, {
  ...options,
  global: {
    plugins: [createPinia()],
    ...(options.global || {}),
  },
});

describe('PinTooltip', () => {
  describe('snapshots', () => {
    it('renders correctly for unsuccessful checklist pin', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            time: '2024-05-31T08:37:46.000+03:00',
            type: 'check',
            check: {
              conditionAuthenticationRequired: false,
              status: 'UNSUCCESSFUL',
              name: 'test refresh CL',
              elements: [
                {
                  name: 'test element',
                  successful: false,
                  value: false,
                  comment: 'test comment',
                },
              ],
              dateTimeISO: '2024-05-31T08:37:46.000+03:00',
              submissionTimeISO: '2024-05-31T13:41:05.000+03:00',
              doneBy: null,
            },
          },
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly for successful checklist pin', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            time: '2024-05-31T10:37:46.000+03:00',
            type: 'check',
            check: {
              conditionAuthenticationRequired: true,
              status: 'SUCCESSFUL',
              name: 'test refresh CL',
              elements: [
                {
                  name: 'test element',
                  successful: true,
                  value: true,
                  comment: '',
                },
              ],
              dateTimeISO: '2024-05-31T10:37:46.000+03:00',
              submissionTimeISO: '2024-05-31T13:40:58.000+03:00',
              doneBy: 'operator',
            },
          },
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly for missed checklist pin', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            time: '2024-05-31T11:00:00.000+03:00',
            type: 'check',
            check: {
              conditionAuthenticationRequired: true,
              status: 'MISSED',
              name: 'Safety assessment',
              elements: [
                {
                  name: 'test element',
                  successful: false,
                  value: null,
                  comment: '',
                },
              ],
              dateTimeISO: '2024-05-31T11:00:00.000+03:00',
              submissionTimeISO: null,
              doneBy: null,
            },
          },
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly for new checklist pin', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            time: '2024-05-31T11:00:00.000+03:00',
            type: 'check',
            check: {
              conditionAuthenticationRequired: true,
              status: 'NEW',
              name: 'Safety assessment',
              elements: [
                {
                  name: 'test element',
                  successful: false,
                  value: null,
                  comment: '',
                },
              ],
              dateTimeISO: '2024-05-31T11:00:00.000+03:00',
              submissionTimeISO: null,
              doneBy: null,
            },
          },
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly for team pin', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            time: '2024-05-31T08:05:00.000+03:00',
            type: 'team',
            team: {
              operatorIds: [1, 2],
              startTimeISO: '2024-05-31T08:05:00.000+03:00',
              endTimeISO: '2024-05-31T14:30:00.000+03:00',
            },
          },
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly for changeover pin', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            time: '2024-05-31T08:05:00.000+03:00',
            type: 'changeover',
            slice: {
              batchId: 1,
            },
          },
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly for target pin', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            time: '2024-05-31T11:35:00.000+03:00',
            type: 'batchTargetReached',
            batchTarget: {
              batch: {},
              quantity: 100,
              scrap: 9,
              eventTime: '2024-05-31T11:35:00.000+03:00',
            },
          },
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly for random type pin', () => {
      const wrapper = createWrapper({
        propsData: {
          item: {
            time: '2024-05-31T11:35:00.000+03:00',
            type: 'random',
          },
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  test('that getTeamTooltipRows returns correct rows', async () => {
    const team = {
      operatorIds: [1, 2],
      startTimeISO: '2024-05-31T08:05:00.000+03:00',
      endTimeISO: '2024-05-31T14:30:00.000+03:00',
    };
    const wrapper = createWrapper({
      propsData: {
        item: {
          time: '2024-05-31T08:05:00.000+03:00',
          type: 'team',
          team,
        },
      },
    });

    const rows = await wrapper.vm.getTeamTooltipRows(team);
    expect(rows).toEqual([
      { key: 'Start', value: '08:05' },
      { key: 'End', value: '14:30' },
    ]);
  });

  test('that getBatchTargetTooltipRows returns correct rows if batch has scrap', async () => {
    const batchTarget = {
      batch: {
        id: 1,
        productName: 'test product',
        productSku: 'SKU',
        unitId: 'test unit',
      },
      quantity: 100,
      scrap: 9,
      eventTime: '2024-05-31T11:35:00.000+03:00',
    };
    const wrapper = createWrapper({
      propsData: {
        item: {
          time: '2024-05-31T11:35:00.000+03:00',
          type: 'batchTargetReached',
          batchTarget,
        },
      },
    });

    expect(await wrapper.vm.getBatchTargetTooltipRows(batchTarget)).toEqual([
      { key: 'Time', value: '11:35' },
      {
        key: 'Target',
        value: '100',
        valueClass: 'text-primary',
        secondaryValue: ' (9)',
        secondaryClass: 'text-lw-orange',
        tertiaryValue: ' test unit',
      },
    ]);
  });

  test('that getBatchTargetTooltipRows returns correct rows if batch doesnt have scrap', async () => {
    const batchTarget = {
      batch: {
        id: 1,
        productName: 'test product',
        productSku: 'SKU',
        unitId: 'test unit',
      },
      quantity: 100,
      scrap: 0,
      eventTime: '2024-05-31T11:35:00.000+03:00',
    };
    const wrapper = createWrapper({
      propsData: {
        item: {
          time: '2024-05-31T11:35:00.000+03:00',
          type: 'batchTargetReached',
          batchTarget,
        },
      },
    });

    expect(await wrapper.vm.getBatchTargetTooltipRows(batchTarget)).toEqual([
      { key: 'Time', value: '11:35' },
      {
        key: 'Target',
        value: '100',
        valueClass: 'text-primary',
        secondaryValue: '',
        secondaryClass: 'text-lw-orange',
        tertiaryValue: ' test unit',
      },
    ]);
  });

  describe('shouldShowCheckValues', () => {
    const wrapper = createWrapper({
      propsData: {
        item: {
          time: '2024-05-31T11:00:00.000+03:00',
          type: 'check',
          check: {
            elements: [],
          },
        },
      },
    });

    it('returns false when more than 2 elements', () => {
      const check = {
        status: 'SUCCESSFUL',
        elements: [
          { value: true },
          { value: true },
          { value: true },
        ],
      };

      expect(wrapper.vm.shouldShowCheckValues(check)).toBe(false);
    });

    it('returns false for MISSED status', () => {
      const check = {
        status: 'MISSED',
        elements: [{ value: null }],
      };

      expect(wrapper.vm.shouldShowCheckValues(check)).toBe(false);
    });

    it('returns false for NEW status', () => {
      const check = {
        status: 'NEW',
        elements: [{ value: null }],
      };

      expect(wrapper.vm.shouldShowCheckValues(check)).toBe(false);
    });

    it('returns true for SUCCESSFUL status', () => {
      const check = {
        status: 'SUCCESSFUL',
        elements: [{ value: true }],
      };

      expect(wrapper.vm.shouldShowCheckValues(check)).toBe(true);
    });

    it('returns true for UNSUCCESSFUL status with 2 elements that are filled', () => {
      const check = {
        status: 'UNSUCCESSFUL',
        elements: [
          { value: true },
          { value: false },
        ],
      };

      expect(wrapper.vm.shouldShowCheckValues(check)).toBe(true);
    });

    it('returns false for UNSUCCESSFUL status with one null element', () => {
      const check = {
        status: 'UNSUCCESSFUL',
        elements: [
          { value: true },
          { value: null },
        ],
      };

      expect(wrapper.vm.shouldShowCheckValues(check)).toBe(false);
    });

    it('returns false for UNSUCCESSFUL status with 3 elements if all filled', () => {
      const check = {
        status: 'UNSUCCESSFUL',
        elements: [
          { value: true },
          { value: true },
          { value: false },
        ],
      };

      expect(wrapper.vm.shouldShowCheckValues(check)).toBe(false);
    });
  });

  describe('getChecklistTooltipRows', () => {
    const wrapper = createWrapper({
      propsData: {
        item: {
          time: '2024-05-31T11:00:00.000+03:00',
          type: 'check',
          check: {
            elements: [],
          },
        },
      },
    });

    it('returns due time', () => {
      const check = {
        dateTimeISO: '2024-05-31T11:00:00.000+03:00',
        elements: [],
      };

      expect(wrapper.vm.getChecklistTooltipRows(check)[0]).toEqual({
        key: 'Due',
        value: '11:00',
      });
    });

    it('has done if submissionTimeISO is not null', () => {
      const check = {
        submissionTimeISO: '2024-05-31T11:00:00.000+03:00',
        elements: [],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const doneRow = rows.find((row) => row.key === 'Done');
      expect(doneRow).toBeDefined();
      expect(doneRow.value).toEqual('11:00 - 31.05.2024');
    });

    it('doesnt have done if submissionTimeISO is null', () => {
      const check = {
        submissionTimeISO: null,
        elements: [],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const doneRow = rows.find((row) => row.key === 'Done');
      expect(doneRow).toEqual(undefined);
    });

    it('has done by if conditionAuthenticationRequired is true', () => {
      const check = {
        conditionAuthenticationRequired: true,
        doneBy: 'operator',
        elements: [],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const doneByRow = rows.find((row) => row.key === 'Done by');
      expect(doneByRow).toBeDefined();
      expect(doneByRow.value).toEqual('operator');
    });

    it('doesnt have done by if conditionAuthenticationRequired is false', () => {
      const check = {
        conditionAuthenticationRequired: false,
        doneBy: '',
        elements: [],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const doneByRow = rows.find((row) => row.key === 'Done by');
      expect(doneByRow).toEqual(undefined);
    });

    it('shows tasks filled if there are more than 2 elements', () => {
      const check = {
        elements: [
          {
            name: 'test element 1', successful: true, value: true, comment: '',
          },
          {
            name: 'test element 2', successful: false, value: null, comment: '',
          },
          {
            name: 'test element 3', successful: true, value: true, comment: '',
          },
        ],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const summaryRow = rows.find((row) => row.key === 'Tasks filled');
      expect(summaryRow).toBeDefined();
      expect(summaryRow.value).toEqual('2/3 (66,67%)');
    });

    it('shows tasks filled for missed check', () => {
      const check = {
        status: 'MISSED',
        elements: [
          {
            name: 'test element 1', successful: false, value: null, comment: '',
          },
        ],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const summaryRow = rows.find((row) => row.key === 'Tasks filled');
      expect(summaryRow).toBeDefined();
      expect(summaryRow.value).toEqual('0/1 (0%)');
    });

    it('shows tasks filled for new check', () => {
      const check = {
        status: 'NEW',
        elements: [
          {
            name: 'test element 1', successful: false, value: null, comment: '',
          },
        ],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const summaryRow = rows.find((row) => row.key === 'Tasks filled');
      expect(summaryRow).toBeDefined();
      expect(summaryRow.value).toEqual('0/1 (0%)');
    });

    it('shows tasks filled for unsuccessful check with two elements if one is not filled', () => {
      const check = {
        status: 'UNSUCCESSFUL',
        elements: [
          {
            name: 'test element 1', successful: false, value: true, comment: '',
          },
          {
            name: 'test element 2', successful: false, value: null, comment: '',
          },
        ],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const summaryRow = rows.find((row) => row.key === 'Tasks filled');
      expect(summaryRow).toBeDefined();
      expect(summaryRow.value).toEqual('1/2 (50%)');
    });

    it('shows tasks filled for check with two elements if one is not applicable', () => {
      const check = {
        status: 'UNSUCCESSFUL',
        elements: [
          {
            name: 'test element 1', successful: false, value: null, comment: '',
          },
          {
            name: 'test element 2', successful: false, value: null, comment: '', notApplicableEnabled: true, valueNotApplicable: true,
          },
        ],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const summaryRow = rows.find((row) => row.key === 'Tasks filled');
      expect(summaryRow).toBeDefined();
      expect(summaryRow.value).toEqual('1/2 (50%)');
    });

    it('shows descriprion and value for successful element with two elements', () => {
      const check = {
        status: 'SUCCESSFUL',
        elements: [
          {
            type: 'MEASUREMENT', name: 'test element 1', successful: true, value: 12, unit: 'unit', comment: '',
          },
          {
            name: 'test element 2', successful: true, value: true, comment: '',
          },
        ],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const row1 = rows.find((row) => row.key === 'test element 1');
      expect(row1).toBeDefined();
      expect(row1.value).toEqual('12 unit');
      const row2 = rows.find((row) => row.key === 'test element 2');
      expect(row2).toBeDefined();
      expect(row2.value).toEqual('Yes');
    });

    it('has comment row with number of comments', () => {
      const check = {
        elements: [
          {
            name: 'test element 1', successful: true, value: true, comment: 'test comment',
          },
          {
            name: 'test element 2', successful: true, value: true, comment: '',
          },
        ],
      };

      const rows = wrapper.vm.getChecklistTooltipRows(check);
      const commentRow = rows.find((row) => row.key === 'Extra note');
      expect(commentRow).toBeDefined();
      expect(commentRow.value).toEqual(1);
    });
  });
});
