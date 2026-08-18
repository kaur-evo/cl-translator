import { getGroupedItems } from './getGroupedItems';
addEventListener('message', (e) => {
  postMessage(getGroupedItems(e.data));
});
