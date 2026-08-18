export default function getStackingConfigurations({ yAxisKey } = {}) {
  return {
    valueKey: yAxisKey ?? 'value',
    stackByValue: true,
    stackOrderKey: 'color',
  };
}
