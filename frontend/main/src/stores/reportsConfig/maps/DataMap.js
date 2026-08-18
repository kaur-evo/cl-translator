import fromEntries from '@/helpers/object/fromEntries';
import formatNumberWithOptions from '@/helpers/numbers/formatNumberWithOptions';
import formatSecondsFriendlyWithOptions from '@/helpers/time/formatSecondsFriendlyWithOptions';
import { defaultNumberFormattingOptions } from '@/constants/formattingConstants';

export default class DataMapper {
  keyDefaults = new Map();

  calculationDefaults = new Map();

  formatDefaults = new Map();

  #input = {};

  inputItemDefaults = {};

  formattedObj = {};

  unformattedObj = {};

  isCompactFormatted = false;

  constructor(item, params = {}) {
    this.#input = item;
    Object.entries(params).forEach(([k, v]) => {
      this[k] = v;
    });
  }

  get item() {
    return { ...this.inputItemDefaults, ...this.#input };
  }

  get keyMap() {
    return this.keyDefaults;
  }

  get calculationMap() {
    return this.calculationDefaults;
  }

  get formatMap() {
    return this.formatDefaults;
  }

  getKeyValue(key, mapKey) {
    let value = null;
    if (this.calculationMap.has(mapKey)) {
      value = this.calculationMap.get(mapKey)(this.item);
    } else if (this.item[key] !== undefined) {
      value = this.item[key];
    }
    return value;
  }

  getUnformatted() {
    const resultMap = new Map();
    this.keyMap.forEach((entityKey, mapKey) => {
      resultMap.set(mapKey, this.getKeyValue(entityKey, mapKey));
    });
    this.unformattedObj = { ...this.unformattedObj, ...fromEntries(resultMap) };

    return this;
  }

  getFormatted(input) {
    if (input) this.#input = input;
    if (Object.keys(this.unformattedObj).length === 0) this.getUnformatted();
    const resultObj = { ...this.unformattedObj };
    this.formatMap.forEach((formatFunc, mapKey) => {
      if (this.unformattedObj[mapKey] !== undefined) {
        resultObj[mapKey] = formatFunc(this.unformattedObj[mapKey], this.unformattedObj);
      }
    });
    this.formattedObj = resultObj;
    Object.assign(this, this.formattedObj);
    return this;
  }

  get numberFormattingOptions() {
    return this?.formattingOptions?.numberFormattingOptions ?? defaultNumberFormattingOptions;
  }

  formatNumberFixed(val, options = {}) {
    return formatNumberWithOptions(val, { ...this.numberFormattingOptions, keepDecimalPlaces: true, ...options });
  }

  formatNumber(val, options = {}) {
    return formatNumberWithOptions(val, { ...this.numberFormattingOptions, ...options });
  }

  formatSecondsReadable(val) {
    return formatSecondsFriendlyWithOptions(val, true, true, 'm', { hourFormatOptions: this.numberFormattingOptions });
  }

  formatSecondsToHour(val) {
    return `${formatNumberWithOptions(val / 3600, { ...this.numberFormattingOptions, decimalPlaces: 0 })}h`;
  }

  formatPercentage(val, options = {}) {
    const defaultOptions = { ...this.numberFormattingOptions, keepDecimalPlaces: true };
    const optionsWithOverrides = { ...defaultOptions, ...options };
    optionsWithOverrides.decimalPlaces = optionsWithOverrides.pctDecimalPlaces;
    return `${formatNumberWithOptions(val, optionsWithOverrides)}%`;
  }
}
