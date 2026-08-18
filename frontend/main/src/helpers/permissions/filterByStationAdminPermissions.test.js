import filterByStationAdminPermissions from './filterByStationAdminPermissions';

describe('filterByStationAdminPermissions', () => {
  const adminStationsMap = { 1: { id: 1 }, 2: { id: 2 } };

  test('returns entities where user has admin permissions for at least one associated station', () => {
    const entities = [
      { id: 1, name: 'Entity 1', stationIds: [1, 2] },
      { id: 2, name: 'Entity 2', stationIds: [3] },
      { id: 3, name: 'Global Entity', stationIds: [] },
    ];

    const result = filterByStationAdminPermissions(entities, adminStationsMap);

    expect(result).toEqual([
      { id: 1, name: 'Entity 1', stationIds: [1, 2] },
      { id: 3, name: 'Global Entity', stationIds: [] },
    ]);
  });

  test('includes entities where user has admin on at least one associated station', () => {
    const entities = [
      { id: 1, name: 'Entity 1', stationIds: [1, 2, 3] },
    ];

    const result = filterByStationAdminPermissions(entities, adminStationsMap);

    expect(result).toEqual([
      { id: 1, name: 'Entity 1', stationIds: [1, 2, 3] },
    ]);
  });

  test('includes global entities with empty stationIds', () => {
    const entities = [
      { id: 1, name: 'Global Entity', stationIds: [] },
    ];

    const result = filterByStationAdminPermissions(entities, {});

    expect(result).toEqual([{ id: 1, name: 'Global Entity', stationIds: [] }]);
  });

  test('handles entities with null stationIds', () => {
    const entities = [
      { id: 1, name: 'Entity with null', stationIds: null },
    ];

    const result = filterByStationAdminPermissions(entities, adminStationsMap);

    expect(result).toEqual([{ id: 1, name: 'Entity with null', stationIds: null }]);
  });

  test('handles entities with undefined stationIds', () => {
    const entities = [
      { id: 1, name: 'Entity without stationIds' },
    ];

    const result = filterByStationAdminPermissions(entities, adminStationsMap);

    expect(result).toEqual([{ id: 1, name: 'Entity without stationIds' }]);
  });

  test('returns empty array when no entities match', () => {
    const entities = [
      { id: 1, name: 'Entity 1', stationIds: [3] },
      { id: 2, name: 'Entity 2', stationIds: [4, 5] },
    ];

    const result = filterByStationAdminPermissions(entities, adminStationsMap);

    expect(result).toEqual([]);
  });

  test('returns all entities when all have permissions', () => {
    const entities = [
      { id: 1, name: 'Entity 1', stationIds: [1] },
      { id: 2, name: 'Entity 2', stationIds: [2] },
      { id: 3, name: 'Entity 3', stationIds: [1, 2] },
    ];

    const result = filterByStationAdminPermissions(entities, adminStationsMap);

    expect(result).toEqual(entities);
  });

  test('returns empty array when entities array is empty', () => {
    const result = filterByStationAdminPermissions([], adminStationsMap);

    expect(result).toEqual([]);
  });
});
