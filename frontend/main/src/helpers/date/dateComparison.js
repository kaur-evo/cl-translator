import { differenceInSeconds } from 'date-fns';

const isSameOrAfter = (date, comparison) => differenceInSeconds(new Date(date), new Date(comparison)) >= 0;

const isSameOrBefore = (date, comparison) => differenceInSeconds(new Date(date), new Date(comparison)) <= 0;

export { isSameOrAfter, isSameOrBefore };
