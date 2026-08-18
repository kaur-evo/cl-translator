import { shallowMount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { mdiPoll, mdiAlignHorizontalLeft } from '@mdi/js';

import index from './index.vue';

import { useConfigurationStore } from '@/stores/index';
import {
  DELAYS_CHART, OEE_CHART, OEE_DONUT, SCRAP_CHART, SPEEDLOSS_CHART, CHECKLIST_WIDGET,
} from '@/constants/dashboardWidgetTypes';
import { CUSTOM, TODAY } from '@/constants/predefinedTimePeriodNames';
import filterItemsApi from '@/api/filterItemsApi';
import { CHECKLIST, GROUP, REASON } from '@/constants/widgetViewTypes';

vi.mock('@/api/filterItemsApi');
filterItemsApi.getFilterItems = vi.fn();

const defaultDialogData = {
  widget: {
    config: {
      comparisonType: 'COMPARISON_TYPE',
      factoryId: [11],
      measure: 'measure',
      periodName: 'periodName',
      top: 10,
      stationId: [21, 22, 23],
      target: 0,
      trendEnabled: false,
      type: 'oeechart',
      viewBy: 'reasons',
      widgetName: 'Widget name',
    },
  },
};

const defaultInitialState = {
  genericDialog: {
    dialogData: defaultDialogData,
  },
  factory: {
    factories: [{ id: 11, name: 'Factory 1' }, { id: 12, name: 'Factory 2' }],
  },
  station: {
    stations: [{ id: 21, name: 'Station 1', groupId: 31 }, { id: 22, name: 'Station 2', groupId: 32 }, { id: 23, name: 'Station 3', groupId: 32 }],
    stationGroups: [{ id: 31, name: 'Group 1' }, { id: 32, name: 'Group 2' }],
  },
  comment: {
    commentGroupsList: [],
  },
  perfComment: {
    perfCommentGroupsList: [],
  },
  scrapReason: {
    scrapReasonGroupsList: [],
  },
  position: {
    positions: [],
  },
  configuration: {
    configuration: {
      includeNoDataDatapoints: true,
    },
  },
  checklistTemplate: {
    checklistTemplates: [],
    checklistGroups: [],
  },
};

const mergeInitialState = (base, override = {}) => {
  const result = { ...base };
  Object.keys(override).forEach((key) => {
    result[key] = { ...base[key], ...override[key] };
  });
  return result;
};

const createWrapper = (options = {}) => {
  const { initialState: stateOverride, checklistStations = [21, 22, 23], checklistFactories = [{ id: 12, name: 'Factory 2' }], ...mountOptions } = options;
  const mergedState = mergeInitialState(defaultInitialState, stateOverride);
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: mergedState,
  });
  const configStore = useConfigurationStore(pinia);
  vi.spyOn(configStore, 'checklistStations', 'get').mockReturnValue(checklistStations);
  vi.spyOn(configStore, 'checklistFactories', 'get').mockReturnValue(checklistFactories);
  return shallowMount(index, {
    global: {
      plugins: [pinia],
      stubs: ['router-link', 'router-view'],
    },
    ...mountOptions,
  });
};

const propsDefault = {};

describe('DashboardWidgetEdit', () => {
  it('renders', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly without access to checklists', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      checklistStations: [],
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if there are no factories', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      initialState: {
        genericDialog: {
          dialogData: {
            widget: { config: { ...defaultDialogData.widget.config, factoryId: [] } },
          },
        },
        factory: { factories: [] },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if widget type is oeechart and content overflows', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      initialState: {
        genericDialog: {
          dialogData: {
            widget: { config: { ...defaultDialogData.widget.config, type: 'oeechart' } },
          },
        },
      },
    });

    wrapper.vm.typeSelectionContainer = {
      scrollWidth: 2000,
      parentElement: { offsetWidth: 1000 },
    };

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if widget type is oeechart', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if widget type is oeedonut', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      initialState: {
        genericDialog: {
          dialogData: {
            widget: { config: { ...defaultDialogData.widget.config, type: 'oeedonut' } },
          },
        },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if widget type is delayschart', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      initialState: {
        genericDialog: {
          dialogData: {
            widget: { config: { ...defaultDialogData.widget.config, type: 'delayschart' } },
          },
        },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if widget type is speedlosschart', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      initialState: {
        genericDialog: {
          dialogData: {
            widget: { config: { ...defaultDialogData.widget.config, type: 'speedlosschart' } },
          },
        },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if widget type is scrapchart', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      initialState: {
        genericDialog: {
          dialogData: {
            widget: { config: { ...defaultDialogData.widget.config, type: 'scrapchart' } },
          },
        },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if widget period is custom', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      initialState: {
        genericDialog: {
          dialogData: {
            widget: { config: { ...defaultDialogData.widget.config, periodName: CUSTOM, range: { start: '2023-01-01', end: '2023-01-31' } } },
          },
        },
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if widget type is CHECKLIST_WIDGET', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
      initialState: {
        genericDialog: {
          dialogData: {
            widget: { config: { ...defaultDialogData.widget.config, type: 'CHECKLIST_WIDGET' } },
          },
        },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('areScrollingArrowsVisible', () => {
    it('returns true when content overflows and breakpoint is not mdAndDown', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.typeSelectionContainer = {
        scrollWidth: 2000,
        parentElement: { offsetWidth: 1000 },
      };
      wrapper.vm.$vuetify.display.mdAndDown = false;
      expect(wrapper.vm.areScrollingArrowsVisible).toBe(true);
    });

    it('returns false when breakpoint is mdAndDown', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.typeSelectionContainer = {
        scrollWidth: 2000,
        parentElement: { offsetWidth: 1000 },
      };
      wrapper.vm.$vuetify.display.mdAndDown = true;
      expect(wrapper.vm.areScrollingArrowsVisible).toBe(false);
    });

    it('returns false when typeSelectionContainer is null', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.typeSelectionContainer = null;
      expect(wrapper.vm.areScrollingArrowsVisible).toBe(false);
    });

    it('returns false when container does not overflow and breakpoint is not mdAndDown', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.typeSelectionContainer = {
        scrollWidth: 500,
        parentElement: { offsetWidth: 1000 },
      };
      wrapper.vm.$vuetify.display.mdAndDown = false;
      expect(wrapper.vm.areScrollingArrowsVisible).toBe(false);
    });
  });

  test('that entityIds array is empty, when type is changed from delayschart to speedlosschart', async () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    wrapper.setData({ formData: { type: DELAYS_CHART, entityIds: [1, 2, 3] } });
    wrapper.vm.onWidgetTypeChange(SPEEDLOSS_CHART);
    expect(wrapper.vm.formData.type).toBe(SPEEDLOSS_CHART);
    expect(wrapper.vm.formData.entityIds).toEqual([]);
  });

  test('that entityIds array is empty, when type is changed from delayschart to scrapchart', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    wrapper.setData({ formData: { type: DELAYS_CHART, entityIds: [1, 2, 3] } });
    wrapper.vm.onWidgetTypeChange(SCRAP_CHART);
    expect(wrapper.vm.formData.type).toBe(SCRAP_CHART);
    expect(wrapper.vm.formData.entityIds).toEqual([]);
  });

  test('that entityIds array is not changed, when type is not changed', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    wrapper.setData({ formData: { type: DELAYS_CHART, entityIds: [1, 2, 3] } });
    wrapper.vm.onWidgetTypeChange(DELAYS_CHART);
    expect(wrapper.vm.formData.type).toBe(DELAYS_CHART);
    expect(wrapper.vm.formData.entityIds).toEqual([1, 2, 3]);
  });

  test('that onWidgetTypeChange calls scrollSelectedWidgetTypeIntoView', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    const scrollSelectedWidgetTypeIntoViewSpy = vi.spyOn(wrapper.vm, 'scrollSelectedWidgetTypeIntoView');
    wrapper.vm.onWidgetTypeChange(OEE_CHART);
    expect(scrollSelectedWidgetTypeIntoViewSpy).toHaveBeenCalled();
  });

  test('that scrollSelectedWidgetTypeIntoView calls scrollIntoView on selected widget type', () => {
    const scrollIntoViewMock = vi.fn();
    const fakeEl = { scrollIntoView: scrollIntoViewMock };
    window.document.getElementById = vi.fn().mockReturnValue(fakeEl);
    const wrapper = createWrapper({ props: { ...propsDefault } });
    wrapper.vm.formData.type = OEE_CHART;
    wrapper.vm.scrollSelectedWidgetTypeIntoView();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', inline: 'center' });
    expect(document.getElementById).toHaveBeenCalledWith(`widget-type-${OEE_CHART}`);
  });

  test('that scrollSelectedWidgetTypeIntoView is called on mounted', async () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    const scrollSelectedWidgetTypeIntoViewSpy = vi.spyOn(wrapper.vm, 'scrollSelectedWidgetTypeIntoView');
    await flushPromises();
    expect(scrollSelectedWidgetTypeIntoViewSpy).toHaveBeenCalled();
  });

  describe('targetHint', () => {
    it('should return the correct target hint for OEE_DONUT type', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { type: OEE_DONUT } });
      expect(wrapper.vm.targetHint).toBe('Please enter target: OEE % (optional)');
    });

    it('should return the correct target hint for OEE_CHART type with measure oee', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { type: OEE_CHART, measure: 'oee' } });
      expect(wrapper.vm.targetHint).toBe('Please enter target: OEE % (optional)');
    });

    it('should return the correct target hint for OEE_CHART type with measure availability', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { type: OEE_CHART, measure: 'availability' } });
      expect(wrapper.vm.targetHint).toBe('Please enter target: availability % (optional)');
    });

    it('should return the correct target hint for OEE_CHART type with measure quality', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { type: OEE_CHART, measure: 'quality' } });
      expect(wrapper.vm.targetHint).toBe('Please enter target: quality % (optional)');
    });

    it('returns the correct target hint for OEE_CHART type with measure performance', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { type: OEE_CHART, measure: 'performance' } });
      expect(wrapper.vm.targetHint).toBe('Please enter target: performance % (optional)');
    });

    it('returns the correct target hint for OEE_CHART type with measure technicalavailability', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { type: OEE_CHART, measure: 'technicalavailability' } });
      expect(wrapper.vm.targetHint).toBe('Please enter target: Technical availability % (optional)');
    });

    it('should return the correct target hint for OEE_CHART type with other measure', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { type: OEE_CHART, measure: 'unknown' } });
      expect(wrapper.vm.targetHint).toBe('Please enter target: qty (optional)');
    });
  });

  describe('onSaveClick', () => {
    it('does not call saveWidget and closeDialog if form is invalid', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = false;
      };
      wrapper.vm.saveWidget = vi.fn();
      wrapper.vm.closeDialog = vi.fn();
      await wrapper.vm.onSaveClick();
      expect(wrapper.vm.saveWidget).not.toHaveBeenCalled();
      expect(wrapper.vm.closeDialog).not.toHaveBeenCalled();
    });

    it('calls saveWidget and closeDialog for valid non-custom period', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        initialState: {
          genericDialog: {
            dialogData: {
              widget: {
                config: {
                  comparisonType: 'COMPARISON_TYPE',
                  factoryId: [11],
                  measure: 'measure',
                  periodName: TODAY,
                  top: 10,
                  stationId: [21, 22, 23],
                  target: 0,
                  trendEnabled: false,
                  type: OEE_CHART,
                  viewBy: 'reasons',
                  widgetName: 'Widget name',
                },
              },
            },
          },
        },
      });
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = true;
      };
      wrapper.vm.saveWidget = vi.fn();
      wrapper.vm.closeDialog = vi.fn();
      wrapper.vm.setFormData();
      await wrapper.vm.onSaveClick();
      expect(wrapper.vm.saveWidget).toHaveBeenCalledWith({
        formData: wrapper.vm.formData,
        currentWidget: wrapper.vm.currentWidget,
      });
      expect(wrapper.vm.closeDialog).toHaveBeenCalled();
    });

    it('calls saveWidget with range and closeDialog for valid custom period', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        initialState: {
          genericDialog: {
            dialogData: {
              widget: {
                config: {
                  comparisonType: 'COMPARISON_TYPE',
                  factoryId: [11],
                  measure: 'measure',
                  periodName: CUSTOM,
                  range: { start: '2025-08-14', end: '2025-08-15' },
                  top: 10,
                  stationId: [21, 22, 23],
                  target: 0,
                  trendEnabled: false,
                  type: OEE_CHART,
                  viewBy: 'reasons',
                  widgetName: 'Widget name',
                },
              },
            },
          },
        },
      });
      wrapper.vm.$refs.form.validate = () => {
        wrapper.vm.valid = true;
      };
      wrapper.vm.saveWidget = vi.fn();
      wrapper.vm.closeDialog = vi.fn();
      wrapper.vm.setFormData();
      wrapper.vm.dateRange = ['2025-08-14', '2025-08-18'];
      await wrapper.vm.onSaveClick();
      expect(wrapper.vm.saveWidget).toHaveBeenCalledWith({
        formData: { ...wrapper.vm.formData, range: { start: '2025-08-14', end: '2025-08-18' } },
        currentWidget: wrapper.vm.currentWidget,
      });
      expect(wrapper.vm.closeDialog).toHaveBeenCalled();
    });
  });

  describe('setNewWidgetName', () => {
    it('does not change widget name if it is not default', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { widgetName: 'Custom name' } });
      wrapper.vm.setNewWidgetName(OEE_CHART);
      expect(wrapper.vm.formData.widgetName).toBe('Custom name');
    });

    it('changes widget name to type default if it was default name before', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { widgetName: 'OEE', type: SCRAP_CHART } });
      wrapper.vm.setNewWidgetName(OEE_DONUT);
      expect(wrapper.vm.formData.widgetName).toBe('Scrap reasons');
    });
  });

  describe('scroll navigation', () => {
    it('calls scroll with -1 when moveLeft is called', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      const scrollSpy = vi.spyOn(wrapper.vm, 'scroll').mockImplementation(() => {});
      wrapper.vm.moveLeft();
      expect(scrollSpy).toHaveBeenCalledWith(-1);
    });

    it('calls scroll with 1 when moveRight is called', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      const scrollSpy = vi.spyOn(wrapper.vm, 'scroll').mockImplementation(() => {});
      wrapper.vm.moveRight();
      expect(scrollSpy).toHaveBeenCalledWith(1);
    });

    test('that both arrows are enabled when scroll position is in the middle', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.typeSelectionContainer = {
        offsetWidth: 500, scrollLeft: 0, scrollWidth: 1500, scrollTo: vi.fn(),
      };
      wrapper.vm.scrollPosition = 500;
      expect(wrapper.vm.leftArrowEnabled).toBe(true);
      expect(wrapper.vm.rightArrowEnabled).toBe(true);
    });

    test('that left arrow is disabled when scrolling to a start position', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.typeSelectionContainer = {
        offsetWidth: 500, scrollLeft: 500, scrollWidth: 1500, scrollTo: vi.fn(),
      };
      wrapper.vm.scroll(-1);
      wrapper.vm.scrollPosition = 0;
      expect(wrapper.vm.leftArrowEnabled).toBe(false);
      expect(wrapper.vm.rightArrowEnabled).toBe(true);
    });

    test('that right arrow is disabled when scrolling to an end position', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.typeSelectionContainer = {
        offsetWidth: 500, scrollLeft: 1000, scrollWidth: 1500, scrollTo: vi.fn(),
      };
      wrapper.vm.scroll(1);
      wrapper.vm.scrollPosition = 1000;
      expect(wrapper.vm.leftArrowEnabled).toBe(true);
      expect(wrapper.vm.rightArrowEnabled).toBe(false);
    });
  });

  describe('shownFactories', () => {
    it('shows all factories for other types than checklist widget', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        initialState: {
          factory: { factories: [{ id: 11, name: 'Factory 1' }, { id: 12, name: 'Factory 2' }] },
        },
      });
      wrapper.setData({ formData: { type: OEE_CHART } });
      expect(wrapper.vm.shownFactories).toEqual([
        { id: 11, name: 'Factory 1' },
        { id: 12, name: 'Factory 2' },
      ]);
    });

    it('shows only checklist factories for checklist widget type', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        initialState: {
          factory: { factories: [{ id: 11, name: 'Factory 1' }, { id: 12, name: 'Factory 2' }] },
        },
        checklistFactories: [{ id: 12, name: 'Factory 2' }],
      });
      wrapper.setData({ formData: { type: CHECKLIST_WIDGET } });
      expect(wrapper.vm.shownFactories).toEqual([{ id: 12, name: 'Factory 2' }]);
    });
  });

  describe('filteredStations', () => {
    it('returns all stations if factory is not selected and type is not checklist widget', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.setData({ formData: { type: OEE_CHART, factoryIds: [] } });
      expect(wrapper.vm.filteredStations).toEqual([
        { id: 21, name: 'Station 1', groupId: 31 },
        { id: 22, name: 'Station 2', groupId: 32 },
        { id: 23, name: 'Station 3', groupId: 32 },
      ]);
    });

    it('returns only checklist stations if factory is not selected and type is checklist widget', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        checklistStations: [21, 22],
      });
      wrapper.setData({ formData: { type: CHECKLIST_WIDGET, factoryIds: [] } });
      expect(wrapper.vm.filteredStations).toEqual([
        { id: 21, name: 'Station 1', groupId: 31 },
        { id: 22, name: 'Station 2', groupId: 32 },
      ]);
    });

    it('returns stations filtered by factory if factory is selected and type is not checklist widget', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        initialState: {
          station: {
            stations: [
              { id: 21, name: 'Station 1', groupId: 31, factoryId: 11 },
              { id: 22, name: 'Station 2', groupId: 32, factoryId: 11 },
              { id: 23, name: 'Station 3', groupId: 32, factoryId: 12 },
            ],
            stationGroups: [{ id: 31, name: 'Group 1' }, { id: 32, name: 'Group 2' }],
          },
        },
      });
      wrapper.setData({ formData: { type: OEE_CHART, factoryIds: [11] } });
      expect(wrapper.vm.filteredStations).toEqual([
        { id: 21, name: 'Station 1', groupId: 31, factoryId: 11 },
        { id: 22, name: 'Station 2', groupId: 32, factoryId: 11 },
      ]);
    });

    it('returns checklist stations filtered by factory and checklistStations if factory is selected and type is checklist widget', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
        initialState: {
          station: {
            stations: [
              { id: 21, name: 'Station 1', groupId: 31, factoryId: 11 },
              { id: 22, name: 'Station 2', groupId: 32, factoryId: 11 },
              { id: 23, name: 'Station 3', groupId: 32, factoryId: 12 },
            ],
            stationGroups: [{ id: 31, name: 'Group 1' }, { id: 32, name: 'Group 2' }],
          },
        },
        checklistStations: [22, 23],
      });
      wrapper.setData({ formData: { type: CHECKLIST_WIDGET, factoryIds: [11] } });
      expect(wrapper.vm.filteredStations).toEqual([
        { id: 22, name: 'Station 2', groupId: 32, factoryId: 11 },
      ]);
    });
  });

  describe('viewByOptions', () => {
    it('returns correct options if type is CHECKLIST_WIDGET', () => {
      const wrapper = createWrapper({ props: propsDefault });
      wrapper.vm.formData.type = CHECKLIST_WIDGET;
      expect(wrapper.vm.viewByOptions).toEqual([
        { name: CHECKLIST, display: 'Checklist name' },
        { name: GROUP, display: 'Checklist groups' },
      ]);
    });

    it('returns correct options if type is DELAYS_CHART and there are no positions', () => {
      const wrapper = createWrapper({ props: propsDefault });
      wrapper.vm.formData.type = DELAYS_CHART;
      expect(wrapper.vm.viewByOptions).toEqual([
        { name: REASON, display: 'Reasons' },
        { name: GROUP, display: 'Groups' },
      ]);
    });
  });

  test('that displayTypes returns correct values', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });
    expect(wrapper.vm.displayTypes).toEqual([
      { mode: 'checklist', text: 'Individual checklists', icon: mdiAlignHorizontalLeft },
      { mode: 'timeline', text: 'Timeline', icon: mdiPoll },
    ]);
  });
});
