import processReportsDataGranularity from '../stores/reportsConfig/processDataGranularity';

addEventListener('message', (event) => {
  if (event.data && event.data.args) {
    const reductionResult = processReportsDataGranularity(...event.data.args);
    postMessage(reductionResult);
  }
});
