import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { subMinutes, format } from 'date-fns';

import ChecklistNotification from './index.vue';

import { useShiftviewSelectionStore, useGenericDialogStore } from '@/stores/index';

const componentData = {
  isVisible: true,
  closed: false,
};

const createPinia = ({ checklistTasks = [], runningShiftChecklists = [], isSelectionActive = false } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      checklistTask: { checklistTasks, runningShiftChecklists },
      shift: { shift: { id: 123 }, currentShift: { id: 123 } },
    },
  });
  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.isSelectionActive = isSelectionActive;
  return pinia;
};

describe('ChecklistNotification', () => {
  it('Shows correct notification with one NEW check', async () => {
    const checkTime = subMinutes(new Date(), 3);
    const wrapper = mount(ChecklistNotification, {
      global: {
        plugins: [createPinia({
          checklistTasks: [{ status: 'NEW', name: 'test notification', dateTime: checkTime }],
        })],
      },
    });
    await wrapper.setData(componentData);
    expect(wrapper.vm.checkText).toBe(`test notification due at ${format(checkTime, 'HH:mm')}`);
  });

  it('Doesnt show a NEW check that is older than 5 minutes', async () => {
    const checkTime1 = subMinutes(new Date(), 3);
    const checkTime2 = subMinutes(new Date(), 6);
    const wrapper = mount(ChecklistNotification, {
      global: {
        plugins: [createPinia({
          checklistTasks: [
            { status: 'NEW', name: 'test notification 1', dateTime: checkTime1 },
            { status: 'NEW', name: 'test notification 2', dateTime: checkTime2 },
          ],
        })],
      },
    });
    await wrapper.setData(componentData);

    expect(wrapper.vm.checkText).toBe(`test notification 1 due at ${format(checkTime1, 'HH:mm')}`);
  });

  it('Shows correct notification with multiple NEW checks', async () => {
    const wrapper = mount(ChecklistNotification, {
      global: {
        plugins: [createPinia({
          checklistTasks: [{ status: 'NEW', name: 'test notification' }, { status: 'NEW', name: 'test notification' }],
        })],
      },
    });
    await wrapper.setData(componentData);

    expect(wrapper.vm.checkText).toBe('New checklists ({variable})');
  });

  test('that onDoCheck calls openDialog', async () => {
    const pinia = createPinia({
      checklistTasks: [{ status: 'NEW', name: 'test notification' }, { status: 'NEW', name: 'test notification' }],
    });
    const genericDialogStore = useGenericDialogStore(pinia);
    const wrapper = mount(ChecklistNotification, {
      global: { plugins: [pinia] },
    });
    await wrapper.setData(componentData);
    wrapper.vm.onDoCheck();
    expect(genericDialogStore.openDialog).toHaveBeenCalled();
  });

  test('that newChecks computed property returns only NEW checks that are triggered within last 5 minutes', async () => {
    const checkTime1 = subMinutes(new Date(), 3);
    const checkTime2 = subMinutes(new Date(), 6);
    const wrapper = mount(ChecklistNotification, {
      global: {
        plugins: [createPinia({
          checklistTasks: [
            { status: 'NEW', name: 'test notification 1', dateTime: checkTime1 },
            { status: 'NEW', name: 'test notification 2', dateTime: checkTime2 },
            { status: 'SUCCESSFUL', name: 'test notification 3', dateTime: checkTime1 },
            { status: 'UNSUCCESSFUL', name: 'test notification 4', dateTime: checkTime2 },
            { status: 'MISSED', name: 'test notification 5', dateTime: checkTime2 },
            { status: 'NEW', name: 'test notification 6', dateTime: checkTime1 },
            { status: 'NEW', name: 'test notification 7', dateTime: checkTime2 },
          ],
        })],
      },
    });
    await wrapper.setData(componentData);

    expect(wrapper.vm.newChecks.length).toBe(2);
    expect(wrapper.vm.newChecks[0].name).toBe('test notification 1');
    expect(wrapper.vm.newChecks[1].name).toBe('test notification 6');
  });

  test('that firstCheck computed property returns first NEW check that is triggered within last 5 minutes', async () => {
    const checkTime1 = subMinutes(new Date(), 3);
    const checkTime2 = subMinutes(new Date(), 6);
    const wrapper = mount(ChecklistNotification, {
      global: {
        plugins: [createPinia({
          checklistTasks: [
            { status: 'NEW', name: 'test notification 1', dateTime: checkTime1 },
            { status: 'NEW', name: 'test notification 2', dateTime: checkTime2 },
            { status: 'SUCCESSFUL', name: 'test notification 3', dateTime: checkTime1 },
            { status: 'UNSUCCESSFUL', name: 'test notification 4', dateTime: checkTime2 },
            { status: 'MISSED', name: 'test notification 5', dateTime: checkTime2 },
            { status: 'NEW', name: 'test notification 6', dateTime: checkTime1 },
            { status: 'NEW', name: 'test notification 7', dateTime: checkTime2 },
          ],
        })],
      },
    });
    await wrapper.setData(componentData);

    expect(wrapper.vm.firstCheck.name).toBe('test notification 1');
  });

  test('that notification is not shown if brackets are enabled', async () => {
    const checkTime = subMinutes(new Date(), 3);
    const wrapper = mount(ChecklistNotification, {
      global: {
        plugins: [createPinia({
          checklistTasks: [{ status: 'NEW', name: 'test notification 1', dateTime: checkTime }],
          isSelectionActive: true,
        })],
      },
    });

    await wrapper.setData({ isVisible: true });

    expect(wrapper.vm.isToastVisible).toBe(false);
  });

  describe('isToastVisible watcher', () => {
    it('emits toggle-notification with true when toast is becoming visible', () => {
      const wrapper = mount(ChecklistNotification, {
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.$options.watch.isToastVisible.call(wrapper.vm, true);
      expect(wrapper.emitted('toggle-notification')[0][0]).toBe(true);
    });

    it('emits toggle-notification with false when toast is hidden', () => {
      const wrapper = mount(ChecklistNotification, {
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.$options.watch.isToastVisible.call(wrapper.vm, false);
      expect(wrapper.emitted('toggle-notification')[0][0]).toBe(false);
    });
  });
});
