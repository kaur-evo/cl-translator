import { beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { logNavigation } from './logNavigation';

import logApi from '@/api/logApi';
import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';

vi.mock('@/api/logApi');
logApi.logEvent = vi.fn();

describe('logNavigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useProfileStore().highestUserRole = 'admin';
    useDeviceStore().screen = { height: 1080, width: 1920 };
    vi.clearAllMocks();
  });
  it('does not log if navigating within the same module', () => {
    const to = { matched: [{ name: 'dashboard' }] };
    const from = { matched: [{ name: 'dashboard' }] };

    logNavigation(to, from);
    expect(logApi.logEvent).not.toHaveBeenCalled();
  });

  it('logs navigation between different modules', () => {
    const to = { matched: [{ name: 'settings' }] };
    const from = { matched: [{ name: 'dashboard' }] };

    logNavigation(to, from);
    expect(logApi.logEvent).toHaveBeenCalledWith([{
      type: 'moduleLoad',
      message: JSON.stringify({
        to: 'settings',
        from: 'dashboard',
        role: 'admin',
        screen: {
          height: 1080,
          width: 1920,
        },
        userAgent: navigator.userAgent,
      }),
    }]);
  });

  it('does not load the same navigation twice', () => {
    const to = { matched: [{ name: 'reporting' }] };
    const from = { matched: [{ name: 'dashboard' }] };

    logNavigation(to, from);
    expect(logApi.logEvent).toHaveBeenCalledTimes(1);
    logNavigation(to, from);
    expect(logApi.logEvent).toHaveBeenCalledTimes(1);
  });
});
