import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref, nextTick } from 'vue';

import useFittedFontSize from './useFittedFontSize';

import { applyFittedFontSize } from '@/helpers/text/applyFittedFontSize';

vi.mock('@/helpers/text/applyFittedFontSize', () => ({
  applyFittedFontSize: vi.fn(),
}));

const createMockElement = (parentElement = document.createElement('div')) => {
  const el = document.createElement('span');
  if (parentElement) parentElement.appendChild(el);
  return el;
};

let resizeObserverInstances;
let mutationObserverInstances;
const originalResizeObserver = globalThis.ResizeObserver;
const originalMutationObserver = globalThis.MutationObserver;

beforeEach(() => {
  vi.clearAllMocks();
  resizeObserverInstances = [];
  mutationObserverInstances = [];

  globalThis.ResizeObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.observedElements = [];
      this.disconnect = vi.fn();
      this.observe = vi.fn((el) => {
        this.observedElements.push(el);
      });
      resizeObserverInstances.push(this);
    }
  };

  globalThis.MutationObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.observedElements = [];
      this.disconnect = vi.fn();
      this.observe = vi.fn((el) => {
        this.observedElements.push(el);
      });
      mutationObserverInstances.push(this);
    }
  };
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
  globalThis.MutationObserver = originalMutationObserver;
});

const mountComposable = (minRef, maxRef) => {
  let composableResult;
  const TestComponent = defineComponent({
    setup() {
      composableResult = useFittedFontSize(minRef, maxRef);
      return {};
    },
    template: '<div></div>',
  });
  const wrapper = shallowMount(TestComponent);
  return { wrapper, composableResult };
};

describe('useFittedFontSize', () => {
  it('returns a scaledTextEl ref', () => {
    const { composableResult } = mountComposable(ref(14), ref(48));
    expect(composableResult.scaledTextEl).toBeDefined();
  });

  it('applies fitted font size when element is assigned and has a parent', async () => {
    const min = ref(14);
    const max = ref(48);
    const { composableResult } = mountComposable(min, max);
    const el = createMockElement();

    composableResult.scaledTextEl.value = el;
    await nextTick();
    await flushPromises();

    expect(applyFittedFontSize).toHaveBeenCalledWith(el, 14, 48);
  });

  it('skips fitting when element has no parent', async () => {
    const { composableResult } = mountComposable(ref(14), ref(48));
    const el = document.createElement('span'); // detached element, no parentElement

    composableResult.scaledTextEl.value = el;
    await nextTick();
    await flushPromises();

    expect(applyFittedFontSize).not.toHaveBeenCalled();
  });

  it('observes parent element for resize and element for content mutations', async () => {
    const { composableResult } = mountComposable(ref(14), ref(48));
    const parent = document.createElement('div');
    const el = createMockElement(parent);

    composableResult.scaledTextEl.value = el;
    await nextTick();
    await flushPromises();

    expect(resizeObserverInstances).toHaveLength(1);
    expect(resizeObserverInstances[0].observe).toHaveBeenCalledWith(parent);
    expect(mutationObserverInstances).toHaveLength(1);
    expect(mutationObserverInstances[0].observe).toHaveBeenCalledWith(
      el,
      { characterData: true, childList: true, subtree: true },
    );
  });

  it('re-fits text when an observer callback fires', async () => {
    const { composableResult } = mountComposable(ref(14), ref(48));
    const el = createMockElement();

    composableResult.scaledTextEl.value = el;
    await nextTick();
    await flushPromises();
    applyFittedFontSize.mockClear();

    resizeObserverInstances[0].callback();
    expect(applyFittedFontSize).toHaveBeenCalledWith(el, 14, 48);
  });

  it('disconnects both observers on unmount', async () => {
    const { wrapper, composableResult } = mountComposable(ref(14), ref(48));
    const el = createMockElement();

    composableResult.scaledTextEl.value = el;
    await nextTick();
    await flushPromises();

    const resizeObs = resizeObserverInstances[0];
    const mutationObs = mutationObserverInstances[0];

    wrapper.unmount();

    expect(resizeObs.disconnect).toHaveBeenCalled();
    expect(mutationObs.disconnect).toHaveBeenCalled();
  });

  it('re-fits text when min or max bounds change', async () => {
    const min = ref(14);
    const max = ref(48);
    const { composableResult } = mountComposable(min, max);
    const el = createMockElement();

    composableResult.scaledTextEl.value = el;
    await nextTick();
    await flushPromises();
    applyFittedFontSize.mockClear();

    min.value = 10;
    await nextTick();
    expect(applyFittedFontSize).toHaveBeenCalledWith(el, 10, 48);

    applyFittedFontSize.mockClear();
    max.value = 96;
    await nextTick();
    expect(applyFittedFontSize).toHaveBeenCalledWith(el, 10, 96);
  });

  it('reconnects observers when element ref changes', async () => {
    const { composableResult } = mountComposable(ref(14), ref(48));
    const el1 = createMockElement();

    composableResult.scaledTextEl.value = el1;
    await nextTick();
    await flushPromises();

    const oldResizeObs = resizeObserverInstances[0];
    const oldMutationObs = mutationObserverInstances[0];

    const el2 = createMockElement();
    composableResult.scaledTextEl.value = el2;
    await nextTick();
    await flushPromises();

    expect(oldResizeObs.disconnect).toHaveBeenCalled();
    expect(oldMutationObs.disconnect).toHaveBeenCalled();
    expect(resizeObserverInstances).toHaveLength(2);
    expect(mutationObserverInstances).toHaveLength(2);
  });
});
