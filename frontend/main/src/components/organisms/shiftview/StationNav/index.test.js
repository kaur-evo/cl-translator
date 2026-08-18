import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import StationNav from './index.vue';

import { useFactoryStore } from '@/stores/index';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const defaultPiniaState = {
  station: { lineviewStation: { id: 12 } },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const factoryStore = useFactoryStore(pinia);
  factoryStore.orderedFactories = overrides.factory?.orderedFactories ?? [
    { id: 1, name: 'Factory 1', stations: [{ id: 11, name: 'Station1' }, { id: 12, name: 'Station2' }] },
    { id: 2, name: 'Factory 2', stations: [{ id: 22, name: 'Station1' }, { id: 23, name: 'Station2' }] },
  ];

  return pinia;
};

const createWrapper = (overrides = {}, options = {}) => mount(StationNav, {
  global: { plugins: [createPinia(overrides)] },
  ...options,
});

describe('StationNav', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when large is true', () => {
    const wrapper = createWrapper({}, { props: { large: true } });

    expect(wrapper.element).toMatchSnapshot();
  });
});
