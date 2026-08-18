import handleSlices from './DiscreteProductPath';

addEventListener('message', (event) => {
  if (event.data) {
    const { slices, shiftHours, timezone } = event.data;
    postMessage(handleSlices({ slices, shiftHours, timezone }));
  }
});
