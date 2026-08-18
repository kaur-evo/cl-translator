import { setActivePinia, createPinia } from 'pinia';

import useSettingsSideMenuStore from './index';

describe('useSettingsSideMenuStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useSettingsSideMenuStore();
  });

  test('initial state', () => {
    expect(store.isCollapsed).toBe(false);
  });

  test('setIsCollapsed sets isCollapsed to true', () => {
    store.setIsCollapsed(true);
    expect(store.isCollapsed).toBe(true);
  });

  test('setIsCollapsed sets isCollapsed to false', () => {
    store.isCollapsed = true;
    store.setIsCollapsed(false);
    expect(store.isCollapsed).toBe(false);
  });
});
