import { describe, it, expect } from 'vitest';

import filterVisibleChecklists from './filterVisibleChecklists';

describe('filterVisibleChecklists', () => {
  const mockTasks = [
    { checklistId: 'c1', name: 'Checklist 1' },
    { checklistId: 'c2', name: 'Checklist 2' },
    { checklistId: 'c3', name: 'Checklist 3' },
    { checklistId: 'c4', name: 'Checklist 4' },
  ];

  describe('station not in map (show all)', () => {
    it('returns all tasks when visibleChecklistIdsByStation is null', () => {
      const result = filterVisibleChecklists(mockTasks, null, '123');
      expect(result).toEqual(mockTasks);
    });

    it('returns all tasks when visibleChecklistIdsByStation is undefined', () => {
      const result = filterVisibleChecklists(mockTasks, undefined, '123');
      expect(result).toEqual(mockTasks);
    });

    it('returns all tasks when visibleChecklistIdsByStation is empty object', () => {
      const result = filterVisibleChecklists(mockTasks, {}, '123');
      expect(result).toEqual(mockTasks);
    });

    it('returns all tasks when station is not in map', () => {
      const result = filterVisibleChecklists(mockTasks, { 456: ['c1'] }, '123');
      expect(result).toEqual(mockTasks);
    });
  });

  describe('station has empty array (show all)', () => {
    it('returns all tasks when station has empty array (all selected)', () => {
      const result = filterVisibleChecklists(mockTasks, { 123: [] }, '123');
      expect(result).toEqual(mockTasks);
    });
  });

  describe('station has specific visible IDs', () => {
    it('returns only tasks with visible IDs', () => {
      const result = filterVisibleChecklists(
        mockTasks,
        { 123: ['c1', 'c3'] },
        '123',
      );
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.checklistId)).toEqual(['c1', 'c3']);
    });

    it('ignores visible IDs that do not exist in tasks', () => {
      const result = filterVisibleChecklists(
        mockTasks,
        { 123: ['c1', 'nonexistent'] },
        '123',
      );
      expect(result).toHaveLength(1);
      expect(result[0].checklistId).toBe('c1');
    });

    it('shows single visible checklist', () => {
      const result = filterVisibleChecklists(
        mockTasks,
        { 123: ['c2'] },
        '123',
      );
      expect(result).toHaveLength(1);
      expect(result[0].checklistId).toBe('c2');
    });
  });

  describe('multi-station scenarios', () => {
    it('uses correct station configuration', () => {
      const map = {
        123: ['c1', 'c2'],
        456: ['c3', 'c4'],
      };

      const result123 = filterVisibleChecklists(mockTasks, map, '123');
      const result456 = filterVisibleChecklists(mockTasks, map, '456');

      expect(result123.map((t) => t.checklistId)).toEqual(['c1', 'c2']);
      expect(result456.map((t) => t.checklistId)).toEqual(['c3', 'c4']);
    });
  });

  describe('edge cases', () => {
    it('handles empty tasks array', () => {
      const result = filterVisibleChecklists([], { 123: ['c1'] }, '123');
      expect(result).toEqual([]);
    });

    it('preserves task object properties', () => {
      const tasks = [{ checklistId: 'c1', name: 'Test', extra: { nested: true } }];
      const result = filterVisibleChecklists(tasks, { 123: ['c1'] }, '123');
      expect(result[0]).toEqual(tasks[0]);
      expect(result[0].extra.nested).toBe(true);
    });

    it('normalizes numeric station ID to string for object key lookup', () => {
      const result = filterVisibleChecklists(
        mockTasks,
        { 123: ['c1'] },
        123,
      );
      expect(result).toHaveLength(1);
      expect(result[0].checklistId).toBe('c1');
    });

    it('handles string station ID directly', () => {
      const result = filterVisibleChecklists(
        mockTasks,
        { 456: ['c2', 'c3'] },
        '456',
      );
      expect(result).toHaveLength(2);
    });
  });
});
