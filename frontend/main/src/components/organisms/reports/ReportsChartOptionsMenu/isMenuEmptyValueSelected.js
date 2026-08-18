export default function isMenuEmptyValueSelected(menuItemValue) {
  return ['null', 'undefined', ''].includes(String(menuItemValue));
}
