export default class Options {
  constructor(options = {}, defaults = {}) {
    Object.assign(this.defaults, defaults);
    Object.assign(this.options, defaults, options);
  }

  defaults = {};

  options = {};

  get(key) {
    if (this.defaults[key] === undefined) throw new Error(`Option ${key} is not defined in defaults`);
    if (this.options[key] === undefined) throw new Error(`Option ${key} is not defined`);
    return this.options[key];
  }

  set(key, value) {
    if (this.defaults[key] === undefined) throw new Error(`Option ${key} is not defined in defaults`);
    if (this.options[key] === undefined) throw new Error(`Option ${key} is not defined`);
    this.options[key] = value;
  }

  update(options = {}) {
    Object.entries(options).forEach(([key, value]) => {
      if (this.defaults[key] === undefined) throw new Error(`Option ${key} is not defined in defaults`);
      if (this.options[key] === undefined) throw new Error(`Option ${key} is not defined`);
      this.options[key] = value;
    });
    return this;
  }

  clone() {
    return new Options(this.options, this.defaults);
  }
}
