import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { cloneDeep } from 'lodash';

import IntervalChecklistStartTimeDialog from './index';

import useGenericDialogStore from '@/stores/genericDialog';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import { buildIntervalStartTimeISO } from '@/helpers/time/buildIntervalStartTimeISO';

vi.mock('@/helpers/time/buildIntervalStartTimeISO', () => ({
  buildIntervalStartTimeISO: vi.fn((hhMm) => `ISO(${hhMm})`),
}));

const defaultPiniaState = {
  genericDialog: {
    dialogData: {
      checklist: { id: 12, name: 'Test Checklist' },
    },
  },
  routeModule: { query: {} },
};

const createGlobal = (piniaOverrides = {}) => ({
  plugins: [
    createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: cloneDeep({ ...defaultPiniaState, ...piniaOverrides }),
    }),
  ],
});

describe('IntervalChecklistStartTimeDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(IntervalChecklistStartTimeDialog, {
      global: createGlobal(),
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onSave', () => {
    it('passes the picked HH:mm through buildIntervalStartTimeISO and dispatches the converted value', async () => {
      const wrapper = shallowMount(IntervalChecklistStartTimeDialog, {
        global: createGlobal(),
      });
      const checklistTemplateStore = useChecklistTemplateStore();
      const saveChecklistSpy = vi.spyOn(checklistTemplateStore, 'saveChecklist');

      wrapper.vm.startTimeOption = 'time';
      wrapper.vm.startTime = '10:30';
      await wrapper.vm.onSave();
      expect(buildIntervalStartTimeISO).toHaveBeenCalledWith('10:30');
      expect(saveChecklistSpy).toHaveBeenCalledWith({
        id: 12,
        name: 'Test Checklist',
        startTime: 'ISO(10:30)',
      });
      const genericDialogStore = useGenericDialogStore();
      expect(genericDialogStore.isOpen).toBe(false);
    });

    it('omits startTime when the user chose "now"', async () => {
      const wrapper = shallowMount(IntervalChecklistStartTimeDialog, {
        global: createGlobal(),
      });
      const checklistTemplateStore = useChecklistTemplateStore();
      const saveChecklistSpy = vi.spyOn(checklistTemplateStore, 'saveChecklist');

      wrapper.vm.startTimeOption = 'now';
      wrapper.vm.startTime = null;
      await wrapper.vm.onSave();
      expect(buildIntervalStartTimeISO).not.toHaveBeenCalled();
      expect(saveChecklistSpy).toHaveBeenCalledWith({
        id: 12,
        name: 'Test Checklist',
      });
      const genericDialogStore = useGenericDialogStore();
      expect(genericDialogStore.isOpen).toBe(false);
    });
  });
});
