import getTimeUsageColumns from './timeUsageColumns';

it('returns expected snapshot', () => {
  expect(getTimeUsageColumns({ durFormatType: 'SECONDS' })).toMatchSnapshot();
});
