import { setActivePinia, createPinia } from 'pinia';

import {
  getEntitiesList, getEntityString, getSVLogsEventsList, getSVLogsEventString, getRequestParams,
  getSettingsUserActionsList, getSVUserActionsList,
} from './activityLogsHelpers';

import { entities, settingsUserActions, svUserActions } from '@/constants/activityLogsConstants';
import { getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';
import useFilterbarStore from '@/stores/filterbar';

vi.mock('@/constants/rollingPeriodRangeDefinitions', () => ({
  getCurrentPeriod: vi.fn(() => ['2024-02-01', '2024-02-28']),
}));

describe('activityLogsHelpers', () => {
  describe('getEntitiesList', () => {
    it('returns correct entities list if checklistsEnabled is true', () => {
      const entitiesList = getEntitiesList(true);
      expect(entitiesList).toMatchSnapshot();
    });

    it('returns correct entities list if checklistsEnabled is false', () => {
      const entitiesList = getEntitiesList(false);
      expect(entitiesList).toMatchSnapshot();
    });
  });

  describe('getEntityString', () => {
    it('returns checklist group entity string', () => {
      const entityString = getEntityString(entities.CHECKLIST_GROUP);
      expect(entityString).toBe('Checklist groups');
    });
  });

  describe('getSVLogsEventsList', () => {
    it('returns correct SV logs events list if checklistsEnabled is true', () => {
      const eventsList = getSVLogsEventsList(true);
      expect(eventsList).toMatchSnapshot();
    });

    it('returns correct SV logs events list if checklistsEnabled is false', () => {
      const eventsList = getSVLogsEventsList(false);
      expect(eventsList).toMatchSnapshot();
    });
  });

  describe('getSVLogsEventString', () => {
    it('returns empty string if event is not found', () => {
      const eventString = getSVLogsEventString('nonexistent_event');
      expect(eventString).toBe('');
    });

    it('returns Changeover for batch event', () => {
      const eventString = getSVLogsEventString(entities.BATCH);
      expect(eventString).toBe('Changeover');
    });
  });

  describe('getRequestParams', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
      useFilterbarStore().requestFilterState = { period: ['2024-01-01', '2024-01-31'] };
      vi.clearAllMocks();
    });

    it('returns correct params when period is an array', async () => {
      const requestEntities = ['A', 'B'];
      const tableOptions = { itemsPerPage: 10, page: 2 };

      const result = await getRequestParams(requestEntities, tableOptions);

      expect(result).toEqual({
        filter: {
          entities: requestEntities,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        limit: 10,
        page: 1,
      });
    });

    it('calls getCurrentPeriod and returns correct params when period is not an array', async () => {
      useFilterbarStore().requestFilterState = { period: 'lastMonth' };
      const requestEntities = ['X'];
      const tableOptions = { itemsPerPage: 5, page: 3 };

      const result = await getRequestParams(requestEntities, tableOptions);

      expect(getCurrentPeriod).toHaveBeenCalledWith('lastMonth', { weekStartsOn: 1 });
      expect(result).toEqual({
        filter: {
          entities: requestEntities,
          startDate: '2024-02-01',
          endDate: '2024-02-28',
        },
        limit: 5,
        page: 2,
      });
    });

    it('includes userActions in filter when userActions array is not empty', async () => {
      useFilterbarStore().requestFilterState = { period: ['2024-01-01', '2024-01-31'], userActions: ['SAVED', 'EDITED'] };
      const requestEntities = ['A'];
      const tableOptions = { itemsPerPage: 10, page: 1 };

      const result = await getRequestParams(requestEntities, tableOptions);

      expect(result).toEqual({
        filter: {
          entities: requestEntities,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          userActions: ['SAVED', 'EDITED'],
        },
        limit: 10,
        page: 0,
      });
    });

    it('does not include userActions in filter when userActions array is empty', async () => {
      useFilterbarStore().requestFilterState = { period: ['2024-01-01', '2024-01-31'], userActions: [] };
      const requestEntities = ['A'];
      const tableOptions = { itemsPerPage: 10, page: 1 };

      const result = await getRequestParams(requestEntities, tableOptions);

      expect(result.filter.userActions).toBeUndefined();
    });

    it('does not include userActions in filter when userActions is undefined', async () => {
      useFilterbarStore().requestFilterState = { period: ['2024-01-01', '2024-01-31'] };
      const requestEntities = ['A'];
      const tableOptions = { itemsPerPage: 10, page: 1 };

      const result = await getRequestParams(requestEntities, tableOptions);

      expect(result.filter.userActions).toBeUndefined();
    });
  });

  describe('getSettingsUserActionsList', () => {
    it('returns correct settings user actions list', () => {
      const actionsList = getSettingsUserActionsList();
      expect(actionsList).toEqual([
        { name: 'Added', id: settingsUserActions.SAVED },
        { name: 'Edited', id: settingsUserActions.EDITED },
        { name: 'Deleted', id: settingsUserActions.DELETED },
      ]);
    });
  });

  describe('getSVUserActionsList', () => {
    it('returns correct SV user actions list if checklistsEnabled is true', () => {
      const actionsList = getSVUserActionsList(true);
      expect(actionsList).toEqual([
        { name: 'Added', id: svUserActions.ADDED },
        { name: 'Edited', id: svUserActions.EDITED },
        { name: 'Deleted', id: svUserActions.DELETED },
        { name: 'First fill', id: svUserActions.FIRST_FILL, isHidden: false },
      ]);
    });

    it('returns correct SV user actions list if checklistsEnabled is false', () => {
      const actionsList = getSVUserActionsList(false);
      expect(actionsList).toEqual([
        { name: 'Added', id: svUserActions.ADDED },
        { name: 'Edited', id: svUserActions.EDITED },
        { name: 'Deleted', id: svUserActions.DELETED },
      ]);
    });
  });
});
