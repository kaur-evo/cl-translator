import { parseISO } from 'date-fns';
import { isString } from 'lodash';

export default function parseDateStr(val) {
  const validDateLength = 'YYYY-MM-DD'.length;
  if (isString(val) && val.length === validDateLength) {
    return parseISO(`${val}T00:00:00`);
  }
  throw new Error(`unable to parse invalid date string: ${val}`);
}
