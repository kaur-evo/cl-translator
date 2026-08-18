export default function listToCommaSeparatedString(items) {
  return items?.join(', ') || '';
}
