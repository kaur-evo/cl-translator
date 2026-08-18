/**
 * Filters entities by station admin permissions.
 * Returns only entities where the user has admin rights to ALL associated stations.
 * Global entities (with empty, null, or undefined stationIds) are always included.
 *
 * @param {Array<Object>} entities - Array of entities with stationIds property
 * @param {Object} adminStationsMap - Map of station IDs the user has admin access to
 * @returns {Array<Object>} Filtered entities
 */
const filterByStationAdminPermissions = (entities, adminStationsMap) => entities.filter((entity) => {
  // Global entities (no station association) are always visible
  if (!entity.stationIds?.length) return true;
  // Entity must be associated with at least one station the user has admin rights to
  return entity.stationIds.some((id) => adminStationsMap[id]);
});

export default filterByStationAdminPermissions;
