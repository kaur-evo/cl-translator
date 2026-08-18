export default function getDisplayName(name) {
  const startingIndex = name.indexOf(')') + 1;
  const endingIndex = name.indexOf('[') > 0 ? name.indexOf('[') : name.length;
  return name.substring(startingIndex, endingIndex);
}
