import {
  ref, onUnmounted, toValue, watch,
} from 'vue';

import { applyFittedFontSize } from '@/helpers/text/applyFittedFontSize';

/**
 * Auto-scales an element's font size to fit within its parent container.
 * Reacts to parent resize, text content changes, and min/max bound changes.
 *
 * The ref'd element must have `white-space: nowrap`, `max-width: 100%`,
 * and `overflow: hidden` for correct measurement.
 *
 * @param {import('vue').MaybeRefOrGetter<number|null>} min - Minimum font size in px
 * @param {import('vue').MaybeRefOrGetter<number|null>} max - Maximum font size in px
 * @returns {{ scaledTextEl: import('vue').Ref<HTMLElement|undefined> }}
 */
const useFittedFontSize = (min, max) => {
  const scaledTextEl = ref();
  let resizeObserver = null;
  let mutationObserver = null;

  const fitText = () => {
    if (!scaledTextEl.value) return;
    applyFittedFontSize(scaledTextEl.value, toValue(min), toValue(max));
  };

  const setupObservers = () => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();

    if (!scaledTextEl.value?.parentElement) return;

    resizeObserver = new ResizeObserver(fitText);
    resizeObserver.observe(scaledTextEl.value.parentElement);

    mutationObserver = new MutationObserver(fitText);
    mutationObserver.observe(scaledTextEl.value, { characterData: true, childList: true, subtree: true });

    fitText();
  };

  onUnmounted(() => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
  });

  watch(scaledTextEl, setupObservers, { flush: 'post' });
  watch([() => toValue(min), () => toValue(max)], fitText);

  return { scaledTextEl };
};

export default useFittedFontSize;
