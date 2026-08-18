import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import KeyListener from './keyListener';

import editScrapDialogConfig from '@/constants/shiftviewDialogConfigs/editScrapDialogConfig';
import useGenericDialogStore from '@/stores/genericDialog';
import useShiftviewTimelineStore from '@/stores/shiftviewTimeline';
import useShiftStore from '@/stores/shift';

const setupPinia = ({ timeline = [{ qty: 2 }], statistics = { shiftTotal: { quantity: 0 }, delaysCount: 0 } } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  setActivePinia(pinia);
  useShiftviewTimelineStore().timeline = timeline;
  useShiftStore().statistics = statistics;
  const dialogStore = useGenericDialogStore();
  dialogStore.isDialogOpened = false;
  dialogStore.isOpen = false;
  return { dialogStore };
};

describe('KeyListener', () => {
  const applyBarCodeComment = vi.fn();
  const applyBarCodeSignalQty = vi.fn();
  const postClientMetrics = vi.fn();
  const applyBarCodeChangeover = vi.fn();
  const applyBarCodeScrap = vi.fn();
  const applyBarCodeScrapReason = vi.fn();
  let keyListener;

  afterEach(() => {
    vi.clearAllMocks();
    keyListener.removeEventListener();
  });

  test('that constructor creates a correct instance', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    expect(keyListener.applyBarCodeComment).toBe(applyBarCodeComment);
    expect(keyListener.applyBarCodeSignalQty).toBe(applyBarCodeSignalQty);
    expect(keyListener.postClientMetrics).toBe(postClientMetrics);
    expect(keyListener.applyBarCodeChangeover).toBe(applyBarCodeChangeover);
    expect(keyListener.applyBarCodeScrap).toBe(applyBarCodeScrap);
    expect(keyListener.applyBarCodeScrapReason).toBe(applyBarCodeScrapReason);
    expect(keyListener.listener).toBe(null);
    expect(keyListener.buffer).toBe('');
  });

  test('that registerKeyListener adds a keyup listener', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    expect(keyListener.listener).toBe(null);
    const spy = vi.spyOn(document, 'addEventListener');
    keyListener.registerKeyListener();
    expect(spy).toBeCalledWith('keyup', keyListener.listener);
    expect(keyListener.listener).not.toBe(null);
  });

  test('that removeEventListener removes the added listener', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    expect(keyListener.listener).toBe(null);
    keyListener.registerKeyListener();
    expect(keyListener.listener).not.toBe(null);
    const spy = vi.spyOn(document, 'removeEventListener');
    keyListener.removeEventListener();
    expect(spy).toBeCalledTimes(1);
    expect(keyListener.listener).toBe(null);
  });

  test('that onKeyUp adds input to buffer', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'p' }));
    expect(keyListener.buffer).toBe('p');
  });

  test('that checkBuffer dispatches openDialog when buffer is "pp"', () => {
    const { dialogStore } = setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.buffer = 'pp';
    keyListener.checkBuffer();
    expect(dialogStore.openDialog).toBeCalledTimes(1);
  });
  test('that onKeyUp doesnt dispatch openDialog when input is "ss" and shiftQuantity is 0', () => {
    const { dialogStore } = setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.buffer = 'ss';
    keyListener.checkBuffer();
    expect(dialogStore.openDialog).toBeCalledTimes(0);
  });

  test('that checkBuffer dispatches openDialog when input is "ss" and shiftQuantity is more than 0', () => {
    const { dialogStore } = setupPinia({
      timeline: [{ type: 'PRODUCT' }],
      statistics: { shiftTotal: { quantity: 1 } },
    });
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.buffer = 'ss';
    keyListener.checkBuffer();
    expect(dialogStore.openDialog).toBeCalledTimes(1);
  });

  test('that that checkBuffer dispatches openDialog when input is "ss" with correct input', () => {
    const { dialogStore } = setupPinia({
      timeline: [{ type: 'PRODUCT' }],
      statistics: { shiftTotal: { quantity: 1 } },
    });
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.buffer = 'ss';
    keyListener.checkBuffer();
    expect(dialogStore.openDialog).toBeCalledWith(editScrapDialogConfig);
  });

  test('that checkBuffer doenst dispatch openDialog when input is "cc" and there is no uncommented stoppages', () => {
    const { dialogStore } = setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.buffer = 'cc';
    keyListener.checkBuffer();
    expect(dialogStore.openDialog).toBeCalledTimes(0);
  });

  test('that checkBuffer dispatches openDialog with commenting dialog conf when input is "cc" and there is at least one delay', () => {
    const { dialogStore } = setupPinia({
      timeline: [{ type: 'STOPPAGE', commentId: 0 }],
      statistics: { delaysCount: 1 },
    });
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.buffer = 'cc';
    keyListener.checkBuffer();
    expect(dialogStore.openDialog).toBeCalledTimes(1);
  });

  test('that onKeyUp adds # to buffer when input is #shift', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    expect(keyListener.buffer).toBe('');
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(keyListener.buffer).toBe('#');
  });

  test('that onKeyUp adds # to buffer when input is shift3', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    expect(keyListener.buffer).toBe('');
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(keyListener.buffer).toBe('#');
  });

  test('that checkBuffer calls applyBarCodeComment function when 1shift3<commentId>shift3 is entered', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(applyBarCodeComment).toBeCalledTimes(1);
    expect(applyBarCodeComment).toBeCalledWith('123');
  });

  test('that checkBuffer calls applyBarCodeComment function when 1#shift<commentId>#shift is entered', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(applyBarCodeComment).toBeCalledTimes(1);
    expect(applyBarCodeComment).toBeCalledWith('123');
  });

  test('that checkBuffer calls applyBarCodeSignalQty function when 2shift3<signalQty>shift3 is entered', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '.' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(applyBarCodeSignalQty).toBeCalledTimes(1);
    expect(applyBarCodeSignalQty).toBeCalledWith('1.4');
  });

  test('that checkBuffer calls applyBarCodeSignalQty function when 2#shift<signalQty>#shift is entered', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '.' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(applyBarCodeSignalQty).toBeCalledTimes(1);
    expect(applyBarCodeSignalQty).toBeCalledWith('1.4');
  });

  test('that checkBuffer calls postClientMetrics function when 3shift3<measureValue>shift3<measureName>shift3<measureUnit>shift3 is entered', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'k' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(postClientMetrics).toBeCalledTimes(1);
    expect(postClientMetrics).toBeCalledWith({ measureValue: '4', measureName: 'a', measureUnit: 'tk' });
  });

  test('that checkBuffer calls postClientMetrics function when 3#shift<measureValue>#shift<measureName>#shift<measureUnit>#shift is entered', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'k' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(postClientMetrics).toBeCalledTimes(1);
    expect(postClientMetrics).toBeCalledWith({ measureValue: '4', measureName: 'a', measureUnit: 'tk' });
  });

  test('that checkBuffer calls postClientMetrics function when 3shift3<measureValue>shift3<measureName>shift3<measureUnit>shift3 is entered and measureName includes capital letters', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shiftm' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shiftn' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'k' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(postClientMetrics).toBeCalledTimes(1);
    expect(postClientMetrics).toBeCalledWith({ measureValue: '4', measureName: 'MeNd', measureUnit: 'tk' });
  });

  test('that checkBuffer calls postClientMetrics function when 3#shift<measureValue>#shift<measureName>#shift<measureUnit>#shift is entered and measureName includes capital letters', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'mshift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'nshift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'k' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(postClientMetrics).toBeCalledTimes(1);
    expect(postClientMetrics).toBeCalledWith({ measureValue: '4', measureName: 'MeNd', measureUnit: 'tk' });
  });

  test('that checkBuffer calls applyBarCodeChangeover function when 4shift3<productId>shift3 is entered', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(applyBarCodeChangeover).toBeCalledTimes(1);
    expect(applyBarCodeChangeover).toBeCalledWith('4');
  });

  test('that checkBuffer calls applyBarCodeChangeover function when 4#shift<productId>#shift is entered', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(applyBarCodeChangeover).toBeCalledTimes(1);
    expect(applyBarCodeChangeover).toBeCalledWith('4');
  });

  test('that checkBuffer calls applyBarCodeSignalQty function when input is 5shift3<signalQty>shift3<productId>shift3', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '5' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(applyBarCodeSignalQty).toBeCalledTimes(1);
    expect(applyBarCodeSignalQty).toBeCalledWith('4', '3');
  });

  test('that checkBuffer calls applyBarCodeSignalQty function when input is 5shift3<signalQty>shift3<productId>shift3 and signalQty is float', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '5' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '.' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '5' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(applyBarCodeSignalQty).toBeCalledTimes(1);
    expect(applyBarCodeSignalQty).toBeCalledWith('4.5', '3');
  });

  test('that checkBuffer calls applyBarCodeSignalQty function when input is 5#shift<signalQty>#shift<productId>#shift', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '5' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(applyBarCodeSignalQty).toBeCalledTimes(1);
    expect(applyBarCodeSignalQty).toBeCalledWith('4', '3');
  });

  test('that checkBuffer calls applyBarCodeSignalQty function when input is 5#shift<signalQty>#shift<productId>#shift and signalQty is float', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '5' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '4' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '.' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '5' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(applyBarCodeSignalQty).toBeCalledTimes(1);
    expect(applyBarCodeSignalQty).toBeCalledWith('4.5', '3');
  });

  test('that checkBuffer calls applyBarCodeScrap function when input is 6#shift<scrapQty>#shift<scrapReason>#shift<scrapNote>#shift', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '6' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'h' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'o' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(applyBarCodeScrap).toBeCalledTimes(1);
    expect(applyBarCodeScrap).toBeCalledWith({ scrapQty: 1, scrapReasonId: 12, scrapNotes: 'this is a note' });
  });

  test('that checkBuffer calls applyBarCodeScrap function when input is 6shift3<scrapQty>shift3<scrapReason>shift3<scrapNote>shift3', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '6' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'h' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'o' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(applyBarCodeScrap).toBeCalledTimes(1);
    expect(applyBarCodeScrap).toBeCalledWith({ scrapQty: 1, scrapReasonId: 12, scrapNotes: 'this is a note' });
  });

  test('that checkBuffer calls applyBarCodeScrap function when input is 6#shift<scrapQty>#shift<scrapReason>#shift<scrapNote>#shift, scrapQty is float and scrapNote includes capital letters', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '6' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '.' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'tshift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'h' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ishift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ishift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'nshift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'o' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'tshift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(applyBarCodeScrap).toBeCalledTimes(1);
    expect(applyBarCodeScrap).toBeCalledWith({ scrapQty: 1.1, scrapReasonId: 12, scrapNotes: 'ThIs Is a NoTe' });
  });

  test('that checkBuffer calls applyBarCodeScrap function when input is 6shift3<scrapQty>shift3<scrapReason>shift3<scrapNote>shift3, scrapQty is float and scrapNote includes capital letters', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '6' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '.' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shiftt' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'h' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shifti' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shifti' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shiftn' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'o' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shiftt' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '3' }));
    expect(applyBarCodeScrap).toBeCalledTimes(1);
    expect(applyBarCodeScrap).toBeCalledWith({ scrapQty: 1.1, scrapReasonId: 12, scrapNotes: 'ThIs Is a NoTe' });
  });

  test('that checkBuffer calls applyBarCodeScrapReason function when input is 7#shift<scrapReasonId>#shift<scrapNote>#shift', () => {
    setupPinia();
    keyListener = new KeyListener(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason);
    keyListener.registerKeyListener();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '7' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '2' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'nshift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'o' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'tshift' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '#' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'shift' }));
    expect(applyBarCodeScrapReason).toBeCalledTimes(1);
    expect(applyBarCodeScrapReason).toBeCalledWith({ scrapReasonId: 12, scrapNotes: 'NoTe' });
  });
});
