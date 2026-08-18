import curveType from '@/stores/reportsConfig/constants/curveType';

export default [
  { text: 'Linear', value: curveType.LINEAR },
  { text: 'Step', value: curveType.STEP },
  { text: 'Monotone', value: curveType.MONOTONE_X },
  { text: 'Basis', value: curveType.BASIS },
  { text: 'Natural', value: curveType.NATURAL },
  { text: 'Cardinal', value: curveType.CARDINAL },
];
