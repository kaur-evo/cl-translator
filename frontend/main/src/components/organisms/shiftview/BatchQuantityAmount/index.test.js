import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useUserPreferencesStore } from '@/stores/index';

const propsDefault = {
  showGoodQty: true,
  batch: {
    producedQty: 100,
    scrapQty: 5,
    plannedQty: 50,
    mainToAltUnitConversion: 0.5,
    unitConversionType: 'PRIMARY_TO_ALT',
    unitConversion: 2,
    unitId: 'unit',
    alternativeUnitId: 'alternativeUnit',
  },
};

const createWrapper = ({ props = propsDefault, viewSettings = { usePrimaryUnit: true } } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const userPreferencesStore = useUserPreferencesStore(pinia);
  userPreferencesStore.viewSettings = viewSettings;

  return shallowMount(index, {
    props,
    global: { plugins: [pinia] },
  });
};

describe('BatchQuantityAmount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when showGoodQty is false', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, showGoodQty: false } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if alternative unit is used', () => {
    const wrapper = createWrapper({ viewSettings: { usePrimaryUnit: false } });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with progress', () => {
    const wrapper = createWrapper({ props: { ...propsDefault, showProgress: true } });

    expect(wrapper.element).toMatchSnapshot();
  });
});
