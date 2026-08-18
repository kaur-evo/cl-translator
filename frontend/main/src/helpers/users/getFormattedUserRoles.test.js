import getFormattedUserRoles from './getFormattedUserRoles';

import { COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER } from '@/constants/userRoles';

describe('getFormattedUserRoles', () => {
  it('returns formatted roles string if role is Company Admin', () => {
    const roles = { 0: COMPANY_ADMIN };

    expect(getFormattedUserRoles(roles)).toBe(COMPANY_ADMIN);
  });

  it('returns formatted roles string if role is Factory Admin + Office User', () => {
    const roles = { 1: FACTORY_ADMIN, 2: OFFICE_USER };

    expect(getFormattedUserRoles(roles)).toBe(`${FACTORY_ADMIN}, ${OFFICE_USER}`);
  });
});
