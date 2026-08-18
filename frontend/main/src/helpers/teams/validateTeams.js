import { DateTime } from 'luxon';

import Slice from './Slice';
import handleTeams from './handleTeams';

function validateTeams(teams, timezone) {
  const remappedTeams = teams.map((elem) => new Slice(
    elem.operatorIds,
    DateTime.fromISO(elem.startTimeISO, { zone: timezone }).toUnixInteger(),
    DateTime.fromISO(elem.endTimeISO, { zone: timezone }).toUnixInteger(),
  ));
  const resultArray = handleTeams(remappedTeams);
  const modifiedArray = [];
  resultArray.forEach((r) => {
    modifiedArray.push({
      operatorIds: r.ids,
      startTimeISO: DateTime.fromSeconds(r.start, { zone: timezone }).toISO(),
      endTimeISO: DateTime.fromSeconds(r.end, { zone: timezone }).toISO(),
    });
  });
  return modifiedArray;
}

export default validateTeams;
