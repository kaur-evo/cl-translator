export function throttle(timer) {
  let queuedCallback;
  return (callback) => {
    if (!queuedCallback) {
      timer(() => {
        const cb = queuedCallback;
        queuedCallback = null;
        cb();
      });
    }
    queuedCallback = callback;
  };
}

export function getThrottleToFrame() {
  return throttle(requestAnimationFrame);
}
