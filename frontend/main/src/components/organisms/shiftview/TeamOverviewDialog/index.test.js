import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import TeamOverviewDialog from './index.vue';

import { useDeviceStore } from '@/stores/index';
import operatorApi from '@/api/operatorApi';

vi.mock('@/api/operatorApi');
const deleteTeams = vi.fn(() => ({ success: true }));
operatorApi.deleteTeams = deleteTeams;

const defaultPiniaState = {
  station: { lineviewStation: {} },
  shiftviewTimeline: { teamTimeline: [] },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const deviceStore = useDeviceStore(pinia);
  deviceStore.showFullscreenDialogs = overrides.device?.showFullscreenDialogs ?? false;
  deviceStore.isMobileView = overrides.device?.isMobileView ?? false;

  return pinia;
};

const createWrapper = (overrides = {}) => shallowMount(TeamOverviewDialog, {
  global: { plugins: [createPinia(overrides)] },
});

describe('TeamOverviewDialog', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in tablet', () => {
    const wrapper = createWrapper({ device: { showFullscreenDialogs: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', () => {
    const wrapper = createWrapper({ device: { isMobileView: true } });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that removeTeam calls deleteTeams with correct station id and eventTime and notifies success', async () => {
    const wrapper = createWrapper({ station: { lineviewStation: { id: 2, zoneId: 'Europe/Tallinn' } } });

    const notifySuccess = vi.spyOn(wrapper.vm, 'notifySuccess');
    await wrapper.vm.removeTeam({ id: 1, startTimeISO: '2021-07-01T12:30:00.000+03:00' });

    expect(deleteTeams).toHaveBeenCalledTimes(1);
    expect(deleteTeams).toHaveBeenCalledWith(2, '20210701123001+0300');
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(notifySuccess).toHaveBeenCalledWith('Operators removed');
  });
});
