import { isRoleSameLevelOrAbove } from './isRoleSameLevelOrAbove';

import roleType from '@/constants/userRoles';


test('isRoleSameLevelOrAbove', () => {
  expect(isRoleSameLevelOrAbove(roleType.LINEVIEW_USER, roleType.LINEVIEW_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.LINEVIEW_USER, roleType.OFFICE_USER)).toBe(false);
  expect(isRoleSameLevelOrAbove(roleType.LINEVIEW_USER, roleType.FACTORY_ADMIN)).toBe(false);
  expect(isRoleSameLevelOrAbove(roleType.LINEVIEW_USER, roleType.COMPANY_ADMIN)).toBe(false);
  expect(isRoleSameLevelOrAbove(roleType.LINEVIEW_USER, roleType.SYS_ADMIN)).toBe(false);

  expect(isRoleSameLevelOrAbove(roleType.OFFICE_USER, roleType.LINEVIEW_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.OFFICE_USER, roleType.OFFICE_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.OFFICE_USER, roleType.FACTORY_ADMIN)).toBe(false);
  expect(isRoleSameLevelOrAbove(roleType.OFFICE_USER, roleType.COMPANY_ADMIN)).toBe(false);
  expect(isRoleSameLevelOrAbove(roleType.OFFICE_USER, roleType.SYS_ADMIN)).toBe(false);

  expect(isRoleSameLevelOrAbove(roleType.FACTORY_ADMIN, roleType.LINEVIEW_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.FACTORY_ADMIN, roleType.OFFICE_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.FACTORY_ADMIN, roleType.FACTORY_ADMIN)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.FACTORY_ADMIN, roleType.COMPANY_ADMIN)).toBe(false);
  expect(isRoleSameLevelOrAbove(roleType.FACTORY_ADMIN, roleType.SYS_ADMIN)).toBe(false);

  expect(isRoleSameLevelOrAbove(roleType.COMPANY_ADMIN, roleType.LINEVIEW_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.COMPANY_ADMIN, roleType.OFFICE_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.COMPANY_ADMIN, roleType.FACTORY_ADMIN)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.COMPANY_ADMIN, roleType.COMPANY_ADMIN)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.COMPANY_ADMIN, roleType.SYS_ADMIN)).toBe(false);

  expect(isRoleSameLevelOrAbove(roleType.SYS_ADMIN, roleType.LINEVIEW_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.SYS_ADMIN, roleType.OFFICE_USER)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.SYS_ADMIN, roleType.FACTORY_ADMIN)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.SYS_ADMIN, roleType.COMPANY_ADMIN)).toBe(true);
  expect(isRoleSameLevelOrAbove(roleType.SYS_ADMIN, roleType.SYS_ADMIN)).toBe(true);
});
