import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPlaylistCheck, mdiAutorenew, mdiAccount, mdiImageOutline } from '@mdi/js';

import ShiftviewPinPopover from './index.vue';

import { useProfileStore } from '@/stores/index';
import { pinTypes } from '@/constants/shiftviewPinConstants';
import { checklistStatuses } from '@/constants/checklistsConstants';
import colorConstants from '@/constants/colorConstants';
import shiftviewDialogs from '@/constants/dialogConfigs';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import checklistEditDialogConfig from '@/constants/shiftviewDialogConfigs/checklistEditDialogConfig';

const target = document.createElement('div');

const createWrapper = (piniaOverrides = {}, options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const profileStore = useProfileStore(pinia);
  vi.spyOn(profileStore, 'isReadOnly', 'get').mockReturnValue(piniaOverrides.isReadOnly ?? false);

  return shallowMount(ShiftviewPinPopover, {
    global: { plugins: [pinia] },
    ...options,
  });
};

describe('ShiftviewPinPopover', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper({}, {
      props: {
        items: [
          { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL } },
          { type: pinTypes.TEAM, time: '2020-02-02T12:00:05' },
        ],
        targetEl: target,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with times from different minutes', () => {
    const wrapper = createWrapper({}, {
      props: {
        items: [
          { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' },
          { type: pinTypes.CHECK, time: '2020-02-02T12:01:00', check: { status: checklistStatuses.NEW } },
        ],
        targetEl: target,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('getIconColor', () => {
    const wrapper = createWrapper({}, {
      props: {
        items: [
          { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL } },
          { type: pinTypes.TEAM, time: '2020-02-02T12:00:05' },
        ],
        targetEl: target,
      },
    });

    expect(wrapper.vm.getIconColor({ type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' })).toBe(colorConstants.dark['lw-blue']);
    expect(wrapper.vm.getIconColor({ type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED } })).toBe(colorConstants.dark['lw-red']);
    expect(wrapper.vm.getIconColor({ type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW } })).toBe(colorConstants.dark['tertiary-dark']);
    expect(wrapper.vm.getIconColor({ type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL } })).toBe(colorConstants.dark.primary);
    expect(wrapper.vm.getIconColor({ type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL } })).toBe(colorConstants.dark['lw-orange']);
    expect(wrapper.vm.getIconColor({ type: pinTypes.TEAM, time: '2020-02-02T12:00:05' })).toBe('');
  });

  test('getIcon', () => {
    const wrapper = createWrapper({}, {
      props: {
        items: [
          { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL } },
          { type: pinTypes.TEAM, time: '2020-02-02T12:00:05' },
        ],
        targetEl: target,
      },
    });

    expect(wrapper.vm.getIcon({ type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' })).toBe(mdiAutorenew);
    expect(wrapper.vm.getIcon({ type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED } })).toBe(mdiPlaylistCheck);
    expect(wrapper.vm.getIcon({ type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW } })).toBe(mdiPlaylistCheck);
    expect(wrapper.vm.getIcon({ type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL } })).toBe(mdiPlaylistCheck);
    expect(wrapper.vm.getIcon({ type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL } })).toBe(mdiPlaylistCheck);
    expect(wrapper.vm.getIcon({ type: pinTypes.TEAM, time: '2020-02-02T12:00:05' })).toBe(mdiAccount);
  });

  test('getText', () => {
    const wrapper = createWrapper({}, {
      props: {
        items: [
          { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED, name: 'checklist 1' } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW, name: 'another checklist' } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL, name: 'a good checklist' } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL, name: 'fourth checklist' } },
          { type: pinTypes.TEAM, time: '2020-02-02T12:00:05' },
        ],
        targetEl: target,
      },
    });

    expect(wrapper.vm.getText({ type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' })).toBe('Edit changeover');
    expect(wrapper.vm.getText({ type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED, name: 'checklist 1' } })).toBe('checklist 1');
    expect(wrapper.vm.getText({ type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW, name: 'another checklist' } })).toBe('another checklist');
    expect(wrapper.vm.getText({ type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL, name: 'a good checklist' } })).toBe('a good checklist');
    expect(wrapper.vm.getText({ type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL, name: 'fourth checklist' } })).toBe('fourth checklist');
    expect(wrapper.vm.getText({ type: pinTypes.TEAM, time: '2020-02-02T12:00:05' })).toBe('Edit team');
  });

  test('onItemClick', () => {
    const wrapper = createWrapper({}, {
      props: {
        items: [
          { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00', slice: { id: 12 } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED, name: 'checklist 1' } },
          { type: pinTypes.TEAM, time: '2020-02-02T12:00:05', team: { id: 1233 } },
        ],
        targetEl: target,
      },
    });

    const openDialog = vi.spyOn(wrapper.vm, 'openDialog');
    const selectSlice = vi.spyOn(wrapper.vm, 'selectSlice');

    wrapper.vm.onItemClick({ type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00', slice: { id: 12 } });
    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(openDialog).toHaveBeenLastCalledWith(shiftviewDialogs.CHANGEOVER);
    expect(selectSlice).toHaveBeenCalledTimes(1);
    expect(selectSlice).toHaveBeenLastCalledWith({ id: 12, isPin: true });
    wrapper.vm.onItemClick({ type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED, name: 'checklist 1' } });
    expect(openDialog).toHaveBeenCalledTimes(2);
    expect(openDialog).toHaveBeenLastCalledWith({ ...checklistEditDialogConfig, data: { item: { status: checklistStatuses.MISSED, name: 'checklist 1' } } });
    expect(selectSlice).toHaveBeenCalledTimes(1);
    wrapper.vm.onItemClick({ type: pinTypes.TEAM, time: '2020-02-02T12:00:05', team: { id: 1233 } });
    expect(openDialog).toHaveBeenCalledTimes(3);
    expect(openDialog).toHaveBeenLastCalledWith({ ...editTeamDialogConfig, data: { id: 1233 } });
    expect(selectSlice).toHaveBeenCalledTimes(1);
  });

  test('onItemClick in read-only mode', () => {
    const wrapper = createWrapper({ isReadOnly: true }, {
      props: {
        items: [
          { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00', slice: { id: 12 } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED, name: 'checklist 1' } },
          { type: pinTypes.TEAM, time: '2020-02-02T12:00:05', team: { id: 1233 } },
        ],
        targetEl: target,
      },
    });

    const openDialog = vi.spyOn(wrapper.vm, 'openDialog');
    const notifyError = vi.spyOn(wrapper.vm, 'notifyError');

    wrapper.vm.onItemClick({ type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00', slice: { id: 12 } });
    expect(notifyError).toHaveBeenLastCalledWith('You are in read-only mode');

    wrapper.vm.onItemClick({ type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED, name: 'checklist 1' } });
    expect(openDialog).toHaveBeenLastCalledWith({ ...checklistEditDialogConfig, data: { item: { status: checklistStatuses.MISSED, name: 'checklist 1' } } });

    wrapper.vm.onItemClick({ type: pinTypes.TEAM, time: '2020-02-02T12:00:05', team: { id: 1233 } });
    expect(notifyError).toHaveBeenLastCalledWith('You are in read-only mode');
  });

  test('mappedItems', () => {
    const wrapper = createWrapper({}, {
      props: {
        items: [
          { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00' },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED, fileCount: 0 } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW, fileCount: 0 } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL, fileCount: 5 } },
          { type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL, fileCount: 1 } },
          { type: pinTypes.TEAM, time: '2020-02-02T12:00:05' },
        ],
        targetEl: target,
      },
    });

    expect(wrapper.vm.mappedItems).toEqual([
      { type: pinTypes.CHANGEOVER, time: '2020-02-02T12:00:00', appendIcon: null },
      { type: pinTypes.CHECK, time: '2020-02-02T12:00:01', check: { status: checklistStatuses.MISSED, fileCount: 0 }, appendIcon: null },
      { type: pinTypes.CHECK, time: '2020-02-02T12:00:02', check: { status: checklistStatuses.NEW, fileCount: 0 }, appendIcon: null },
      { type: pinTypes.CHECK, time: '2020-02-02T12:00:03', check: { status: checklistStatuses.SUCCESSFUL, fileCount: 5 }, appendIcon: mdiImageOutline },
      { type: pinTypes.CHECK, time: '2020-02-02T12:00:04', check: { status: checklistStatuses.UNSUCCESSFUL, fileCount: 1 }, appendIcon: mdiImageOutline },
      { type: pinTypes.TEAM, time: '2020-02-02T12:00:05', appendIcon: null },
    ]);
  });
});
