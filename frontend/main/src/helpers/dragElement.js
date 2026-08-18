/* eslint-disable no-param-reassign */
const MIN_VISIBLE_PART = 40; // in px

export function dragElement(element, handle) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  function elementDrag(e) {
    e.preventDefault();
    // calculate new position:
    pos1 = pos3 - e.touches[0].clientX;
    pos2 = pos4 - e.touches[0].clientY;
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;

    // at least 40px of element has to remain to the screen
    const minLeft = MIN_VISIBLE_PART - element.clientWidth;
    const maxLeft = window.innerWidth - MIN_VISIBLE_PART;
    const newLeft = Math.min(Math.max(element.offsetLeft - pos1, minLeft), maxLeft);
    const minTop = MIN_VISIBLE_PART - element.clientHeight;
    const maxTop = window.innerHeight - MIN_VISIBLE_PART;
    const newTop = Math.min(Math.max(element.offsetTop - pos2, minTop), maxTop);

    // set new position:
    element.style.top = `${newTop}px`;
    element.style.left = `${newLeft}px`;
  }

  function dragEnd() {
    // stop moving when mouse button is released:
    document.removeEventListener('touchmove', elementDrag, { passive: false });
    document.removeEventListener('touchend', dragEnd);
  }

  function onTouchStart(e) {
    // starting position:
    pos3 = e.clientX;
    pos4 = e.clientY;

    document.addEventListener('touchmove', elementDrag, { passive: false });
    document.addEventListener('touchend', dragEnd);
  }

  handle?.addEventListener('touchstart', onTouchStart);
}
