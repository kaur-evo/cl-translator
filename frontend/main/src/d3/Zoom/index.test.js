import ZoomModule from './index';

describe('ZoomModule', () => {
  let instance;
  beforeEach(() => {
    const Zoom = ZoomModule(Object);
    instance = new Zoom();
    instance.zoomOptions.minScaleFactor = 2;
    instance.zoomOptions.maxScaleFactor = 6;
  });

  test('sliderToScale', () => {
    expect(instance.sliderToScale(0)).toBe(2);
    expect(instance.sliderToScale(25)).toBe(3);
    expect(instance.sliderToScale(50)).toBe(4);
    expect(instance.sliderToScale(75)).toBe(5);
    expect(instance.sliderToScale(100)).toBe(6);
  });

  test('scaleToSlider', () => {
    expect(instance.scaleToSlider(2)).toBe(0);
    expect(instance.scaleToSlider(3)).toBe(25);
    expect(instance.scaleToSlider(4)).toBe(50);
    expect(instance.scaleToSlider(5)).toBe(75);
    expect(instance.scaleToSlider(6)).toBe(100);
  });

  test('scaleToSlider with equal min and max', () => {
    instance.zoomOptions.minScaleFactor = 5;
    instance.zoomOptions.maxScaleFactor = 5;
    expect(instance.scaleToSlider(5)).toBe(0);
  });
});
