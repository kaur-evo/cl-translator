import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsActivityLogsSVOverview from './index.vue';

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    station: {
      stations: [{ id: 1, name: 'Station 1' }],
    },
    feature: {
      checklists: true,
    },
    profile: {},
  },
});

describe('SettingsActivityLogsSVOverview', () => {
  it('renders', () => {
    const wrapper = shallowMount(SettingsActivityLogsSVOverview, {
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = shallowMount(SettingsActivityLogsSVOverview, {
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that onLinkClick calls window.open with correct URL', () => {
    const wrapper = shallowMount(SettingsActivityLogsSVOverview, {
      global: { plugins: [createPinia()] },
    });

    window.open = vi.fn();
    const item = { station: { id: 1 }, shift: { id: 2 } };
    wrapper.vm.onLinkClick(item);
    expect(window.open).toHaveBeenCalledWith(`#/shiftview/${item.station.id}/${item.shift.id}`, '_blank');
    window.open.mockRestore();
  });
});
