import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import WidgetTabsRow from './index.vue';

import performanceWidgetType from '@/constants/performanceWidgetType';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    userPreferences: { viewSettings: { usePrimaryUnit: true, performanceWidgetType: performanceWidgetType.UNIT_PER_HOUR } },
    shiftviewTimeline: { batches: new Map([['batch1', { unitId: 'pcs', alternativeUnitId: null, productId: null }]]), currentRoute: null },
    ...overrides,
  },
});

const defaultProps = {
  modelValue: 0,
  widgetsList: [
    { name: 'performance', component: 'performance-widget', type: 'perform' },
    { name: 'OEE', component: 'OEE-widget', type: 'oee' },
  ],
};

describe('WidgetTabsRow', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(WidgetTabsRow, {
      global: { plugins: [createPinia()] },
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with single widget', () => {
    const wrapper = shallowMount(WidgetTabsRow, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: 0,
        widgetsList: [{ name: 'OEE', component: 'OEE-widget', type: 'oee' }],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with dark mode', () => {
    const wrapper = shallowMount(WidgetTabsRow, {
      global: { plugins: [createPinia()] },
      props: {
        ...defaultProps,
        dark: true,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('getTabName', () => {
    it('returns performance widget label if widget component is performance-widget and performance type exists', () => {
      const wrapper = shallowMount(WidgetTabsRow, {
        global: { plugins: [createPinia({
          userPreferences: { viewSettings: { usePrimaryUnit: true, performanceWidgetType: performanceWidgetType.SECOND_PER_SIGNAL } },
        })] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.getTabName({ name: 'performance', component: 'performance-widget', type: 'perform' })).toBe('sec/signal');
    });

    it('returns Speed if widget component is performance-widget and performance type is unknown', () => {
      const wrapper = shallowMount(WidgetTabsRow, {
        global: { plugins: [createPinia({
          userPreferences: { viewSettings: { usePrimaryUnit: true, performanceWidgetType: 'unknown_type' } },
        })] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.getTabName({ name: 'performance', component: 'performance-widget', type: 'perform' })).toBe('Speed');
    });

    it('returns widget title from configuration', () => {
      const wrapper = shallowMount(WidgetTabsRow, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.getTabName({ name: 'measure', component: 'measure-widget', type: 'measure', config: { widgetTitle: 'Custom Title' } })).toBe('Custom Title');
    });

    it('returns widget name as fallback', () => {
      const wrapper = shallowMount(WidgetTabsRow, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.getTabName({ name: 'OEE', component: 'OEE-widget', type: 'oee' })).toBe('OEE');
    });
  });
});
