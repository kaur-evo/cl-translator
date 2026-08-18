import i18n from '@/services/i18n';
import listToKeyMap from '@/helpers/list/listToKeyMap';
export const selectableColor = {
  LIGHT_GREY: 'light-grey',
  GREY: 'grey',
  BLUE: 'blue',
  LIGHT_BLUE: 'light-blue',
  CYAN_AQUA: 'cyan-aqua',
  GREEN: 'green',
  NEON_GREEN: 'neon-green',
  YELLOW: 'yellow',
  CORAL: 'coral',
  RED: 'red',
  PINK: 'pink',
  MAGENTA: 'magenta',
  LILAC: 'lilac',
  VIOLET: 'violet',
};
export const getUserSelectableColors = () => [
  { hex: '#CDCDCD', id: selectableColor.LIGHT_GREY, name: i18n.global.t('Light grey') },
  { hex: '#666666', id: selectableColor.GREY, name: i18n.global.t('Grey') },
  { hex: '#0066CC', id: selectableColor.BLUE, name: i18n.global.t('Blue') },
  { hex: '#3498DB', id: selectableColor.LIGHT_BLUE, name: i18n.global.t('Light blue') },
  { hex: '#1ABC9C', id: selectableColor.CYAN_AQUA, name: i18n.global.t('Cyan/Aqua') },
  { hex: '#2ECC71', id: selectableColor.GREEN, name: i18n.global.t('Green') },
  { hex: '#A7D129', id: selectableColor.NEON_GREEN, name: i18n.global.t('Neon green') },
  { hex: '#F1C40F', id: selectableColor.YELLOW, name: i18n.global.t('Yellow') },
  { hex: '#FA8072', id: selectableColor.CORAL, name: i18n.global.t('Coral') },
  { hex: '#800808', id: selectableColor.RED, name: i18n.global.t('Red') },
  { hex: '#FB85AD', id: selectableColor.PINK, name: i18n.global.t('Pink') },
  { hex: '#F3368D', id: selectableColor.MAGENTA, name: i18n.global.t('Magenta') },
  { hex: '#909AFC', id: selectableColor.LILAC, name: i18n.global.t('Lilac') },
  { hex: '#9B59B6', id: selectableColor.VIOLET, name: i18n.global.t('Violet') },
];


export function getUserSelectableColorName(color) {
  return listToKeyMap(getUserSelectableColors(), 'hex')[color]?.name ?? '';
}

export const userSelectableColors = listToKeyMap(getUserSelectableColors(), 'id', 'hex');
