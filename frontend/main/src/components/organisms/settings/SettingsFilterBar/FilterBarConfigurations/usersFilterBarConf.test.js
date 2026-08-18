import { createFilterConfiguration } from './usersFilterBarConf';

import {
  OFFICE_USER, LINEVIEW_USER, FACTORY_ADMIN, COMPANY_ADMIN,
} from '@/constants/userRoles';

test('usersFilterBarConf', () => {
  const roles = [
    { id: COMPANY_ADMIN, name: 'Company Admin' },
    { id: FACTORY_ADMIN, name: 'Factory Admin' },
    { id: LINEVIEW_USER, name: 'Lineview User' },
    { id: OFFICE_USER, name: 'Office User' },
  ];
  expect(createFilterConfiguration(roles)).toMatchSnapshot();
});
