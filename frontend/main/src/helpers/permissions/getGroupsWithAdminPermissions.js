const getGroupsWithAdminPermissions = (groups, roles) => {
  if (0 in roles) return groups;
  return groups.filter((group) => {
    if ('local' in group && !group.local) return true;
    if ('factoryId' in group) return roles[group.factoryId] === 'FACTORY_ADMIN';
    return group.factoryIds.some((id) => roles[id] === 'FACTORY_ADMIN');
  });
};

export default getGroupsWithAdminPermissions;
