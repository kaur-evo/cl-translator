import i18n from '@/services/i18n';

export const COMPANY_ADMIN = 'COMPANY_ADMIN';
export const FACTORY_ADMIN = 'FACTORY_ADMIN';
export const OFFICE_USER = 'OFFICE_USER';
export const LINEVIEW_USER = 'LINEVIEW_USER';
export const SYS_ADMIN = 'SYS_ADMIN';

export const ROLE_SYS_ADMIN = 'ROLE_SYS_ADMIN';
export const ROLE_COMPANY_ADMIN = 'ROLE_COMPANY_ADMIN';
export const ROLE_FACTORY_ADMIN = 'ROLE_FACTORY_ADMIN';
export const ROLE_OFFICE_USER = 'ROLE_OFFICE_USER';
export const ROLE_LINEVIEW_USER = 'ROLE_LINEVIEW_USER';

export default {
  COMPANY_ADMIN,
  FACTORY_ADMIN,
  OFFICE_USER,
  LINEVIEW_USER,
  SYS_ADMIN,
};

export const ascRolesArray = [
  SYS_ADMIN,
  COMPANY_ADMIN,
  FACTORY_ADMIN,
  OFFICE_USER,
  LINEVIEW_USER,
];

export const getRolesTranslationsMap = () => ({
  [COMPANY_ADMIN]: i18n.global.t('COMPANY_ADMIN'),
  [FACTORY_ADMIN]: i18n.global.t('FACTORY_ADMIN'),
  [OFFICE_USER]: i18n.global.t('OFFICE_USER'),
  [LINEVIEW_USER]: i18n.global.t('LINEVIEW_USER'),
  [SYS_ADMIN]: i18n.global.t('SYS_ADMIN'),
  [ROLE_COMPANY_ADMIN]: i18n.global.t('COMPANY_ADMIN'),
  [ROLE_FACTORY_ADMIN]: i18n.global.t('FACTORY_ADMIN'),
  [ROLE_OFFICE_USER]: i18n.global.t('OFFICE_USER'),
  [ROLE_LINEVIEW_USER]: i18n.global.t('LINEVIEW_USER'),
  [ROLE_SYS_ADMIN]: i18n.global.t('SYS_ADMIN'),
});

export function getRoleTranslation(role) {
  return getRolesTranslationsMap()[role] ?? '';
}
