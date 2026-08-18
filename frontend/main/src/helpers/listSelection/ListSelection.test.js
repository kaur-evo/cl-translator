import ListSelection from './ListSelection';

describe('ListSelection', () => {
  test('if isTotalCountEnabled returns true only when totalCount input is numeric', () => {
    const truthyResult = ListSelection({ totalCount: 1 }).isTotalCountEnabled();
    const falsyResult = ListSelection({ totalCount: null }).isTotalCountEnabled();
    expect(truthyResult).toBe(true);
    expect(falsyResult).toBe(false);
  });

  test('if getItemValue returns item value based on input key', () => {
    const getObjKeyValue = ListSelection({ selectionKey: 'value' }).getItemValue({ value: 'value' });
    const getValue = ListSelection({ selectionKey: null }).getItemValue('value2');
    expect(getObjKeyValue).toBe('value');
    expect(getValue).toBe('value2');
  });

  test('if getItemText returns item text based on input key/function', () => {
    const getFunctionLabel = ListSelection({ itemText: (item) => `${item.text}!` }).getItemText({ text: 'label' });
    const getObjKeyLabel = ListSelection({ itemText: 'text' }).getItemText({ text: 'label' });
    const getLabel = ListSelection({ itemText: null }).getItemText('label2');
    expect(getFunctionLabel).toBe('label!');
    expect(getObjKeyLabel).toBe('label');
    expect(getLabel).toBe('label2');
  });

  test('if getItemSecondaryText returns item text based on input key/function', () => {
    const getFunctionLabel = ListSelection({ itemSecondaryText: (item) => `${item.text}!` }).getItemSecondaryText({ text: 'label' });
    const getObjKeyLabel = ListSelection({ itemSecondaryText: 'text' }).getItemSecondaryText({ text: 'label' });
    const getLabel = ListSelection({ itemSecondaryText: null }).getItemSecondaryText('label2');
    expect(getFunctionLabel).toBe('label!');
    expect(getObjKeyLabel).toBe('label');
    expect(getLabel).toBe('label2');
  });

  test('if getItemTertiaryText returns item text based on input key/function', () => {
    const getFunctionLabel = ListSelection({ itemTertiaryText: (item) => `${item.text}!` }).getItemTertiaryText({ text: 'label' });
    const getObjKeyLabel = ListSelection({ itemTertiaryText: 'text' }).getItemTertiaryText({ text: 'label' });
    const getLabel = ListSelection({ itemTertiaryText: null }).getItemTertiaryText('label2');
    expect(getFunctionLabel).toBe('label!');
    expect(getObjKeyLabel).toBe('label');
    expect(getLabel).toBe('label2');
  });

  test('if getSelectedItemIndex returns the index position of item within selectionList', () => {
    const defaultBehaviorIndex = ListSelection({ selectedValuesList: [0, 1] }).getSelectedItemIndex(1);
    const customSelectionIndex = ListSelection({ selectedValuesList: [0, 1] }).getSelectedItemIndex(2, [2]);
    const notInSelection = ListSelection({ selectedValuesList: [1] }).getSelectedItemIndex(2);
    expect(defaultBehaviorIndex).toBe(1);
    expect(customSelectionIndex).toBe(0);
    expect(notInSelection).toBe(-1);
  });

  test('if isIndexSelected returns boolean of if index is shown visually selected(checked) (including inversion)', () => {
    const truthyNotInverted = ListSelection({ selectedValuesList: [0, 1] }).isIndexSelected(1);
    const falsyNotInverted = ListSelection({ selectedValuesList: [0, 1] }).isIndexSelected(-1);
    expect(truthyNotInverted).toBe(true);
    expect(falsyNotInverted).toBe(false);
    const truthyInverted = ListSelection({ selectedValuesList: [0, 1], inverted: true }).isIndexSelected(1);
    const falsyInverted = ListSelection({ selectedValuesList: [0, 1], inverted: true }).isIndexSelected(-1);
    expect(truthyInverted).toBe(false);
    expect(falsyInverted).toBe(true);
  });

  test('if isItemSelected returns boolean of being in selected items list', () => {
    const truthyNotInverted = ListSelection({ selectedValuesList: [0, 1], selectionKey: 'value' }).isItemSelected({ value: 0 });
    const falsyNotInverted = ListSelection({ selectedValuesList: [0, 1], selectionKey: 'value' }).isItemSelected({ value: 2 });
    expect(truthyNotInverted).toBe(true);
    expect(falsyNotInverted).toBe(false);
    const truthyInverted = ListSelection({ selectedValuesList: [0, 1], selectionKey: 'value', inverted: true }).isItemSelected({ value: 0 });
    const falsyInverted = ListSelection({ selectedValuesList: [0, 1], selectionKey: 'value', inverted: true }).isItemSelected({ value: 2 });
    expect(truthyInverted).toBe(false);
    expect(falsyInverted).toBe(true);
  });

  test('if isItemDisabled returns boolean of item being disabled', () => {
    const getFunctionDisabled = ListSelection({ itemDisabled: (item) => !item.disabled }).isItemDisabled({ disabled: true });
    const getObjKeyDisabledTruthy = ListSelection({ itemDisabled: 'disabled' }).isItemDisabled({ disabled: true });
    const getObjKeyDisabledFalsy = ListSelection({ itemDisabled: 'disabled' }).isItemDisabled({ disabled: false });
    const getDisabledTruthy = ListSelection({ itemDisabled: true }).isItemDisabled('item1');
    const getDisabledFalsy = ListSelection({ itemDisabled: false }).isItemDisabled('item1');
    expect(getFunctionDisabled).toBe(false);
    expect(getObjKeyDisabledTruthy).toBe(true);
    expect(getObjKeyDisabledFalsy).toBe(false);
    expect(getDisabledTruthy).toBe(true);
    expect(getDisabledFalsy).toBe(false);
  });

  test('if areAllItemsSelected returns boolean of all list items being also included in selected values list', () => {
    const allSelected = ListSelection({ selectedValuesList: [0, 1], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }] }).areAllItemsSelected();
    const someSelected = ListSelection({ selectedValuesList: [0], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }] }).areAllItemsSelected();
    const noneSelected = ListSelection({ selectedValuesList: [], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }] }).areAllItemsSelected();
    expect(allSelected).toBe(true);
    expect(someSelected).toBe(false);
    expect(noneSelected).toBe(false);
    const allSelectedInverted = ListSelection({
      selectedValuesList: [0, 1],
      selectionKey: 'value',
      itemsList: [{ value: 0 }, { value: 1 }],
      inverted: true,
    }).areAllItemsSelected();
    const someSelectedInverted = ListSelection({
      selectedValuesList: [0],
      selectionKey: 'value',
      itemsList: [{ value: 0 }, { value: 1 }],
      inverted: true,
    }).areAllItemsSelected();
    const noneSelectedInverted = ListSelection({
      selectedValuesList: [],
      selectionKey: 'value',
      itemsList: [{ value: 0 }, { value: 1 }],
      inverted: true,
    }).areAllItemsSelected();
    expect(allSelectedInverted).toBe(false);
    expect(someSelectedInverted).toBe(false);
    expect(noneSelectedInverted).toBe(true);
  });

  test('if areTotalAllItemsSelected returns boolean of all list items being selected but also taking backend pagination into account', () => {
    const noneSelected = ListSelection({
      selectedValuesList: [0], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).areTotalAllItemsSelected();
    const allSelectedButLessThanTotal = ListSelection({
      totalCount: 3, selectedValuesList: [0, 1], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).areTotalAllItemsSelected();
    const totalAllSelected = ListSelection({
      totalCount: 2, selectedValuesList: [0, 1], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).areTotalAllItemsSelected();
    expect(noneSelected).toBe(false);
    expect(allSelectedButLessThanTotal).toBe(false);
    expect(totalAllSelected).toBe(true);
  });

  test('if areSomeItemsSelected returns boolean of at least 1 item being in selected values list', () => {
    const allSelected = ListSelection({
      selectedValuesList: [0, 1], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).areSomeItemsSelected();
    const someSelected = ListSelection({
      selectedValuesList: [0], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).areSomeItemsSelected();
    const noneSelected = ListSelection({
      selectedValuesList: [], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).areSomeItemsSelected();
    expect(allSelected).toBe(true);
    expect(someSelected).toBe(true);
    expect(noneSelected).toBe(false);
    const allSelectedInverted = ListSelection({
      selectedValuesList: [0, 1], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }], inverted: true,
    }).areSomeItemsSelected();
    const someSelectedInverted = ListSelection({
      selectedValuesList: [0], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }], inverted: true,
    }).areSomeItemsSelected();
    const noneSelectedInverted = ListSelection({
      selectedValuesList: [], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }], inverted: true,
    }).areSomeItemsSelected();
    expect(allSelectedInverted).toBe(false);
    expect(someSelectedInverted).toBe(true);
    expect(noneSelectedInverted).toBe(true);
  });

  test('if getAllItemValues returns selection values of all available list items', () => {
    const itemValues = ListSelection({
      selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).getAllItemValues();
    expect(itemValues).toStrictEqual([0, 1]);
  });

  test('if getSelectionsNotInItems returns selected values not being in current items list', () => {
    const selectionsNotInItems = ListSelection({ selectedValuesList: [0, 1, 2, 3], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }] }).getSelectionsNotInItems();
    expect(selectionsNotInItems).toStrictEqual([2, 3]);
  });

  test('if getToggleTotalAllItemsState returns new selected values state as if "select all" was clicked', () => {
    const allSelectedResult = ListSelection({
      selectedValuesList: [0, 1], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).getToggleTotalAllItemsState();
    expect(allSelectedResult).toStrictEqual([]);

    const noneSelected = ListSelection({
      selectedValuesList: [], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).getToggleTotalAllItemsState();
    expect(noneSelected).toStrictEqual([0, 1]);

    const allSelectedWithDisabledAndNotInItemsResult = ListSelection({
      selectedValuesList: [0, 1, 2], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }], disabledValues: [3],
    }).getToggleTotalAllItemsState();
    expect(allSelectedWithDisabledAndNotInItemsResult).toStrictEqual([2, 3]);

    const noneSelectedWithDisabledAndNotInItemsResult = ListSelection({
      selectedValuesList: [2], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }], disabledValues: [3],
    }).getToggleTotalAllItemsState();
    expect(noneSelectedWithDisabledAndNotInItemsResult).toStrictEqual([2, 0, 1, 3]);
  });

  test('if getToggleItemSelectionState returns new selected values state as if single item was clicked', () => {
    const deselectResult = ListSelection({
      selectedValuesList: [0, 1], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).getToggleItemSelectionState({ value: 0 });
    expect(deselectResult).toStrictEqual([1]);
    const selectResult = ListSelection({
      selectedValuesList: [1], selectionKey: 'value', itemsList: [{ value: 0 }, { value: 1 }],
    }).getToggleItemSelectionState({ value: 0 });
    expect(selectResult).toStrictEqual([1, 0]);
  });

  test('if getToggleGroupSelectionState returns new selected values state as group of items was clicked', () => {
    const groupPreviouslyDeselected = ListSelection({
      selectedValuesList: [0, 1],
      selectionKey: 'value',
    }).getToggleGroupSelectionState([{ value: 2 }, { value: 3 }]);
    expect(groupPreviouslyDeselected).toStrictEqual([0, 1, 2, 3]);
    const groupPreviouslyPartiallySelected = ListSelection({
      selectedValuesList: [0, 1, 2],
      selectionKey: 'value',
    }).getToggleGroupSelectionState([{ value: 2 }, { value: 3 }]);
    expect(groupPreviouslyPartiallySelected).toStrictEqual([0, 1, 2, 3]);
    const groupPreviouslySelected = ListSelection({
      selectedValuesList: [0, 1, 2, 3],
      selectionKey: 'value',
    }).getToggleGroupSelectionState([{ value: 2 }, { value: 3 }]);
    expect(groupPreviouslySelected).toStrictEqual([0, 1]);
  });

  describe('selectionValueAllSelected', () => {
    it('returns true when limit exists, emptyEqualsAllSelected is true, someSelected is true and limit is equal to selectedValuesList length', () => {
      expect(ListSelection({
        emptyEqualsAllSelected: true, selectedValuesList: [1, 2, 3], someSelected: true, limit: 3,
      }).isOverrideAllSelected()).toBe(true);
    });

    it('returns false when limit exists, emptyEqualsAllSelected is true, someSelected is true and selectedValuesList length is less than limit', () => {
      expect(ListSelection({
        emptyEqualsAllSelected: true, selectedValuesList: [1, 2], someSelected: true, limit: 3,
      }).isOverrideAllSelected()).toBe(false);
    });

    it('returns false when limit exists, emptyEqualsAllSelected is false, someSelected is true and limit is equal to selectedValuesList length', () => {
      expect(ListSelection({
        emptyEqualsAllSelected: false, selectedValuesList: [1, 2, 3], someSelected: true, limit: 3,
      }).isOverrideAllSelected()).toBe(false);
    });

    it('returns false when limit exists, emptyEqualsAllSelected is true, someSelected is false and limit is equal to selectedValuesList length', () => {
      expect(ListSelection({
        emptyEqualsAllSelected: true, selectedValuesList: [1, 2, 3], someSelected: false, limit: 3,
      }).isOverrideAllSelected()).toBe(false);
    });

    it('returns true when emptyEqualsAllSelected is true, selectedValuesList is empty, and someSelected is true', () => {
      expect(ListSelection({ emptyEqualsAllSelected: true, selectedValuesList: [], someSelected: true }).isOverrideAllSelected()).toBe(true);
    });

    it('returns false when emptyEqualsAllSelected is false', () => {
      expect(ListSelection({ emptyEqualsAllSelected: false, selectedValuesList: [], someSelected: true }).isOverrideAllSelected()).toBe(false);
    });

    it('returns false when selectedValuesList is not empty', () => {
      expect(ListSelection({ emptyEqualsAllSelected: true, selectedValuesList: [1], someSelected: true }).isOverrideAllSelected()).toBe(false);
    });

    it('returns false when someSelected is false', () => {
      expect(ListSelection({ emptyEqualsAllSelected: true, selectedValuesList: [], someSelected: false }).isOverrideAllSelected()).toBe(false);
    });
  });
});
