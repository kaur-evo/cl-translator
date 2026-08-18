import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { DateTime } from 'luxon';

import { luxonApplyLocale } from './luxonHelpers';

import useProfileStore from '@/stores/profile';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('luxonApplyLocale', () => {
  it('should set locale to "en-GB" when firstDayOfWeek is 1', () => {
    useProfileStore().currentUser = { firstDayOfWeek: 1 };

    const mockDate = DateTime.now();
    const result = luxonApplyLocale(mockDate);
    expect(result.locale).toBe('en-GB');
  });

  it('should set locale to "en-US" when firstDayOfWeek is not 1', () => {
    useProfileStore().currentUser = { firstDayOfWeek: 0 }; // 0 = Sunday (non-Monday first day)

    const mockDate = DateTime.now();
    const result = luxonApplyLocale(mockDate);
    expect(result.locale).toBe('en-US');
  });

  it('should not modify the original date object', () => {
    useProfileStore().currentUser = { firstDayOfWeek: 1 };

    const mockDate = DateTime.now();
    const result = luxonApplyLocale(mockDate);
    expect(result).not.toBe(mockDate);
  });

  it('should set locale correctly and check startOf("week") weekday when firstDayOfWeek is 1', () => {
    useProfileStore().currentUser = { firstDayOfWeek: 1 };
    const mockDate = DateTime.now();
    const result = luxonApplyLocale(mockDate).startOf('week', { useLocaleWeeks: true });
    expect(result.locale).toBe('en-GB');
    expect(result.weekday).toBe(1); // Monday
  });

  it('should set locale correctly and check startOf("week") weekday when firstDayOfWeek is not 1', () => {
    useProfileStore().currentUser = { firstDayOfWeek: 0 }; // 0 = Sunday (non-Monday first day)

    const mockDate = DateTime.now();
    const result = luxonApplyLocale(mockDate).startOf('week', { useLocaleWeeks: true });
    expect(result.locale).toBe('en-US');
    expect(result.weekday).toBe(7); // Sunday
  });

  it('should set locale correctly and check endOf("week") weekday when firstDayOfWeek is 1', () => {
    useProfileStore().currentUser = { firstDayOfWeek: 1 };
    const mockDate = DateTime.now();
    const result = luxonApplyLocale(mockDate).endOf('week', { useLocaleWeeks: true });
    expect(result.locale).toBe('en-GB');
    expect(result.weekday).toBe(7); // Sunday
  });

  it('should set locale correctly and check endOf("week") weekday when firstDayOfWeek is not 1', () => {
    useProfileStore().currentUser = { firstDayOfWeek: 7 }; // 7 = Sunday (non-Monday first day)

    const mockDate = DateTime.now();
    const result = luxonApplyLocale(mockDate).endOf('week', { useLocaleWeeks: true });
    expect(result.locale).toBe('en-US');
    expect(result.weekday).toBe(6); // Saturday
  });
});
