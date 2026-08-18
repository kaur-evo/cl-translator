import { joinShiftOverlapMessage } from './joinShiftOverlapMessage';

test('joinShiftOverlapMessage', () => {
  const stationsMap = {
    1: { name: 'Station 1' },
    2: { name: 'Station 2' },
  };
  const overlaps = [
    { stationId: 1, shiftName: 'Shift 1' },
    { stationId: 2, shiftName: 'Shift 2' },
    { stationId: 1, shiftName: 'Shift 3' },
  ];

  expect(joinShiftOverlapMessage(stationsMap, overlaps)).toBe('Shift 1 (Station 1), Shift 2 (Station 2), Shift 3 (Station 1)');
});
