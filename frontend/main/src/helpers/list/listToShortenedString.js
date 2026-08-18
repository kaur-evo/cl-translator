import i18n from '@/services/i18n';

export default function listToShortenedString(listOfStrings, displayedCount = 1) {
  const displayedItems = listOfStrings.slice(0, displayedCount).join(', ');
  const hiddenItemsCount = listOfStrings.length - displayedCount;
  if (hiddenItemsCount > 0) {
    return `${displayedItems} + ${hiddenItemsCount} ${i18n.global.t('more')}`;
  }
  return displayedItems;
}
