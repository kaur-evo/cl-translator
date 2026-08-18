import processTimeline from '../services/processFactoryViewTimeline';

function processTimelinesParallel({ timelinesMap, commentsMap, timezone }) {
  const stationIds = Object.keys(timelinesMap);
  const modifyTimeline = (modifiedTimelines, stationId) => {
    const timelinesCopy = { ...modifiedTimelines };
    timelinesCopy[stationId] = processTimeline({ data: timelinesMap[stationId], commentsMap, timezone });
    return timelinesCopy;
  };
  return stationIds.reduce(modifyTimeline, {});
}

addEventListener('message', (event) => {
  postMessage(processTimelinesParallel(event.data));
});
