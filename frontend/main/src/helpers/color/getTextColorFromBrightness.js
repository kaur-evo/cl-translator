import hexToRgb from '@/helpers/color/hexToRgb';
/* eslint-disable no-magic-numbers */

export default function getTextColorFromBrightness(hex) {
  const rgb = hexToRgb(hex);
  const brightness = Math.round(((parseInt(rgb[0], 10) * 299)
    + (parseInt(rgb[1], 10) * 587)
    + (parseInt(rgb[2], 10) * 114)) / 1000);
  const textColour = (brightness > 125) ? '#000' : '#FFF';
  return textColour;
}
