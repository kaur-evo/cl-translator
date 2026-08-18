import i18n from '@/services/i18n';

const formatTooltipByLimit = (tooltipValues, tooltipItemsLimit = 30) => {
  if (tooltipValues.length > tooltipItemsLimit) {
    const visibleValues = tooltipValues.slice(0, tooltipItemsLimit);
    return `${visibleValues.join(', ')} + ${tooltipValues.length - visibleValues.length} ${i18n.global.t('selected')}`;
  }
  return tooltipValues.join(', ');
};

export default formatTooltipByLimit;
