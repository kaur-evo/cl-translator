import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ShrinkableListItem from './index.vue';

const defaultPiniaState = {
  mainNavDrawerConfig: { drawerOpen: false },
};

const createWrapper = ({ props, piniaOverrides = {} } = {}) => shallowMount(ShrinkableListItem, {
  props,
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: { ...defaultPiniaState, ...piniaOverrides },
    })],
    stubs: { 'v-list-item': false },
  },
});

describe('ShrinkableListItem', () => {
  describe('Render', () => {
    afterEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-09-01'));
    });

    it('renders correctly', () => {
      expect(createWrapper().element).toMatchSnapshot();
    });

    it('renders active item correctly', () => {
      expect(createWrapper({ props: { closed: false, active: true } }).element).toMatchSnapshot();
    });

    it('renders inactive item correctly', () => {
      expect(createWrapper({ props: { closed: false, active: false } }).element).toMatchSnapshot();
    });

    it('renders menu item with dot correctly', () => {
      expect(createWrapper({ props: { closed: true, active: false, menuItemHasDot: true } }).element).toMatchSnapshot();
    });

    it('renders menu item with title dot correcly', () => {
      expect(createWrapper({ props: { closed: false, active: false, menuItemTitleHasDot: true } }).element).toMatchSnapshot();
    });

    it('renders menu item with new tag correctly if newIndicatorShownUntil exists', () => {
      expect(createWrapper({ props: { closed: false, active: false, newIndicatorShownUntil: '2024-10-01' } }).element).toMatchSnapshot();
    });
  });
});
