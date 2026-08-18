import { without } from 'lodash';

import handleMultiTypeProp from '@/helpers/prop/handleMultiTypeProp';

export function selectionValueAllSelected(emptyEqualsAllSelected, selectedValuesList, someSelected, limit) {
  if (limit) return emptyEqualsAllSelected && selectedValuesList.length === limit && someSelected === true;
  return emptyEqualsAllSelected && selectedValuesList.length === 0 && someSelected === true;
}

export default ({
  itemsList, selectedValuesList, selectionKey, inverted, totalCount,
  disabledValues, itemText, itemSecondaryText, itemTertiaryText, itemDisabled,
  search = '', isSingleSelect = false, required = false, someSelected = false, emptyEqualsAllSelected = false, limit = null,
}) => {
  function isOverrideAllSelected() {
    return selectionValueAllSelected(emptyEqualsAllSelected, selectedValuesList, someSelected, limit);
  }

  function isIndexPresent(index) {
    if (isOverrideAllSelected()) return true;
    return index > -1;
  }

  function isTotalCountEnabled() {
    return typeof totalCount === 'number';
  }

  function getItemValue(item) {
    return selectionKey ? item[selectionKey] : item;
  }

  function getSelectedItemIndex(item, _selectedValuesList = selectedValuesList) {
    return _selectedValuesList?.indexOf(getItemValue(item));
  }

  function isIndexSelected(index) {
    return isIndexPresent(index) === !inverted;
  }

  function isItemSelected(item) {
    if (isOverrideAllSelected()) return true;
    return isIndexSelected(getSelectedItemIndex(item));
  }

  function isItemDisabled(item) {
    if (typeof itemDisabled === 'boolean') return itemDisabled;
    return !!handleMultiTypeProp(item, itemDisabled);
  }

  function areAllItemsSelected(_itemsList) {
    if (isOverrideAllSelected()) return true;
    const items = _itemsList ?? itemsList;
    return items.every(isItemSelected);
  }

  function areTotalAllItemsSelected() {
    if (isOverrideAllSelected()) return true;
    if (selectedValuesList.length === 0) return inverted;
    if (isTotalCountEnabled() && !search.length) return totalCount === selectedValuesList.length;
    return areAllItemsSelected();
  }

  function areSomeItemsSelected(_itemsList = itemsList) {
    if (isOverrideAllSelected()) return true;
    return _itemsList.some(isItemSelected);
  }

  function getAllItemValues(_itemsList = itemsList) {
    return _itemsList.map(getItemValue);
  }

  function getSelectionsNotInItems(_itemsList = itemsList) {
    const itemsListValues = getAllItemValues(_itemsList);
    return without(selectedValuesList, ...itemsListValues);
  }

  function getToggleItemSelectionState(item) {
    const selectedValuesListCopy = [...selectedValuesList];
    const selectedIndex = getSelectedItemIndex(item);
    if (isOverrideAllSelected()) {
      return [getItemValue(item)];
    }
    if (isIndexPresent(selectedIndex)) {
      if (!required || (!isSingleSelect && selectedValuesListCopy.length)) {
        selectedValuesListCopy.splice(selectedIndex, 1);
      }
    } else if (isSingleSelect) {
      return [getItemValue(item)];
    } else {
      selectedValuesListCopy.push(getItemValue(item));
    }
    return selectedValuesListCopy;
  }

  function getToggleTotalAllItemsState() {
    let newSelectedValues;
    if (areAllItemsSelected() && !inverted) {
      newSelectedValues = Array.from(new Set([
        ...getSelectionsNotInItems(),
        // deselect all currently visible
        ...(disabledValues ?? []),
      ]));
    } else {
      newSelectedValues = Array.from(new Set([
        ...getSelectionsNotInItems(),
        ...getAllItemValues(), // select all currently visible
        ...(disabledValues ?? []),
      ]));
    }
    return newSelectedValues;
  }

  function getToggleGroupSelectionState(groupItems) {
    const groupValues = getAllItemValues(groupItems);
    const selectedValuesWithoutGroup = without(selectedValuesList, ...groupValues);
    const difference = selectedValuesList.length - selectedValuesWithoutGroup.length;

    const noneFromGroupSelected = difference === 0;
    const someFromGroupSelected = groupValues.length > difference > 0;
    if (isOverrideAllSelected()) {
      const allItemValues = getAllItemValues();
      return without(allItemValues, ...groupValues);
    }
    if (noneFromGroupSelected || someFromGroupSelected) {
      return [...selectedValuesWithoutGroup, ...groupValues];
    }
    return selectedValuesWithoutGroup;
  }

  function getItemText(item) {
    return handleMultiTypeProp(item, itemText);
  }
  function getItemSecondaryText(item) {
    return handleMultiTypeProp(item, itemSecondaryText);
  }
  function getItemTertiaryText(item) {
    return handleMultiTypeProp(item, itemTertiaryText);
  }

  return {
    isOverrideAllSelected,
    isTotalCountEnabled,
    getItemValue,
    getItemText,
    getItemSecondaryText,
    getItemTertiaryText,
    getSelectedItemIndex,
    isIndexSelected,
    isItemSelected,
    isItemDisabled,
    areAllItemsSelected,
    areTotalAllItemsSelected,
    areSomeItemsSelected,
    getAllItemValues,
    getSelectionsNotInItems,
    getToggleTotalAllItemsState,
    getToggleItemSelectionState,
    getToggleGroupSelectionState,
  };
};
