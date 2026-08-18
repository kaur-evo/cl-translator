import { getSubmissionTime } from './getSubmissionTime';

test('getSubmissionTime', () => {
  expect(getSubmissionTime({}, 'UTC')).toBe(null);
  expect(getSubmissionTime({
    dateTimeISO: '2023-04-06T12:00:00.000Z',
    submissionTimeISO: '2023-04-06T12:12:00.000Z',
  }, 'UTC')).toBe('12:12');
  expect(getSubmissionTime({
    dateTimeISO: '2023-04-06T12:00:00.000Z',
    submissionTimeISO: '2023-04-07T12:12:00.000Z',
  }, 'UTC')).toBe('12:12 - 07.04.2023');
});
