import chartType from '@/stores/reportsConfig/constants/chartType';

export default [
  { text: 'Stacked column chart', value: chartType.STACKED_COLUMN },
  { text: 'Grouped column chart', value: chartType.GROUPED_COLUMN },
  { text: 'Line chart', value: chartType.LINE },
  { text: 'Area chart', value: chartType.AREA },
  { text: 'Dot plot chart', value: chartType.DOT_PLOT },
  { text: 'Datapoint labels', value: chartType.DATAPOINT_LABELS },
];
