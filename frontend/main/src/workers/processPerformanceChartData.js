import processPerformanceChartData from '../components/organisms/shiftview/ShiftviewPerformanceWidget/processChartData.js';

addEventListener('message', (event) => {
  if (event.data) {
    const reductionResult = processPerformanceChartData(event.data);
    postMessage(reductionResult);
  }
});
