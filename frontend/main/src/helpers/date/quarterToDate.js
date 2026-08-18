import { isValid } from 'date-fns';

export default (quarterString) => {
  try {
    const year = quarterString.substring(0, 4);
    const quarter = quarterString.substring(4, 5);
    const date = new Date(year, (quarter * 3) - 3, 1);
    if (isValid(date)) {
      return date;
    }
    throw new Error(`unable to parse invalid quarter string: ${quarterString}`);
  } catch {
    throw new Error(`unable to parse invalid quarter string: ${quarterString}`);
  }
};
