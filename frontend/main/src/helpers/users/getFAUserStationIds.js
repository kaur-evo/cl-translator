import { FACTORY_ADMIN } from '@/constants/userRoles';

export default function getFAUserStationIds(roles, factoriesMap) {
  const allowedFactoryIds = Object.entries(roles).filter(([, role]) => role === FACTORY_ADMIN).map(([id]) => Number(id));
  return allowedFactoryIds.reduce((acc, factoryId) => {
    const factory = factoriesMap[factoryId];
    if (factory) acc.push(...factory.stations.map((station) => station.id));
    return acc;
  }, []);
}
