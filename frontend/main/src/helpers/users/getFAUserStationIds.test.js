import getFAUserStationIds from './getFAUserStationIds';

import { COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER } from '@/constants/userRoles';

describe('getFAUserStationIds', () => {
  const factoriesMap = { 31: { id: 31, stations: [{ id: 21 }, { id: 22 }] }, 32: { id: 32, stations: [{ id: 24 }] } };
  it('returns empty array if user is Company Admin', () => {
    const roles = { 0: COMPANY_ADMIN };

    expect(getFAUserStationIds(roles, factoriesMap)).toEqual([]);
  });

  it('returns empty array if user is Office User', () => {
    const roles = { 31: OFFICE_USER };

    expect(getFAUserStationIds(roles, factoriesMap)).toEqual([]);
  });

  it('returns array of station ids if user is Factory Admin in one factory', () => {
    const roles = { 31: FACTORY_ADMIN };

    expect(getFAUserStationIds(roles, factoriesMap)).toEqual([21, 22]);
  });

  it('returns array of station ids if user is Factory Admin in multiple factories', () => {
    const roles = { 31: FACTORY_ADMIN, 32: FACTORY_ADMIN };

    expect(getFAUserStationIds(roles, factoriesMap)).toEqual([21, 22, 24]);
  });

  it('returns array of station ids that are only allowed for the Factory Admin if user is Factory Admin + Office User', () => {
    const roles = { 31: FACTORY_ADMIN, 32: OFFICE_USER };

    expect(getFAUserStationIds(roles, factoriesMap)).toEqual([21, 22]);
  });
});
