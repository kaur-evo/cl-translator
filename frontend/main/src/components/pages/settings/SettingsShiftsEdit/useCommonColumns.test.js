import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import useCommonColumns from './useCommonColumns';

import useDeviceStore from '@/stores/device';

describe('useCommonColumns', () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ createSpy: vi.fn }));
  });

  it('should return correct row actions column when isMobileView is true', () => {
    const deviceStore = useDeviceStore();
    deviceStore.isMobileView = true;

    const { getRowActionsColumn } = useCommonColumns();
    const rowActionsColumn = getRowActionsColumn();

    expect(rowActionsColumn).toEqual({
      filterable: false,
      sortable: false,
      style: {
        padding: '0 !important',
        width: '88px',
        maxWidth: '88px',
        minWidth: '88px',
      },
      isSlotColumn: true,
      slotName: 'row-actions',
      notClickable: true,
      type: 'number',
    });
  });

  it('should return correct row actions column when isMobileView is false', () => {
    const deviceStore = useDeviceStore();
    deviceStore.isMobileView = false;

    const { getRowActionsColumn } = useCommonColumns();
    const rowActionsColumn = getRowActionsColumn();

    expect(rowActionsColumn).toEqual({
      filterable: false,
      sortable: false,
      style: {
        padding: '0 !important',
        width: '112px',
        maxWidth: '112px',
        minWidth: '112px',
      },
      isSlotColumn: true,
      slotName: 'row-actions',
      notClickable: true,
      type: 'number',
    });
  });

  it('should return correct primary column when isMobileView is true', () => {
    const deviceStore = useDeviceStore();
    deviceStore.isMobileView = true;

    const { getPrimaryColumn } = useCommonColumns();
    const columnAttr = { customAttr: 'test' };
    const primaryColumn = getPrimaryColumn(columnAttr);

    expect(primaryColumn).toEqual({
      isBold: true,
      isFixed: true,
      style: {
        width: '170px',
        maxWidth: '170px',
        minWidth: '170px',
      },
      customAttr: 'test',
    });
  });

  it('should return correct primary column when isMobileView is false', () => {
    const deviceStore = useDeviceStore();
    deviceStore.isMobileView = false;

    const { getPrimaryColumn } = useCommonColumns();
    const columnAttr = { customAttr: 'test' };
    const primaryColumn = getPrimaryColumn(columnAttr);

    expect(primaryColumn).toEqual({
      isBold: true,
      isFixed: true,
      style: {
        width: '200px',
        maxWidth: '200px',
        minWidth: '200px',
      },
      customAttr: 'test',
    });
  });
});
