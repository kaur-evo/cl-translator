import { mdiCircle, mdiMessageReplyText, mdiCircleOutline } from '@mdi/js';
import tinyColor from 'tinycolor2';

import colorConstants from '@/constants/colorConstants';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import { getIconAsset } from '@/helpers/file/getAsset';

const iconXAxis = getIconAsset('iconXAxis.svg');
const iconYAxis = getIconAsset('iconYAxis.svg');
const icon2ndYAxis = getIconAsset('icon2ndYAxis.svg');
const iconXZAxis = getIconAsset('iconXZAxis.svg');

export default function tooltipTemplate({
  paramRows, note,
} = {}) {
  const getXAXisIcon = () => `<img style="width: 12px" class="ml-n1 mr-2" src="${iconXAxis}" />`;
  const getXZAXisIcon = () => `<img style="width: 12px" class="ml-n1 mr-2" src="${iconXZAxis}" />`;
  const getYAxisIcon = () => `<img style="width: 12px" class="ml-n1 mr-2" src="${iconYAxis}" />`;
  const get2ndYaxisIcon = () => `<img style="width: 12px" class="ml-n1 mr-2" src="${icon2ndYAxis}" />`;

  const getDotIcon = (color) => {
    const darknessThreshold = 0.1;
    const isTooDark = tinyColor(color).getLuminance() < darknessThreshold;
    const dotIcon = isTooDark ? mdiCircleOutline : mdiCircle;
    const dotColor = isTooDark ? colorConstants.dark['secondary-dark'] : color;
    return `<span class="d-flex pr-2">${vIconRawTemplate(dotIcon, 10, dotColor, '')}</span>`;
  };

  const getKeyClasses = (isPrimary, valueDefined) => {
    const sizeClass = isPrimary ? 'text-body-large' : 'text-label-small';
    const colorClass = valueDefined ? 'text-tertiary-dark' : '';
    return `${sizeClass} ${colorClass} font-weight-medium`.trim();
  };

  const getValueClass = (isPrimary, keyDefined) => (isPrimary && !keyDefined ? 'text-body-large' : 'text-body-small');

  const icons = {
    iconXAxis: getXAXisIcon,
    iconXZAxis: getXZAXisIcon,
    iconYAxis: getYAxisIcon,
    icon2ndYAxis: get2ndYaxisIcon,
    iconDot: getDotIcon,
  };

  const axisIconPlaceholder = '<img style="width: 12px;" class="ml-n1 mr-2" src="" />';
  const getIcon = (icon, color) => (icons[icon] ? icons[icon](color) : axisIconPlaceholder);
  let params = '';
  if (paramRows) {
    params = paramRows.map(({
      key, value, color, icon, secondaryValue, isPrimary,
    }) => {
      const secondaryValueSpan = secondaryValue ? `<span class="ml-1 text-body-small text-none text-quaternary-dark-2">(${secondaryValue})</span>` : '';
      const valueDefined = value !== undefined;
      const keyDefined = key !== undefined;

      const keySuffix = valueDefined ? ':&nbsp;' : '';
      const keySpan = keyDefined
        ? `<span class="${getKeyClasses(isPrimary, valueDefined)}">${key}${keySuffix}</span>`
        : '';

      const valueSpan = value === undefined ? '' : `<span class="${getValueClass(isPrimary, keyDefined)} font-weight-medium text-none">${value}</span>${secondaryValueSpan}`;

      return `<div class="font-weight-regular align-center d-flex">
             ${isPrimary ? '' : getIcon(icon, color)}
              ${keySpan}
              ${valueSpan}
              </div>`;
    }).join('');
  }
  let noteRow = '';
  if (note) {
    const noteIcon = vIconRawTemplate(mdiMessageReplyText, 12);
    noteRow = note ? `<div class="mt-1 text-body-small align-center flex-nowrap"><span class="mr-2">${noteIcon}</span><span>${note}</span></div>` : '';
  }

  const row = `<div class="v-row align-center text-white"><v-col class="pb-2 pt-1">

  ${params}
  ${noteRow}
  </v-col></div>`;
  return row;
}
