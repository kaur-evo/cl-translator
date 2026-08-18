const allowedEventTypes = new Set(['mousemove', 'touchmove']);
export default function isMoveEvent(event) {
  return allowedEventTypes.has(event?.sourceEvent?.type);
}
