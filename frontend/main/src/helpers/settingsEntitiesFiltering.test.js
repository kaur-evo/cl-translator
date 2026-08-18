import {
  isEmptyValue,
  isIncludedInFilter,
  matchesTerm,
  matchesOrEmpty,
  passesSearchFilter,
  passesFactoryFilter,
  passesStationFilter,
  passesGroupFilter,
  passesTypeFilter,
  passesDayFilter,
  passesRoleFilter,
  passesProductFilter,
  passesStatusFilter,
  passesCommentFilter,
  passesPerformanceCommentFilter,
  passesOperatorFilter,
  passesChannelFilter,
  passesPasscodeFilter,
  passesAuthenticationFilter,
  filterEntities,
} from './settingsEntitiesFiltering';

import { FACTORY_ADMIN, OFFICE_USER } from '@/constants/userRoles';

describe('settingsEntitiesFiltering', () => {
  describe('isEmptyValue', () => {
    it('returns true for undefined', () => {
      expect(isEmptyValue(undefined)).toBe(true);
    });

    it('returns true for null', () => {
      expect(isEmptyValue(null)).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(isEmptyValue('')).toBe(true);
    });

    it('returns true for empty array', () => {
      expect(isEmptyValue([])).toBe(true);
    });

    it('returns false for non-empty string', () => {
      expect(isEmptyValue('test')).toBe(false);
    });

    it('returns false for non-empty array', () => {
      expect(isEmptyValue([1, 2, 3])).toBe(false);
    });
  });

  describe('isIncludedInFilter', () => {
    it('returns true if value is array and some elements are in filter', () => {
      const filter = [1, 2, 3];
      const value = [2, 4];
      const result = isIncludedInFilter(filter, value);
      expect(result).toBe(true);
    });

    it('returns false if value is array and no elements are in filter', () => {
      const filter = [1, 2, 3];
      const value = [4, 5];
      const result = isIncludedInFilter(filter, value);
      expect(result).toBe(false);
    });

    it('returns true if value is in filter', () => {
      const filter = ['A', 'B', 'C'];
      const value = 'B';
      const result = isIncludedInFilter(filter, value);
      expect(result).toBe(true);
    });

    it('returns false if value is not in filter', () => {
      const filter = ['A', 'B', 'C'];
      const value = 'D';
      const result = isIncludedInFilter(filter, value);
      expect(result).toBe(false);
    });
  });

  test('matchesTerm', () => {
    expect(matchesTerm('TestValue', 'test')).toBe(true);
    expect(matchesTerm('Anothervalue', 'Value')).toBe(true);
    expect(matchesTerm('Sample', 'example')).toBe(false);
    expect(matchesTerm(null, 'test')).toBe(false);
  });

  describe('matchesOrEmpty', () => {
    it('returns true if filter is empty', () => {
      const result = matchesOrEmpty('anyValue', []);
      expect(result).toBe(true);
    });

    it('returns true if isOptional is true and keyVal is empty', () => {
      const result = matchesOrEmpty('', ['A', 'B', 'C'], true);
      expect(result).toBe(true);
    });

    it('returns true if value is in filter', () => {
      const result = matchesOrEmpty('B', ['A', 'B', 'C']);
      expect(result).toBe(true);
    });

    it('returns false if value is not in filter', () => {
      const result = matchesOrEmpty('D', ['A', 'B', 'C']);
      expect(result).toBe(false);
    });
  });

  describe('passesSearchFilter', () => {
    it('returns true if search is empty', () => {
      const entity = { name: 'Test Entity' };
      const result = passesSearchFilter(entity, '');
      expect(result).toBe(true);
    });

    it('returns true if entity.name includes the search string', () => {
      const entity = { name: 'Test Entity' };
      const result = passesSearchFilter(entity, 'test');
      expect(result).toBe(true);
    });

    it('returns false if entity.name does not include the search string', () => {
      const entity = { name: 'Test Entity' };
      const result = passesSearchFilter(entity, 'example');
      expect(result).toBe(false);
    });

    it('returns true if entity.groupName includes the search string', () => {
      const entity = { groupName: 'Group A' };
      const result = passesSearchFilter(entity, 'group');
      expect(result).toBe(true);
    });

    it('returns false if entity.groupName does not include the search string', () => {
      const entity = { groupName: 'Group A' };
      const result = passesSearchFilter(entity, 'example');
      expect(result).toBe(false);
    });

    it('returns true if entity.fullName includes the search string', () => {
      const entity = { fullName: 'Full Entity Name' };
      const result = passesSearchFilter(entity, 'entity');
      expect(result).toBe(true);
    });

    it('returns false if entity.fullName does not include the search string', () => {
      const entity = { fullName: 'Full Entity Name' };
      const result = passesSearchFilter(entity, 'example');
      expect(result).toBe(false);
    });

    it('returns true if entity.username includes the search string', () => {
      const entity = { username: 'user123' };
      const result = passesSearchFilter(entity, 'SER1');
      expect(result).toBe(true);
    });

    it('returns false if entity.username does not include the search string', () => {
      const entity = { username: 'user123' };
      const result = passesSearchFilter(entity, 'example');
      expect(result).toBe(false);
    });

    it('returns true if entity.serialNumber includes the search string', () => {
      const entity = { serialNumber: 123456 };
      const result = passesSearchFilter(entity, '345');
      expect(result).toBe(true);
    });

    it('returns false if entity.serialNumber does not include the search string', () => {
      const entity = { serialNumber: 123456 };
      const result = passesSearchFilter(entity, '789');
      expect(result).toBe(false);
    });

    it('returns true if entity.sku includes the search string', () => {
      const entity = { sku: 'SKU-001' };
      const result = passesSearchFilter(entity, 'sku');
      expect(result).toBe(true);
    });

    it('returns false if entity.sku does not include the search string', () => {
      const entity = { sku: 'SKU-001' };
      const result = passesSearchFilter(entity, 'example');
      expect(result).toBe(false);
    });
  });

  describe('passesFactoryFilter', () => {
    it('returns true if factoryFilter is empty', () => {
      const entity = { factoryIds: [1, 2, 3] };
      const result = passesFactoryFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.factoryIds includes any id from factoryFilter', () => {
      const entity = { factoryIds: [1, 2, 3] };
      const result = passesFactoryFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.factoryIds does not include any id from factoryFilter', () => {
      const entity = { factoryIds: [1, 2, 3] };
      const result = passesFactoryFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });

    it('returns true if entity.factoryId is included in factoryFilter', () => {
      const entity = { factoryId: 2 };
      const result = passesFactoryFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.factoryId is not included in factoryFilter', () => {
      const entity = { factoryId: 2 };
      const result = passesFactoryFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });

    it('returns true if entity.allowedFactories includes any id from factoryFilter', () => {
      const entity = { allowedFactories: [1, 2, 3] };
      const result = passesFactoryFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.allowedFactories does not include any id from factoryFilter', () => {
      const entity = { allowedFactories: [1, 2, 3] };
      const result = passesFactoryFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });
  });

  describe('passesStationFilter', () => {
    it('returns true if stationFilter is empty', () => {
      const entity = { stationIds: [1, 2, 3] };
      const result = passesStationFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.stationIds includes any id from stationFilter', () => {
      const entity = { stationIds: [1, 2, 3] };
      const result = passesStationFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.stationIds does not include any id from stationFilter', () => {
      const entity = { stationIds: [1, 2, 3] };
      const result = passesStationFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });

    it('returns true if entity.allowedStations includes only 0', () => {
      const entity = { allowedStations: { 0: true } };
      const result = passesStationFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns true if entity.allowedStations includes any id from stationFilter', () => {
      const entity = { allowedStations: { 1: true, 2: true } };
      const result = passesStationFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.allowedStations does not include any id from stationFilter', () => {
      const entity = { allowedStations: { 1: true, 2: true } };
      const result = passesStationFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });
  });

  describe('passesGroupFilter', () => {
    it('returns true if groupFilter is empty', () => {
      const entity = { groupId: 10 };
      const result = passesGroupFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.groupId is included in groupFilter', () => {
      const entity = { groupId: 10 };
      const result = passesGroupFilter(entity, [10, 20]);
      expect(result).toBe(true);
    });

    it('returns false if entity.groupId is not included in groupFilter', () => {
      const entity = { groupId: 10 };
      const result = passesGroupFilter(entity, [20, 30]);
      expect(result).toBe(false);
    });
  });

  describe('passesTypeFilter', () => {
    it('returns true if typeFilter is empty', () => {
      const entity = { type: 'A' };
      const result = passesTypeFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.type is included in typeFilter', () => {
      const entity = { type: 'A' };
      const result = passesTypeFilter(entity, ['A', 'B']);
      expect(result).toBe(true);
    });

    it('returns false if entity.type is not included in typeFilter', () => {
      const entity = { type: 'A' };
      const result = passesTypeFilter(entity, ['B', 'C']);
      expect(result).toBe(false);
    });
  });

  describe('passesDayFilter', () => {
    it('returns true if dayFilter is empty', () => {
      const entity = { daysOfWeek: ['MONDAY', 'TUESDAY'] };
      const result = passesDayFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.daysOfWeek includes any day from dayFilter', () => {
      const entity = { daysOfWeek: ['MONDAY', 'TUESDAY'] };
      const result = passesDayFilter(entity, ['TUESDAY', 'WEDNESDAY']);
      expect(result).toBe(true);
    });

    it('returns false if entity.daysOfWeek does not include any day from dayFilter', () => {
      const entity = { daysOfWeek: ['MONDAY', 'TUESDAY'] };
      const result = passesDayFilter(entity, ['WEDNESDAY', 'THURSDAY']);
      expect(result).toBe(false);
    });
  });

  describe('passesRoleFilter', () => {
    it('returns true if roleFilter is empty', () => {
      const entity = { roles: { 1: FACTORY_ADMIN, 3: OFFICE_USER } };
      const result = passesRoleFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.roles includes any role from roleFilter', () => {
      const entity = { roles: { 1: FACTORY_ADMIN, 3: OFFICE_USER } };
      const result = passesRoleFilter(entity, [OFFICE_USER, 'SOME_OTHER_ROLE']);
      expect(result).toBe(true);
    });

    it('returns false if entity.roles does not include any role from roleFilter', () => {
      const entity = { roles: { 1: FACTORY_ADMIN, 3: OFFICE_USER } };
      const result = passesRoleFilter(entity, ['SOME_OTHER_ROLE', 'ANOTHER_ROLE']);
      expect(result).toBe(false);
    });

    it('returns false if entity.roles is undefined', () => {
      const entity = {};
      const result = passesRoleFilter(entity, [OFFICE_USER]);
      expect(result).toBe(false);
    });
  });

  describe('passesProductFilter', () => {
    it('returns true if productFilter is empty', () => {
      const entity = { frequency: { productIds: [1, 2, 3] } };
      const result = passesProductFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.frequency.productIds is empty', () => {
      const entity = { frequency: { productIds: [] } };
      const result = passesProductFilter(entity, [1, 2]);
      expect(result).toBe(true);
    });

    it('returns true if entity.frequency.productIds includes any id from productFilter', () => {
      const entity = { frequency: { productIds: [1, 2, 3] } };
      const result = passesProductFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.frequency.productIds does not include any id from productFilter', () => {
      const entity = { frequency: { productIds: [1, 2, 3] } };
      const result = passesProductFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });
  });

  describe('passesStatusFilter', () => {
    it('returns true if statusFilter is empty', () => {
      const entity = { active: true };
      const result = passesStatusFilter(entity, [], 'active');
      expect(result).toBe(true);
    });

    it('returns true if entity[statusKey] is included in statusFilter', () => {
      const entity = { active: true };
      const result = passesStatusFilter(entity, [true], 'active');
      expect(result).toBe(true);
    });

    it('returns false if entity[statusKey] is not included in statusFilter', () => {
      const entity = { active: true };
      const result = passesStatusFilter(entity, [false], 'active');
      expect(result).toBe(false);
    });
  });

  describe('passesCommentFilter', () => {
    it('returns true if commentFilter is empty', () => {
      const entity = { commentIds: [1, 2, 3] };
      const result = passesCommentFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.commentIds is empty', () => {
      const entity = { commentIds: [] };
      const result = passesCommentFilter(entity, [1, 2]);
      expect(result).toBe(true);
    });

    it('returns true if entity.commentIds includes any id from commentFilter', () => {
      const entity = { commentIds: [1, 2, 3] };
      const result = passesCommentFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.commentIds does not include any id from commentFilter', () => {
      const entity = { commentIds: [1, 2, 3] };
      const result = passesCommentFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });
  });

  describe('passesPerformanceCommentFilter', () => {
    it('returns true if performanceCommentFilter is empty', () => {
      const entity = { performanceCommentIds: [1, 2, 3] };
      const result = passesPerformanceCommentFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.performanceCommentIds is empty', () => {
      const entity = { performanceCommentIds: [] };
      const result = passesPerformanceCommentFilter(entity, [1, 2]);
      expect(result).toBe(true);
    });

    it('returns true if entity.performanceCommentIds includes any id from performanceCommentFilter', () => {
      const entity = { performanceCommentIds: [1, 2, 3] };
      const result = passesPerformanceCommentFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.performanceCommentIds does not include any id from performanceCommentFilter', () => {
      const entity = { performanceCommentIds: [1, 2, 3] };
      const result = passesPerformanceCommentFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });
  });

  describe('passesOperatorFilter', () => {
    it('returns true if operatorsFilter is empty', () => {
      const entity = { operatorIds: [1, 2, 3] };
      const result = passesOperatorFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.operatorIds is empty', () => {
      const entity = { operatorIds: [] };
      const result = passesOperatorFilter(entity, [1, 2]);
      expect(result).toBe(true);
    });

    it('returns true if entity.operatorIds includes any id from operatorsFilter', () => {
      const entity = { operatorIds: [1, 2, 3] };
      const result = passesOperatorFilter(entity, [2, 4]);
      expect(result).toBe(true);
    });

    it('returns false if entity.operatorIds does not include any id from operatorsFilter', () => {
      const entity = { operatorIds: [1, 2, 3] };
      const result = passesOperatorFilter(entity, [4, 5]);
      expect(result).toBe(false);
    });
  });

  describe('passesChannelFilter', () => {
    it('returns true if channelFilter is empty', () => {
      const entity = { output: { channels: [{ type: 'A' }, { type: 'B' }] } };
      const result = passesChannelFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity has a channel type included in channelFilter', () => {
      const entity = { output: { channels: [{ type: 'A' }, { type: 'B' }] } };
      const result = passesChannelFilter(entity, ['B', 'C']);
      expect(result).toBe(true);
    });

    it('returns false if entity has no output', () => {
      const entity = {};
      const result = passesChannelFilter(entity, ['A', 'B']);
      expect(result).toBe(false);
    });

    it('returns false if entity has no channels', () => {
      const entity = { output: {} };
      const result = passesChannelFilter(entity, ['A', 'B']);
      expect(result).toBe(false);
    });

    it('returns false if entity has no channel types included in channelFilter', () => {
      const entity = { output: { channels: [{ type: 'A' }, { type: 'B' }] } };
      const result = passesChannelFilter(entity, ['C', 'D']);
      expect(result).toBe(false);
    });
  });

  describe('passesPasscodeFilter', () => {
    it('returns true if passcodeFilter is empty', () => {
      const entity = { passcodeCreatedAt: '2023-01-01T12:34:56' };
      const result = passesPasscodeFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.passcodeCreatedAt exists and passcodeFilter includes true', () => {
      const entity = { passcodeCreatedAt: '2023-01-01T12:34:56' };
      const result = passesPasscodeFilter(entity, [true]);
      expect(result).toBe(true);
    });

    it('returns true if entity.passcodeCreatedAt does not exist and passcodeFilter includes false', () => {
      const entity = { passcodeCreatedAt: null };
      const result = passesPasscodeFilter(entity, [false]);
      expect(result).toBe(true);
    });

    it('returns false if entity.passcodeCreatedAt exists and passcodeFilter includes false', () => {
      const entity = { passcodeCreatedAt: '2023-01-01T12:34:56' };
      const result = passesPasscodeFilter(entity, [false]);
      expect(result).toBe(false);
    });

    it('returns false if entity.passcodeCreatedAt does not exist and passcodeFilter includes true', () => {
      const entity = { passcodeCreatedAt: null };
      const result = passesPasscodeFilter(entity, [true]);
      expect(result).toBe(false);
    });
  });

  describe('passesAuthenticationFilter', () => {
    it('returns true if authenticationFilter is empty', () => {
      const entity = { authenticationRequired: true };
      const result = passesAuthenticationFilter(entity, []);
      expect(result).toBe(true);
    });

    it('returns true if entity.authenticationRequired is true and authenticationFilter includes true', () => {
      const entity = { authenticationRequired: true };
      const result = passesAuthenticationFilter(entity, [true]);
      expect(result).toBe(true);
    });

    it('returns true if entity.authenticationRequired is false and authenticationFilter includes false', () => {
      const entity = { authenticationRequired: false };
      const result = passesAuthenticationFilter(entity, [false]);
      expect(result).toBe(true);
    });

    it('returns false if entity.authenticationRequired is true and authenticationFilter includes false', () => {
      const entity = { authenticationRequired: true };
      const result = passesAuthenticationFilter(entity, [false]);
      expect(result).toBe(false);
    });

    it('returns false if entity.authenticationRequired is false and authenticationFilter includes true', () => {
      const entity = { authenticationRequired: false };
      const result = passesAuthenticationFilter(entity, [true]);
      expect(result).toBe(false);
    });
  });

  describe('filterEntities', () => {
    const defaultEntities = [
      { id: 1, name: 'test1', groupId: 1, type: 'A' },
      { id: 2, name: 'test2', groupId: 2, type: 'B' },
      { id: 3, name: 'test3', groupId: 1, type: 'A' },
    ];

    it('returns all entities if filters object is empty', () => {
      const filters = {};
      const result = filterEntities(defaultEntities, filters);
      expect(result).toEqual(defaultEntities);
    });

    it('returns all entities if no filters are applied', () => {
      const filters = { search: '', groupId: [], type: [] };
      const result = filterEntities(defaultEntities, filters);
      expect(result).toEqual(defaultEntities);
    });

    it('returns all entities if filter includes some other keys', () => {
      const filters = { someOtherFilter: [1, 2, 3] };
      const result = filterEntities(defaultEntities, filters);
      expect(result).toEqual(defaultEntities);
    });

    it('returns filtered entities', () => {
      const filters = { search: 'st3', groupId: [1], type: ['A'] };
      const result = filterEntities(defaultEntities, filters);
      expect(result).toEqual([{ id: 3, name: 'test3', groupId: 1, type: 'A' }]);

      const filters2 = { search: 'st3', groupId: [2], type: [] };
      const result2 = filterEntities(defaultEntities, filters2);
      expect(result2).toEqual([]);
    });
  });
});
