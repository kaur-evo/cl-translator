import processTimeline from '../services/processFactoryViewTimeline';

addEventListener('message', (event) => {
  if (event.data && event.data.stationId && event.data.timeline) {
    const { timeline, commentsMap, stationId, timezone } = event.data;
    const processedTimeline = {
      station: stationId,
      data: processTimeline({ data: timeline, commentsMap, timezone }),
    };
    postMessage(processedTimeline);
  }
});
