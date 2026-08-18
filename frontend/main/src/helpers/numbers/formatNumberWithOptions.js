export default function formatNumberWithOptions(inputNumber, options, intlOptions) {
  // 5 is "magic number" when we do not want to limit the number of decimal places, the default would be 3
  try {
    const number = inputNumber;
    const numberParts = new Intl.NumberFormat(options.language ?? 'en', {
      maximumFractionDigits: options.decimalPlaces === null ? 5 : options.decimalPlaces,
      ...intlOptions,
    }).formatToParts(number);
    if (options.keepDecimalPlaces && !numberParts.find((part) => part.type === 'fraction') && options.decimalPlaces > 0) {
      const literalIndex = numberParts.findIndex((part) => part.type === 'literal');
      const decimalPart = { type: 'decimal', value: options.decimalSeparator };
      const fractionPart = { type: 'fraction', value: '0' };

      if (literalIndex === -1) {
        numberParts.push(decimalPart, fractionPart);
      } else {
        numberParts.splice(literalIndex, 0, decimalPart, fractionPart);
      }
    }
    const replacedParts = numberParts.map((part) => {
      if (part.type === 'group') return options.groupSeparator;
      if (part.type === 'decimal') return options.decimalSeparator;
      if (part.type === 'fraction') {
        return options.keepDecimalPlaces ? part.value.padEnd(options.decimalPlaces, '0') : part.value;
      }
      return part.value;
    });
    return replacedParts.join('');
  } catch {
    return inputNumber;
  }
}
