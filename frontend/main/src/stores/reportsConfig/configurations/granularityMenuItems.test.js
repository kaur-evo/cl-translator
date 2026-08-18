import { getGranularityMenu, getExtendedGranularityMenu, getExtraGranularityItem } from './granularityMenuItems';

window.Intl.DisplayNames = class {
  constructor(locale, options) {
    this.locale = locale;
    this.options = options;
  }


  of(type) {
    return type;
  }
};
describe('granularityMenuItems', () => {
  test('if getGranularityMenu returns expected configuration snapshot', () => {
    expect(getGranularityMenu()).toMatchSnapshot();
  });
  test('if getExtendedGranularityMenu returns expected configuration snapshot', () => {
    expect(getExtendedGranularityMenu()).toMatchSnapshot();
  });
  test('if getExtraGranularityItem returns expected configuration snapshot', () => {
    expect(getExtraGranularityItem()).toMatchSnapshot();
  });
});
