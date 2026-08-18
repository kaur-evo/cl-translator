import { getRoleTranslation } from '@/constants/userRoles';

export default function getFormattedUserRoles(roles) {
  const translatedRoles = Object.values(roles).map((role) => getRoleTranslation(role));
  return [...new Set(translatedRoles)].sort((a, b) => a.localeCompare(b)).join(', ');
}
