import { flushPromises, shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { useRoute, useRouter } from 'vue-router';
import { mdiCircleOutline, mdiCheckboxMarkedCircle } from '@mdi/js';

import ProductTour from './index.vue';

import {
  SHIFT_VIEW, REALTIME, TIMELINE, ALL_FACTORIES, DASHBOARD, REPORTS, SETTINGS,
} from '@/constants/routeNames';
import { COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER } from '@/constants/userRoles';
import productTourApi from '@/api/productTourApi';
import { getDashboardProductTourConfig } from '@/constants/productTourConfigs/dashboardProductTourConfig';
import { getFactoryOverviewProductTourConfig } from '@/constants/productTourConfigs/factoryOverviewProductTourConfig';
import { getReportsProductTourConfig } from '@/constants/productTourConfigs/reportsProductTourConfig';
import { getShiftViewProductTourConfig } from '@/constants/productTourConfigs/shiftViewProductTourConfig';
import { useFeatureStore, useProfileStore } from '@/stores/index';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock('@/api/productTourApi');
productTourApi.getFlowStates.mockResolvedValue({});
productTourApi.updateFlowStates.mockResolvedValue({});

const createWrapper = ({
  route = { name: 'name' },
  productTourEnabled = true,
  highestRoleAllows = () => true,
  ...piniaOverrides
} = {}) => {
  useRoute.mockReturnValue(route.value ?? route);

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: piniaOverrides,
  });
  useProfileStore(pinia).highestRoleAllows = highestRoleAllows;
  useFeatureStore(pinia).productTourEnabled = productTourEnabled;

  return shallowMount(ProductTour, {
    global: {
      mocks: { $route: route },
      plugins: [pinia],
    },
  });
};

describe('ProductTour', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2020-01-01T12:34:33'));
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders', () => {
    expect(createWrapper().exists()).toBe(true);
  });

  it('renders correctly if module is not recognized', () => {
    expect(createWrapper().element).toMatchSnapshot();
  });

  it('renders correctly if highestRoleAllows is false', () => {
    const wrapper = createWrapper({
      route: { name: SHIFT_VIEW },
      highestRoleAllows: () => false,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if list is opened and one of the flows is selected', async () => {
    productTourApi.getFlowStates.mockResolvedValue({
      [SHIFT_VIEW]: {
        closed: false,
        flows: {
          svWelcome: false, svIntro: false, svDtTracking: false, svMonitoring: false, svRecording: false, svEngagement: false,
        },
      },
    });

    const wrapper = createWrapper({
      route: { name: SHIFT_VIEW },
      profile: { highestUserRole: OFFICE_USER },
    });
    wrapper.vm.isListOpened = true;
    wrapper.vm.onFlowSelected('svRecording');

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if list is opened and none of the flows are selected', async () => {
    productTourApi.getFlowStates.mockResolvedValue({
      [REPORTS]: {
        closed: false,
        flows: {
          reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false,
        },
      },
    });

    const route = ref({ name: 'name' });
    const wrapper = createWrapper({ route, profile: { highestUserRole: OFFICE_USER } });

    await flushPromises();
    route.value.name = REPORTS;
    await nextTick();
    wrapper.vm.isListOpened = true;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if all list items will be completed and product tour is still visible', async () => {
    productTourApi.getFlowStates.mockResolvedValue({
      [REPORTS]: {
        closed: false,
        flows: {
          reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: false,
        },
      },
    });

    productTourApi.updateFlowStates.mockResolvedValue({
      [REPORTS]: {
        closed: false,
        flows: {
          reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: true,
        },
      },
    });

    const wrapper = createWrapper({
      route: { name: REPORTS },
      profile: { highestUserRole: OFFICE_USER },
    });
    wrapper.vm.isListOpened = true;
    wrapper.vm.onFlowSelected('reportsExporting');
    await wrapper.vm.onFinishFlow();

    wrapper.vm.onCloseFlowCard();

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if all list items are already completed and tour is not closed', async () => {
    productTourApi.getFlowStates.mockResolvedValue({
      [REPORTS]: {
        closed: false,
        flows: {
          reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: true,
        },
      },
    });

    const route = ref({ name: 'name' });
    const wrapper = createWrapper({ route, profile: { highestUserRole: OFFICE_USER } });

    await flushPromises();
    route.value.name = REPORTS;
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if all list items are already completed and tour is closed', async () => {
    productTourApi.getFlowStates.mockResolvedValue({
      [REPORTS]: {
        closed: true,
        flows: {
          reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: true,
        },
      },
    });

    const wrapper = createWrapper({ route: { name: REPORTS } });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('moduleName', () => {
    it('returns empty string if route name does not exist', () => {
      const wrapper = createWrapper({ route: {} });
      expect(wrapper.vm.moduleName).toBe('');
    });

    it('returns ALL_FACTORIES if route name is REALTIME', () => {
      const wrapper = createWrapper({ route: { name: REALTIME } });
      expect(wrapper.vm.moduleName).toBe(ALL_FACTORIES);
    });

    it('returns ALL_FACTORIES if route name is TIMELINE', () => {
      const wrapper = createWrapper({ route: { name: TIMELINE } });
      expect(wrapper.vm.moduleName).toBe(ALL_FACTORIES);
    });

    it('returns route name', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      expect(wrapper.vm.moduleName).toBe(REPORTS);
    });
  });

  describe('tourTitle', () => {
    it('returns empty string if route name does not exist', () => {
      expect(createWrapper({ route: {} }).vm.tourTitle).toBe('');
    });

    it('returns Learn shift view if route name is SHIFT_VIEW', () => {
      expect(createWrapper({ route: { name: SHIFT_VIEW } }).vm.tourTitle).toBe('Learn Shift View');
    });

    it('returns Learn factory overview if route name is REALTIME', () => {
      expect(createWrapper({ route: { name: REALTIME } }).vm.tourTitle).toBe('Learn Factory Overview');
    });

    it('returns Learn factory overview if route name is TIMELINE', () => {
      expect(createWrapper({ route: { name: TIMELINE } }).vm.tourTitle).toBe('Learn Factory Overview');
    });

    it('returns Learn dashboard if route name is DASHBOARD', () => {
      expect(createWrapper({ route: { name: DASHBOARD } }).vm.tourTitle).toBe('Learn Dashboard');
    });

    it('returns Learn reports if route name is REPORTS', () => {
      expect(createWrapper({ route: { name: REPORTS } }).vm.tourTitle).toBe('Learn Reports');
    });
  });

  describe('currentConfig', () => {
    it('returns empty object if module name is not recognized', () => {
      expect(createWrapper({ route: { name: 'name' } }).vm.currentConfig).toEqual({});
    });

    it('returns correct config if module name is SHIFT_VIEW', () => {
      const wrapper = createWrapper({ route: { name: SHIFT_VIEW } });
      const flowStates = {
        closed: false,
        flows: {
          svWelcome: false, svIntro: false, svDtTracking: false, svMonitoring: false, svRecording: false, svEngagement: false,
        },
      };
      expect(wrapper.vm.currentConfig).toEqual(getShiftViewProductTourConfig(flowStates));
    });

    it('returns correct config if module name is REALTIME', () => {
      const wrapper = createWrapper({ route: { name: REALTIME } });
      const flowStates = {
        closed: false,
        flows: {
          foIntro: false, foLiveIntro: false, foTimelineIntro: false, foGrid: false,
        },
      };
      expect(wrapper.vm.currentConfig).toEqual(getFactoryOverviewProductTourConfig(flowStates));
    });

    it('returns correct config if module name is TIMELINE', () => {
      const wrapper = createWrapper({ route: { name: TIMELINE } });
      const flowStates = {
        closed: false,
        flows: {
          foIntro: false, foLiveIntro: false, foTimelineIntro: false, foGrid: false,
        },
      };
      expect(wrapper.vm.currentConfig).toEqual(getFactoryOverviewProductTourConfig(flowStates));
    });

    it('returns correct config if module name is DASHBOARD', () => {
      const wrapper = createWrapper({ route: { name: DASHBOARD } });
      const flowStates = {
        closed: false,
        flows: { dbOverview: false, dbCreation: false, dbInvolving: false },
      };
      expect(wrapper.vm.currentConfig).toEqual(getDashboardProductTourConfig(flowStates));
    });

    it('returns correct config if module name is REPORTS', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      const flowStates = {
        closed: false,
        flows: {
          reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false,
        },
      };
      expect(wrapper.vm.currentConfig).toEqual(getReportsProductTourConfig(flowStates));
    });
  });

  describe('tourDescription', () => {
    it('returns empty string if module name is not recognized', () => {
      expect(createWrapper({ route: { name: 'name' } }).vm.tourDescription).toBe('');
    });

    it('returns correct text if module name is SHIFT_VIEW', () => {
      expect(createWrapper({ route: { name: SHIFT_VIEW } }).vm.tourDescription).toBe('How to optimize your production with Shift View.');
    });

    it('returns correct text if module name is REALTIME', () => {
      expect(createWrapper({ route: { name: REALTIME } }).vm.tourDescription).toBe('Basics of how you can monitor the performance of your factory(s).');
    });

    it('returns correct text if module name is TIMELINE', () => {
      expect(createWrapper({ route: { name: TIMELINE } }).vm.tourDescription).toBe('Basics of how you can monitor the performance of your factory(s).');
    });

    it('returns correct text if module name is DASHBOARD', () => {
      expect(createWrapper({ route: { name: DASHBOARD } }).vm.tourDescription).toBe('How Evocon makes your production data accessible and actionable.');
    });

    it('returns correct text if module name is REPORTS', () => {
      expect(createWrapper({ route: { name: REPORTS } }).vm.tourDescription).toBe('How Evocon supports the analysis of your production data.');
    });
  });

  describe('listItems', () => {
    it('returns correct items if module name is SHIFT_VIEW', () => {
      const wrapper = createWrapper({ route: { name: SHIFT_VIEW } });
      const flowStates = {
        closed: false,
        flows: {
          svWelcome: false, svIntro: false, svDtTracking: false, svMonitoring: false, svRecording: false, svEngagement: false,
        },
      };
      expect(wrapper.vm.listItems).toEqual(Object.values(getShiftViewProductTourConfig(flowStates).flows));
    });

    it('returns correct items if module name is REALTIME', () => {
      const wrapper = createWrapper({ route: { name: REALTIME } });
      const flowStates = {
        closed: false,
        flows: {
          foIntro: false, foLiveIntro: false, foTimelineIntro: false, foGrid: false,
        },
      };
      expect(wrapper.vm.listItems).toEqual(Object.values(getFactoryOverviewProductTourConfig(flowStates).flows));
    });

    it('returns correct items if module name is TIMELINE', () => {
      const wrapper = createWrapper({ route: { name: TIMELINE } });
      const flowStates = {
        closed: false,
        flows: {
          foIntro: false, foLiveIntro: false, foTimelineIntro: false, foGrid: false,
        },
      };
      expect(wrapper.vm.listItems).toEqual(Object.values(getFactoryOverviewProductTourConfig(flowStates).flows));
    });

    it('returns correct items if module name is DASHBOARD', () => {
      const wrapper = createWrapper({ route: { name: DASHBOARD } });
      const flowStates = {
        closed: false,
        flows: { dbOverview: false, dbCreation: false, dbInvolving: false },
      };
      expect(wrapper.vm.listItems).toEqual(Object.values(getDashboardProductTourConfig(flowStates).flows));
    });

    it('returns correct items if module name is REPORTS', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      const flowStates = {
        closed: false,
        flows: {
          reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false,
        },
      };
      expect(wrapper.vm.listItems).toEqual(Object.values(getReportsProductTourConfig(flowStates).flows));
    });
  });

  describe('areAllFlowsCompleted', () => {
    it('returns false if none of the items are completed', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      wrapper.vm.flowStates = {
        [REPORTS]: {
          closed: false,
          flows: {
            reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false,
          },
        },
      };
      expect(wrapper.vm.areAllFlowsCompleted).toBe(false);
    });

    it('returns false if some items are completed', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      wrapper.vm.flowStates = {
        [REPORTS]: {
          closed: false,
          flows: {
            reportsIntro: true, reportsSaving: false, reportsComparing: true, reportsExporting: true,
          },
        },
      };
      expect(wrapper.vm.areAllFlowsCompleted).toBe(false);
    });

    it('returns true if all items are completed', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      wrapper.vm.flowStates = {
        [REPORTS]: {
          closed: false,
          flows: {
            reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: true,
          },
        },
      };
      expect(wrapper.vm.areAllFlowsCompleted).toBe(true);
    });
  });

  describe('isTourAllowed', () => {
    it('returns false if highest user role is OFFICE_USER in SETTINGS module', () => {
      const wrapper = createWrapper({
        route: { name: SETTINGS },
        profile: { highestUserRole: OFFICE_USER },
      });
      expect(wrapper.vm.isTourAllowed).toBe(false);
    });

    it('returns true if highest user role is OFFICE_USER in DASHBOARD module', () => {
      const wrapper = createWrapper({
        route: { name: DASHBOARD },
        profile: { highestUserRole: OFFICE_USER },
      });
      expect(wrapper.vm.isTourAllowed).toBe(true);
    });

    it('returns true if highest user role is OFFICE_USER in SHIFT_VIEW module', () => {
      const wrapper = createWrapper({
        route: { name: SHIFT_VIEW },
        profile: { highestUserRole: OFFICE_USER },
      });
      expect(wrapper.vm.isTourAllowed).toBe(true);
    });

    it('returns true if highest user role is OFFICE_USER in REPORTS module', () => {
      const wrapper = createWrapper({
        route: { name: REPORTS },
        profile: { highestUserRole: OFFICE_USER },
      });
      expect(wrapper.vm.isTourAllowed).toBe(true);
    });

    it('returns true if highest user role is OFFICE_USER in REALTIME module', () => {
      const wrapper = createWrapper({
        route: { name: REALTIME },
        profile: { highestUserRole: OFFICE_USER },
      });
      expect(wrapper.vm.isTourAllowed).toBe(true);
    });

    it('returns true if highest user role is OFFICE_USER in TIMELINE module', () => {
      const wrapper = createWrapper({
        route: { name: TIMELINE },
        profile: { highestUserRole: OFFICE_USER },
      });
      expect(wrapper.vm.isTourAllowed).toBe(true);
    });

    it('returns false if highest user role is COMPANY_ADMIN in DASHBOARD, SHIFT_VIEW, REPORTS, REALTIME or TIMELINE modules', () => {
      const route = ref({ name: DASHBOARD });
      const wrapper = createWrapper({
        route,
        profile: { highestUserRole: COMPANY_ADMIN },
      });

      expect(wrapper.vm.isTourAllowed).toBe(false);

      route.value.name = SHIFT_VIEW;
      expect(wrapper.vm.isTourAllowed).toBe(false);

      route.value.name = REPORTS;
      expect(wrapper.vm.isTourAllowed).toBe(false);

      route.value.name = REALTIME;
      expect(wrapper.vm.isTourAllowed).toBe(false);

      route.value.name = TIMELINE;
      expect(wrapper.vm.isTourAllowed).toBe(false);
    });

    it('returns false if highest user role is FACTORY_ADMIN in DASHBOARD, SHIFT_VIEW, REPORTS, REALTIME or TIMELINE modules', () => {
      const route = ref({ name: DASHBOARD });
      const wrapper = createWrapper({
        route,
        profile: { highestUserRole: FACTORY_ADMIN },
      });

      expect(wrapper.vm.isTourAllowed).toBe(false);

      route.value.name = SHIFT_VIEW;
      expect(wrapper.vm.isTourAllowed).toBe(false);

      route.value.name = REPORTS;
      expect(wrapper.vm.isTourAllowed).toBe(false);

      route.value.name = REALTIME;
      expect(wrapper.vm.isTourAllowed).toBe(false);

      route.value.name = TIMELINE;
      expect(wrapper.vm.isTourAllowed).toBe(false);
    });
  });

  describe('isProductTourActivatorVisible', () => {
    it('returns false if module name is not recognized', () => {
      expect(createWrapper({ route: { name: 'name' } }).vm.isProductTourActivatorVisible).toBe(false);
    });

    it('returns false if tour is closed', async () => {
      productTourApi.getFlowStates.mockResolvedValue({
        [REPORTS]: {
          closed: true,
          flows: {
            reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: true,
          },
        },
      });

      const wrapper = createWrapper({ route: { name: REPORTS } });

      await flushPromises();
      expect(wrapper.vm.isProductTourActivatorVisible).toBe(false);
    });

    it('returns false if one of the flows is selected', () => {
      const wrapper = createWrapper({ route: { name: SHIFT_VIEW } });
      wrapper.vm.onFlowSelected('svRecording');
      expect(wrapper.vm.isProductTourActivatorVisible).toBe(false);
    });

    it('returns false if tour is not closed and isCardTransitionFinished is false', async () => {
      productTourApi.getFlowStates.mockResolvedValue({
        [REPORTS]: {
          closed: false,
          flows: {
            reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false,
          },
        },
      });

      const wrapper = createWrapper({ route: { name: REPORTS } });

      await flushPromises();

      wrapper.vm.isCardTransitionFinished = false;
      expect(wrapper.vm.isProductTourActivatorVisible).toBe(false);
    });

    it('returns true if tour is not closed', async () => {
      productTourApi.getFlowStates.mockResolvedValue({
        [REPORTS]: {
          closed: false,
          flows: {
            reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false,
          },
        },
      });

      const route = ref({ name: 'name' });
      const wrapper = createWrapper({ route, profile: { highestUserRole: OFFICE_USER } });

      await flushPromises();
      route.value.name = REPORTS;
      await nextTick();
      expect(wrapper.vm.isProductTourActivatorVisible).toBe(true);
    });
  });

  describe('progressBarPercentage', () => {
    it('returns 0 if none of the items are completed', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      wrapper.vm.flowStates = {
        [REPORTS]: {
          closed: false,
          flows: {
            reportsIntro: false, reportsSaving: false, reportsComparing: false, reportsExporting: false,
          },
        },
      };
      expect(wrapper.vm.progressBarPercentage).toBe(0);
    });

    it('returns 100 if all items are completed', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      wrapper.vm.flowStates = {
        [REPORTS]: {
          closed: false,
          flows: {
            reportsIntro: true, reportsSaving: true, reportsComparing: true, reportsExporting: true,
          },
        },
      };
      expect(wrapper.vm.progressBarPercentage).toBe(100);
    });

    it('returns 75 if some items are completed', () => {
      const wrapper = createWrapper({ route: { name: REPORTS } });
      wrapper.vm.flowStates = {
        [REPORTS]: {
          closed: false,
          flows: {
            reportsIntro: true, reportsSaving: false, reportsComparing: true, reportsExporting: true,
          },
        },
      };
      expect(wrapper.vm.progressBarPercentage).toBe(75);
    });
  });

  describe('getListItemIcon', () => {
    it('returns correct icon if item is not completed', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.getListItemIcon({ isCompleted: false })).toBe(mdiCircleOutline);
    });

    it('returns correct icon if item is completed', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.getListItemIcon({ isCompleted: true })).toBe(mdiCheckboxMarkedCircle);
    });
  });

  describe('getListItemIconColor', () => {
    it('returns correct color if item is not completed', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.getListItemIconColor({ isCompleted: false })).toBe('secondary-text');
    });

    it('returns correct color if item is completed', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.getListItemIconColor({ isCompleted: true })).toBe('primary');
    });
  });

  describe('onFlowSelected', () => {
    it('sets selectedFlowId to selected flow and finds correct steps for selectedFlowSteps array', () => {
      const wrapper = createWrapper({ route: { name: SHIFT_VIEW } });
      wrapper.vm.onFlowSelected('svRecording');

      expect(wrapper.vm.selectedFlowId).toBe('svRecording');
      expect(wrapper.vm.selectedFlowSteps).toEqual(getShiftViewProductTourConfig({}).flows.svRecording.steps);
    });

    it('does not call route push if selected flow does not have urlToNavigate', () => {
      const router = { push: vi.fn() };
      useRouter.mockReturnValue(router);

      const wrapper = createWrapper({ route: { name: REALTIME } });
      wrapper.vm.onFlowSelected('foIntro');

      expect(getFactoryOverviewProductTourConfig({}).flows.foIntro.urlToNavigate).toBe(undefined);
    });

    it('does not call route push if selected flow has urlToNavigate and it is equal to current route fullPath', () => {
      const router = { push: vi.fn() };
      useRouter.mockReturnValue(router);

      const wrapper = createWrapper({ route: { name: REALTIME, fullPath: '/factory-view/realtime' } });
      wrapper.vm.onFlowSelected('foLiveIntro');

      expect(getFactoryOverviewProductTourConfig({}).flows.foLiveIntro.urlToNavigate).toBe('/factory-view/realtime');
      expect(router.push).not.toHaveBeenCalled();
    });

    it('calls route push if selected flow has urlToNavigate and it is not equal to current route fullPath', () => {
      const router = { push: vi.fn() };
      useRouter.mockReturnValue(router);

      const wrapper = createWrapper({ route: { name: REALTIME, fullPath: '/factory-view/realtime' } });
      wrapper.vm.onFlowSelected('foTimelineIntro');

      expect(getFactoryOverviewProductTourConfig({}).flows.foTimelineIntro.urlToNavigate).toBe('/factory-view/timeline');
      expect(router.push).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith('/factory-view/timeline');
    });
  });

  test('that onCloseFlowCard sets isCardTransitionFinished to false, selectedFlowId to empty string and selectedFlowSteps to empty array', () => {
    const wrapper = createWrapper({ route: { name: SHIFT_VIEW } });
    wrapper.vm.onFlowSelected('svRecording');

    expect(wrapper.vm.isCardTransitionFinished).toBe(true);
    expect(wrapper.vm.selectedFlowId).toBe('svRecording');
    expect(wrapper.vm.selectedFlowSteps).toEqual(getShiftViewProductTourConfig({}).flows.svRecording.steps);

    wrapper.vm.onCloseFlowCard();

    expect(wrapper.vm.isCardTransitionFinished).toBe(false);
    expect(wrapper.vm.selectedFlowId).toBe('');
    expect(wrapper.vm.selectedFlowSteps).toEqual([]);
  });

  test('that onHideProductTour adds current time to local storage and sets selectedFlowSteps to empty values', () => {
    const route = { name: SETTINGS };
    const fixedDate = new Date('2021-11-01T12:34:33.000Z');
    vi.setSystemTime(fixedDate);

    const wrapper = createWrapper({ route });

    expect(localStorage.getItem(`${route.name}-tourHidingTime`)).toBe(null);
    wrapper.vm.onHideProductTour();
    expect(localStorage.getItem(`${route.name}-tourHidingTime`)).toBe(fixedDate.toISOString());
    expect(wrapper.vm.selectedFlowSteps).toEqual([]);
  });

  test('that onCloseProductTour sets isListOpened to false, calls updateFlowStates with correct arguments and sets isProductTourVisible to false', async () => {
    productTourApi.getFlowStates.mockResolvedValue({
      [SHIFT_VIEW]: {
        closed: false,
        flows: {
          svWelcome: true, svIntro: true, svDtTracking: true, svMonitoring: false, svRecording: false, svEngagement: true,
        },
      },
    });

    const route = ref({ name: 'name' });
    const wrapper = createWrapper({ route, profile: { highestUserRole: OFFICE_USER } });

    await flushPromises();
    route.value.name = SHIFT_VIEW;
    await nextTick();

    expect(wrapper.vm.isProductTourVisible).toBe(true);
    expect(wrapper.vm.isListOpened).toBe(true);

    await wrapper.vm.onCloseProductTour();

    expect(wrapper.vm.isListOpened).toBe(false);
    expect(productTourApi.updateFlowStates).toHaveBeenCalledWith({
      [SHIFT_VIEW]: {
        closed: true,
        flows: {
          svWelcome: true, svIntro: true, svDtTracking: true, svMonitoring: false, svRecording: false, svEngagement: true,
        },
      },
    });
    expect(wrapper.vm.isProductTourVisible).toBe(false);
  });

  describe('setProductTourVisibility', () => {
    test('that isProductTourVisible is false if module name is not recognized', async () => {
      const route = ref({ name: 'name' });
      const wrapper = createWrapper({ route });

      await flushPromises();
      expect(wrapper.vm.flowStates[route.value.name]).toBeUndefined();
      expect(wrapper.vm.isProductTourVisible).toBe(false);
    });

    it('sets isProductTourVisible to false if tour is closed', async () => {
      productTourApi.getFlowStates.mockResolvedValue({
        [ALL_FACTORIES]: {
          closed: true,
          flows: {
            foIntro: true, foLiveIntro: true, foTimelineIntro: true, foGrid: true,
          },
        },
      });

      const wrapper = createWrapper({ route: ref({ name: REALTIME }) });

      await flushPromises();
      wrapper.vm.setProductTourVisibility();
      expect(wrapper.vm.isProductTourVisible).toBe(false);
    });

    it('sets isProductTourVisible to true if tour is not closed', async () => {
      productTourApi.getFlowStates.mockResolvedValue({
        [ALL_FACTORIES]: {
          closed: false,
          flows: {
            foIntro: true, foLiveIntro: true, foTimelineIntro: true, foGrid: true,
          },
        },
      });

      const wrapper = createWrapper({
        route: ref({ name: REALTIME }),
        profile: { highestUserRole: OFFICE_USER },
      });

      await flushPromises();
      wrapper.vm.setProductTourVisibility();
      expect(wrapper.vm.isProductTourVisible).toBe(true);
    });

    it('sets isListOpened to false if module name is not recognized in flowStates', async () => {
      const route = ref({ name: 'name' });
      const wrapper = createWrapper({ route });

      await flushPromises();
      wrapper.vm.setProductTourVisibility();

      expect(wrapper.vm.flowStates[route.value.name]).toBeUndefined();
      expect(wrapper.vm.isListOpened).toBe(false);
    });

    it('sets isListOpened to false if all flows are completed', async () => {
      productTourApi.getFlowStates.mockResolvedValue({
        [ALL_FACTORIES]: {
          closed: false,
          flows: {
            foIntro: true, foLiveIntro: true, foTimelineIntro: true, foGrid: true,
          },
        },
      });

      const wrapper = createWrapper({ route: ref({ name: REALTIME }) });

      await flushPromises();
      wrapper.vm.setProductTourVisibility();
      expect(wrapper.vm.isListOpened).toBe(false);
    });

    it('sets isListOpened to true if some flows are not completed', async () => {
      productTourApi.getFlowStates.mockResolvedValue({
        [ALL_FACTORIES]: {
          closed: false,
          flows: {
            foIntro: false, foLiveIntro: true, foTimelineIntro: false, foGrid: true,
          },
        },
      });

      const wrapper = createWrapper({
        route: ref({ name: REALTIME }),
        profile: { highestUserRole: OFFICE_USER },
      });

      await flushPromises();
      wrapper.vm.setProductTourVisibility();
      expect(wrapper.vm.isListOpened).toBe(true);
    });

    it('does not select the flow if there is more than one list item', () => {
      const wrapper = createWrapper({ route: ref({ name: DASHBOARD }) });
      wrapper.vm.flowStates = {
        [DASHBOARD]: {
          closed: false,
          flows: { dbOverview: false, dbCreation: false, dbInvolving: false },
        },
      };

      wrapper.vm.setProductTourVisibility();

      expect(wrapper.vm.listItems.length).toBe(3);
      expect(wrapper.vm.selectedFlowId).toBe('');
      expect(wrapper.vm.selectedFlowSteps).toEqual([]);
    });

    it('does not select the flow if tour is not visible', () => {
      const wrapper = createWrapper({ route: ref({ name: SETTINGS }) });
      wrapper.vm.flowStates = {
        [SETTINGS]: {
          closed: true,
          flows: { shiftTemplatesMerging: true },
        },
      };

      wrapper.vm.setProductTourVisibility();

      expect(wrapper.vm.isProductTourVisible).toBe(false);
      expect(wrapper.vm.selectedFlowId).toBe('');
      expect(wrapper.vm.selectedFlowSteps).toEqual([]);
    });
  });

  describe('onProductTourActivatorClick', () => {
    it('sets isListOpened to true if there are more than one flow', () => {
      const wrapper = createWrapper({ route: {} });
      wrapper.vm.flowStates = {
        [DASHBOARD]: {
          closed: false,
          flows: { dbOverview: false, dbCreation: false, dbInvolving: false },
        },
      };

      wrapper.vm.onProductTourActivatorClick();

      expect(wrapper.vm.isListOpened).toBe(true);
    });
  });

  describe('moduleName watcher', () => {
    it('sets selectedFlowId to empty string and selectedFlowSteps to empty array', async () => {
      productTourApi.getFlowStates.mockResolvedValue({
        [SHIFT_VIEW]: {
          closed: false,
          flows: {
            svWelcome: false, svIntro: false, svDtTracking: false, svMonitoring: false, svRecording: false, svEngagement: false,
          },
        },
        [ALL_FACTORIES]: {
          closed: false,
          flows: {
            foIntro: false, foLiveIntro: false, foTimelineIntro: false, foGrid: false,
          },
        },
      });

      const route = ref({ name: SHIFT_VIEW });
      const wrapper = createWrapper({ route });
      wrapper.vm.onFlowSelected('svRecording');

      expect(wrapper.vm.selectedFlowId).toBe('svRecording');
      expect(wrapper.vm.selectedFlowSteps).toEqual(getShiftViewProductTourConfig({}).flows.svRecording.steps);

      route.value.name = REALTIME;
      await flushPromises();

      expect(wrapper.vm.selectedFlowId).toBe('');
      expect(wrapper.vm.selectedFlowSteps).toEqual([]);
    });
  });

  test('that onFinishFlow calls updateFlowStates with correct arguments', async () => {
    productTourApi.getFlowStates.mockResolvedValue({
      [SHIFT_VIEW]: {
        closed: false,
        flows: {
          svWelcome: false, svIntro: false, svDtTracking: false, svMonitoring: false, svRecording: false, svEngagement: false,
        },
      },
    });

    const wrapper = createWrapper({ route: { name: SHIFT_VIEW } });

    await flushPromises();

    wrapper.vm.onFlowSelected('svRecording');
    wrapper.vm.onFinishFlow();

    expect(productTourApi.updateFlowStates).toHaveBeenCalledWith({
      [SHIFT_VIEW]: {
        closed: false,
        flows: {
          svWelcome: false, svIntro: false, svDtTracking: false, svMonitoring: false, svRecording: true, svEngagement: false,
        },
      },
    });
  });

  test('that getFlowStates is not called on mounted, when highestRoleAllows is false', () => {
    createWrapper({
      route: { name: SHIFT_VIEW },
      highestRoleAllows: () => false,
    });

    expect(productTourApi.getFlowStates).not.toHaveBeenCalled();
  });

  test('that getFlowStates is called on mounted', () => {
    createWrapper({ route: { name: SHIFT_VIEW } });

    expect(productTourApi.getFlowStates).toHaveBeenCalled();
  });

  describe('showTour', () => {
    it('returns true if module flow is demoFlow and productTourEnabled is true', () => {
      const wrapper = createWrapper({
        route: { name: SHIFT_VIEW },
        productTourEnabled: true,
      });
      expect(wrapper.vm.showTour).toBe(true);
    });

    it('returns false if module flow is demoflow and productTourEnabled is false', () => {
      const wrapper = createWrapper({
        route: { name: SHIFT_VIEW },
        productTourEnabled: false,
      });
      expect(wrapper.vm.showTour).toBe(false);
    });

    it('returns true if module flow is not demoflow and productTourEnabled is false', () => {
      const wrapper = createWrapper({
        route: { name: SETTINGS },
        productTourEnabled: false,
      });
      expect(wrapper.vm.showTour).toBe(true);
    });

    it('returns true if module flow is not demoflow and productTourEnabled is true', () => {
      const wrapper = createWrapper({
        route: { name: SETTINGS },
        productTourEnabled: true,
      });
      expect(wrapper.vm.showTour).toBe(true);
    });
  });
});
