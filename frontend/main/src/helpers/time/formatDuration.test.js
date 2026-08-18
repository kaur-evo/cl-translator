import formatDuration from './formatDuration';

import { durationFormats } from '@/constants/durationFormat';

const seconds = 1234567890;
describe('formatDuration', () => {
  Object.values(durationFormats).forEach((durFormat) => {
    test(`if formats seconds in expected manner for format type: ${durFormat}`, () => {
      const result = formatDuration(seconds, durFormat);
      expect(result).toMatchSnapshot();
    });
  });
});
