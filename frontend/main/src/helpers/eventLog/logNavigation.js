import { isEqual } from 'lodash';

import logApi from '@/api/logApi';
import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';

const lastNavigation = { to: null, from: null };

export const logNavigation = (to, from) => {
  const toModule = to.matched[0]?.name;
  const fromModule = from.matched[0]?.name;
  if (toModule === fromModule) return;
  if (isEqual(lastNavigation, { to: toModule, from: fromModule })) return;
  lastNavigation.to = toModule;
  lastNavigation.from = fromModule;
  const profileStore = useProfileStore();
  const deviceStore = useDeviceStore();
  logApi.logEvent([{
    type: 'moduleLoad',
    message: JSON.stringify({
      to: toModule,
      from: fromModule,
      role: profileStore.highestUserRole,
      screen: {
        height: deviceStore.screen.height,
        width: deviceStore.screen.width,
      },
      userAgent: navigator.userAgent,
    }),
  }]);
};
