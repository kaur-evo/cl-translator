import { calculateStatistics } from '../helpers/incremental/statisticsCalculator';

addEventListener('message', (event) => {
  if (event.data && event.data.timezone && event.data.timeline && event.data.shift) {
    const { timeline, timezone, shift } = event.data;
    postMessage(calculateStatistics(timeline, timezone, shift));
  }
});
