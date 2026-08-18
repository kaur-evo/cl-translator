import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import statisticsApi from '@/api/statisticsApi';

vi.mock('@/api/statisticsApi');
statisticsApi.getOeeSummary = vi.fn();

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          station: {
            stations: [],
          },
        },
      }),
    ],
  },
  ...options,
});

const propsDefault = {
  i: 'string',
  widgetData: { stationId: [] },
  updateTrigger: 0,
  fetchTrigger: 0,
};

describe('DashboardOeeDonutWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when shiftProductionType is missing', () => {
    statisticsApi.getOeeSummary.mockResolvedValueOnce({ current: { delayTime: 0, productionTime: 0 }, previous: { delayTime: 0, productionTime: 0 } });

    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when shiftProductionType is 0', () => {
    statisticsApi.getOeeSummary.mockResolvedValueOnce({ current: { delayTime: 0, productionTime: 0, shiftProductionType: 0 }, previous: { delayTime: 0, productionTime: 0 } });

    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when OEE data doesnt have current delayTime, but has productionTime', async () => {
    statisticsApi.getOeeSummary.mockResolvedValueOnce({ current: { delayTime: 0, productionTime: 1800, shiftProductionType: 2 }, previous: { delayTime: 0, productionTime: 0 } });

    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when OEE data has current delayTime, but doesnt have productionTime', async () => {
    statisticsApi.getOeeSummary.mockResolvedValueOnce({ current: { delayTime: 1800, productionTime: 0, shiftProductionType: 1 }, previous: { delayTime: 0, productionTime: 0 } });

    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when OEE data has current and previous delayTime and productionTime', async () => {
    statisticsApi.getOeeSummary.mockResolvedValueOnce({ current: { delayTime: 1800, productionTime: 3600, shiftProductionType: 2 }, previous: { delayTime: 2000, productionTime: 4000 } });

    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('formattedComparison', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.vm.formattedComparison(1, 2)).toBe('-100%');
    expect(wrapper.vm.formattedComparison(2, 1)).toBe('+100%');
    expect(wrapper.vm.formattedComparison(1, 1)).toBe('0%');
    expect(wrapper.vm.formattedComparison(0, 1)).toBe('-100%');
    expect(wrapper.vm.formattedComparison(1, 0)).toBe('+100%');
    expect(wrapper.vm.formattedComparison(0, 0)).toBe('0%');
    expect(wrapper.vm.formattedComparison(0, 0.8)).toBe('-80%');
    expect(wrapper.vm.formattedComparison(0.8, 0.4)).toBe('+40%');
  });
});
