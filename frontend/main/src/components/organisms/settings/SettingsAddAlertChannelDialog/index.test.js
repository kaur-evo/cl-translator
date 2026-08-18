import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import cloneDeep from 'lodash/cloneDeep';

import SettingsAddAlertChannelDialog from './index.vue';

import {
  channelTypes, getChannelTypesArray, getChannelTypeById, alertSubtypes, alertTypes,
} from '@/constants/alerts';
import useDeviceStore from '@/stores/device';

const defaultDialogData = {
  availableTypes: getChannelTypesArray(),
  alertType: alertTypes.STOPREASON,
  alertSubtype: alertSubtypes.EXCEEDS,
  cancel: vi.fn(),
  action: vi.fn(),
};

const defaultPiniaState = {
  genericDialog: {
    dialogData: { ...defaultDialogData },
  },
  profile: {
    currentUser: { email: 'currentuser@evocon.com' },
  },
};

const createGlobal = (piniaOverrides = {}, { isMobile = false, screenHeight = 1080 } = {}) => {
  const state = cloneDeep({ ...defaultPiniaState, ...piniaOverrides });
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: state,
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobile;
  deviceStore.screenHeight = screenHeight;
  return {
    plugins: [pinia],
    mocks: {},
  };
};

describe('SettingsAddAlertChannelDialog', () => {
  it('renders correctly when channel is not selected', () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: {
        ...createGlobal(),
        stubs: { 'form-dialog-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when channel is not selected, but email channel is not available', () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: {
        ...createGlobal({
          genericDialog: {
            dialogData: {
              ...defaultDialogData,
              availableTypes: [getChannelTypeById(channelTypes.WEBHOOK)],
            },
          },
        }),
        stubs: { 'form-dialog-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if email channel is selected', () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: {
        ...createGlobal({
          genericDialog: {
            dialogData: {
              ...defaultDialogData,
              channel: {
                type: channelTypes.EMAIL,
                targets: ['test1@email.com', 'test2@email.com'],
                subject: 'testsubject',
                message: 'testmessage',
              },
            },
          },
        }),
        stubs: { 'form-dialog-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if webhook channel is selected', () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: {
        ...createGlobal({
          genericDialog: {
            dialogData: {
              ...defaultDialogData,
              channel: {
                type: channelTypes.WEBHOOK,
                message: 'test webhook message',
                url: 'https://test.com',
              },
            },
          },
        }),
        stubs: { 'form-dialog-template': false },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('variables and mappedVariables if alert subtype is EXCEEDS', () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal(),
    });
    const expectedVariables = [
      { displayName: 'Active operators', variableName: '{ActiveOperators}' },
      { displayName: 'Duration', variableName: '{Duration}' },
      { displayName: 'Extra note', variableName: '{Note}' },
      { displayName: 'Factory', variableName: '{Factory}' },
      { displayName: 'Loss', variableName: '{Loss}' },
      { displayName: 'Machine location', variableName: '{Location}' },
      { displayName: 'Product', variableName: '{Product}' },
      { displayName: 'Product code', variableName: '{ProductCode}' },
      { displayName: 'Reason', variableName: '{Reason}' },
      { displayName: 'Shift', variableName: '{Shift}' },
      { displayName: 'Shift URL', variableName: '{ShiftURL}' },
      { displayName: 'Start time', variableName: '{StartTime}' },
      { displayName: 'station', variableName: '{Station}' },
    ];
    const expectedMappedVariables = ['{ActiveOperators}', '{Duration}', '{Note}', '{Factory}', '{Loss}', '{Location}', '{Product}', '{ProductCode}', '{Reason}',
      '{Shift}', '{ShiftURL}', '{StartTime}', '{Station}'];

    expect(wrapper.vm.variables).toEqual(expectedVariables);
    expect(wrapper.vm.mappedVariables).toEqual(expectedMappedVariables);
  });

  test('variables and mappedVariables if alert subtype is ADDED', () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: { ...defaultDialogData, alertSubtype: alertSubtypes.ADDED },
        },
      }),
    });
    const expectedVariables = [
      { displayName: 'Active operators', variableName: '{ActiveOperators}' },
      { displayName: 'Duration', variableName: '{Duration}' },
      { displayName: 'Extra note', variableName: '{Note}' },
      { displayName: 'Factory', variableName: '{Factory}' },
      { displayName: 'Loss', variableName: '{Loss}' },
      { displayName: 'Machine location', variableName: '{Location}' },
      { displayName: 'Product', variableName: '{Product}' },
      { displayName: 'Product code', variableName: '{ProductCode}' },
      { displayName: 'Reason', variableName: '{Reason}' },
      { displayName: 'Shift', variableName: '{Shift}' },
      { displayName: 'Shift URL', variableName: '{ShiftURL}' },
      { displayName: 'Start time', variableName: '{StartTime}' },
      { displayName: 'station', variableName: '{Station}' },
    ];
    const expectedMappedVariables = ['{ActiveOperators}', '{Duration}', '{Note}', '{Factory}', '{Loss}', '{Location}', '{Product}', '{ProductCode}', '{Reason}',
      '{Shift}', '{ShiftURL}', '{StartTime}', '{Station}'];

    expect(wrapper.vm.variables).toEqual(expectedVariables);
    expect(wrapper.vm.mappedVariables).toEqual(expectedMappedVariables);
  });

  test('variables and mappedVariables if alert subtype is REPEATS', () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: { ...defaultDialogData, alertSubtype: alertSubtypes.REPEATS },
        },
      }),
    });
    const expectedVariables = [
      { displayName: 'Active operators', variableName: '{ActiveOperators}' },
      { displayName: 'Count', variableName: '{Count}' },
      { displayName: 'Duration', variableName: '{Duration}' },
      { displayName: 'Extra note', variableName: '{Note}' },
      { displayName: 'Factory', variableName: '{Factory}' },
      { displayName: 'Loss', variableName: '{Loss}' },
      { displayName: 'Machine location', variableName: '{Location}' },
      { displayName: 'Product', variableName: '{Product}' },
      { displayName: 'Product code', variableName: '{ProductCode}' },
      { displayName: 'Reason', variableName: '{Reason}' },
      { displayName: 'Shift', variableName: '{Shift}' },
      { displayName: 'Shift URL', variableName: '{ShiftURL}' },
      { displayName: 'Start time', variableName: '{StartTime}' },
      { displayName: 'station', variableName: '{Station}' },
    ];
    const expectedMappedVariables = ['{ActiveOperators}', '{Count}', '{Duration}', '{Note}', '{Factory}', '{Loss}', '{Location}', '{Product}', '{ProductCode}', '{Reason}',
      '{Shift}', '{ShiftURL}', '{StartTime}', '{Station}'];

    expect(wrapper.vm.variables).toEqual(expectedVariables);
    expect(wrapper.vm.mappedVariables).toEqual(expectedMappedVariables);
  });

  test('subjectRule', async () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            ...defaultDialogData,
            channel: {
              type: channelTypes.EMAIL,
              targets: ['test1@email.com', 'test2@email.com'],
              subject: 'testsubject',
              message: 'testmessage',
            },
          },
        },
      }),
    });

    expect(wrapper.vm.subjectRule).toBeTruthy();
    await wrapper.setData({ formData: { subject: '' } });
    expect(wrapper.vm.subjectRule).toBe('Subject');
  });

  test('messageRule', async () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            ...defaultDialogData,
            channel: {
              type: channelTypes.EMAIL,
              targets: ['test1@email.com', 'test2@email.com'],
              subject: 'testsubject',
              message: 'testmessage',
            },
          },
        },
      }),
    });

    expect(wrapper.vm.messageRule).toBeTruthy();
    await wrapper.setData({ formData: { message: '' } });
    expect(wrapper.vm.messageRule).toBe('Message');
  });

  test('urlRule', async () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            ...defaultDialogData,
            channel: {
              type: channelTypes.WEBHOOK,
              message: 'test webhook message',
              url: 'https://test.com',
            },
          },
        },
      }),
    });

    expect(wrapper.vm.urlRule).toBeTruthy();
    await wrapper.setData({ formData: { url: '' } });
    expect(wrapper.vm.urlRule).toBe('URL');
  });

  test('that onCancel calls dialogdata.cancel and closeDialog methods', () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal(),
    });

    const dialogDataCancelSpy = vi.spyOn(wrapper.vm.dialogData, 'cancel');
    const closeDialogSpy = vi.spyOn(wrapper.vm, 'closeDialog');
    wrapper.vm.onCancel();
    expect(dialogDataCancelSpy).toHaveBeenCalled();
    expect(closeDialogSpy).toHaveBeenCalled();
  });

  test('that onSave deletes unnecessary properties if type changes from email to webhook and calls dialogData.action and closeDialog methods', async () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            ...defaultDialogData,
            channel: {
              type: channelTypes.EMAIL,
              targets: ['test1@email.com', 'test2@email.com'],
              subject: 'testsubject',
              message: 'testmessage',
            },
          },
        },
      }),
    });

    const dialogDataActionSpy = vi.spyOn(wrapper.vm.dialogData, 'action');
    const closeDialogSpy = vi.spyOn(wrapper.vm, 'closeDialog');

    // New type is webhook
    await wrapper.setData({ formData: { type: channelTypes.WEBHOOK, url: 'https://test.com' } });
    expect(wrapper.vm.formData).toEqual({
      type: channelTypes.WEBHOOK,
      targets: ['test1@email.com', 'test2@email.com'],
      subject: 'testsubject',
      message: 'testmessage',
      url: 'https://test.com',
    });
    wrapper.vm.validate = () => {
      wrapper.vm.valid = true;
    };
    await wrapper.vm.onSave();
    expect(wrapper.vm.formData).toEqual({ type: channelTypes.WEBHOOK, message: 'testmessage', url: 'https://test.com' });
    expect(dialogDataActionSpy).toHaveBeenLastCalledWith(wrapper.vm.formData);
    expect(closeDialogSpy).toHaveBeenCalled();
  });

  test('that onSave deletes unnecessary properties if type changes from webhook to email and calls dialogData.action and closeDialog methods', async () => {
    const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
      global: createGlobal({
        genericDialog: {
          dialogData: {
            ...defaultDialogData,
            channel: {
              type: channelTypes.WEBHOOK,
              message: 'testmessage',
              url: 'https://test.com',
            },
          },
        },
      }),
      computed: {
        ...SettingsAddAlertChannelDialog.computed,
        isDialogValid: () => true,
      },
    });

    const dialogDataActionSpy = vi.spyOn(wrapper.vm.dialogData, 'action');
    const closeDialogSpy = vi.spyOn(wrapper.vm, 'closeDialog');

    // New type is email
    await wrapper.setData({
      formData: {
        type: channelTypes.EMAIL, subject: 'email subject', message: 'email message', targets: ['mr@evocon.com'],
      },
    });
    expect(wrapper.vm.formData).toEqual({
      type: channelTypes.EMAIL,
      targets: ['mr@evocon.com'],
      subject: 'email subject',
      message: 'email message',
      url: 'https://test.com',
    });
    wrapper.vm.validate = () => {
      wrapper.vm.valid = true;
    };
    await wrapper.vm.onSave();
    expect(wrapper.vm.formData).toEqual({
      type: channelTypes.EMAIL, message: 'email message', subject: 'email subject', targets: ['mr@evocon.com'],
    });
    expect(dialogDataActionSpy).toHaveBeenLastCalledWith(wrapper.vm.formData);
    expect(closeDialogSpy).toHaveBeenCalled();
  });

  describe('editorHeight', () => {
    it('returns correct value for desktop view', () => {
      const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
        global: createGlobal(),
      });

      expect(wrapper.vm.editorHeight).toBe(320);
    });

    it('returns correct value for mobile view when type is email', () => {
      const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
        global: createGlobal({}, { isMobile: true, screenHeight: 900 }),
      });

      wrapper.vm.formData.type = channelTypes.EMAIL;

      expect(wrapper.vm.editorHeight).toBe(440);
    });

    it('returns correct value for mobile view when type is webhook', () => {
      const wrapper = shallowMount(SettingsAddAlertChannelDialog, {
        global: createGlobal({}, { isMobile: true, screenHeight: 900 }),
      });

      wrapper.vm.formData.type = channelTypes.WEBHOOK;

      expect(wrapper.vm.editorHeight).toBe(502);
    });
  });
});
