import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import UserPreferencesForm from './index.vue';

import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';
import useStationStore from '@/stores/station';
import useFeatureStore from '@/stores/feature';

const defaultFormData = {
  defaultStationId: 1,
  startPage: 'dashboard',
  decimalPlaces: 2,
  pctDecimalPlaces: 1,
  decimalSeparator: ',',
  groupSeparator: '.',
  dateFormat: 'DD.MM.YYYY',
  timeFormat: 12,
  firstDayOfWeek: 1,
  lineviewLanguages: [],
};

const createWrapper = (propsOverrides = {}, { isMobile = false, highestRoleAllowsFn = () => true } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  const profileStore = useProfileStore(pinia);
  profileStore.highestRoleAllows = highestRoleAllowsFn;
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobile;
  const stationStore = useStationStore(pinia);
  stationStore.stations = [{ id: 1, name: 'test 1' }, { id: 2, name: 'test 2' }];
  const featureStore = useFeatureStore(pinia);
  featureStore.improvementsEnabled = true;

  return shallowMount(UserPreferencesForm, {
    props: { hasStartPageOption: false, formData: { ...defaultFormData }, ...propsOverrides },
    global: { plugins: [pinia] },
  });
};

describe('UserPreferencesForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-02-18T12:34:23'));
  });

  it('renders correctly with start page option', () => {
    const wrapper = createWrapper({ hasStartPageOption: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with start page option in mobile', () => {
    const wrapper = createWrapper({ hasStartPageOption: true }, { isMobile: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without start page option', () => {
    const wrapper = createWrapper({
      formData: {
        ...defaultFormData,
        defaultStationId: 2,
        startPage: 'settings',
        decimalPlaces: 1,
        pctDecimalPlaces: 0,
        decimalSeparator: '.',
        groupSeparator: ' ',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 24,
        firstDayOfWeek: 0,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with lineview languages option', () => {
    const wrapper = createWrapper({
      isLineviewUser: true,
      formData: {
        ...defaultFormData,
        defaultStationId: 2,
        startPage: 'settings',
        decimalPlaces: 1,
        pctDecimalPlaces: 2,
        decimalSeparator: '.',
        groupSeparator: ' ',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 24,
        firstDayOfWeek: 0,
        lineviewLanguages: ['en'],
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with lineview languages option in mobile', () => {
    const wrapper = createWrapper({
      isLineviewUser: true,
      formData: {
        ...defaultFormData,
        defaultStationId: 2,
        startPage: 'settings',
        decimalPlaces: 1,
        pctDecimalPlaces: 2,
        decimalSeparator: '.',
        groupSeparator: ' ',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 24,
        firstDayOfWeek: 0,
        lineviewLanguages: ['en'],
      },
    }, { isMobile: true });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that filteredStations has all stations if stationsFilter is empty', () => {
    const wrapper = createWrapper({
      formData: {
        ...defaultFormData,
        defaultStationId: 2,
        startPage: 'settings',
        decimalPlaces: 1,
        pctDecimalPlaces: 0,
        decimalSeparator: '.',
        groupSeparator: ' ',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 24,
        firstDayOfWeek: 0,
      },
    });
    expect(wrapper.vm.filteredStations.length).toEqual(2);
    expect(wrapper.vm.filteredStations[0].id).toEqual(1);
    expect(wrapper.vm.filteredStations[1].id).toEqual(2);
  });

  test('that filteredStations has only stations that match stationsFilter', () => {
    const wrapper = createWrapper({
      stationsFilter: [2],
      formData: {
        ...defaultFormData,
        defaultStationId: 2,
        startPage: 'settings',
        decimalPlaces: 1,
        pctDecimalPlaces: 1,
        decimalSeparator: '.',
        groupSeparator: ' ',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 24,
        firstDayOfWeek: 0,
      },
    });
    expect(wrapper.vm.filteredStations.length).toEqual(1);
    expect(wrapper.vm.filteredStations[0].id).toEqual(2);
  });

  test('decimalOptions with comma as separator', () => {
    const wrapper = createWrapper({
      stationsFilter: [2],
      formData: {
        ...defaultFormData,
        defaultStationId: 2,
        startPage: 'settings',
        decimalPlaces: 1,
        pctDecimalPlaces: 2,
        decimalSeparator: ',',
        groupSeparator: ' ',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 24,
        firstDayOfWeek: 0,
      },
    });
    expect(wrapper.vm.decimalOptions).toEqual([
      { name: '0', id: 0, pctName: '0%' },
      { name: '0,0', id: 1, pctName: '0,0%' },
      { name: '0,00', id: 2, pctName: '0,00%' },
      { name: '0,000', id: 3, pctName: '0,000%' },
      { name: '0,0000', id: 4, pctName: '0,0000%' },
      { name: '0,00000', id: 5, pctName: '0,00000%' },
    ]);
  });

  test('decimalOptions with period as separator', () => {
    const wrapper = createWrapper({
      stationsFilter: [2],
      formData: {
        ...defaultFormData,
        defaultStationId: 2,
        startPage: 'settings',
        decimalPlaces: 1,
        pctDecimalPlaces: 2,
        decimalSeparator: '.',
        groupSeparator: ' ',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 24,
        firstDayOfWeek: 0,
      },
    });
    expect(wrapper.vm.decimalOptions).toEqual([
      { name: '0', id: 0, pctName: '0%' },
      { name: '0.0', id: 1, pctName: '0.0%' },
      { name: '0.00', id: 2, pctName: '0.00%' },
      { name: '0.000', id: 3, pctName: '0.000%' },
      { name: '0.0000', id: 4, pctName: '0.0000%' },
      { name: '0.00000', id: 5, pctName: '0.00000%' },
    ]);
  });

  describe('modules', () => {
    it('returns correct modules list', () => {
      const wrapper = createWrapper({
        formData: {
          ...defaultFormData,
          defaultStationId: 2,
          startPage: 'dashboard',
          decimalPlaces: 1,
          pctDecimalPlaces: 2,
          decimalSeparator: '.',
          groupSeparator: ' ',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: 24,
          firstDayOfWeek: 0,
        },
      });
      expect(wrapper.vm.modules).toEqual([
        { id: 'shiftview', name: 'Shift view' },
        { id: 'factory-view', name: 'Factory view (Live)' },
        { id: 'factory-view-timeline', name: 'Factory view (Timeline)' },
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'reports', name: 'Reports' },
        { hidden: false, id: 'improvements', name: 'Improvements' },
        { hidden: false, id: 'settings', name: 'Settings' },
      ]);
    });

    it('returns correct modules list when highestRoleAllows returns false', () => {
      const wrapper = createWrapper({
        formData: {
          ...defaultFormData,
          defaultStationId: 2,
          startPage: 'dashboard',
          decimalPlaces: 1,
          pctDecimalPlaces: 2,
          decimalSeparator: '.',
          groupSeparator: ' ',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: 24,
          firstDayOfWeek: 0,
        },
      }, { highestRoleAllowsFn: () => false });
      expect(wrapper.vm.modules).toEqual([
        { id: 'shiftview', name: 'Shift view' },
        { id: 'factory-view', name: 'Factory view (Live)' },
        { id: 'factory-view-timeline', name: 'Factory view (Timeline)' },
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'reports', name: 'Reports' },
        { hidden: false, id: 'improvements', name: 'Improvements' },
        { hidden: true, id: 'settings', name: 'Settings' },
      ]);
    });
  });
});
