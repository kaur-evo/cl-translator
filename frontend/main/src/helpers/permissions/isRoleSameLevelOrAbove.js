import roleType, { ascRolesArray } from '@/constants/userRoles';

export const isRoleSameLevelOrAbove = (role, requirement = roleType.LINEVIEW_USER) => {
  const roleIndex = ascRolesArray.indexOf(role);
  const requirementIndex = ascRolesArray.indexOf(requirement);
  return roleIndex !== -1 && roleIndex <= requirementIndex;
};
