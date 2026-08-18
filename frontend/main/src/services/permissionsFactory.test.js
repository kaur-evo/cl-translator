import { permissionMap, roleAllows, getAllowedRoutes, getHighestRole, getFactoryRole } from './permissionsFactory';

import { COMPANY_ADMIN, FACTORY_ADMIN, LINEVIEW_USER, OFFICE_USER, SYS_ADMIN } from '@/constants/userRoles';
import {
  SHIFT_VIEW, ALL_FACTORIES, DASHBOARD, REPORTS, IMPROVEMENTS, SETTINGS, SPLIT_VIEW,
} from '@/constants/routeNames';

describe('permissionsFactory', () => {
  it('returns correct permissionsMap', () => {
    expect(permissionMap).toMatchSnapshot();
  });

  describe('roleAllows', () => {
    it('throws error if action is not defined in permissionMap', () => {
      expect(() => roleAllows('nonExistentAction', 'SYS_ADMIN')).toThrow('No permission named nonExistentAction in permissions');
    });

    it('returns true if action is allowed for user role', () => {
      expect(roleAllows('shareDashboard', 'SYS_ADMIN')).toBe(true);
      expect(roleAllows('editSignal', 'COMPANY_ADMIN')).toBe(true);
      expect(roleAllows('addAPIKeys', 'FACTORY_ADMIN')).toBe(true);
      expect(roleAllows('help', 'LINEVIEW_USER')).toBe(true);
    });

    it('returns false if action is not allowed for user role', () => {
      expect(roleAllows('editGlobalGroup', 'FACTORY_ADMIN')).toBe(false);
      expect(roleAllows('addAPIKeys', 'OFFICE_USER')).toBe(false);
      expect(roleAllows('editProfile', 'LINEVIEW_USER')).toBe(false);
    });
  });

  test('getAllowedRoutes', () => {
    expect(getAllowedRoutes('SYS_ADMIN')).toEqual([ALL_FACTORIES, SETTINGS, REPORTS, DASHBOARD, IMPROVEMENTS, SHIFT_VIEW, SPLIT_VIEW]);
    expect(getAllowedRoutes('COMPANY_ADMIN')).toEqual([ALL_FACTORIES, SETTINGS, REPORTS, DASHBOARD, IMPROVEMENTS, SHIFT_VIEW, SPLIT_VIEW]);
    expect(getAllowedRoutes('FACTORY_ADMIN')).toEqual([ALL_FACTORIES, SETTINGS, REPORTS, DASHBOARD, IMPROVEMENTS, SHIFT_VIEW, SPLIT_VIEW]);
    expect(getAllowedRoutes('OFFICE_USER')).toEqual([ALL_FACTORIES, REPORTS, DASHBOARD, IMPROVEMENTS, SHIFT_VIEW, SPLIT_VIEW]);
    expect(getAllowedRoutes('LINEVIEW_USER')).toEqual([SHIFT_VIEW, SPLIT_VIEW]);
  });

  test('getHighestRole', () => {
    expect(getHighestRole({ 0: SYS_ADMIN })).toBe(SYS_ADMIN);
    expect(getHighestRole({ 0: COMPANY_ADMIN })).toBe(COMPANY_ADMIN);
    expect(getHighestRole({ 1: FACTORY_ADMIN })).toBe(FACTORY_ADMIN);
    expect(getHighestRole({ 1: OFFICE_USER, 2: FACTORY_ADMIN })).toBe(FACTORY_ADMIN);
    expect(getHighestRole({ 2: OFFICE_USER })).toBe(OFFICE_USER);
    expect(getHighestRole({ 3: LINEVIEW_USER })).toBe(LINEVIEW_USER);
  });

  test('getFactoryRole', () => {
    expect(getFactoryRole({ 0: SYS_ADMIN }, 1)).toBe(SYS_ADMIN);
    expect(getFactoryRole({ 0: COMPANY_ADMIN }, 2)).toBe(COMPANY_ADMIN);
    expect(getFactoryRole({ 1: FACTORY_ADMIN, 2: OFFICE_USER }, 1)).toBe(FACTORY_ADMIN);
    expect(getFactoryRole({ 1: FACTORY_ADMIN, 2: OFFICE_USER }, 2)).toBe(OFFICE_USER);
    expect(getFactoryRole({ 1: FACTORY_ADMIN, 2: OFFICE_USER }, 3)).toBe(LINEVIEW_USER);
    expect(getFactoryRole({ 3: OFFICE_USER }, 3)).toBe(OFFICE_USER);
    expect(getFactoryRole({ 3: OFFICE_USER }, 4)).toBe(LINEVIEW_USER);
    expect(getFactoryRole({ 3: LINEVIEW_USER }, 3)).toBe(LINEVIEW_USER);
  });
});
