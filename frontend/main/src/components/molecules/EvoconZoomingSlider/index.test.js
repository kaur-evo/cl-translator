import { shallowMount } from '@vue/test-utils';

import EvoconZoomingSlider from './index.vue';

describe('EvoconZoomingSlider', () => {
  it('renders', () => {
    const wrapper = shallowMount(EvoconZoomingSlider);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(EvoconZoomingSlider);
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that onZoomUpdate emits correct value', () => {
    const wrapper = shallowMount(EvoconZoomingSlider, {
      props: {
        zoomValue: 20,
        sliderStep: 2,
        sliderMinValue: 0,
        sliderMaxValue: 100,
      },
    });

    wrapper.vm.onZoomUpdate(1);
    expect(wrapper.emitted('update:zoom-value')[0][0]).toBe(22);

    wrapper.vm.onZoomUpdate(10);
    expect(wrapper.emitted('update:zoom-value')[1][0]).toBe(40);

    wrapper.vm.onZoomUpdate(-1);
    expect(wrapper.emitted('update:zoom-value')[2][0]).toBe(18);

    wrapper.vm.onZoomUpdate(-10);
    expect(wrapper.emitted('update:zoom-value')[3][0]).toBe(0);
  });

  test('that startChange sets interval', () => {
    vi.useFakeTimers();
    const wrapper = shallowMount(EvoconZoomingSlider, {
      props: {
        zoomValue: 10,
        sliderStep: 1,
        sliderMinValue: 0,
        sliderMaxValue: 100,
      },
    });

    wrapper.vm.startChange(1);
    expect(wrapper.vm.interval).not.toBeNull();
    wrapper.vm.stopChange();
    vi.useRealTimers();
  });

  test('that stopChange clears interval', () => {
    const wrapper = shallowMount(EvoconZoomingSlider);

    wrapper.vm.startChange(1);
    expect(wrapper.vm.interval).not.toBeNull();
    wrapper.vm.stopChange();
    expect(wrapper.vm.interval).toBeNull();
  });
});
