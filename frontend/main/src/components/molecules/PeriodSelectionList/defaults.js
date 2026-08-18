import {
  getLast4Quarters, getLastQuarter, getThisQuarter, getToday, getYesterday,
  getThisWeek, getLastWeek, getThisMonth, getLastMonth, getRolling7Days,
  getRolling30Days, getThisYear, getLastYear, getCustom, getRolling12Months,
} from '@/constants/rollingPeriodRangeDefinitions';

export default function getDefaults(weekStartsOn) {
  return [
    getToday({ weekStartsOn }),
    getYesterday({ weekStartsOn }),
    getThisWeek({ weekStartsOn }),
    getLastWeek({ weekStartsOn }),
    getRolling7Days({ weekStartsOn }),
    getThisMonth({ weekStartsOn }),
    getLastMonth({ weekStartsOn }),
    getRolling30Days({ weekStartsOn }),
    getThisQuarter({ weekStartsOn }),
    getLastQuarter({ weekStartsOn }),
    getLast4Quarters({ weekStartsOn }),
    getThisYear({ weekStartsOn }),
    getLastYear({ weekStartsOn }),
    getRolling12Months({ weekStartsOn }),
    getCustom(),
  ];
}
