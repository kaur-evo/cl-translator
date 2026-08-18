import getGroupsWithAdminPermissions from './getGroupsWithAdminPermissions';

describe('getGroupsWithAdminPermissions', () => {
  test('with company admin when groups have just one factory', () => {
    const groups = [
      { id: 1, factoryId: 1 },
      { id: 2, factoryId: 2 },
    ];
    const roles = { 0: true };
    const result = getGroupsWithAdminPermissions(groups, roles);
    expect(result).toEqual(groups);
  });

  test('with company admin when groups have multiple factories', () => {
    const groups = [
      { id: 1, factoryIds: [], local: false },
      { id: 2, factoryIds: [2], local: true },
    ];
    const roles = { 0: true };
    const result = getGroupsWithAdminPermissions(groups, roles);
    expect(result).toEqual(groups);
  });

  test('with factory admin + office user when groups have just one factory', () => {
    const groups = [
      { id: 1, factoryId: 1 },
      { id: 2, factoryId: 2 },
    ];
    const roles = { 1: 'FACTORY_ADMIN', 2: 'OFFICE_USER' };
    const result = getGroupsWithAdminPermissions(groups, roles);
    expect(result).toEqual([groups[0]]);
  });

  test('with factory admin + office user when groups have multiple factoryIds', () => {
    const groups = [
      { id: 1, factoryIds: [1], local: true },
      { id: 2, factoryIds: [2], local: true },
      { id: 2, factoryIds: [], local: false },

    ];
    const roles = { 1: 'FACTORY_ADMIN', 2: 'OFFICE_USER' };
    const result = getGroupsWithAdminPermissions(groups, roles);
    expect(result).toEqual([groups[0], groups[2]]);
  });

  test('with factory admin + office user when groups have multiple factoryIds, but no local prop', () => {
    const groups = [
      { id: 1, factoryIds: [1] },
      { id: 2, factoryIds: [2] },
      { id: 2, factoryIds: [] },

    ];
    const roles = { 1: 'FACTORY_ADMIN', 2: 'OFFICE_USER' };
    const result = getGroupsWithAdminPermissions(groups, roles);
    expect(result).toEqual([groups[0]]);
  });
});
