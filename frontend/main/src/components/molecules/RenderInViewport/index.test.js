import { shallowMount } from '@vue/test-utils';

import RenderInViewport from './index.vue';

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observedElements = new Set();
  }

  observe(element) {
    this.observedElements.add(element);
  }

  unobserve(element) {
    this.observedElements.delete(element);
  }

  disconnect() {
    this.observedElements.clear();
  }

  trigger(isIntersecting) {
    this.callback([{ intersectionRatio: isIntersecting ? 1 : 0 }]);
  }
}

class MockMutationObserver {
  constructor(callback) {
    this.callback = callback;
    this.observedElements = new Set();
  }

  observe(element) {
    this.observedElements.add(element);
  }

  disconnect() {
    this.observedElements.clear();
  }

  trigger() {
    this.callback([{ type: 'childList' }]);
  }
}

let mockIntersectionObserverInstance;
let mockMutationObserverInstance;

beforeEach(() => {
  window.IntersectionObserver = MockIntersectionObserver;
  window.MutationObserver = MockMutationObserver;

  // eslint-disable-next-line prefer-arrow-callback
  vi.spyOn(window, 'IntersectionObserver').mockImplementation(function mockIntersectionObserver(callback) {
    mockIntersectionObserverInstance = new MockIntersectionObserver(callback);
    return mockIntersectionObserverInstance;
  });

  // eslint-disable-next-line prefer-arrow-callback
  vi.spyOn(window, 'MutationObserver').mockImplementation(function mockMutationObserver(callback) {
    mockMutationObserverInstance = new MockMutationObserver(callback);
    return mockMutationObserverInstance;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('snapshot', () => {
  it('should match the snapshot', () => {
    const wrapper = shallowMount(RenderInViewport);
    expect(wrapper.element).toMatchSnapshot();
  });
});

describe('RenderInViewport', () => {
  it('should set isInView to true when the element intersects', async () => {
    const wrapper = shallowMount(RenderInViewport);

    expect(wrapper.vm.isInView).toBe(false);

    mockIntersectionObserverInstance.trigger(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isInView).toBe(true);
    expect(wrapper.find('div').isVisible()).toBe(true);
  });

  it('should set isInView to false when the element leaves the viewport', async () => {
    const wrapper = shallowMount(RenderInViewport);

    mockIntersectionObserverInstance.trigger(true);
    await wrapper.vm.$nextTick();

    mockIntersectionObserverInstance.trigger(false);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isInView).toBe(false);
  });
});

describe('RenderInViewport with dragParent', () => {
  it('should set up a MutationObserver if dragParent is provided', () => {
    const dragParent = document.createElement('div');
    shallowMount(RenderInViewport, { props: { dragParent } });

    expect(window.IntersectionObserver).toHaveBeenCalled();
    expect(window.MutationObserver).toHaveBeenCalled();

    expect(mockMutationObserverInstance.observedElements.has(dragParent)).toBe(true);
  });

  it('should re-observe the element when a childList mutation occurs', async () => {
    const dragParent = document.createElement('div');
    const wrapper = shallowMount(RenderInViewport, { props: { dragParent } });

    const observeSpy = vi.spyOn(mockIntersectionObserverInstance, 'observe');
    const unobserveSpy = vi.spyOn(mockIntersectionObserverInstance, 'unobserve');

    mockMutationObserverInstance.trigger();
    await wrapper.vm.$nextTick();

    expect(unobserveSpy).toHaveBeenCalledTimes(1);
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });
});

describe('RenderInViewport cleanup', () => {
  it('should disconnect both observers on unmount', () => {
    const dragParent = document.createElement('div');
    const wrapper = shallowMount(RenderInViewport, { props: { dragParent } });

    const intersectionDisconnectSpy = vi.spyOn(mockIntersectionObserverInstance, 'disconnect');
    const mutationDisconnectSpy = vi.spyOn(mockMutationObserverInstance, 'disconnect');

    wrapper.unmount();

    expect(intersectionDisconnectSpy).toHaveBeenCalledTimes(1);
    expect(mutationDisconnectSpy).toHaveBeenCalledTimes(1);
  });
});
