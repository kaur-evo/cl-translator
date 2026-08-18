export default class BrowserText {
  constructor() {
    let canvas = document.getElementById('measure-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('id', 'measure-canvas');
    }
    this.context = canvas.getContext('2d');
  }

  measureText(text, fontSize, fontFace) {
    this.context.font = `${fontSize}px ${fontFace}`;
    return this.context.measureText(text);
  }
}
