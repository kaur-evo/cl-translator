import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import SettingsRouteEditForm from './index.vue';

import useDeviceStore from '@/stores/device';
import { defaultNumberFormattingOptions } from '@/constants/formattingConstants';

vi.mock('@/helpers/d3Helpers', async () => {
  const actual = await vi.importActual('@/helpers/d3Helpers');
  return {
    ...actual,
    getTextWidth: vi.fn(() => 8),
  };
});

vi.mock('@/services/i18n', () => ({
  default: { global: { t: vi.fn((t) => t) } },
  __esModule: true,
}));

const defaultDialogData = {
  route: {},
  group: {},
  action: vi.fn(),
  disabledStations: [],
  filteredStations: [
    {
      id: 1, name: 'station 1', factoryId: 1, groupId: 2,
    },
    {
      id: 2, name: 'station 2', factoryId: 2, groupId: 1,
    },
    { id: 4, name: 'station 4', groupId: 2 },
  ],
};

const defaultPiniaState = {
  genericDialog: {
    dialogData: { ...defaultDialogData },
    allowFullscreen: true,
  },
  station: {
    stations: [
      {
        id: 1, name: 'station 1', factoryId: 1, groupId: 2,
      },
      {
        id: 2, name: 'station 2', factoryId: 2, groupId: 1,
      },
      { id: 4, name: 'station 4', groupId: 2 },
    ],
    stationGroups: [
      { id: 1, name: 'group 1' },
      { id: 2, name: 'group 2' },
    ],
  },
  configuration: {
    configuration: {
      productBasedScrap: [1, 2, 3],
    },
  },
  feature: {
    semiFinished: false,
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
    numberFormattingOptions: defaultNumberFormattingOptions,
  },
};

const stubs = { 'form-dialog-template': false, VImg: true };
let tout;

const createGlobal = (piniaOverrides = {}, deviceOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: cloneDeep({ ...defaultPiniaState, ...piniaOverrides }),
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = deviceOverrides.isMobileView ?? false;
  deviceStore.showFullscreenDialogs = deviceOverrides.showFullscreenDialogs ?? false;
  return {
    plugins: [pinia],
    stubs,
  };
};

describe('SettingsRouteEditForm', () => {
  beforeEach(() => {
    tout = window.setTimeout;
    window.setTimeout = (fn) => fn?.();
  });
  afterEach(() => {
    window.setTimeout = tout;
    vi.clearAllMocks();
  });
  it('renders correctly when adding new route', () => {
    const wrapper = shallowMount(SettingsRouteEditForm, {
      global: createGlobal(),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when adding new route in mobile view', () => {
    const wrapper = shallowMount(SettingsRouteEditForm, {
      global: createGlobal(
        {},
        { showFullscreenDialogs: true, isMobileView: true },
      ),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when editing route', async () => {
    const wrapper = shallowMount(SettingsRouteEditForm, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            disabledStations: [2],
            filteredStations: defaultDialogData.filteredStations,
            group: { local: false, factoryIds: [1, 2] },
            route: {
              item: {
                stationId: 1,
                runTimeType: 'UNIT_PER_HOUR',
                runTime: 30,
                cycleTimeCritical: 240,
                unitQty: 2,
                semiFinised: false,
                id: 22,
                scrapUnitQty: 1,
                unitConversion: 1,
                unitConversionType: 'PRIMARY_TO_ALT',
              },
            },
            unit: 'tk',
            alternativeUnit: 'package',
            isEdit: true,
          },
          allowFullscreen: true,
        },
      }),
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when selected station has timeModeActive as true', async () => {
    const wrapper = shallowMount(SettingsRouteEditForm, {
      global: createGlobal({
        station: {
          stations: [
            { id: 1, timeModeActive: true, name: 'station 1', factoryId: 1, groupId: 2 },
            { id: 2, name: 'station 2', factoryId: 2, groupId: 1 },
            { id: 4, name: 'station 4', groupId: 2 },
          ],
          stationGroups: [
            { id: 1, name: 'group 1' },
            { id: 2, name: 'group 2' },
          ],
        },
      }),
    });

    await wrapper.setData({ formData: { stationId: 1 } });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that clicking "Apply" button calls onSaveClick method', async () => {
    const wrapper = mount(SettingsRouteEditForm, {
      global: createGlobal(),
    });

    const applyButton = wrapper.find('#primary-button');
    const spy = vi.spyOn(wrapper.vm, 'onSaveClick');
    await applyButton.trigger('click');

    expect(spy).toBeCalledTimes(1);
  });

  test('that unit-conversion-field is not visible if alternativeUnit is not set in dialogData', async () => {
    const wrapper = mount(SettingsRouteEditForm, {
      global: createGlobal(),
    });

    await flushPromises();

    expect(wrapper.find('#unit-conversion-field').exists()).toBe(false);
  });

  test('that unit-conversion-field is visible if alternativeUnit is set in dialogData', async () => {
    const wrapper = mount(SettingsRouteEditForm, {
      global: createGlobal({
        genericDialog: {
          dialogData: { alternativeUnit: 'test', group: {} },
          allowFullscreen: true,
        },
      }),
    });

    await flushPromises();

    expect(wrapper.find('#unit-conversion-field').exists()).toBe(true);
  });

  test('that unit-conversion-type-field is not visible if alternativeUnit is not set in dialogData', async () => {
    const wrapper = mount(SettingsRouteEditForm, {
      global: createGlobal(),
    });

    await flushPromises();

    expect(wrapper.vm.unitConversionTypes).toStrictEqual([]);
    expect(wrapper.find('#unit-conversion-type-field').exists()).toBe(false);
  });

  test('that field for product-based-scrap is shown if selected station id is configured to have it', async () => {
    const wrapper = mount(SettingsRouteEditForm, {
      global: createGlobal(),
    });

    await wrapper.setData({ formData: { stationId: 1 } });

    expect(wrapper.find('#product-based-scrap').exists()).toBe(true);
  });

  test('that field for product-based-scrap is not shown if selected station id is not configured to have it', async () => {
    const wrapper = mount(SettingsRouteEditForm, {
      global: createGlobal(),
    });

    await wrapper.setData({ formData: { stationId: 11 } });

    expect(wrapper.find('#product-based-scrap').exists()).toBe(false);
  });

  describe('showScrapUnitQty', () => {
    test('when conf is off', () => {
      const wrapper = shallowMount(SettingsRouteEditForm, {
        global: createGlobal({
          configuration: { configuration: { productBasedScrap: false } },
        }),
      });

      expect(wrapper.vm.showScrapUnitQty).toBe(false);
    });

    test('when conf is on, but not for selected station', async () => {
      const wrapper = shallowMount(SettingsRouteEditForm, {
        global: createGlobal(),
      });

      await wrapper.setData({ formData: { stationId: 4 } });

      expect(wrapper.vm.showScrapUnitQty).toBe(false);
    });

    test('when conf is on for selected station', async () => {
      const wrapper = shallowMount(SettingsRouteEditForm, {
        global: createGlobal(),
      });

      await wrapper.setData({ formData: { stationId: 1 } });

      expect(wrapper.vm.showScrapUnitQty).toBe(true);
    });
  });

  test('idealCycleTime', async () => {
    const wrapper = shallowMount(SettingsRouteEditForm, {
      global: createGlobal(),
    });

    // runTime = 1
    expect(wrapper.vm.idealCycleTime).toBe(60);
    await wrapper.setData({ formData: { runTimeType: 'SECOND_PER_UNIT' } });
    expect(wrapper.vm.idealCycleTime).toBe(1);
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_SECOND' } });
    expect(wrapper.vm.idealCycleTime).toBe(1);
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_HOUR' } });
    expect(wrapper.vm.idealCycleTime).toBe(3600);

    // runTime = 1.5
    await wrapper.setData({ formData: { runTime: 1.5, runTimeType: 'UNIT_PER_MINUTE' } });
    expect(wrapper.vm.idealCycleTime).toBe(40);
    await wrapper.setData({ formData: { runTimeType: 'SECOND_PER_UNIT' } });
    expect(wrapper.vm.idealCycleTime).toBe(1.5);
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_SECOND' } });
    expect(wrapper.vm.idealCycleTime).toBe(1 / 1.5);
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_HOUR' } });
    expect(wrapper.vm.idealCycleTime).toBe(2400);

    // runTime = 30
    await wrapper.setData({ formData: { runTime: 30, runTimeType: 'UNIT_PER_MINUTE' } });
    expect(wrapper.vm.idealCycleTime).toBe(2);
    await wrapper.setData({ formData: { runTimeType: 'SECOND_PER_UNIT' } });
    expect(wrapper.vm.idealCycleTime).toBe(30);
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_SECOND' } });
    expect(wrapper.vm.idealCycleTime).toBe(1 / 30);
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_HOUR' } });
    expect(wrapper.vm.idealCycleTime).toBe(120);
  });

  test('formattedIdealCycleTime', async () => {
    const wrapper = shallowMount(SettingsRouteEditForm, {
      global: createGlobal(),
    });

    // runTime = 1
    expect(wrapper.vm.formattedIdealCycleTime).toBe('60');
    await wrapper.setData({ formData: { runTimeType: 'SECOND_PER_UNIT' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('1');
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_SECOND' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('1');
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_HOUR' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('3 600');

    // runTime = 1.5
    await wrapper.setData({ formData: { runTime: 1.5, runTimeType: 'UNIT_PER_MINUTE' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('40');
    await wrapper.setData({ formData: { runTimeType: 'SECOND_PER_UNIT' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('1,5');
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_SECOND' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('0,67');
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_HOUR' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('2 400');

    // runTime = 30
    await wrapper.setData({ formData: { runTime: 30, runTimeType: 'UNIT_PER_MINUTE' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('2');
    await wrapper.setData({ formData: { runTimeType: 'SECOND_PER_UNIT' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('30');
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_SECOND' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('0,03');
    await wrapper.setData({ formData: { runTimeType: 'UNIT_PER_HOUR' } });
    expect(wrapper.vm.formattedIdealCycleTime).toBe('120');
  });

  test('that runTimeTypes returns runTimeTypes array', () => {
    const wrapper = shallowMount(SettingsRouteEditForm, {
      global: createGlobal({
        genericDialog: {
          dialogData: { unit: 'kg' },
          allowFullscreen: true,
        },
      }),
    });

    expect(wrapper.vm.runTimeTypes).toStrictEqual([
      { id: 'SECOND_PER_UNIT', name: 'SECOND_PER_{unit}' },
      { id: 'UNIT_PER_SECOND', name: '{unit}_PER_SECOND' },
      { id: 'UNIT_PER_MINUTE', name: '{unit}_PER_MINUTE' },
      { id: 'UNIT_PER_HOUR', name: '{unit}_PER_HOUR' },
    ]);
  });

  describe('unitConversionTypes', () => {
    it('returns empty array if alternativeUnit is not set', () => {
      const wrapper = shallowMount(SettingsRouteEditForm, {
        global: createGlobal({
          genericDialog: {
            dialogData: { unit: 'kg', alternativeUnit: '' },
            allowFullscreen: true,
          },
        }),
      });

      expect(wrapper.vm.unitConversionTypes).toStrictEqual([]);
    });

    it('returns unitConversionTypes array if alternativeUnit is set', () => {
      const wrapper = shallowMount(SettingsRouteEditForm, {
        global: createGlobal({
          genericDialog: {
            dialogData: { unit: 'kg', alternativeUnit: 'box' },
            allowFullscreen: true,
          },
        }),
      });

      expect(wrapper.vm.unitConversionTypes).toStrictEqual([
        { id: 'PRIMARY_TO_ALT', name: 'kg = 1 box' },
        { id: 'ALT_TO_PRIMARY', name: 'box = 1 kg' },
      ]);
    });
  });
});
