import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPencil, mdiDelete } from '@mdi/js';

import SettingsAlertsEdit from './index.vue';

import { channelTypes } from '@/constants/alerts';
import useDeviceStore from '@/stores/device';

const mocks = {
  $t: (t) => t,
  $route: { params: {}, query: { test: 'test' } },
  $router: { push: vi.fn() },
};

const alerts = [
  {
    id: 123,
    active: true,
    name: 'madli test alert',
    requirements: {
      type: 'STOPREASON',
      setpoint: 0,
      stationIds: [1, 2],
      productIds: [231, 404],
      operatorIds: [42, 43, 17],
      commentIds: [838, 624],
    },
    output: {
      channels: [
        {
          type: channelTypes.EMAIL,
          targets: ['madli@evocon.vom', 'doris@evocon.com'],
          subject: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station}',
          message: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station} - {ShiftURL}',
        },
        {
          type: channelTypes.WEBHOOK,
          targets: ['test webhook url'],
          message: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station} - {ShiftURL}',
          url: 'https://test.com',
        },
      ],
    },
  },
  {
    id: 124,
    active: false,
    name: 'another mocked alert',
    requirements: {
      type: 'STOPREASON',
      setpoint: 3600,
      stationIds: [],
      productIds: [],
      operatorIds: [],
      commentIds: [],
    },
    output: {
      channels: [
        {
          type: channelTypes.EMAIL,
          targets: ['madli@evocon.vom'],
          subject: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station}',
          message: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station} - {ShiftURL}',
        },
      ],
    },
  },
  {
    id: 125,
    active: true,
    name: '¡ALERT!',
    requirements: {
      type: 'STOPREASON',
      setpoint: 3000,
      stationIds: [1],
      productIds: [],
      operatorIds: [],
      commentIds: [504],
    },
    output: {
      channels: [
        {
          type: channelTypes.EMAIL,
          targets: ['doris@evocon.com'],
          subject: '{Reason} on {Station}',
          message: `Stop reason: {Reason}
  <br> Note: {Note}
  <br> Start time: {StartTime}
  <br> Duration: {Duration}
  <br> Factory: {Factory}
  <br> Station: {Station}
  <br> Machine location: {Location}
  <br> Product: {Product}
  <br> Product code: {ProductCode}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL} `,
        },
        {
          type: channelTypes.WEBHOOK,
          targets: ['test url'],
          message: '',
        },
      ],
    },
  },
  {
    id: 126,
    active: false,
    name: 'Mocked CL alert',
    requirements: {
      type: 'CHECKLIST',
      stationIds: [],
      productIds: [],
      operatorIds: [],
      checklistStatuses: [],
      checklistIds: [],
    },
    output: {
      channels: [
        {
          type: channelTypes.EMAIL,
          targets: ['doris@evocon.vom'],
          subject: '{ChecklistName} tööjaamal {Station}',
          message: '{ChecklistName} tööjaamal {Station} on {ChecklistResult}',
        },
      ],
    },
  },
];

const defaultPiniaState = {
  station: {
    stations: [
      { id: 1, groupId: 1, factoryId: 12 },
      { id: 2, groupId: 1, factoryId: 11 },
      { id: 3, groupId: 1, factoryId: 12 },
      { id: 4, groupId: 2, factoryId: 11 },
    ],
    loading: [],
  },
  alert: {
    alerts,
    loading: [],
  },
  genericDialog: {},
  genericNotification: {
    isOpen: false,
    type: '',
  },
  confirmDialog: {},
  feature: {
    checklists: false,
  },
  position: {
    positions: [],
    loading: [],
  },
  profile: {
    currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
  },
};

const createPlugins = (storeOverrides, piniaOverrides) => {
  const piniaState = piniaOverrides ? { ...defaultPiniaState, ...piniaOverrides } : defaultPiniaState;
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: piniaState,
  });
  useDeviceStore(pinia).isMobileView = false;
  return [pinia];
};

describe('SettingsAlertsEdit', () => {
  it('renders correctly when selected alert is not in alertsMap', () => {
    const customAlerts = [{
      id: 1, active: true, name: 'test alert', requirements: {}, output: { channels: [] },
    }];
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(null, { alert: { alerts: customAlerts, loading: [] } }),
        mocks: { ...mocks, $route: { params: { id: 2 } } },
        stubs: { 'form-page-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when adding new', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
        stubs: { 'form-page-template': false },
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when editing existing', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks: { ...mocks, $route: { params: { id: 123 } } },
        stubs: { 'form-page-template': false },
      },

    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that channelCardButtons array has delete and edit actions', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    expect(wrapper.vm.channelCardButtons.length).toBe(2);
    expect(wrapper.vm.channelCardButtons[0]).toEqual({
      icon: mdiPencil,
      text: 'Edit',
      tooltip: 'Edit',
      action: expect.any(Function),
    });
    expect(wrapper.vm.channelCardButtons[1]).toEqual({
      icon: mdiDelete,
      text: 'Delete',
      tooltip: 'Delete',
      action: expect.any(Function),
    });
  });

  test('alertSubtype watcher', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    const addWarningAndReplaceChannelContentSpy = vi.spyOn(wrapper.vm, 'addWarningAndReplaceChannelContent');
    wrapper.vm.$options.watch.alertSubtype.call(wrapper.vm, 'EXCEEDS', null);
    expect(addWarningAndReplaceChannelContentSpy).toHaveBeenCalledTimes(0);
    wrapper.vm.$options.watch.alertSubtype.call(wrapper.vm, 'ADDED', 'EXCEEDS');
    expect(addWarningAndReplaceChannelContentSpy).toHaveBeenCalledTimes(1);
  });

  test('that closeNotification is not called when component is unmounted and notification is closed', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    const closeNotification = vi.spyOn(wrapper.vm, 'closeNotification');
    wrapper.unmount();
    expect(closeNotification).toHaveBeenCalledTimes(0);
  });

  test('that closeNotification is not called when component is unmounted, notification is open, but notification type is success', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(null, { genericNotification: { isOpen: true, type: 'success' } }),
        mocks,
      },
    });

    const closeNotification = vi.spyOn(wrapper.vm, 'closeNotification');
    wrapper.unmount();
    expect(closeNotification).toHaveBeenCalledTimes(0);
  });

  test('that closeNotification is called when component is unmounted, notification is open and notification type is warning', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(null, { genericNotification: { isOpen: true, type: 'warning' } }),
        mocks,
      },
    });

    const closeNotification = vi.spyOn(wrapper.vm, 'closeNotification');
    wrapper.unmount();
    expect(closeNotification).toHaveBeenCalledTimes(1);
  });

  test('that goBackToOverview calls router push', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    wrapper.vm.goBackToOverview();
    expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'alertOverview', query: { test: 'test' } });
  });

  test('that onDelete calls openConfirmDialog', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    const openConfirmDialog = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    wrapper.vm.onDelete();
    expect(openConfirmDialog).toHaveBeenCalledTimes(1);
  });

  test('onAlertTypeChange', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    await flushPromises();
    expect(wrapper.vm.formData.requirements).toStrictEqual({
      type: null,
      factoryIds: [],
      stationIds: [],
      productIds: [],
      operatorIds: [],
      shiftTemplateIds: [],
      positionIds: [],
    });
    wrapper.vm.onAlertTypeChange('CHECKLIST');
    expect(wrapper.vm.formData.requirements).toStrictEqual({
      type: 'CHECKLIST',
      factoryIds: [],
      stationIds: [],
      productIds: [],
      operatorIds: [],
      shiftTemplateIds: [],
      positionIds: [],
      checklistIds: [],
      checklistStatuses: [],
    });
    await wrapper.setData({ formData: { requirements: { stationIds: [1, 2, 3], productIds: [11] } } });
    wrapper.vm.onAlertTypeChange('STOPREASON');
    expect(wrapper.vm.formData.requirements).toStrictEqual({
      type: 'STOPREASON',
      setpoint: null,
      factoryIds: [],
      stationIds: [1, 2, 3],
      productIds: [11],
      operatorIds: [],
      shiftTemplateIds: [],
      positionIds: [],
      commentIds: [],
    });
    wrapper.vm.onAlertTypeChange('SCRAPREASON');
    expect(wrapper.vm.formData.requirements).toStrictEqual({
      type: 'SCRAPREASON',
      subType: 'SCRAP_QTY',
      intervalQty: null,
      factoryIds: [],
      stationIds: [1, 2, 3],
      productIds: [11],
      operatorIds: [],
      shiftTemplateIds: [],
      positionIds: [],
      scrapReasonIds: [],
    });
    wrapper.vm.onAlertTypeChange('CHANGEOVER');
    expect(wrapper.vm.formData.requirements).toStrictEqual({
      type: 'CHANGEOVER',
      subType: 'ADDED',
      factoryIds: [],
      stationIds: [1, 2, 3],
      productIds: [11],
      operatorIds: [],
      shiftTemplateIds: [],
      positionIds: [],
    });
  });

  test('onRequirementsUpdate', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    await flushPromises();
    wrapper.vm.onAlertTypeChange('STOPREASON');
    wrapper.vm.onRequirementsUpdate({
      setpoint: 0, stationIds: [1], productIds: [1, 2], operatorIds: [3], commentIds: [11], type: 'STOPREASON',
    });

    expect(wrapper.vm.formData.requirements).toEqual({
      type: 'STOPREASON',
      setpoint: 0,
      stationIds: [1],
      productIds: [1, 2],
      operatorIds: [3],
      shiftTemplateIds: [],
      positionIds: [],
      commentIds: [11],
      factoryIds: [],
    });
  });

  test('that onAddChannel calls openDialog', () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    const openDialog = vi.spyOn(wrapper.vm, 'openDialog');
    wrapper.vm.onAddChannel({ item: { type: channelTypes.WEBHOOK, name: 'Webhook' }, index: 0 });
    expect(openDialog).toHaveBeenCalledTimes(1);
  });

  test('that removeChannel removes a channel', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks: { ...mocks, $route: { params: { id: 123 } } },
      },
    });

    await flushPromises();
    expect(wrapper.vm.alertChannels.length).toBe(2);
    expect(wrapper.vm.alertChannels).toEqual([
      {
        type: channelTypes.EMAIL,
        targets: ['madli@evocon.vom', 'doris@evocon.com'],
        subject: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station}',
        message: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station} - {ShiftURL}',
      },
      {
        type: channelTypes.WEBHOOK,
        targets: ['test webhook url'],
        message: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station} - {ShiftURL}',
        url: 'https://test.com',
      },
    ]);
    wrapper.vm.removeChannel(0);
    expect(wrapper.vm.alertChannels.length).toBe(1);
    expect(wrapper.vm.alertChannels).toEqual([
      {
        type: channelTypes.WEBHOOK,
        targets: ['test webhook url'],
        message: 'Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station} - {ShiftURL}',
        url: 'https://test.com',
      },
    ]);
  });

  test('that getSubtitle returns correct key-value pairs', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks: { ...mocks, $route: { params: { id: 123 } } },
      },
    });

    await flushPromises();
    const subtitleResult = wrapper.vm.getSubtitle(wrapper.vm.alertChannels[0]);
    expect(subtitleResult).toEqual([{ key: 'Emails', value: 'madli@evocon.vom, doris@evocon.com' }]);
    const subtitleResult2 = wrapper.vm.getSubtitle(wrapper.vm.alertChannels[1]);
    expect(subtitleResult2).toEqual([{ key: 'URL', value: 'https://test.com' }]);
  });

  test('getStationIds', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks: { ...mocks, $route: { params: { id: 125 } } },
      },
    });

    await flushPromises();
    expect(wrapper.vm.getStationIds()).toEqual([1]);
    await wrapper.setData({ formData: { requirements: { stationIds: [], factoryIds: [11] } } });
    expect(wrapper.vm.getStationIds()).toEqual([2, 4]);
    await wrapper.setData({ formData: { requirements: { factoryIds: [] } } });
    expect(wrapper.vm.getStationIds()).toEqual([1, 2, 3, 4]);
  });

  test('that addWarningAndReplaceChannelContent replaces subject, but does not add warning if channel content was default', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks: { ...mocks, $route: { params: { id: 125 } } },
      },
    });

    await flushPromises();
    const { warningsMap } = wrapper.vm;
    const notifyWarning = vi.spyOn(wrapper.vm, 'notifyWarning');
    expect(warningsMap).toEqual(new Map([['EMAIL', false], ['WEBHOOK', false]]));
    expect(wrapper.vm.formData.output.channels[0].subject).toBe('{Reason} on {Station}');
    expect(wrapper.vm.formData.output.channels[0].message).toBe(`Stop reason: {Reason}
  <br> Note: {Note}
  <br> Start time: {StartTime}
  <br> Duration: {Duration}
  <br> Factory: {Factory}
  <br> Station: {Station}
  <br> Machine location: {Location}
  <br> Product: {Product}
  <br> Product code: {ProductCode}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL} `);
    await wrapper.setData({ alertSubtype: 'REPEATS' });
    wrapper.vm.addWarningAndReplaceChannelContent('EXCEEDS');
    expect(warningsMap).toEqual(new Map([['EMAIL', false], ['WEBHOOK', false]]));
    expect(notifyWarning).toBeCalledTimes(0);
    expect(wrapper.vm.formData.output.channels[0].subject).toBe('{Reason} ({Count}) on {Station}');
    expect(wrapper.vm.formData.output.channels[0].message).toBe(`Stop reason: {Reason}
  <br> Note: {Note}
  <br> Start time: {StartTime}
  <br> Duration: {Duration}
  <br> Factory: {Factory}
  <br> Station: {Station}
  <br> Machine location: {Location}
  <br> Product: {Product}
  <br> Product code: {ProductCode}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL} `);
    expect(wrapper.vm.formData.output.channels[1].message).toBe('');
  });

  test('that addWarningAndReplaceChannelContent replaces content and adds warning if channel content was not default', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks: { ...mocks, $route: { params: { id: 124 } } },
      },
    });

    await flushPromises();
    const { warningsMap } = wrapper.vm;
    const notifyWarning = vi.spyOn(wrapper.vm, 'notifyWarning');
    expect(warningsMap).toEqual(new Map([['EMAIL', false], ['WEBHOOK', false]]));
    expect(wrapper.vm.formData.output.channels[0].subject).toBe('Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station}');
    expect(wrapper.vm.formData.output.channels[0].message).toBe('Seisak {StopReason} kestis kauem kui {DurationLimit} tööjaamal {Station} - {ShiftURL}');
    await wrapper.setData({ alertSubtype: 'REPEATS' });
    wrapper.vm.addWarningAndReplaceChannelContent('EXCEEDS');
    expect(warningsMap).toEqual(new Map([['EMAIL', true], ['WEBHOOK', false]]));
    expect(notifyWarning).toBeCalledWith({ text: 'Trigger change has reset the alert message.', timeout: -1 });
    expect(wrapper.vm.formData.output.channels[0].subject).toBe('{Reason} ({Count}) on {Station}');
    expect(wrapper.vm.formData.output.channels[0].message).toBe(`Stop reason: {Reason}
  <br> Note: {Note}
  <br> Start time: {StartTime}
  <br> Duration: {Duration}
  <br> Factory: {Factory}
  <br> Station: {Station}
  <br> Machine location: {Location}
  <br> Product: {Product}
  <br> Product code: {ProductCode}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL} `);
  });

  test('that removeWarningFromChannel sets channel value to false in warningsMap and calls closeNotification if all warningsMap values are false', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    await flushPromises();
    const { warningsMap } = wrapper.vm;
    const closeNotification = vi.spyOn(wrapper.vm, 'closeNotification');
    expect(warningsMap).toEqual(new Map([['EMAIL', false], ['WEBHOOK', false]]));
    warningsMap.set('EMAIL', true);
    expect(warningsMap).toEqual(new Map([['EMAIL', true], ['WEBHOOK', false]]));
    wrapper.vm.removeWarningFromChannel('EMAIL');
    expect(warningsMap).toEqual(new Map([['EMAIL', false], ['WEBHOOK', false]]));
    expect(closeNotification).toBeCalledTimes(1);
  });

  test('that removeWarningFromChannel sets channel value to false in warningsMap and does not call closeNotification if some warningsMap values are true', async () => {
    const wrapper = shallowMount(SettingsAlertsEdit, {
      global: {
        plugins: createPlugins(),
        mocks,
      },
    });

    await flushPromises();
    const { warningsMap } = wrapper.vm;
    const closeNotification = vi.spyOn(wrapper.vm, 'closeNotification');
    expect(warningsMap).toEqual(new Map([['EMAIL', false], ['WEBHOOK', false]]));
    warningsMap.set('EMAIL', true);
    warningsMap.set('WEBHOOK', true);
    expect(warningsMap).toEqual(new Map([['EMAIL', true], ['WEBHOOK', true]]));
    wrapper.vm.removeWarningFromChannel('EMAIL');
    expect(warningsMap).toEqual(new Map([['EMAIL', false], ['WEBHOOK', true]]));
    expect(closeNotification).toBeCalledTimes(0);
  });

  describe('requirement defaults when editing alerts', () => {
    it('applies default requirement values when fields are missing from API response', async () => {
      const wrapper = shallowMount(SettingsAlertsEdit, {
        global: {
          plugins: createPlugins(),
          mocks: { ...mocks, $route: { params: { id: 123 } } },
        },
      });

      await flushPromises();
      // Alert 123 fixture does not include positionIds or shiftTemplateIds
      expect(wrapper.vm.formData.requirements.positionIds).toEqual([]);
      expect(wrapper.vm.formData.requirements.shiftTemplateIds).toEqual([]);
    });

    it('preserves existing positionIds and shiftTemplateIds when present in API response', async () => {
      const customAlerts = [{
        ...alerts[0],
        requirements: {
          ...alerts[0].requirements,
          positionIds: [10, 20],
          shiftTemplateIds: [5],
        },
      }];
      const wrapper = shallowMount(SettingsAlertsEdit, {
        global: {
          plugins: createPlugins(null, { alert: { alerts: customAlerts, loading: [] } }),
          mocks: { ...mocks, $route: { params: { id: 123 } } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.formData.requirements.positionIds).toEqual([10, 20]);
      expect(wrapper.vm.formData.requirements.shiftTemplateIds).toEqual([5]);
    });

    it('savedRequirements applies defaults for missing requirement fields', async () => {
      const wrapper = shallowMount(SettingsAlertsEdit, {
        global: {
          plugins: createPlugins(),
          mocks: { ...mocks, $route: { params: { id: 123 } } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.savedRequirements.positionIds).toEqual([]);
      expect(wrapper.vm.savedRequirements.shiftTemplateIds).toEqual([]);
    });
  });

  describe('isRemovedAlert', () => {
    it('returns false if isFormLoading is true', () => {
      const wrapper = shallowMount(SettingsAlertsEdit, {
        global: {
          plugins: createPlugins(),
          mocks: { ...mocks, $route: { params: { id: 1 } } },
        },
      });

      wrapper.vm.isFormLoading = true;
      expect(wrapper.vm.isRemovedAlert).toBe(false);
    });

    it('returns false if alertId does not exist', async () => {
      const wrapper = shallowMount(SettingsAlertsEdit, {
        global: {
          plugins: createPlugins(),
          mocks: { ...mocks, $route: { params: {} } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isRemovedAlert).toBe(false);
    });

    it('returns false if alertId exists and alert is in alertsMap', async () => {
      const customAlerts = [{
        id: 123, active: true, name: 'test alert', requirements: {}, output: { channels: [] }, deleted: false,
      }];
      const wrapper = shallowMount(SettingsAlertsEdit, {
        global: {
          plugins: createPlugins(null, { alert: { alerts: customAlerts, loading: [] } }),
          mocks: { ...mocks, $route: { params: { id: 123 } } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isRemovedAlert).toBe(false);
    });

    it('returns true if alertId exists, alert is in alertsMap and alert is deleted', async () => {
      const customAlerts = [{
        id: 123, active: true, name: 'test alert', requirements: {}, output: { channels: [] }, deleted: true,
      }];
      const wrapper = shallowMount(SettingsAlertsEdit, {
        global: {
          plugins: createPlugins(null, { alert: { alerts: customAlerts, loading: [] } }),
          mocks: { ...mocks, $route: { params: { id: 123 } } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isRemovedAlert).toBe(true);
    });

    it('returns true if alertId exists but alert is not in alertsMap', async () => {
      const customAlerts = [{
        id: 123, active: true, name: 'test alert', requirements: {}, output: { channels: [] },
      }];
      const wrapper = shallowMount(SettingsAlertsEdit, {
        global: {
          plugins: createPlugins(null, { alert: { alerts: customAlerts, loading: [] } }),
          mocks: { ...mocks, $route: { params: { id: 999 } } },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isRemovedAlert).toBe(true);
    });
  });
});
