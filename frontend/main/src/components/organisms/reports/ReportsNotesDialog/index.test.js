import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useReportsConfigStore } from '@/stores';
import statisticsApi from '@/api/statisticsApi';
import mockData from '@/components/organisms/reports/ReportsNotesDialog/mockData';
import configType from '@/stores/reportsConfig/constants/configType';

vi.mock('@/api/statisticsApi');
statisticsApi.getReportData = vi.fn();

const headers = [{
  text: 'Stop reasons', id: 'comment', textKey: 'entityName', width: '200px', isLink: true, defaultDirection: 'asc', relatedParam: 'commentId',
}, {
  textKey: 'operator', id: 'operator', text: 'Operators', type: 'text', defaultDirection: 'asc', relatedParam: 'operatorId',
}, {
  textKey: 'station', id: 'station', text: 'Stations', type: 'text', defaultDirection: 'asc', relatedParam: 'stationId',
}, {
  text: 'Time', id: 'starttime', textKey: 'tableTimeLabel', valueKey: 'xScaleValue', type: 'text', defaultDirection: 'asc',
}, {
  textKey: 'valueLabel', valueKey: 'value', id: 'stopduration', text: 'Duration', align: 'end', type: 'number', defaultDirection: 'desc',
}, {
  textKey: 'notes', id: 'notes', text: 'Notes', type: 'text', defaultDirection: 'asc', noTruncation: true,
}];

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      filterbar: {
        requestFilterState: { type: configType.DOWNTIME },
      },
      genericDialog: {
        dialogData: { dateRange: [], item: { tableTimeLabel: '', xScaleValue: '202200' } },
      },
      ...overrides,
    },
  });
  const reportsConfigStore = useReportsConfigStore(pinia);
  reportsConfigStore.calculatedNotesData = mockData.calculatedNotesData;
  reportsConfigStore.isNotesLoading = false;
  reportsConfigStore.notesTableActiveHeaders = vi.fn(() => headers);
  reportsConfigStore.loadReportsNotesTableData = vi.fn();
  return pinia;
};

const createWrapper = (options = {}) => shallowMount(index, {
  global: { plugins: [createPinia()] },
  ...options,
});

const propsDefault = {};

describe('ReportsNotesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    expect(wrapper.element).toMatchSnapshot();
  });
});
