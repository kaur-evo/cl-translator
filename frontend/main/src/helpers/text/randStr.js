export default function randStr(prefix) {
  // eslint-disable-next-line no-magic-numbers
  return Math.random().toString(36).replace('0.', prefix || '');
}
