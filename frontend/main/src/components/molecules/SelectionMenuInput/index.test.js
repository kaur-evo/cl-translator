import { shallowMount } from '@vue/test-utils';
import { mdiDelete, mdiMenuUp, mdiMenuDown } from '@mdi/js';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  isOpen: true,
  modelValue: [],
  itemsMap: {},
  items: [],
  itemText: 'string',
  prependText: 'string',
};

describe('SelectionMenuInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that isAllSelected returns false for single select input', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, isSingleSelect: true },
    });

    expect(wrapper.vm.isAllSelected).toBe(false);
  });

  test('that isAllSelected returns true for multi select input if modelValue is empty and showEmptyArrayAsAllSelected is true', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        showEmptyArrayAsAllSelected: true,
        modelValue: [],
        isSingleSelect: false,
      },
    });

    expect(wrapper.vm.isAllSelected).toBe(true);
  });

  test('that isAllSelected returns false for multi select input if modelValue is empty and showEmptyArrayAsAllSelected is false', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        showEmptyArrayAsAllSelected: false,
        modelValue: [],
        isSingleSelect: false,
      },
    });

    expect(wrapper.vm.isAllSelected).toBe(false);
  });

  test('that isAllSelected retruns true for multi select input if modelValue is not empty and all items are selected', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        modelValue: ['1', '2'],
        totalCount: 2,
        isSingleSelect: false,
      },
    });

    expect(wrapper.vm.isAllSelected).toBe(true);
  });

  test('that isAllSelected retruns false for multi select input if modelValue is not empty and not all items are selected', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        modelValue: ['1'],
        totalCount: 2,
        isSingleSelect: false,
      },
    });

    expect(wrapper.vm.isAllSelected).toBe(false);
  });

  test('that isAllSelected retruns true for multi select input if modelValue length minus hidddenItemsCount equals totalCount', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        modelValue: ['1', '2'],
        hiddenItemsCount: 1,
        totalCount: 1,
        isSingleSelect: false,
      },
    });

    expect(wrapper.vm.isAllSelected).toBe(true);
  });

  test('that isAllSelected retruns false for multi select input if modelValue length minus hidddenItemsCount doesnt equal totalCount', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        modelValue: ['1', '2'],
        hiddenItemsCount: 1,
        totalCount: 10,
        isSingleSelect: false,
      },
    });

    expect(wrapper.vm.isAllSelected).toBe(false);
  });

  test('that selectedText returns shortened text when useChips is false and prependText is empty', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        useChips: false,
        prependText: '',
        modelValue: ['1', '2', '3'],
        itemsMap: {
          1: { id: '1', string: 'Item 1' },
          2: { id: '2', string: 'Item 2' },
          3: { id: '3', string: 'Item 3' },
        },
      },
    });

    expect(wrapper.vm.selectedText).toBe('Item 1 + 2 more');
  });

  describe('showShortenedText', () => {
    it('returns true if useChips is false and prependText is empty', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          useChips: false,
          prependText: '',
        },
      });
      expect(wrapper.vm.showShortenedText).toBe(true);
    });

    it('returns false if useChips is true', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          useChips: true,
          prependText: 'Prepend',
        },
      });
      expect(wrapper.vm.showShortenedText).toBe(false);
    });

    it('returns false if prependText is not empty', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          useChips: false,
          prependText: 'Prepend',
        },
      });
      expect(wrapper.vm.showShortenedText).toBe(false);
    });
  });

  describe('isIconActivated', () => {
    it('returns false even if some items are selected, but colorActivePrepend is false', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          modelValue: ['1', '2'],
          hiddenItemsCount: 0,
          totalCount: 10,
          isSingleSelect: false,
          colorActivePrepend: false,
        },
      });
      expect(wrapper.vm.isIconActivated).toBe(false);
    });

    it('returns false if colorActivePrepend is true and all items are selected', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          modelValue: ['1', '2'],
          hiddenItemsCount: 0,
          totalCount: 2,
          isSingleSelect: false,
          colorActivePrepend: true,
        },
      });
      expect(wrapper.vm.isIconActivated).toBe(false);
    });

    it('returns false if colorActivePrepend is true and no items are selected', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          modelValue: [],
          hiddenItemsCount: 0,
          totalCount: 2,
          isSingleSelect: false,
          colorActivePrepend: true,
        },
      });
      expect(wrapper.vm.isIconActivated).toBe(false);
    });

    it('returns true if colorActivePrepend is true and some items are selected', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          modelValue: ['1', '2'],
          hiddenItemsCount: 0,
          totalCount: 10,
          isSingleSelect: false,
          colorActivePrepend: true,
        },
      });
      expect(wrapper.vm.isIconActivated).toBe(true);
    });
  });

  describe('chipAppendIcon', () => {
    it('returs appendIcon if it is provided', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          appendIcon: mdiDelete,
        },
      });
      expect(wrapper.vm.chipAppendIcon).toBe(mdiDelete);
    });

    it('returns mdiMenuDown icon when isOpen is false', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, isOpen: false },
      });
      expect(wrapper.vm.chipAppendIcon).toBe(mdiMenuDown);
    });

    it('returns mdiMenuUp icon when isOpen is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, isOpen: true },
      });

      expect(wrapper.vm.chipAppendIcon).toBe(mdiMenuUp);
    });
  });

  describe('onAppendIconClick', () => {
    it('emits append-icon-click event if appendIcon is provided', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, appendIcon: mdiDelete },
      });

      wrapper.vm.onAppendIconClick();
      expect(wrapper.emitted('append-icon-click')).toBeTruthy();
    });

    it('emits append-icon-click event if appendIcon is not provided, but useChips is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, useChips: true },
      });

      wrapper.vm.onAppendIconClick();
      expect(wrapper.emitted('append-icon-click')).toBeTruthy();
    });

    it('emits update:menu-open event if appendIcon is not provided and useChips is false', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, appendIcon: '', useChips: false, isOpen: false },
      });

      wrapper.vm.onAppendIconClick();
      expect(wrapper.emitted('update:menu-open')).toBeTruthy();
      expect(wrapper.emitted('update:menu-open')[0][0]).toEqual(true);
    });
  });
});
