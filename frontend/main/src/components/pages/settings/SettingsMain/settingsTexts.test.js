import { expect } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';

import SettingIntroTexts from './settingsTexts';

import useFeatureStore from '@/stores/feature';
import useConfigurationStore from '@/stores/configuration';

const featureFlagNames = ['apiAccess', 'activityLogs', 'alerts', 'checklists', 'tags', 'qualityYield', 'securitySettings'];

const activatePinia = ({ featuresEnabled = false, adminChecklistStations = [], securitySettingsEnabled = featuresEnabled } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  setActivePinia(pinia);
  const featureStore = useFeatureStore();
  featureFlagNames.forEach((key) => {
    featureStore[key] = featuresEnabled;
  });
  featureStore.securitySettings = securitySettingsEnabled;
  useConfigurationStore().adminChecklistStations = adminChecklistStations;
  return pinia;
};

describe('SettingIntroTexts', () => {
  const mockUser = { fullName: 'John Doe' };

  it('should return only profile as visible when settings are not allowed', () => {
    activatePinia();
    const result = SettingIntroTexts(mockUser, false, false).flat().filter((module) => module.visible);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('profile');
  });

  it('should return all modules as visible when settings are allowed and all features are enabled', () => {
    activatePinia({ featuresEnabled: true, adminChecklistStations: [1, 2, 3] });
    const result = SettingIntroTexts(mockUser, true, true).flat().filter((module) => module.visible);
    expect(result).toHaveLength(18);
    expect(result[0].id).toBe('profile');
    expect(result[1].id).toBe('users');
    expect(result[2].id).toBe('operators');
    expect(result[3].id).toBe('comments');
    expect(result[4].id).toBe('speedlossreasons');
    expect(result[5].id).toBe('scrapreasons');
    expect(result[6].id).toBe('stations');
    expect(result[7].id).toBe('positions');
    expect(result[8].id).toBe('products');
    expect(result[9].id).toBe('shifts');
    expect(result[10].id).toBe('alerts');
    expect(result[11].id).toBe('checklists');
    expect(result[12].id).toBe('devices');
    expect(result[13].id).toBe('tags');
    expect(result[14].id).toBe('quality');
    expect(result[15].id).toBe('security');
    expect(result[16].id).toBe('apikeys');
    expect(result[17].id).toBe('activitylogs');
  });

  it('should return only basic modules when settings are allowed but no features are enabled', () => {
    activatePinia();
    const result = SettingIntroTexts(mockUser, true, false).flat().filter((module) => module.visible);
    expect(result).toHaveLength(11);
    expect(result[0].id).toBe('profile');
    expect(result[1].id).toBe('users');
    expect(result[2].id).toBe('operators');
    expect(result[3].id).toBe('comments');
    expect(result[4].id).toBe('speedlossreasons');
    expect(result[5].id).toBe('scrapreasons');
    expect(result[6].id).toBe('stations');
    expect(result[7].id).toBe('positions');
    expect(result[8].id).toBe('products');
    expect(result[9].id).toBe('shifts');
    expect(result[10].id).toBe('devices');
  });
});

describe('security settings card', () => {
  it('is hidden if settings are not allowed', () => {
    activatePinia({ securitySettingsEnabled: true });
    const texts = SettingIntroTexts({ fullName: 'Test User' }, false, false);
    expect(texts.flat().find((text) => text.id === 'security').visible).toBe(false);
  });

  it('is hidden if settings are allowed but securitySettings not allowed', () => {
    activatePinia({ securitySettingsEnabled: true });
    const texts = SettingIntroTexts({ fullName: 'Test User' }, true, false);
    expect(texts.flat().find((text) => text.id === 'security').visible).toBe(false);
  });

  it('is hidden if settings and securitySettings are allowed but feature flag is disabled', () => {
    activatePinia({ securitySettingsEnabled: false });
    const texts = SettingIntroTexts({ fullName: 'Test User' }, true, true);
    expect(texts.flat().find((text) => text.id === 'security').visible).toBe(false);
  });

  it('is visible if settings and securitySettings are allowed and feature flag is enabled', () => {
    activatePinia({ securitySettingsEnabled: true });
    const texts = SettingIntroTexts({ fullName: 'Test User' }, true, true);
    expect(texts.flat().find((text) => text.id === 'security').visible).toBe(true);
  });
});
