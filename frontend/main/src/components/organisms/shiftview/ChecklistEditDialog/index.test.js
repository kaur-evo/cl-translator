import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ChecklistEditDialog from './index.vue';

import {
  useGenericDialogStore,
  useProfileStore,
  useDeviceStore,
  useStationStore,
  useOperatorStore,
  useConfirmDialogStore,
  useChecklistTaskStore,
  useShiftviewSelectionStore,
} from '@/stores/index';
import { LINEVIEW_USER } from '@/constants/userRoles';
import checklistApi from '@/api/checklistApi';

vi.mock('@/api/checklistApi');
const getTaskFiles = vi.fn();
checklistApi.getTaskFiles = getTaskFiles;

const createWrapper = ({ storeOverrides = {}, mountFn = shallowMount } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const genericDialogStore = useGenericDialogStore(pinia);
  genericDialogStore.dialogData = storeOverrides.dialogData ?? { item: { checklistId: 'asd-asd-dfgdfg' } };
  genericDialogStore.previousState = storeOverrides.previousState ?? {};

  const profileStore = useProfileStore(pinia);
  profileStore.currentUser = storeOverrides.currentUser ?? { id: 11, fullName: 'Current user' };
  profileStore.shiftviewStationRoleAllows = storeOverrides.shiftviewStationRoleAllows ?? (() => true);
  profileStore.shiftviewStationUserRole = storeOverrides.shiftviewStationUserRole ?? null;
  profileStore.isReadOnly = storeOverrides.isReadOnly ?? false;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = storeOverrides.showFullscreenDialogs ?? false;
  deviceStore.isMobileView = storeOverrides.isMobileView ?? false;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = storeOverrides.lineviewStation ?? { id: 1, zoneId: 'UTC' };

  const operatorStore = useOperatorStore(pinia);
  operatorStore.operatorsMap = storeOverrides.operatorsMap ?? { 1: { id: 1, name: 'Operator1' } };

  const confirmDialogStore = useConfirmDialogStore(pinia);
  const checklistTaskStore = useChecklistTaskStore(pinia);
  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);

  const stores = {
    genericDialogStore,
    profileStore,
    deviceStore,
    stationStore,
    operatorStore,
    confirmDialogStore,
    checklistTaskStore,
    shiftviewSelectionStore,
  };

  const wrapper = mountFn(ChecklistEditDialog, {
    global: { plugins: [pinia] },
  });

  return { wrapper, stores, pinia };
};

describe('ChecklistEditDialog', () => {
  let originalCrypto;

  beforeEach(() => {
    originalCrypto = window.crypto;

    const mockRandomUUID = vi.fn(() => 'mocked-uuid-12345');

    Object.defineProperty(window, 'crypto', {
      writable: true,
      value: {
        ...originalCrypto, // Keep other crypto methods if your code uses them
        randomUUID: mockRandomUUID,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: {
            dateTimeISO: '2020-05-20T08:00:00.000Z',
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Manual checklist in another timezone',
            stationIds: [61],
            description: 'This is a manual checklist in another timezone',
            active: false,
            frequency: {
              type: 'MANUAL', productIds: [], intervalTime: 0, pauseDuringDowntime: false,
            },
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
            manualAllowed: false,
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if not applicable checkbox is visible', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: {
            dateTimeISO: '2020-05-20T08:00:00.000Z',
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Manual checklist in another timezone',
            stationIds: [61],
            description: 'This is a manual checklist in another timezone',
            active: false,
            frequency: {
              type: 'MANUAL', productIds: [], intervalTime: 0, pauseDuringDowntime: false,
            },
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: true,
            }, {
              id: 2, name: 'Is the package damaged?', type: 'SELECTION', value: ['Yes', 'No'], notApplicableEnabled: true,
            }, {
              id: 3, name: 'Comments', type: 'TEXT', notApplicableEnabled: true,
            }],
            manualAllowed: false,
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly for manual checklist', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: {
            dateTimeISO: '2020-05-20T08:00:00.000Z',
            submissionTimeISO: '2020-05-20T08:00:00.000Z',
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Manual checklist in another timezone',
            stationIds: [61],
            description: 'This is a manual checklist in another timezone',
            active: false,
            frequency: {
              type: 'MANUAL', productIds: [], intervalTime: 0, pauseDuringDowntime: false,
            },
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
            manualAllowed: false,
          },
          manual: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if checklist authentication is required and active user role is lineview user', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        shiftviewStationUserRole: LINEVIEW_USER,
        shiftviewStationRoleAllows: () => false,
        dialogData: {
          item: {
            dateTimeISO: '2020-05-20T08:00:00.000Z',
            submissionTimeISO: '2020-05-20T08:00:00.000Z',
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Checklist test',
            stationIds: [61],
            description: 'This is a checklist auth test',
            conditionAuthenticationRequired: true,
            doneBy: 'Test User',
            frequency: {
              type: 'INTERVAL', productIds: [], intervalTime: 1800, pauseDuringDowntime: false,
            },
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view if checklist authentication is required and active user role is lineview user', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        shiftviewStationUserRole: LINEVIEW_USER,
        shiftviewStationRoleAllows: () => false,
        isMobileView: true,
        dialogData: {
          item: {
            dateTimeISO: '2020-05-20T08:00:00.000Z',
            submissionTimeISO: '2020-05-20T08:00:00.000Z',
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Checklist test',
            stationIds: [61],
            description: 'This is a checklist auth test',
            conditionAuthenticationRequired: true,
            doneBy: 'Test User',
            frequency: {
              type: 'INTERVAL', productIds: [], intervalTime: 1800, pauseDuringDowntime: false,
            },
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in readonly mode', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        isReadOnly: true,
        dialogData: {
          item: {
            dateTimeISO: '2020-05-20T08:00:00.000Z',
            submissionTimeISO: '2020-05-20T08:00:00.000Z',
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Checklist test',
            stationIds: [61],
            description: 'This is a readonly test',
            conditionAuthenticationRequired: true,
            doneBy: 'Test User',
            frequency: {
              type: 'INTERVAL', productIds: [], intervalTime: 1800, pauseDuringDowntime: false,
            },
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that checklist authentication is required if checklists authentication is enabled', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        shiftviewStationUserRole: LINEVIEW_USER,
        dialogData: { item: { conditionAuthenticationRequired: true } },
      },
    });

    expect(wrapper.vm.isChecklistAuthRequired).toBeTruthy();
  });

  test('that dialog header is green when all checks are successful', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: { item: { checklistId: 'asd-asd-dfgdfg', elements: [{ successful: true }, { successful: true }, { successful: true }] } },
      },
      mountFn: mount,
    });

    await flushPromises();
    expect(wrapper.vm.toolbarColor).toBe('primary');
  });

  test('that dialog header is orange when at least one check is unsuccessful', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: { checklistId: 'asd-asd-dfgdfg', elements: [{ successful: false, value: false }, { successful: null, value: null }, { successful: true, value: true }] },
        },
      },
    });

    await flushPromises();
    expect(wrapper.vm.toolbarColor).toBe('lw-orange');
  });

  test('that dialog header is grey when some checks values are null', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: { checklistId: 'asd-asd-dfgdfg', elements: [{ successful: false, value: null }, { successful: false, value: null }, { successful: true, value: true }] },
        },
      },
      mountFn: mount,
    });

    await flushPromises();
    expect(wrapper.find('#dialog-toolbar').isVisible()).toBe(true);
    expect(wrapper.find('#dialog-toolbar').classes('bg-lw-gray')).toBe(true);
  });

  test('that dialog header is grey when some checks are undone and all that have been done, are successful', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: { item: { checklistId: 'asd-asd-dfgdfg', elements: [{ successful: true }, { successful: null }, { successful: true }] } },
      },
    });

    await flushPromises();
    expect(wrapper.vm.toolbarColor).toBe('lw-gray');
  });

  test('that dialog shows truncated check description for long text if description is collpsed', async () => {
    const inputDesc = `Long text test. Long text test. Long text test. Long text test.
      Long text test. Long text test. Long text test. Long text test.
      Long text test. Long text test. Long text test. Long text test.`;
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: { item: { checklistId: 'asd-asd-dfgdfg', description: inputDesc } },
      },
      mountFn: mount,
    });

    wrapper.vm.isDescriptionCollapsed = true;

    await flushPromises();
    expect(wrapper.find('.checklist-description').isVisible()).toBe(true);
    expect(wrapper.find('.checklist-description').text()).toBe('Long text test. Long text test. Long text test. Long text test....');
  });

  test('that dialog shows button for collapsing description, when description contains newline character', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: {
            dateTimeISO: '2020-05-20T08:00:00.000Z',
            checklistId: 'asd-asd-dfgdfg',
            description: 'a) test1\nb) test2\nc) test3',
            frequency: {},
          },
        },
      },
      mountFn: mount,
    });

    await flushPromises();
    expect(wrapper.find('#collapse-text-btn').isVisible()).toBe(true);
  });

  test('that dialog has a card for every check that has do be done', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: { item: { dateTimeISO: '2023-04-06T12:32:00.000Z', checklistId: 'asd-asd-dfgdfg', elements: [{}, {}, {}, {}] } },
      },
      mountFn: mount,
    });

    await flushPromises();
    expect(wrapper.findAll('.check-card').length).toBe(4);
  });

  test('readonly has save button disabled', async () => {
    const { wrapper } = createWrapper({
      storeOverrides: { isReadOnly: true },
      mountFn: mount,
    });

    const spy = vi.spyOn(wrapper.vm, 'onSave');

    await flushPromises();
    expect(wrapper.find('#save-button').exists()).toBe(true);
    expect(wrapper.find('#save-button').element.disabled).toBe(true);
    await wrapper.find('#save-button').trigger('click', spy);
    expect(wrapper.vm.onSave).toHaveBeenCalledTimes(0);
  });

  it('has a delete button when shiftviewStationRoleAllows deleting checklist', () => {
    const { wrapper } = createWrapper({
      storeOverrides: { shiftviewStationRoleAllows: (action) => action === 'deleteChecklist' },
      mountFn: mount,
    });

    expect(wrapper.find('#delete-btn').exists()).toBe(true);
  });

  it('doesnt have a delete button when shiftviewStationRoleAllows forbids deleting checklist', () => {
    const { wrapper } = createWrapper({
      storeOverrides: { shiftviewStationRoleAllows: () => false },
      mountFn: mount,
    });

    expect(wrapper.find('#delete-btn').exists()).toBe(false);
  });

  test('that when hasFormDataChanged watcher is triggered with false, then changeDoneBy isnt called', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: {
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Checklist test',
            doneBy: 'Test User',
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
            conditionAuthenticationRequired: true,
          },
        },
      },
      mountFn: mount,
    });

    const changeDoneBy = vi.spyOn(wrapper.vm, 'changeDoneBy');
    wrapper.vm.$options.watch.hasFormDataChanged.call(wrapper.vm, false);
    expect(changeDoneBy).toHaveBeenCalledTimes(0);
  });

  test('that when hasFormDataChanged watcher is triggered with false, then changeDoneBy is called, but isChecklistAuthRequired is false', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: {
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Checklist test',
            doneBy: 'Test User',
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
            conditionAuthenticationRequired: false,
          },
        },
      },
      mountFn: mount,
    });

    const changeDoneBy = vi.spyOn(wrapper.vm, 'changeDoneBy');
    wrapper.vm.$options.watch.hasFormDataChanged.call(wrapper.vm, false);
    expect(changeDoneBy).toHaveBeenCalledTimes(0);
  });

  test('that when hasFormDataChanged watcher is triggered with true, then changeDoneBy is called and doneBy is replaced with user full name if user role is admin', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        dialogData: {
          item: {
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Checklist test',
            doneBy: 'Test User',
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
            conditionAuthenticationRequired: true,
          },
        },
      },
      mountFn: mount,
    });

    const changeDoneBy = vi.spyOn(wrapper.vm, 'changeDoneBy');
    wrapper.vm.$options.watch.hasFormDataChanged.call(wrapper.vm, true);
    expect(changeDoneBy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.doneBy).toBe('Current user');
  });

  test('that when hasFormDataChanged watcher is triggered with true, then changeDoneBy is called and doneBy is replaced with operator name if user role is lineview user', () => {
    const { wrapper } = createWrapper({
      storeOverrides: {
        shiftviewStationUserRole: LINEVIEW_USER,
        dialogData: {
          item: {
            checklistId: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            id: '48fa54dc-4a20-4522-b742-f0c2f722c974',
            name: 'Checklist test',
            doneBy: 'Test User',
            elements: [{
              id: 1, name: 'How many pcs in a package?', unit: 'pcs', minVal: 9, maxVal: 11, type: 'MEASUREMENT', notApplicableEnabled: false,
            }],
            passcodeValidation: { operatorId: 1 },
            conditionAuthenticationRequired: true,
          },
        },
      },
      mountFn: mount,
    });

    const changeDoneBy = vi.spyOn(wrapper.vm, 'changeDoneBy');
    wrapper.vm.$options.watch.hasFormDataChanged.call(wrapper.vm, true);
    expect(changeDoneBy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.doneBy).toBe('Operator1');
  });

  describe('isCheckSuccessful', () => {
    const { wrapper } = createWrapper({ mountFn: mount });

    it('returns false if MEASUREMENT check value is null', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: null, minVal: 9, maxVal: 12,
      })).toBe(false);
    });

    it('returns false if MEASUREMENT check value is empty array', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [], minVal: 9, maxVal: 12,
      })).toBe(false);
    });

    it('returns false if MEASUREMENT check is value is less than minVal', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [8], minVal: 9, maxVal: 12,
      })).toBe(false);
    });

    it('returns false if MEASUREMENT check is value is more than maxVal', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [13], minVal: 9, maxVal: 12,
      })).toBe(false);
    });

    it('returns true if MEASUREMENT check is value is between minVal and maxVal', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [10], minVal: 9, maxVal: 12,
      })).toBe(true);
    });

    it('returns true if MEASUREMENT check is value is equal to minVal', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [9], minVal: 9, maxVal: 12,
      })).toBe(true);
    });

    it('returns true if MEASUREMENT check is value is equal to maxVal', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [12], minVal: 9, maxVal: 12,
      })).toBe(true);
    });

    it('returns false if MEASUREMENT check value has less items than requiredSampleCount', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [10], minVal: 9, maxVal: 12, requiredSampleCount: 2,
      })).toBe(false);
    });

    it('returns true if MEASUREMENT check value has at least as many items as requiredSampleCount and all values are between minVal and maxVal', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [10, 11], minVal: 9, maxVal: 12, requiredSampleCount: 2,
      })).toBe(true);
    });

    it('returns false if MEASUREMENT check value has at least as many items as requiredSampleCount but at least one value is less than minVal', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'MEASUREMENT', value: [10, 8], minVal: 9, maxVal: 12, requiredSampleCount: 2,
      })).toBe(false);
    });

    it('returns false if SELECTION check value is empty', () => {
      expect(wrapper.vm.isCheckSuccessful({ type: 'SELECTION', value: [] })).toBe(false);
    });

    it('returns true if SELECTION check value has at least one item', () => {
      expect(wrapper.vm.isCheckSuccessful({ type: 'SELECTION', value: ['one'] })).toBe(true);
    });

    it('returns true if TEXT check is filled', () => {
      expect(wrapper.vm.isCheckSuccessful({ type: 'TEXT', value: 'test' })).toBe(true);
    });

    it('returns false if TEXT check is empty', () => {
      expect(wrapper.vm.isCheckSuccessful({ type: 'TEXT', value: '' })).toBe(false);
    });

    it('returns false if YES_NO with multipleSelection value is empty array', () => {
      expect(wrapper.vm.isCheckSuccessful({ type: 'YES_NO', multipleSelection: true, value: [] })).toBe(false);
    });

    it('returns false if YES_NO with multipleSelection value has less items than requiredSampleCount', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'YES_NO', multipleSelection: true, value: [true], requiredSampleCount: 2,
      })).toBe(false);
    });

    it('returns true if YES_NO with multipleSelection all values are true and requiredSampleCount is met', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'YES_NO', multipleSelection: true, value: [true, true], requiredSampleCount: 2,
      })).toBe(true);
    });

    it('returns false if YES_NO with multipleSelection some values are false', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'YES_NO', multipleSelection: true, value: [true, false],
      })).toBe(false);
    });

    it('returns true if YES_NO with multipleSelection all values are true', () => {
      expect(wrapper.vm.isCheckSuccessful({
        type: 'YES_NO', multipleSelection: true, value: [true, true],
      })).toBe(true);
    });
  });

  describe('isNotApplicableCheckboxVisible', () => {
    it('returns false if formData does not have elements prop', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { dialogData: { item: { checklistId: 'asd-asd-dfgdfg' } } },
        mountFn: mount,
      });

      await flushPromises();
      expect(wrapper.vm.isNotApplicableCheckboxVisible).toBe(false);
    });

    it('returns false if only one element has notApplicableEnabled prop set to true', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                { notApplicableEnabled: true },
                { notApplicableEnabled: false },
              ],
            },
          },
        },
        mountFn: mount,
      });

      await flushPromises();
      expect(wrapper.vm.isNotApplicableCheckboxVisible).toBe(false);
    });

    it('returns true if at least two elements have notApplicableEnabled prop set to true', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                { notApplicableEnabled: true },
                { notApplicableEnabled: true },
              ],
            },
          },
        },
        mountFn: mount,
      });

      await flushPromises();
      expect(wrapper.vm.isNotApplicableCheckboxVisible).toBe(true);
    });
  });

  describe('tasksWithNAOption', () => {
    it('returns empty array when formData.elements is undefined', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: { dialogData: { item: { checklistId: 'asd-asd-dfgdfg' } } },
      });

      await flushPromises();
      expect(wrapper.vm.tasksWithNAOption).toEqual([]);
    });

    it('returns only tasks with notApplicableEnabled set to true', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  id: 1, type: 'TEXT', value: 'test1', notApplicableEnabled: true,
                },
                {
                  id: 2, type: 'TEXT', value: 'test2', notApplicableEnabled: false,
                },
                {
                  id: 3, type: 'SELECTION', value: [], notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.tasksWithNAOption).toEqual([
        {
          id: 1, type: 'TEXT', value: 'test1', notApplicableEnabled: true,
        },
        {
          id: 3, type: 'SELECTION', value: [], notApplicableEnabled: true,
        },
      ]);
    });

    it('returns empty array when no tasks have notApplicableEnabled', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: 'test1', notApplicableEnabled: false,
                },
                {
                  type: 'TEXT', value: 'test2', notApplicableEnabled: false,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.tasksWithNAOption).toEqual([]);
    });
  });

  describe('areAllUnfilledTasksMarkedNA', () => {
    it('returns false when there are no tasks with NA option', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: null, valueNotApplicable: false, notApplicableEnabled: false,
                },
                {
                  type: 'TEXT', value: 'test2', valueNotApplicable: false, notApplicableEnabled: false,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.areAllUnfilledTasksMarkedNA).toBe(false);
    });

    it('returns false when all tasks with NA option are filled', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: 'test1', valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'SELECTION', value: [1, 2, 3], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.areAllUnfilledTasksMarkedNA).toBe(false);
    });

    it('returns false when some unfilled tasks with NA option have valueNotApplicable set to false', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: null, valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'SELECTION', value: null, valueNotApplicable: true, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.areAllUnfilledTasksMarkedNA).toBe(false);
    });

    it('returns true when all unfilled tasks with NA option are marked as not applicable', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: null, valueNotApplicable: true, notApplicableEnabled: true,
                },
                {
                  type: 'SELECTION', value: null, valueNotApplicable: true, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.areAllUnfilledTasksMarkedNA).toBe(true);
    });
  });

  describe('areAllTasksWithNAOptionFilled', () => {
    it('returns false when any task with NA option is not filled', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: 'test', valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'TEXT', value: null, valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'SELECTION', value: ['test'], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.areAllTasksWithNAOptionFilled).toBe(false);
    });

    it('returns true when tasks without NA option are unfilled but all NA tasks are filled', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: 'test', valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'TEXT', value: null, valueNotApplicable: false, notApplicableEnabled: false,
                },
                {
                  type: 'SELECTION', value: ['test'], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.areAllTasksWithNAOptionFilled).toBe(true);
    });

    it('returns true when all tasks with NA option are filled', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: 'test', valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'TEXT', value: 'test2', valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'SELECTION', value: ['test'], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.areAllTasksWithNAOptionFilled).toBe(true);
    });
  });

  describe('isElementFilled', () => {
    it('returns false if element has notApplicableEnabled and valueNotApplicable is true', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: null, valueNotApplicable: true, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(false);
    });

    it('returns false if type is SELECTION and value is empty array', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'SELECTION', value: [], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(false);
    });

    it('returns true if type is SELECTION and value is set', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'SELECTION', value: ['test'], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(true);
    });

    it('returns false if element value is null', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: null, valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(false);
    });

    it('returns false if element value is undefined', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: undefined, valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(false);
    });

    it('returns true if element has value set', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: 'test', valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(true);
    });

    it('returns false if type is YES_NO and value is empty array', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'YES_NO', value: [], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(false);
    });

    it('returns true if type is YES_NO and value has items', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'YES_NO', value: [true, false], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(true);
    });

    it('returns false if type is MEASUREMENT and value is empty array', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'MEASUREMENT', value: [], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(false);
    });

    it('returns true if type is MEASUREMENT and value has items', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'MEASUREMENT', value: [5.2], valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      expect(wrapper.vm.isElementFilled(wrapper.vm.formData.elements[0])).toBe(true);
    });
  });

  describe('onNotApplicableCheckboxChange', () => {
    it('sets those elements valueNotApplicable to true that have notApplicableEnabled as true, does not have value set and valueNotApplicable is false', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: 'test', valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'TEXT', value: null, valueNotApplicable: false, notApplicableEnabled: false,
                },
                {
                  type: 'SELECTION', value: ['test'], valueNotApplicable: false, notApplicableEnabled: false,
                },
                {
                  type: 'SELECTION', value: [], valueNotApplicable: true, notApplicableEnabled: true,
                },
                {
                  type: 'MEASUREMENT', value: 10, minVal: 9, maxVal: 12, valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'MEASUREMENT', value: undefined, minVal: 9, maxVal: 12, valueNotApplicable: true, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      wrapper.vm.onNotApplicableCheckboxChange(true);
      expect(wrapper.vm.formData.elements[0].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[1].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[2].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[3].valueNotApplicable).toBe(true);
      expect(wrapper.vm.formData.elements[4].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[5].valueNotApplicable).toBe(true);
    });

    it('sets those elements valueNotApplicable to false that have valueNotApplicable as true', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'TEXT', value: 'test', valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'TEXT', value: null, valueNotApplicable: false, notApplicableEnabled: false,
                },
                {
                  type: 'SELECTION', value: ['test'], valueNotApplicable: false, notApplicableEnabled: false,
                },
                {
                  type: 'SELECTION', value: [], valueNotApplicable: true, notApplicableEnabled: true,
                },
                {
                  type: 'MEASUREMENT', value: 10, minVal: 9, maxVal: 12, valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'MEASUREMENT', value: undefined, minVal: 9, maxVal: 12, valueNotApplicable: true, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      wrapper.vm.onNotApplicableCheckboxChange(false);
      expect(wrapper.vm.formData.elements[0].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[1].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[2].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[3].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[4].valueNotApplicable).toBe(false);
      expect(wrapper.vm.formData.elements[5].valueNotApplicable).toBe(false);
    });

    it('sets valueNotApplicable for YES_NO, SELECTION, and MEASUREMENT elements with empty array value', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  type: 'YES_NO', value: [], valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'SELECTION', value: [], valueNotApplicable: false, notApplicableEnabled: true,
                },
                {
                  type: 'MEASUREMENT', value: [], minVal: 9, maxVal: 12, valueNotApplicable: false, notApplicableEnabled: true,
                },
              ],
            },
          },
        },
      });

      await flushPromises();
      wrapper.vm.onNotApplicableCheckboxChange(true);
      expect(wrapper.vm.formData.elements[0].valueNotApplicable).toBe(true);
      expect(wrapper.vm.formData.elements[1].valueNotApplicable).toBe(true);
      expect(wrapper.vm.formData.elements[2].valueNotApplicable).toBe(true);
    });
  });

  describe('hasFormDataChanged', () => {
    it('returns true if comment is changed', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  id: 1, comment: 'test', value: true, valueNotApplicable: false, notApplicableEnabled: false,
                },
              ],
            },
          },
        },
      });

      wrapper.vm.formData.elements[0].comment = 'changed';
      expect(wrapper.vm.hasFormDataChanged).toBe(true);
    });

    it('returns true if value is changed', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  id: 1, comment: 'test', value: true, valueNotApplicable: false, notApplicableEnabled: false,
                },
              ],
            },
          },
        },
      });

      wrapper.vm.formData.elements[0].value = false;
      expect(wrapper.vm.hasFormDataChanged).toBe(true);
    });

    it('returns true if valueNotApplicable is changed', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  id: 1, comment: 'test', value: true, valueNotApplicable: false, notApplicableEnabled: false,
                },
              ],
            },
          },
        },
      });

      wrapper.vm.formData.elements[0].valueNotApplicable = true;
      expect(wrapper.vm.hasFormDataChanged).toBe(true);
    });

    it('returns false if comment, value and notApplicableValue are not changed', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                {
                  id: 1, comment: 'test', value: true, valueNotApplicable: false, notApplicableEnabled: false,
                },
              ],
            },
          },
        },
      });

      expect(wrapper.vm.hasFormDataChanged).toBe(false);
    });

    it('returns false if formData does not have elements', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData = { checklistId: 'asd-asd-dfgdfg' };

      expect(wrapper.vm.hasFormDataChanged).toBe(false);
    });

    it('returns true if checklistFileSourceMap is not empty', () => {
      const { wrapper } = createWrapper();

      wrapper.vm.formData = {
        checklistId: 'asd-asd-dfgdfg',
        elements: [{ id: 1, type: 'TEXT', value: 'test' }],
        checklistFileSourceMap: { 'file1.jpg': 'source1' },
      };

      expect(wrapper.vm.hasFormDataChanged).toBe(true);
    });

    it('returns false if checklistFileSourceMap is empty and no data has changed', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [{ id: 1, type: 'TEXT', value: 'test' }],
            },
          },
        },
      });

      wrapper.vm.formData = {
        checklistId: 'asd-asd-dfgdfg',
        elements: [{ id: 1, type: 'TEXT', value: 'test' }],
        checklistFileSourceMap: {},
      };

      expect(wrapper.vm.hasFormDataChanged).toBe(false);
    });

    it('returns true if checklistFileSourceMap is empty and data has changed', () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [{ id: 1, type: 'TEXT', value: 'test' }],
            },
          },
        },
      });

      wrapper.vm.formData = {
        checklistId: 'asd-asd-dfgdfg',
        elements: [{ id: 1, type: 'TEXT', value: 'changed' }],
        checklistFileSourceMap: {},
      };

      expect(wrapper.vm.hasFormDataChanged).toBe(true);
    });
  });

  describe('getChecklistNormalizedValue', () => {
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper());
    });

    it('returns null if value is undefined', () => {
      expect(wrapper.vm.getChecklistNormalizedValue(undefined)).toBe(null);
    });

    it('returns null if value is empty string', () => {
      expect(wrapper.vm.getChecklistNormalizedValue('')).toBe(null);
    });

    it('returns null if value is empty array', () => {
      expect(wrapper.vm.getChecklistNormalizedValue([])).toBe(null);
    });

    it('returns value if value is not undefined, empty string or empty array', () => {
      expect(wrapper.vm.getChecklistNormalizedValue(null)).toBe(null);
      expect(wrapper.vm.getChecklistNormalizedValue('test')).toBe('test');
      expect(wrapper.vm.getChecklistNormalizedValue(123)).toBe(123);
      expect(wrapper.vm.getChecklistNormalizedValue(false)).toBe(false);
      expect(wrapper.vm.getChecklistNormalizedValue([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('getNormalizedNotApplicableValue', () => {
    it('returns false if value is undefined', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.getNormalizedNotApplicableValue(undefined)).toBe(false);
    });

    it('returns value if value is not undefined', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.getNormalizedNotApplicableValue('')).toBe('');
      expect(wrapper.vm.getNormalizedNotApplicableValue('test')).toBe('test');
      expect(wrapper.vm.getNormalizedNotApplicableValue(123)).toBe(123);
      expect(wrapper.vm.getNormalizedNotApplicableValue(false)).toBe(false);
    });
  });

  describe('areFormDataValuesEqual', () => {
    let wrapper;

    beforeEach(() => {
      ({ wrapper } = createWrapper());
    });

    it('returns true if both values are null', () => {
      expect(wrapper.vm.areFormDataValuesEqual(null, null)).toBe(true);
    });

    it('returns true if both values are undefined', () => {
      expect(wrapper.vm.areFormDataValuesEqual(undefined, undefined)).toBe(true);
    });

    it('returns true if one value is null and the other qualifies as missing value', () => {
      expect(wrapper.vm.areFormDataValuesEqual(null, undefined)).toBe(true);
      expect(wrapper.vm.areFormDataValuesEqual(undefined, null)).toBe(true);
      expect(wrapper.vm.areFormDataValuesEqual(null, [])).toBe(true);
      expect(wrapper.vm.areFormDataValuesEqual([], null)).toBe(true);
      expect(wrapper.vm.areFormDataValuesEqual(null, '')).toBe(true);
      expect(wrapper.vm.areFormDataValuesEqual('', null)).toBe(true);
    });

    it('returns false if one value is null and the other is 0', () => {
      expect(wrapper.vm.areFormDataValuesEqual(null, 0)).toBe(false);
      expect(wrapper.vm.areFormDataValuesEqual(0, null)).toBe(false);
    });

    it('returns false if one value is null and the other is not', () => {
      expect(wrapper.vm.areFormDataValuesEqual(null, 'test')).toBe(false);
      expect(wrapper.vm.areFormDataValuesEqual('test', null)).toBe(false);
    });

    it('returns true if both values are equal', () => {
      expect(wrapper.vm.areFormDataValuesEqual('test', 'test')).toBe(true);
      expect(wrapper.vm.areFormDataValuesEqual(123, 123)).toBe(true);
      expect(wrapper.vm.areFormDataValuesEqual([1, 2], [1, 2])).toBe(true);
      expect(wrapper.vm.areFormDataValuesEqual(['test1', 'test2'], ['test2', 'test1'])).toBe(true);
    });

    it('returns false if values are not equal', () => {
      expect(wrapper.vm.areFormDataValuesEqual('test', 'different')).toBe(false);
      expect(wrapper.vm.areFormDataValuesEqual(123, 456)).toBe(false);
      expect(wrapper.vm.areFormDataValuesEqual([1, 2], [2, 3])).toBe(false);
      expect(wrapper.vm.areFormDataValuesEqual(['test1', 'test2'], ['test1', 'test3'])).toBe(false);
    });
  });

  describe('isEmptyValue', () => {
    it('returns true if value is empty array', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.isEmptyValue([])).toBe(true);
    });

    it('returns false if value is not empty array', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.isEmptyValue([1, 2, 3])).toBe(false);
    });

    it('returns true if value is undefined', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.isEmptyValue(undefined)).toBe(true);
    });

    it('returns true if value is null', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.isEmptyValue(null)).toBe(true);
    });

    it('returns true if value is empty string', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.isEmptyValue('')).toBe(true);
    });

    it('returns false if value is false', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.isEmptyValue(false)).toBe(false);
    });

    it('returns false if value is 0', () => {
      const { wrapper } = createWrapper();

      expect(wrapper.vm.isEmptyValue(0)).toBe(false);
    });
  });

  describe('onFileAdded', () => {
    it('pops element from filesLoading array', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                { id: 1, type: 'FILE', value: null, valueNotApplicable: false, notApplicableEnabled: false },
              ],
            },
          },
        },
        mountFn: mount,
      });

      await flushPromises();
      wrapper.vm.filesLoading = [1];
      expect(wrapper.vm.filesLoading.length).toBe(1);
      wrapper.vm.onFileAdded({ id: 1 }, 'file.jpg', 'base64source');
      expect(wrapper.vm.filesLoading.length).toBe(0);
    });

    it('does not add file to checklistFileSourceMap filePath is not given', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                { id: 1, type: 'FILE', value: null, valueNotApplicable: false, notApplicableEnabled: false },
              ],
            },
          },
        },
        mountFn: mount,
      });

      await flushPromises();
      expect(Object.keys(wrapper.vm.formData.checklistFileSourceMap).length).toBe(0);
      wrapper.vm.onFileAdded({ id: 1 }, null);
      expect(Object.keys(wrapper.vm.formData.checklistFileSourceMap).length).toBe(0);
    });

    it('adds file to checklistFileSourceMap if filePath is given', async () => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                { id: 1, type: 'FILE', value: null, valueNotApplicable: false, notApplicableEnabled: false },
              ],
            },
          },
        },
        mountFn: mount,
      });

      await flushPromises();
      expect(Object.keys(wrapper.vm.formData.checklistFileSourceMap).length).toBe(0);
      wrapper.vm.onFileAdded({ id: 1 }, 'file.jpg');
      expect(Object.keys(wrapper.vm.formData.checklistFileSourceMap).length).toBe(1);
      expect(wrapper.vm.formData.checklistFileSourceMap[1]).toEqual(['file.jpg']);
    });
  });

  describe('onFileRemoved', () => {
    const mountWithFileMap = async (fileSourceMap) => {
      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              checklistId: 'asd-asd-dfgdfg',
              elements: [{ id: 1, type: 'CHECK', value: null }],
            },
          },
        },
        mountFn: mount,
      });
      await flushPromises();
      wrapper.vm.formData.checklistFileSourceMap = fileSourceMap;
      return wrapper;
    };

    it('removes file by path', async () => {
      const wrapper = await mountWithFileMap({ 1: ['/path/to/file1.jpg', '/path/to/file2.jpg'] });

      wrapper.vm.onFileRemoved({ id: 1 }, { file: { path: '/path/to/file1.jpg', fileName: 'file1.jpg' } });

      expect(wrapper.vm.formData.checklistFileSourceMap[1]).toEqual(['/path/to/file2.jpg']);
    });

    it('removes file by fileName when path is unavailable', async () => {
      const wrapper = await mountWithFileMap({ 1: ['file1.jpg', 'file2.jpg'] });

      wrapper.vm.onFileRemoved({ id: 1 }, { file: { fileName: 'file1.jpg' } });

      expect(wrapper.vm.formData.checklistFileSourceMap[1]).toEqual(['file2.jpg']);
    });

    it('keeps map unchanged when file not found', async () => {
      const wrapper = await mountWithFileMap({ 1: ['/path/to/file1.jpg'] });

      wrapper.vm.onFileRemoved({ id: 1 }, { file: { path: '/path/to/nonexistent.jpg' } });

      expect(wrapper.vm.formData.checklistFileSourceMap[1]).toEqual(['/path/to/file1.jpg']);
    });

    it('initializes empty array for element if not exists', async () => {
      const wrapper = await mountWithFileMap({});

      wrapper.vm.onFileRemoved({ id: 1 }, { file: { path: '/path/to/file.jpg' } });

      expect(wrapper.vm.formData.checklistFileSourceMap[1]).toEqual([]);
    });
  });

  describe('file loading on mount', () => {
    it('populates checklistFileSourceMap from loaded files', async () => {
      getTaskFiles.mockResolvedValueOnce([
        { path: '/path/to/file1.jpg', checklistTaskElementId: 1 },
        { path: '/path/to/file2.jpg', checklistTaskElementId: 1 },
        { path: '/path/to/file3.jpg', checklistTaskElementId: 2 },
      ]);

      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              id: 'task-123',
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                { id: 1, type: 'CHECK', value: null },
                { id: 2, type: 'CHECK', value: null },
              ],
            },
          },
        },
        mountFn: mount,
      });

      await flushPromises();

      expect(wrapper.vm.formData.checklistFileSourceMap[1]).toEqual(['/path/to/file1.jpg', '/path/to/file2.jpg']);
      expect(wrapper.vm.formData.checklistFileSourceMap[2]).toEqual(['/path/to/file3.jpg']);
    });

    it('skips files without path property', async () => {
      getTaskFiles.mockResolvedValueOnce([
        { path: '/path/to/file1.jpg', checklistTaskElementId: 1 },
        { fileName: 'file2.jpg', checklistTaskElementId: 1 },
        { path: null, checklistTaskElementId: 1 },
      ]);

      const { wrapper } = createWrapper({
        storeOverrides: {
          dialogData: {
            item: {
              id: 'task-123',
              checklistId: 'asd-asd-dfgdfg',
              elements: [
                { id: 1, type: 'CHECK', value: null },
              ],
            },
          },
        },
        mountFn: mount,
      });

      await flushPromises();

      expect(wrapper.vm.formData.checklistFileSourceMap[1]).toEqual(['/path/to/file1.jpg']);
    });

    it('does not call getTaskFiles for manual checklists', async () => {
      getTaskFiles.mockClear();

      createWrapper({
        storeOverrides: {
          dialogData: {
            manual: true,
            item: {
              id: 'task-123',
              checklistId: 'asd-asd-dfgdfg',
              elements: [],
            },
          },
        },
      });

      await flushPromises();

      expect(getTaskFiles).not.toHaveBeenCalled();
    });
  });

  it('calls clearSliceSelection when closing manual checklist', async () => {
    const { wrapper, stores } = createWrapper({
      storeOverrides: {
        dialogData: {
          manual: true,
          item: { elements: [] },
        },
      },
    });

    await wrapper.vm.close();

    expect(stores.shiftviewSelectionStore.clearSliceSelection).toHaveBeenCalled();
  });
});
