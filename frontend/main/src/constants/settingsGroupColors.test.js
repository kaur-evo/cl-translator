import { getUserSelectableColors, getUserSelectableColorName } from './userSelectableColors';

import i18n from '@/services/i18n';

describe('settingsGroupColors', () => {
  describe('getUserSelectableColors', () => {
    it('returns an array of group colors with hex and name properties', () => {
      const colors = getUserSelectableColors();
      expect(colors).toHaveLength(14);
      expect(colors[0]).toHaveProperty('hex');
      expect(colors[0]).toHaveProperty('name');
    });
  });

  describe('getGroupColorName', () => {
    it('returns empty string if color does not exist in constants', () => {
      expect(getUserSelectableColorName('nonexistentColor')).toBe('');
    });

    it('returns color name if the color exists in constants', () => {
      expect(getUserSelectableColorName('#FA8072')).toBe(i18n.global.t('Coral'));
    });
  });
});
