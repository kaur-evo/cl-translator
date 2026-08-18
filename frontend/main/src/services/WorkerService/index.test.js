import workerRegistry from './workerRegistry';

import WorkerService from './index';

describe('WorkerService', () => {
  let workerService;

  beforeEach(() => {
    workerService = new WorkerService();
  });

  it('should throw an error if an unknown worker is specified', () => {
    expect(() => workerService.process('unknownWorker', {})).toThrowError('Unknown worker unknownWorker');
  });

  it('should create a new worker if one does not already exist', () => {
    const mockWorker = vi.fn(() => ({
      postMessage: vi.fn(),
      onmessage: null,
      onerror: null,
    }));
    workerRegistry.testWorker = mockWorker;
    workerService.process('testWorker', {});
    expect(mockWorker).toHaveBeenCalled();
  });

  it('should reuse an existing worker if one already exists', () => {
    const mockWorker = vi.fn(() => ({
      postMessage: vi.fn(),
      onmessage: null,
      onerror: null,
    }));
    workerRegistry.testWorker = mockWorker;
    workerService.process('testWorker', {});
    workerService.process('testWorker', {});
    expect(mockWorker).toHaveBeenCalledTimes(1);
  });

  it('should call the success callback when a message is received from the worker', () => {
    const mockWorker = {
      postMessage: vi.fn(),
      onmessage: null,
      onerror: null,
    };
    workerRegistry.testWorker = () => mockWorker;
    const successCB = vi.fn();
    workerService.process('testWorker', {}).then(successCB);
    mockWorker.onmessage({ data: 'test' });
    expect(successCB).toHaveBeenCalledWith('test');
  });

  it('should call the error callback when an error is received from the worker', () => {
    const mockWorker = {
      postMessage: vi.fn(),
      onmessage: null,
      onerror: null,
    };
    workerRegistry.testWorker = () => mockWorker;
    const errorCB = vi.fn();
    workerService.process('testWorker', {}).catch(errorCB);
    mockWorker.onerror({ message: 'error' });
    expect(errorCB).toHaveBeenCalledWith('error');
  });

  it('should cancel the first request in the queue', () => {
    const mockWorker = {
      postMessage: vi.fn(),
      onmessage: null,
      onerror: null,
    };
    workerRegistry.testWorker = () => mockWorker;
    const cancelCB = vi.fn();
    workerService.process('testWorker', {}).cancel(cancelCB);
    workerService.cancelFirstInQueue('testWorker');
    expect(cancelCB).toHaveBeenCalled();
  });
});
