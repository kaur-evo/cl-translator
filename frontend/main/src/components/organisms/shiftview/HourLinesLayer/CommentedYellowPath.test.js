import { scaleBand } from 'd3';

import CommentedYellowPath from './CommentedYellowPath';

describe('CommentedYellowPath', () => {
  const y = scaleBand()
    .paddingOuter(0.1)
    .paddingInner(0.2)
    .range([0, 1000])
    .domain(['2022-02-14T12:00:00.000Z', '2022-02-14T13:00:00.000Z', '2022-02-14T14:00:00.000Z', '2022-02-14T15:00:00.000Z', '2022-02-14T16:00:00.000Z']);

  test('with no yellows', () => {
    const yellowPath = new CommentedYellowPath(y, [], []);
    expect(yellowPath.getPath()).toBe('');
  });

  test('with yellow slices', () => {
    const yellowSlices = [{
      parent: { sliceStartTmISO: '2022-02-14T13:20:00.000Z' }, hourStart: '2022-02-14T13:00:00.000Z', startSecond: 22 * 60, endSecond: 23 * 60,
    }];
    const timeline = [{ startTimeISO: '2022-02-14T13:20:00.000Z', endTimeISO: '2022-02-14T13:23:00.000Z' }];
    const yellowPath = new CommentedYellowPath(y, yellowSlices, timeline);
    expect(yellowPath.getPath()).toBe('M 1320, 300 H 1380 ');
  });
});
