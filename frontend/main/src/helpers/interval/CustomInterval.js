export default class CustomInterval {
  constructor(cbFun, delay) {
    this.cbFun = cbFun;
    this.delay = delay;
    this.interval = null;
  }

  set() {
    this.interval = window.setTimeout(() => {
      this.cbFun();
      this.set();
    }, this.delay);
    return this;
  }

  clear() {
    window.clearTimeout(this.interval);
    this.interval = null;
    return null;
  }

  static createInterval(cbFun, delay) {
    const interval = new CustomInterval(cbFun, delay);
    interval.set();
    return interval;
  }
}
