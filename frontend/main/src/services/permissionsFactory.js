import {
  SHIFT_VIEW, ALL_FACTORIES, DASHBOARD, REPORTS, IMPROVEMENTS, SETTINGS, SPLIT_VIEW,
} from '@/constants/routeNames';
import roleType, { ascRolesArray } from '@/constants/userRoles';


function exclude(rolesDef = []) {
  const newRoles = [];
  for (let i = 0; i < ascRolesArray.length; i += 1) {
    if (rolesDef.indexOf(ascRolesArray[i]) === -1) {
      newRoles.push(ascRolesArray[i]);
    }
  }

  return newRoles;
}

const routePermissionsMap = {
  [ALL_FACTORIES]: exclude([roleType.LINEVIEW_USER]),
  [SETTINGS]: exclude([roleType.OFFICE_USER, roleType.LINEVIEW_USER]),
  [REPORTS]: exclude([roleType.LINEVIEW_USER]),
  [DASHBOARD]: exclude([roleType.LINEVIEW_USER]),
  [IMPROVEMENTS]: exclude([roleType.LINEVIEW_USER]),
  [SHIFT_VIEW]: ascRolesArray,
  [SPLIT_VIEW]: ascRolesArray,
};

const permissionMap = {
  ...routePermissionsMap,
  editProfile: exclude([roleType.LINEVIEW_USER]),
  support: exclude([roleType.LINEVIEW_USER]),
  help: ascRolesArray,
  editGlobalGroup: [roleType.SYS_ADMIN, roleType.COMPANY_ADMIN],
  suggestFeature: exclude([roleType.LINEVIEW_USER]),
  addAPIKeys: [roleType.COMPANY_ADMIN, roleType.FACTORY_ADMIN, roleType.SYS_ADMIN],
  exportSettings: [roleType.SYS_ADMIN, roleType.COMPANY_ADMIN],
  dataImportExport: [roleType.SYS_ADMIN, roleType.COMPANY_ADMIN],
  editPastShift: [roleType.FACTORY_ADMIN, roleType.COMPANY_ADMIN, roleType.SYS_ADMIN],
  deleteShift: [roleType.FACTORY_ADMIN, roleType.COMPANY_ADMIN, roleType.SYS_ADMIN],
  shareDashboard: [roleType.SYS_ADMIN, roleType.COMPANY_ADMIN, roleType.FACTORY_ADMIN],
  productTour: exclude([roleType.LINEVIEW_USER]),
  chat: exclude([roleType.LINEVIEW_USER]),
  gridview: exclude([roleType.LINEVIEW_USER]),
  billingNotification: [roleType.SYS_ADMIN, roleType.COMPANY_ADMIN, roleType.FACTORY_ADMIN],
  deleteChecklist: [roleType.SYS_ADMIN, roleType.COMPANY_ADMIN, roleType.FACTORY_ADMIN],
  editSignal: [roleType.SYS_ADMIN, roleType.COMPANY_ADMIN, roleType.FACTORY_ADMIN],
  releasesUpdate: exclude([roleType.LINEVIEW_USER]),
  securitySettings: [roleType.SYS_ADMIN, roleType.COMPANY_ADMIN],
};

const roleAllows = (action, role) => {
  const permissionRoles = permissionMap[action];
  if (typeof (permissionRoles) === 'undefined') {
    throw new Error(`No permission named ${action} in permissions`);
  }
  return permissionMap[action].indexOf(role) !== -1;
};

const getAllowedRoutes = (role) => {
  const allowedRoutes = [];
  Object.keys(routePermissionsMap).forEach((action) => {
    if (roleAllows(action, role)) {
      allowedRoutes.push(action);
    }
  });
  return allowedRoutes;
};

const hierarchy = {
  LINEVIEW_USER: 0,
  OFFICE_USER: 1,
  FACTORY_ADMIN: 2,
  COMPANY_ADMIN: 3,
  SYS_ADMIN: 4,
};

const getHighestRole = (roles) => {
  const setOfRoles = new Set(Object.values(roles));
  if (setOfRoles.size === 1) {
    return Object.values(roles)[0];
  }
  const hierarchies = [...setOfRoles].map((role) => hierarchy[role]);
  const highestHierarchy = Math.max(...hierarchies);
  return Object.keys(hierarchy).find((key) => hierarchy[key] === highestHierarchy);
};

const getFactoryRole = (roles, factoryId) => {
  if (roles[factoryId]) {
    return roles[factoryId];
  }
  if (roles[0]) {
    return roles[0];
  }
  return roleType.LINEVIEW_USER;
};

export {
  getHighestRole, getFactoryRole, roleAllows, getAllowedRoutes, permissionMap,
};
