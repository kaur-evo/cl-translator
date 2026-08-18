import { setActivePinia, createPinia } from 'pinia';

import useBottomSheetStore from './index';

const mockComponent = { name: 'MockComponent' };

describe('useBottomSheetStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useBottomSheetStore();
  });

  test('initial state', () => {
    expect(store.isOpen).toBe(false);
    expect(store.component).toBe(null);
    expect(store.componentProps).toStrictEqual({});
    expect(store.title).toBe('');
    expect(store.theme).toBe('dark');
    expect(store.height).toBe(null);
  });

  describe('openBottomSheet', () => {
    test('sets all config fields and opens the sheet', () => {
      store.openBottomSheet({
        component: mockComponent,
        componentProps: { tab: 'overview' },
        title: 'Test title',
        theme: 'light',
        height: 360,
      });
      expect(store.isOpen).toBe(true);
      expect(store.component).toStrictEqual(mockComponent);
      expect(store.componentProps).toStrictEqual({ tab: 'overview' });
      expect(store.title).toBe('Test title');
      expect(store.theme).toBe('light');
      expect(store.height).toBe(360);
    });

    test('applies defaults for missing fields', () => {
      store.openBottomSheet({});
      expect(store.isOpen).toBe(true);
      expect(store.component).toBe(null);
      expect(store.componentProps).toStrictEqual({});
      expect(store.title).toBe('');
      expect(store.theme).toBe('dark');
      expect(store.height).toBe(null);
    });
  });

  describe('closeBottomSheet', () => {
    test('closes the sheet and resets all fields to defaults', () => {
      store.openBottomSheet({ component: mockComponent, title: 'Title', theme: 'light', height: 300 });
      store.closeBottomSheet();
      expect(store.isOpen).toBe(false);
      expect(store.component).toBe(null);
      expect(store.componentProps).toStrictEqual({});
      expect(store.title).toBe('');
      expect(store.theme).toBe('dark');
      expect(store.height).toBe(null);
    });
  });
});
