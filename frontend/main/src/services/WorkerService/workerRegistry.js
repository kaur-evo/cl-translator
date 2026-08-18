const getBuildRegistry = () => ({
  processGroupedSelection: () => new Worker(new URL('../../workers/processGroupedSelection.js', import.meta.url), {}),
  processTimeline: () => new Worker(new URL('../../workers/processTimeline.worker.js', import.meta.url), {}),
  processTimelines: () => new Worker(new URL('../../workers/processTimelines.worker.js', import.meta.url), {}),
  processDiscreteProductPath: () => new Worker(new URL('../../workers/processDiscreteProductPath.js', import.meta.url), {}),
  processReportsDataGranularity: () => new Worker(new URL('../../workers/processReportsDataGranularity.js', import.meta.url), {}),
  processTimelineStatistics: () => new Worker(new URL('../../workers/processTimelineStatistics.worker.js', import.meta.url), {}),
  processPerformanceChartData: () => new Worker(new URL('../../workers/processPerformanceChartData.js', import.meta.url), {}),
});
const getServeRegistry = () => ({
  processGroupedSelection: () => new Worker(new URL('../../workers/processGroupedSelection.js', import.meta.url), { type: 'module' }),
  processTimeline: () => new Worker(new URL('../../workers/processTimeline.worker.js', import.meta.url), { type: 'module' }),
  processTimelines: () => new Worker(new URL('../../workers/processTimelines.worker.js', import.meta.url), { type: 'module' }),
  processDiscreteProductPath: () => new Worker(new URL('../../workers/processDiscreteProductPath.js', import.meta.url), { type: 'module' }),
  processReportsDataGranularity: () => new Worker(new URL('../../workers/processReportsDataGranularity.js', import.meta.url), { type: 'module' }),
  processTimelineStatistics: () => new Worker(new URL('../../workers/processTimelineStatistics.worker.js', import.meta.url), { type: 'module' }),
  processPerformanceChartData: () => new Worker(new URL('../../workers/processPerformanceChartData.js', import.meta.url), { type: 'module' }),
});

export default import.meta.env.VITE_VUE_APP_SYSTEM_NAME === 'SERVE' ? getServeRegistry() : getBuildRegistry();
