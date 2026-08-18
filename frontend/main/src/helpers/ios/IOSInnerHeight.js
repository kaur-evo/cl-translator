/* eslint-disable no-magic-numbers */
import { isIOS } from './DetectIOSTouch';

export default () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 0;
  }
  if (!isIOS()) {
    return window.innerHeight;
  }

  const axis = Math.abs(window.orientation);
  const dims = { w: 0, h: 0 };

  const createRuler = () => {
    let ruler = document.createElement('div');

    ruler.style.position = 'fixed';
    ruler.style.height = '100vh';
    ruler.style.width = 0;
    ruler.style.top = 0;

    document.documentElement.appendChild(ruler);

    dims.w = axis === 90 ? ruler.offsetHeight : window.innerWidth;
    dims.h = axis === 90 ? window.innerWidth : ruler.offsetHeight;

    try {
      document.documentElement.removeChild(ruler);
      ruler = null;
    } catch {
      ruler.style.display = 'none';
    }
  };

  createRuler();

  if (Math.abs(window.orientation) !== 90) {
    return dims.h;
  }

  return dims.w;
};
