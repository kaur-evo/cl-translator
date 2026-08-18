import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ProductTooltip from './index.vue';

import {
  useShiftviewTimelineStore,
  useScrapReasonStore,
  useShiftviewSelectionStore,
  useStationStore,
} from '@/stores/index';

const createPinia = () => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  const shiftviewTimelineStore = useShiftviewTimelineStore(pinia);
  shiftviewTimelineStore.batches = new Map([[1, {
    id: 1,
    productId: 1,
    alternativeUnitId: 'kg',
    unitId: 'pcs',
    productName: 'test product',
    productSku: 'test sku',
    unitConversionType: 'ALT_TO_PRIMARY',
    unitConversion: 2,
  }], [2, {
    id: 2,
    productId: 2,
    alternativeUnitId: 'kg',
    unitId: 'pcs',
    productName: 'test product 2',
    productSku: 'test sku 2',
    unitConversionType: 'ALT_TO_PRIMARY',
    unitConversion: 1,
  }]]);

  const scrapReasonStore = useScrapReasonStore(pinia);
  scrapReasonStore.scrapReasonsList = [{ id: 1, name: 'test scrap reason', groupId: 1 }];
  scrapReasonStore.scrapReasonGroupsList = [{ id: 1, name: 'test scrap reason group' }];

  const shiftviewSelectionStore = useShiftviewSelectionStore(pinia);
  shiftviewSelectionStore.shiftviewSelectionType = null;

  const stationStore = useStationStore(pinia);
  stationStore.lineviewStation = { zoneId: 'Europe/Tallinn' };

  return pinia;
};

describe('ProductTooltip', () => {
  it('renders correctly as usual signal tooltip', () => {
    const wrapper = shallowMount(ProductTooltip, {
      global: { plugins: [createPinia()] },
      propsData: {
        tooltipProps: {
          productSlice: {
            scrapQty: 0,
            batchId: 1,
            scrapReasonId: 0,
            quantity: 10,
            sliceEndTmISO: '2021-01-01T12:12:00.000+02:00',
            productionOrder: 'order 123',
            scrapNotes: '',
            signalNotes: 'signal with a note',
            quantityFromBatchStart: 100,
            scrapQtyFromBatchStart: 12,
          },
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
  it('renders correctly as scrap signal tooltip', () => {
    const wrapper = shallowMount(ProductTooltip, {
      global: { plugins: [createPinia()] },
      propsData: {
        tooltipProps: {
          productSlice: {
            scrapQty: 4,
            batchId: 1,
            scrapReasonId: 1,
            quantity: 10,
            sliceEndTmISO: '2021-01-01T12:12:00.000+02:00',
            productionOrder: 'order 123',
            scrapNotes: 'scrap with a note',
            signalNotes: '',
            quantityFromBatchStart: 100,
            scrapQtyFromBatchStart: 12,
          },
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('tooltipComponentProps.rows for usual signal without scrap', () => {
    const wrapper = shallowMount(ProductTooltip, {
      global: { plugins: [createPinia()] },
      propsData: {
        tooltipProps: {
          productSlice: {
            scrapQty: 0,
            batchId: 1,
            scrapReasonId: 0,
            quantity: 10,
            sliceEndTmISO: '2021-01-01T12:12:00.000+02:00',
            productionOrder: 'order 123',
            scrapNotes: '',
            signalNotes: 'signal with a note',
            quantityFromBatchStart: 100,
            scrapQtyFromBatchStart: 0,
          },
        },
      },
    });

    expect(wrapper.vm.tooltipComponentProps.rows).toEqual([
      { key: 'Group', value: '' },
      { key: 'Time', value: '12:12' },
      { key: 'Product', value: '' },
      { key: 'Order', value: 'order 123' },
      { key: 'quantity', value: '20 kg' },
      {
        key: 'Scrap quantity',
        value: '',
        secondaryValue: '',
        tertiaryValue: '',
        valueClass: 'text-lw-orange',
      },
      {
        key: 'Since changeover',
        value: '200',
        valueClass: 'text-primary',
        secondaryValue: '',
        secondaryClass: 'text-lw-orange',
        tertiaryValue: ' kg',
      },
      {
        key: 'Extra note',
        value: '',
        allowTextWrap: true,
      },
      { key: 'Extra note', value: 'signal with a note', allowTextWrap: true },
    ]);
  });

  test('tooltipComponentProps.rows for signal with decimals', () => {
    const wrapper = shallowMount(ProductTooltip, {
      global: { plugins: [createPinia()] },
      propsData: {
        tooltipProps: {
          productSlice: {
            scrapQty: 0,
            batchId: 2,
            scrapReasonId: 1,
            quantity: 10.00025,
            sliceEndTmISO: '2021-01-01T12:12:00.000+02:00',
            productionOrder: 'order 123',
            scrapNotes: '',
            signalNotes: '',
            quantityFromBatchStart: 100.00025,
            scrapQtyFromBatchStart: 12.00012,
          },
        },
      },
    });

    expect(wrapper.vm.tooltipComponentProps.rows).toEqual([
      { key: 'Group', value: '' },
      { key: 'Time', value: '12:12' },
      { key: 'Product', value: '' },
      { key: 'Order', value: 'order 123' },
      { key: 'quantity', value: '10 kg' },
      {
        key: 'Scrap quantity',
        value: '',
        secondaryValue: '',
        tertiaryValue: '',
        valueClass: 'text-lw-orange',
      },
      {
        key: 'Since changeover',
        value: '100',
        valueClass: 'text-primary',
        secondaryValue: ' (12)',
        secondaryClass: 'text-lw-orange',
        tertiaryValue: ' kg',
      },
      { key: 'Extra note', value: '', allowTextWrap: true },
      { key: 'Extra note', value: '', allowTextWrap: true },
    ]);
  });
});
