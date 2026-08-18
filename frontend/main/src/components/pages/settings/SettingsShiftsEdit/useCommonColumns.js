import useDeviceStore from '@/stores/device';

export default function useCommonColumns() {
  const { isMobileView } = useDeviceStore();
  const getRowActionsColumn = () => ({
    filterable: false,
    sortable: false,
    style: {
      padding: '0 !important',
      width: isMobileView ? '88px' : '112px',
      maxWidth: isMobileView ? '88px' : '112px',
      minWidth: isMobileView ? '88px' : '112px',
    },
    isSlotColumn: true,
    slotName: 'row-actions',
    notClickable: true,
    type: 'number',
  });
  const getPrimaryColumn = (columnAttr) => ({
    isBold: true,
    isFixed: true,
    style: {
      width: isMobileView ? '170px' : '200px',
      maxWidth: isMobileView ? '170px' : '200px',
      minWidth: isMobileView ? '170px' : '200px',
    },
    ...columnAttr,
  });
  return {
    getRowActionsColumn,
    getPrimaryColumn,
  };
}
