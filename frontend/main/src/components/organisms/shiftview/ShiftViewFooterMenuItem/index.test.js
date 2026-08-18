import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPencil } from '@mdi/js';

import ShiftviewFooterMenuItem from './index.vue';

import { useShiftviewSelectionStore } from '@/stores/index';

const defaultPiniaState = {
  shiftviewTimeline: { timeline: [] },
  station: { lineviewStation: {} },
};

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { ...defaultPiniaState, ...overrides },
  });

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.isSelectionActive = overrides.shiftviewSelection?.isSelectionActive ?? false;

  return pinia;
};

const createWrapper = (overrides = {}, options = {}) => shallowMount(ShiftviewFooterMenuItem, {
  global: { plugins: [createPinia(overrides)] },
  props: options.props ?? { item: { id: 1 } },
});

describe('ShiftviewFooterMenuItem', () => {
  it('doesnt require operator when requireOperatorBeforeOpen is false,', async () => {
    const wrapper = createWrapper({}, { props: { item: { id: 1, requireOperatorBeforeOpen: false } } });

    const spy = vi.spyOn(wrapper.vm, 'requestOperator');
    await wrapper.find('.menu-item-button').trigger('click');

    expect(spy).toBeCalledTimes(0);
  });

  it('requires operator when requireOperatorBeforeOpen is true,', async () => {
    const wrapper = createWrapper({}, { props: { item: { id: 1, requireOperatorBeforeOpen: true } } });

    const spy = vi.spyOn(wrapper.vm, 'requestOperator');
    await wrapper.find('.menu-item-button').trigger('click');

    expect(spy).toBeCalledTimes(1);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper({}, {
      props: {
        item: {
          id: 1, requireOperatorBeforeOpen: false, name: 'test item', compact: false,
        },
      },
    });
    wrapper.vm.$vuetify.display.mdAndDown = false;

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with counter', () => {
    const wrapper = createWrapper({}, {
      props: {
        item: {
          id: 1, requireOperatorBeforeOpen: false, counter: 12, color: 'primary', icon: mdiPencil, name: 'test item', compact: false,
        },
      },
    });
    wrapper.vm.$vuetify.display.mdAndDown = false;

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with icon dot', () => {
    const wrapper = createWrapper({}, {
      props: {
        item: {
          id: 1, requireOperatorBeforeOpen: false, hasIconDot: true, color: 'primary', icon: mdiPencil, name: 'test item', compact: false,
        },
      },
    });
    wrapper.vm.$vuetify.display.mdAndDown = false;

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly as compact', () => {
    const wrapper = createWrapper({}, {
      props: {
        item: {
          id: 1, requireOperatorBeforeOpen: false, counter: 12, color: 'primary', icon: mdiPencil, name: 'test item', compact: true,
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
