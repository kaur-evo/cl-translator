import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import EvoconVTable from './index.vue';

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  initialState: { filterbar: { requestFilterState: {} } },
});

describe('EvoconVTable', () => {
  it('renders correctly if all columns are visible', () => {
    const wrapper = shallowMount(EvoconVTable, {
      props: {
        options: {},
        headers: [{
          id: 'name',
          text: 'Header 1',
          textKey: 'name',
          isFixed: true,
        },
        {
          id: 'weight',
          text: 'Header 2',
          textKey: 'weight',
          class: 'text-end',
          hasTotal: true,
        },
        {
          id: 'percentage',
          text: 'Header 3',
          textKey: 'percentage',
          secondaryTextKey: 'weight',
          class: 'text-end',
          hasTotal: true,
          formatFn: (val) => `${val * 100}%`,
          secondaryFormatFn: (val) => `${val}kg`,
        }],
        items: [
          { name: 'Name 1', weight: 100, percentage: 0.1 },
          { name: 'Name 2', weight: 10, percentage: 0.01 },
          { name: 'Name 3', weight: 110, percentage: 0.1 },
          { name: 'Name 4', weight: 20, percentage: 0.2 },
          { name: 'Name 5', weight: 200, percentage: 0.6 },
        ],
        totals: {
          weight: 440,
          percentage: 1.01,
        },
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly if some columns are hidden', () => {
    const wrapper = shallowMount(EvoconVTable, {
      props: {
        options: {},
        headers: [{
          id: 'name',
          text: 'Header 1',
          textKey: 'name',
          isFixed: true,
        },
        {
          id: 'weight',
          text: 'Header 2',
          textKey: 'weight',
          class: 'text-end',
          hasTotal: true,
          isHidden: true,
        },
        {
          id: 'percentage',
          text: 'Header 3',
          textKey: 'percentage',
          secondaryTextKey: 'weight',
          class: 'text-end',
          hasTotal: true,
          isHidden: true,
          formatFn: (val) => `${val * 100}%`,
          secondaryFormatFn: (val) => `${val}kg`,
        }],
        items: [
          { name: 'Name 1', weight: 100, percentage: 0.1 },
          { name: 'Name 2', weight: 10, percentage: 0.01 },
          { name: 'Name 3', weight: 110, percentage: 0.1 },
          { name: 'Name 4', weight: 20, percentage: 0.2 },
          { name: 'Name 5', weight: 200, percentage: 0.6 },
        ],
        totals: {
          weight: 440,
          percentage: 1.01,
        },
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly if all columns are hidden', () => {
    const wrapper = shallowMount(EvoconVTable, {
      props: {
        options: {},
        headers: [{
          id: 'name',
          text: 'Header 1',
          textKey: 'name',
          isFixed: true,
          isHidden: true,
        },
        {
          id: 'weight',
          text: 'Header 2',
          textKey: 'weight',
          class: 'text-end',
          hasTotal: true,
          isHidden: true,
        },
        {
          id: 'percentage',
          text: 'Header 3',
          textKey: 'percentage',
          secondaryTextKey: 'weight',
          class: 'text-end',
          hasTotal: true,
          isHidden: true,
          formatFn: (val) => `${val * 100}%`,
          secondaryFormatFn: (val) => `${val}kg`,
        }],
        items: [
          { name: 'Name 1', weight: 100, percentage: 0.1 },
          { name: 'Name 2', weight: 10, percentage: 0.01 },
          { name: 'Name 3', weight: 110, percentage: 0.1 },
          { name: 'Name 4', weight: 20, percentage: 0.2 },
          { name: 'Name 5', weight: 200, percentage: 0.6 },
        ],
        totals: {
          weight: 440,
          percentage: 1.01,
        },
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const wrapper = shallowMount(EvoconVTable, {
      props: {
        loading: true,
        options: {},
        headers: [{
          id: 'name',
          text: 'Header 1',
          textKey: 'name',
          isFixed: true,
        },
        {
          id: 'weight',
          text: 'Header 2',
          textKey: 'weight',
          class: 'text-end',
          hasTotal: true,
        },
        {
          id: 'percentage',
          text: 'Header 3',
          textKey: 'percentage',
          secondaryTextKey: 'weight',
          class: 'text-end',
          hasTotal: true,
          formatFn: (val) => `${val * 100}%`,
          secondaryFormatFn: (val) => `${val}kg`,
        }],
        items: [
          { name: 'Name 1', weight: 100, percentage: 0.1 },
          { name: 'Name 2', weight: 10, percentage: 0.01 },
          { name: 'Name 3', weight: 110, percentage: 0.1 },
          { name: 'Name 4', weight: 20, percentage: 0.2 },
          { name: 'Name 5', weight: 200, percentage: 0.6 },
        ],
        totals: {
          weight: 440,
          percentage: 1.01,
        },
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('requestFilterState watcher', () => {
    it('clears expanded set and updates column handles, when expanded set is not empty', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.expanded = new Set(['row1', 'row2']);

      const updateColumnHandlesSpy = vi.spyOn(wrapper.vm, 'updateColumnHandles');
      expect(wrapper.vm.expanded.size).toBe(2);
      wrapper.vm.$options.watch.requestFilterState.call(wrapper.vm, 'newVal');
      expect(wrapper.vm.expanded.size).toBe(0);
      expect(updateColumnHandlesSpy).toHaveBeenCalled();
    });

    it('does not clear expanded set or update column handles, when expanded set is empty', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.expanded = new Set();

      const updateColumnHandlesSpy = vi.spyOn(wrapper.vm, 'updateColumnHandles');
      expect(wrapper.vm.expanded.size).toBe(0);
      wrapper.vm.$options.watch.requestFilterState.call(wrapper.vm, 'newVal');
      expect(wrapper.vm.expanded.size).toBe(0);
      expect(updateColumnHandlesSpy).not.toHaveBeenCalled();
    });
  });

  describe('onCellClick', () => {
    it('should emit link-click event if cell is link column', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const col = { isLink: true };
      const ev = { stopPropagation: vi.fn() };
      wrapper.vm.onCellClick(ev, item, col, 0, 0);
      expect(wrapper.emitted('link-click')).toBeTruthy();
      expect(wrapper.emitted()['link-click'][0][0]).toBe(item);
      expect(wrapper.emitted()['link-click'][0][1]).toBe(col);
    });

    it('should emit link-click event if cell is pop-up column', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const col = { isPopUp: true };
      const ev = { stopPropagation: vi.fn() };
      wrapper.vm.onCellClick(ev, item, col, 0, 0);
      expect(wrapper.emitted('link-click')).toBeTruthy();
      expect(wrapper.emitted()['link-click'][0][0]).toBe(item);
      expect(wrapper.emitted()['link-click'][0][1]).toBe(col);
    });

    it('should not emit link-click event if cell is not link or pop-up column', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const col = {};
      const ev = { stopPropagation: vi.fn() };
      wrapper.vm.onCellClick(ev, item, col, 0, 0);
      expect(wrapper.emitted('link-click')).toBeFalsy();
    });

    it('should not do anything while loading', () => {
      const wrapper = shallowMount(EvoconVTable, {
        props: { loading: true },
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const col = { isLink: true, isContentExpandColumn: true, isPopUp: true };
      const ev = { stopPropagation: vi.fn() };
      wrapper.vm.onCellClick(ev, item, col, 0, 0);
      expect(wrapper.emitted('link-click')).toBeFalsy();
    });

    it('should call toggleRowExpand if column is expandable', () => {
      const toggleRowExpand = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          toggleRowExpand,
        },
      };
      const ev = { stopPropagation: vi.fn() };
      component.methods.toggleRowExpand = toggleRowExpand;
      component.methods.onCellClick(ev, { name: 'Name 1' }, { isContentExpandColumn: true }, 0, 0);
      expect(toggleRowExpand).toHaveBeenCalled();
    });
  });
  describe('onLinkClick', () => {
    it('should emit link-click event if cell has open link btn', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const col = { hasOpenLinkBtn: true };
      const ev = { stopPropagation: vi.fn() };
      wrapper.vm.onLinkClick(ev, item, col, 0, 0);
      expect(wrapper.emitted('link-click')).toBeTruthy();
      expect(wrapper.emitted()['link-click'][0][0]).toBe(item);
      expect(wrapper.emitted()['link-click'][0][1]).toBe(col);
    });
  });
  describe('toggleRowExpand', () => {
    it('should add or remove item from expandedRows', async () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      wrapper.vm.expanded = new Set([]);
      await flushPromises();
      wrapper.vm.toggleRowExpand(1);
      expect(wrapper.vm.expanded).toEqual(new Set([1]));
      wrapper.vm.toggleRowExpand(1);
      expect(wrapper.vm.expanded).toEqual(new Set());
    });

    it('should call updateColumnHandles', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const updateColumnHandlesSpy = vi.spyOn(wrapper.vm, 'updateColumnHandles');
      wrapper.vm.toggleRowExpand(1);
      expect(updateColumnHandlesSpy).toHaveBeenCalled();
    });
  });

  describe('getColKeyVal', () => {
    it('should return correct value for textKey', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const col = { textKey: 'name' };
      const result = wrapper.vm.getColKeyVal(col, 'textKey', item);
      expect(result).toBe('name');
    });

    it('should return undefined if key does not exist in item', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const col = { textKey: 'name' };
      const result = wrapper.vm.getColKeyVal(col, 'nonexistent', item);
      expect(result).toBeUndefined();
    });

    it('should return formatted value if fn is provided', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const item = 0.13;
      const col = { textKey: (val) => `${val * 100}%` };
      const result = wrapper.vm.getColKeyVal(col, 'textKey', item);
      expect(result).toBe('13%');
    });
  });

  describe('getAdditionalClass', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = { name: 'Name 1' };
      const col = { textKey: 'name' };
      component.methods.getAdditionalClass(item, col);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'class', item);
    });
  });

  describe('isLinkCol', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = { name: 'Name 1' };
      const col = { textKey: 'name' };
      const colIndex = 39;
      component.methods.isLinkCol(item, col, colIndex);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'isLink', item, colIndex);
    });
  });

  describe('isPopUpCol', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = { name: 'Name 1' };
      const col = { textKey: 'name' };
      component.methods.isPopUpCol(item, col);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'isPopUp', item);
    });
  });

  describe('isFixedCol', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = { name: 'Name 1' };
      const col = { textKey: 'name' };
      component.methods.isFixedCol(col, item);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'isFixed', item);
    });
  });

  describe('isBoldCol', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = { name: 'Name 1' };
      const col = { textKey: 'name' };
      component.methods.isBoldCol(col, item);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'isBold', item);
    });
  });

  describe('isHiddenCol', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = { name: 'Name 1' };
      const col = { textKey: 'name' };
      component.methods.isHiddenCol(col, item);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'isHidden');
    });
  });

  describe('getColSlot', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const isRowExpanded = true;
      const col = { slot: 'name' };
      component.methods.getColSlot(col, isRowExpanded);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'slot', col, isRowExpanded);
    });
  });

  describe('isContentExpandColumn', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = 1;
      const item2 = 2;

      const col = { textKey: 'name' };
      component.methods.isContentExpandColumn(item, col, item2);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'isContentExpandColumn', item, item2);
    });
  });

  describe('appendIcon', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = 1;
      const col = { textKey: 'name' };
      component.methods.appendIcon(item, col);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'appendIcon', item);
    });
  });

  describe('showTooltip', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = 1;
      const col = { textKey: 'name' };
      component.methods.showTooltip(col, item);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'showTooltip', item);
    });
  });

  describe('getPrependIcon', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = 1;
      const item2 = 2;
      const col = { textKey: 'name' };
      component.methods.getPrependIcon(col, item, item2);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'prependIcon', item, item2);
    });
  });

  describe('getPrependIconColor', () => {
    it('should call getColKeyVal with correct arguments', () => {
      const getColKeyVal = vi.fn();
      const component = {
        methods: {
          ...EvoconVTable.methods,
          getColKeyVal,
        },
      };
      const item = 1;
      const col = { textKey: 'name' };
      component.methods.getPrependIconColor(col, item);
      expect(getColKeyVal).toHaveBeenCalledWith(col, 'prependIconColor', item);
    });
  });

  describe('isClickableCol', () => {
    test('that isClickableCol returns true if islinkCol returns true', () => {
      const isLinkCol = vi.fn(() => true);
      const isPopUpCol = vi.fn(() => false);
      const isContentExpandColumn = vi.fn(() => false);
      const component = {
        methods: {
          ...EvoconVTable.methods,
          isLinkCol,
          isPopUpCol,
          isContentExpandColumn,
        },
      };
      const item = 1;
      const colIndex = 2;
      const col = { textKey: 'name' };
      expect(component.methods.isClickableCol(item, col, colIndex)).toBe(true);
      expect(isLinkCol).toHaveBeenCalledWith(item, col, colIndex);
      expect(isPopUpCol).not.toHaveBeenCalled();
      expect(isContentExpandColumn).not.toHaveBeenCalled();
    });

    test('that isClickableCol returns true if isPopUpCol returns true', () => {
      const isLinkCol = vi.fn(() => false);
      const isPopUpCol = vi.fn(() => true);
      const isContentExpandColumn = vi.fn(() => false);
      const component = {
        methods: {
          ...EvoconVTable.methods,
          isLinkCol,
          isPopUpCol,
          isContentExpandColumn,
        },
      };
      const item = 1;
      const colIndex = 2;
      const col = { textKey: 'name' };
      expect(component.methods.isClickableCol(item, col, colIndex)).toBe(true);
      expect(isLinkCol).toHaveBeenCalledWith(item, col, colIndex);
      expect(isPopUpCol).toHaveBeenCalledWith(item, col);
      expect(isContentExpandColumn).not.toHaveBeenCalled();
    });

    test('that isClickableCol returns true if isContentExpandColumn returns true', () => {
      const isLinkCol = vi.fn(() => false);
      const isPopUpCol = vi.fn(() => false);
      const isContentExpandColumn = vi.fn(() => true);
      const component = {
        methods: {
          ...EvoconVTable.methods,
          isLinkCol,
          isPopUpCol,
          isContentExpandColumn,
        },
      };
      const item = 1;
      const colIndex = 2;
      const col = { textKey: 'name' };
      expect(component.methods.isClickableCol(item, col, colIndex)).toBe(true);
      expect(isLinkCol).toHaveBeenCalledWith(item, col, colIndex);
      expect(isPopUpCol).toHaveBeenCalledWith(item, col);
      expect(isContentExpandColumn).toHaveBeenCalledWith(item, col, colIndex);
    });

    test('that isClickableCol returns false if none of the conditions are met', () => {
      const isLinkCol = vi.fn(() => false);
      const isPopUpCol = vi.fn(() => false);
      const isContentExpandColumn = vi.fn(() => false);
      const component = {
        methods: {
          ...EvoconVTable.methods,
          isLinkCol,
          isPopUpCol,
          isContentExpandColumn,
        },
      };
      const item = 1;
      const colIndex = 2;
      const col = { textKey: 'name' };
      expect(component.methods.isClickableCol(item, col, colIndex)).toBe(false);
      expect(isLinkCol).toHaveBeenCalledWith(item, col, colIndex);
      expect(isPopUpCol).toHaveBeenCalledWith(item, col);
      expect(isContentExpandColumn).toHaveBeenCalledWith(item, col, colIndex);
    });
  });
  describe('hasCellAdornment', () => {
    it('returns true when col has appendIconSrc', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { appendIconSrc: 'icon.png' };
      expect(wrapper.vm.hasCellAdornment(col, {}, [])).toBe(true);
    });

    it('returns true when col has appendIcon', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { appendIcon: 'mdi-check' };
      expect(wrapper.vm.hasCellAdornment(col, {}, [])).toBe(true);
    });

    it('returns true when col has hasOpenLinkBtn', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { hasOpenLinkBtn: true };
      expect(wrapper.vm.hasCellAdornment(col, {}, [])).toBe(true);
    });

    it('returns false when col has no adornments', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { textKey: 'name' };
      expect(wrapper.vm.hasCellAdornment(col, {}, [])).toBe(false);
    });

    it('returns false when appendIconSrc function returns empty string', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { appendIconSrc: (item) => (item._hasAiInsights ? 'icon.svg' : '') };
      const item = { _hasAiInsights: false };
      expect(wrapper.vm.hasCellAdornment(col, item, [])).toBe(false);
    });

    it('returns true when appendIconSrc function returns a value', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { appendIconSrc: (item) => (item._hasAiInsights ? 'icon.svg' : '') };
      const item = { _hasAiInsights: true };
      expect(wrapper.vm.hasCellAdornment(col, item, [])).toBe(true);
    });
  });

  describe('shouldTruncateCell', () => {
    it('returns true when col has appendIconSrc', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { appendIconSrc: 'icon.png' };
      expect(wrapper.vm.shouldTruncateCell(col, {}, [])).toBe(true);
    });

    it('returns true when col has appendIcon', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { appendIcon: 'mdi-check' };
      expect(wrapper.vm.shouldTruncateCell(col, {}, [])).toBe(true);
    });

    it('returns false when col only has hasOpenLinkBtn', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { hasOpenLinkBtn: true };
      expect(wrapper.vm.shouldTruncateCell(col, {}, [])).toBe(false);
    });

    it('returns false when col has no adornments', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { textKey: 'name' };
      expect(wrapper.vm.shouldTruncateCell(col, {}, [])).toBe(false);
    });

    it('returns false when appendIconSrc function returns empty string', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { appendIconSrc: (item) => (item._hasAiInsights ? 'icon.svg' : '') };
      const item = { _hasAiInsights: false };
      expect(wrapper.vm.shouldTruncateCell(col, item, [])).toBe(false);
    });

    it('returns true when appendIconSrc function returns a value', () => {
      const wrapper = shallowMount(EvoconVTable, {
        global: { plugins: [createPinia()] },
      });
      const col = { appendIconSrc: (item) => (item._hasAiInsights ? 'icon.svg' : '') };
      const item = { _hasAiInsights: true };
      expect(wrapper.vm.shouldTruncateCell(col, item, [])).toBe(true);
    });
  });

  describe('onRowClick', () => {
    it('should not emit anything when loading', () => {
      const component = EvoconVTable;
      const toggleRowExpand = vi.fn();
      component.methods.toggleRowExpand = toggleRowExpand;
      const wrapper = shallowMount(component, {
        props: { loading: true, areRowsClickable: true },
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const ev = { stopPropagation: vi.fn() };
      wrapper.vm.onRowClick(ev, item);
      expect(wrapper.emitted('row-click')).toBeFalsy();
      expect(toggleRowExpand).not.toHaveBeenCalled();
    });

    it('should not emit anything when row is not clickable', () => {
      const component = EvoconVTable;
      const toggleRowExpand = vi.fn();
      component.methods.toggleRowExpand = toggleRowExpand;
      const wrapper = shallowMount(component, {
        props: { loading: false, areRowsClickable: false },
        global: { plugins: [createPinia()] },
      });
      const item = {};
      const ev = { stopPropagation: vi.fn() };
      wrapper.vm.onRowClick(ev, item);
      expect(wrapper.emitted('row-click')).toBeFalsy();
      expect(toggleRowExpand).not.toHaveBeenCalled();
    });

    it('should emit row-click event when row is clickable', () => {
      const component = EvoconVTable;
      const toggleRowExpand = vi.fn();
      component.methods.toggleRowExpand = toggleRowExpand;
      const wrapper = shallowMount(component, {
        props: { loading: false, areRowsClickable: true },
        global: { plugins: [createPinia()] },
      });
      const item = { name: 'test' };
      wrapper.vm.onRowClick(item, 99);
      expect(wrapper.emitted('row-click')).toBeTruthy();
      expect(wrapper.emitted('row-click')[0][0]).toEqual({ item, rowIndex: 99 });
      expect(toggleRowExpand).not.toHaveBeenCalled();
    });

    it('should call toggleRowExpand when row is clickable and isContentExpandColumn is true', () => {
      const component = EvoconVTable;
      const toggleRowExpand = vi.fn();
      component.methods.toggleRowExpand = toggleRowExpand;
      const wrapper = shallowMount(component, {
        props: { loading: false, areRowsClickable: true, rowClickMode: 'contentExpand' },
        global: { plugins: [createPinia()] },
      });
      const item = { name: 'test' };
      const rowIndex = 99;
      wrapper.vm.onRowClick(item, 99);
      expect(wrapper.emitted('row-click')).toBeFalsy();
      expect(toggleRowExpand).toHaveBeenCalledWith(rowIndex);
    });
  });
});
