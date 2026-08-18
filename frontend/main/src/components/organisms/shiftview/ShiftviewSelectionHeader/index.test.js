import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SelectionHeader from './index.vue';

import { useShiftviewSelectionStore } from '@/stores/index';

const createWrapper = (options = {}, pinia = createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    shiftviewSelection: { shiftviewSelectionType: 'PRODUCT' },
  },
})) => shallowMount(SelectionHeader, {
  global: { plugins: [pinia] },
  ...options,
});

describe('SelectionHeader', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('keyListener', () => {
    test('that Escape calls clearSliceSelection and clearPinSelection', () => {
      const pinia = createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          shiftviewSelection: { shiftviewSelectionType: 'PRODUCT' },
        },
      });
      const wrapper = createWrapper({}, pinia);
      const selectionStore = useShiftviewSelectionStore(pinia);

      wrapper.vm.keyListener({ key: 'Escape' });

      expect(selectionStore.clearPinSelection).toHaveBeenCalledTimes(1);
      expect(selectionStore.clearSliceSelection).toHaveBeenCalledTimes(1);
    });
  });
});
