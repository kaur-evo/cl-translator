import iosFriendlyInnerHeight from '@/helpers/ios/IOSInnerHeight';
import { useDeviceStore } from '@/stores/index';

class ScreenListener {
  constructor(window) {
    this.window = window;
  }

  appSize = () => {
    const doc = document.documentElement;
    const innerHeight = iosFriendlyInnerHeight();
    doc.style.setProperty('--app-height', `${document.documentElement.clientHeight}`);
    const screenData = {
      width: this.window.innerWidth,
      height: innerHeight,
    };
    useDeviceStore().setScreen(screenData);
  };

  registerWindowListener() {
    this.appSize();

    this.window.addEventListener('resize', () => {
      this.appSize();
    });
  }
}
export default ScreenListener;
