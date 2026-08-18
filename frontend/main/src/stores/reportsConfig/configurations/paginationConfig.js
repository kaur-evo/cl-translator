import configType from '@/stores/reportsConfig/constants/configType';

export default function getPaginationConfig(type) {
  if (type === configType.PRODUCTION_SPEED) {
    return {
      ITEMS_PER_PAGE_DEFAULT: -1,
      PAGE_DEFAULT: 1,
      ITEMS_PER_PAGE_OPTIONS: [-1],
    };
  }
  return {
    ITEMS_PER_PAGE_DEFAULT: 100,
    PAGE_DEFAULT: 1,
    ITEMS_PER_PAGE_OPTIONS: [100],
  };
}
