/**
 * Sets the font size on an element so that its text content fits within
 * the available width. Uses the browser's own layout engine for measurement
 * by temporarily applying maxFontSize and comparing scrollWidth vs clientWidth.
 *
 * Requires the element to have `white-space: nowrap` and `overflow: hidden`.
 *
 * @param {HTMLElement} el - The DOM element containing the text.
 * @param {number} minFontSize - Minimum font size in pixels.
 * @param {number} maxFontSize - Maximum font size in pixels.
 */
export const applyFittedFontSize = (el, minFontSize, maxFontSize) => {
  if (!el || minFontSize === null || maxFontSize === null) return;
  const { style } = el;
  style.fontSize = `${maxFontSize}px`;
  style.lineHeight = '1';
  const { clientWidth, scrollWidth } = el;
  if (scrollWidth <= clientWidth) return;
  let fitted = Math.floor(maxFontSize * (clientWidth / scrollWidth));
  fitted = Math.max(minFontSize, fitted);
  style.fontSize = `${fitted}px`;
};
