import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShiftviewShiftOptionsMenu from './index.vue';

import { useShiftStore, useStationStore, useProfileStore } from '@/stores/index';
import shiftApi from '@/api/shiftApi';

vi.mock('@/api/shiftApi');
shiftApi.putShift.mockResolvedValue({ id: 1, stationId: 2 });
shiftApi.getShift.mockResolvedValue({ id: 1, stationId: 2 });

const createWrapper = (piniaOverrides = {}, options = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const shiftStore = useShiftStore(pinia);
  const stationStore = useStationStore(pinia);
  const profileStore = useProfileStore(pinia);

  shiftStore.shift = piniaOverrides.shift ?? { id: 1, startTimeISO: '2020-01-01T00:00:00.000Z' };
  shiftStore.currentShift = piniaOverrides.currentShift ?? { id: 3, stationId: 2, startTimeISO: '2019-12-31T18:00:00.000Z' };
  shiftStore.isShiftRunning = piniaOverrides.isShiftRunning ?? true;
  vi.spyOn(shiftStore, 'isLastShiftSelected', 'get').mockReturnValue(piniaOverrides.isLastShiftSelected ?? true);
  stationStore.lineviewStation = piniaOverrides.lineviewStation ?? { id: 2, zoneId: 'UTC' };
  vi.spyOn(profileStore, 'shiftviewStationRoleAllows', 'get').mockReturnValue(piniaOverrides.shiftviewStationRoleAllows ?? (() => true));

  return mount(ShiftviewShiftOptionsMenu, {
    global: {
      plugins: [pinia],
      ...options.global,
    },
    props: options.props,
  });
};

describe('ShiftviewShiftOptionsMenu', () => {
  describe('requestOperator', () => {
    it('doesnt request operator when requireOperator is false,', async () => {
      const wrapper = createWrapper({}, { props: { requireOperator: false } });

      const spy = vi.spyOn(wrapper.vm, 'requestOperator');
      await wrapper.find('.shift-menu-item').trigger('click');

      expect(spy).toBeCalledTimes(0);
    });

    it('requests operator when requireOperator is true,', async () => {
      const wrapper = createWrapper({}, { props: { requireOperator: true } });

      const spy = vi.spyOn(wrapper.vm, 'requestOperator');
      await wrapper.find('.shift-menu-item').trigger('click');

      expect(spy).toBeCalledTimes(1);
    });

    it('doesnt request operator when shift is not running', async () => {
      const wrapper = createWrapper(
        { isShiftRunning: false },
        { props: { requireOperator: true } },
      );

      const spy = vi.spyOn(wrapper.vm, 'requestOperator');
      await wrapper.find('.shift-menu-item').trigger('click');

      expect(spy).toBeCalledTimes(0);
    });
  });

  describe('finishShift', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2020-01-01T12:23:37.000Z'));
    });

    it('calls shiftApi.putShift with stationId, shiftId, startTimeISO, eventTimeISO and endTimeISO with seconds set to 00', async () => {
      const wrapper = createWrapper({}, { props: { requireOperator: false } });

      await wrapper.vm.finishShift();
      expect(shiftApi.putShift).toHaveBeenCalledTimes(1);
      expect(shiftApi.putShift).toHaveBeenCalledWith({
        endTimeISO: '2020-01-01T12:23:00.000Z', shiftId: 1, startTimeISO: '2020-01-01T00:00:00.000Z', stationId: 2, eventTimeISO: '2020-01-01T00:00:00.000Z',
      });
    });
  });

  describe('visibleMenuitems', () => {
    it('returns correct items if shift is running', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.visibleMenuItems.length).toBe(2);
      expect(wrapper.vm.visibleMenuItems[0].name).toBe('Edit shift time');
      expect(wrapper.vm.visibleMenuItems[1].name).toBe('Finish shift');
    });

    it('returns correct items if shift is not running, but last shift is selected', () => {
      const wrapper = createWrapper({ isShiftRunning: false });

      expect(wrapper.vm.visibleMenuItems.length).toBe(3);
      expect(wrapper.vm.visibleMenuItems[0].name).toBe('Start shift');
      expect(wrapper.vm.visibleMenuItems[1].name).toBe('Edit shift time');
      expect(wrapper.vm.visibleMenuItems[2].name).toBe('Delete shift');
    });

    it('returns correct items if shift is not running and last shift is not selected', () => {
      const wrapper = createWrapper({ isShiftRunning: false, isLastShiftSelected: false });

      expect(wrapper.vm.visibleMenuItems.length).toBe(2);
      expect(wrapper.vm.visibleMenuItems[0].name).toBe('Edit shift time');
      expect(wrapper.vm.visibleMenuItems[1].name).toBe('Delete shift');
    });

    it('returns correct items if shift is not running, but last shift is selected and shiftviewStationRoleAllows is false', () => {
      const wrapper = createWrapper({ isShiftRunning: false, shiftviewStationRoleAllows: () => false });

      expect(wrapper.vm.visibleMenuItems.length).toBe(1);
      expect(wrapper.vm.visibleMenuItems[0].name).toBe('Start shift');
    });
  });

  describe('shift deletion', () => {
    test('that onDeleteShift calls openConfirmDialog with correct parameters', async () => {
      const wrapper = createWrapper();

      const spy = vi.spyOn(wrapper.vm, 'openConfirmDialog');
      await wrapper.vm.onDeleteShift();
      expect(spy).toHaveBeenCalledWith({
        title: 'Confirmation',
        text: 'Are you sure you want to delete this shift? You cannot undo this action!',
        action: expect.any(Function),
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
    });

    test('that onDeleteShiftAction calls deleteShift and fetchCurrentShift actions and router pushes to correct path', async () => {
      const wrapper = createWrapper({}, {
        global: { mocks: { $router: { push: vi.fn() } } },
      });

      const spyDeleteShift = vi.spyOn(wrapper.vm, 'deleteShift');
      const spyFetchCurrentShift = vi.spyOn(wrapper.vm, 'fetchCurrentShift');

      await wrapper.vm.onDeleteShiftAction();

      expect(spyDeleteShift).toHaveBeenCalledTimes(1);
      expect(spyDeleteShift).toHaveBeenCalledWith({ id: 1, startTimeISO: '2020-01-01T00:00:00.000Z' });

      expect(spyFetchCurrentShift).toHaveBeenCalledTimes(1);
      expect(spyFetchCurrentShift).toHaveBeenCalledWith({ stationId: 2 });

      expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'shiftview', params: { stationId: 2, shiftId: 3 } });
    });
  });
});
