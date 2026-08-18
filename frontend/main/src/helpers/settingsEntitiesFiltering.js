export const isEmptyValue = (value) => !value || !value.length;

export const isIncludedInFilter = (filter, value) => {
  if (Array.isArray(value)) return value.some((v) => filter.includes(v));
  return filter.includes(value);
};

export const matchesTerm = (keyVal, term) => (keyVal ? keyVal.toLowerCase().includes(term.toLowerCase()) : false);

export const matchesOrEmpty = (keyVal, filter, isOptional = false) => isEmptyValue(filter) || (isOptional && isEmptyValue(keyVal)) || isIncludedInFilter(filter, keyVal);

export const passesSearchFilter = (entity, search) => {
  if (!search) return true;
  const nameIncludes = matchesTerm(entity.name, search);
  const groupNameIncludes = matchesTerm(entity.groupName, search);
  const fullNameIncludes = matchesTerm(entity.fullName, search);
  const usernameIncludes = matchesTerm(entity.username, search);
  const serialNumberIncludes = matchesTerm(entity.serialNumber?.toString(), search);
  const skuIncludes = matchesTerm(entity.sku, search);
  return !!nameIncludes || !!groupNameIncludes || !!fullNameIncludes || !!usernameIncludes || !!serialNumberIncludes || !!skuIncludes;
};

export const passesFactoryFilter = (entity, factoryFilter) => isEmptyValue(factoryFilter)
  || isIncludedInFilter(factoryFilter, entity.factoryIds || entity.factoryId || entity.allowedFactories);

export const passesStationFilter = (entity, stationFilter) => matchesOrEmpty(entity.stationIds, stationFilter)
  || (!!entity.allowedStations && (entity.allowedStations[0] || Object.keys(entity.allowedStations)?.some((id) => stationFilter.includes(Number(id)))));

export const passesGroupFilter = (entity, groupFilter) => matchesOrEmpty(entity.groupId, groupFilter);

export const passesTypeFilter = (entity, typeFilter) => matchesOrEmpty(entity?.type, typeFilter);

export const passesDayFilter = (entity, dayFilter) => matchesOrEmpty(entity.daysOfWeek, dayFilter);

export const passesRoleFilter = (entity, roleFilter) => isEmptyValue(roleFilter) || (!!entity.roles && isIncludedInFilter(roleFilter, Object.values(entity.roles)));

export const passesProductFilter = (entity, productFilter) => matchesOrEmpty(entity.frequency?.productIds, productFilter, true);

export const passesStatusFilter = (entity, statusFilter, statusKey) => matchesOrEmpty(entity[statusKey], statusFilter);

export const passesCommentFilter = (entity, commentFilter) => matchesOrEmpty(entity.commentIds, commentFilter, true);

export const passesPerformanceCommentFilter = (entity, performanceCommentFilter) => matchesOrEmpty(entity.performanceCommentIds, performanceCommentFilter, true);

export const passesOperatorFilter = (entity, operatorsFilter) => matchesOrEmpty(entity.operatorIds, operatorsFilter, true);

export const passesChannelFilter = (entity, channelFilter) => isEmptyValue(channelFilter) || !!entity.output?.channels?.some((channel) => channelFilter.includes(channel.type));

export const passesPasscodeFilter = (entity, passcodeFilter) => isEmptyValue(passcodeFilter)
  || (passcodeFilter.includes(true) && !!entity.passcodeCreatedAt)
  || (passcodeFilter.includes(false) && !entity.passcodeCreatedAt);

export const passesAuthenticationFilter = (entity, authenticationFilter) => isEmptyValue(authenticationFilter)
  || (authenticationFilter.includes(true) && entity.authenticationRequired)
  || (authenticationFilter.includes(false) && !entity.authenticationRequired);

const filterValidationMap = {
  search: passesSearchFilter,
  factoryId: passesFactoryFilter,
  stationId: passesStationFilter,
  groupId: passesGroupFilter,
  type: passesTypeFilter,
  day: passesDayFilter,
  role: passesRoleFilter,
  productId: passesProductFilter,
  status: passesStatusFilter,
  commentId: passesCommentFilter,
  performanceCommentId: passesPerformanceCommentFilter,
  operatorId: passesOperatorFilter,
  channelId: passesChannelFilter,
  passcode: passesPasscodeFilter,
  authentication: passesAuthenticationFilter,
};

export const filterEntities = (entities, filterState, statusKey) => entities.filter((entity) => Object.entries(filterState).every(([filterKey, filterValue]) => {
  const filterValidationFunc = filterValidationMap[filterKey];
  if (!filterValidationFunc) return true;
  return filterValidationFunc(entity, filterValue, statusKey);
}));
