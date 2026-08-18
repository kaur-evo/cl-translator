import listToShortenedString from '@/helpers/list/listToShortenedString';

export default function setToShortenedString(setOfStrings, limit) {
  const list = Array.from(setOfStrings);
  return listToShortenedString(list, limit);
}
