import WorkerServiceRequest from './WorkerRequest';

describe('WorkerServiceRequest', () => {
  let request;

  beforeEach(() => {
    request = new WorkerServiceRequest();
  });

  it('should call the success callback when the "then" method is called', () => {
    const successCB = vi.fn();
    request.then(successCB);
    request.successCB('test');
    expect(successCB).toHaveBeenCalledWith('test');
  });

  it('should call the cancel callback when the "cancel" method is called', () => {
    const cancelCB = vi.fn();
    request.cancel(cancelCB);
    request.cancelCB();
    expect(cancelCB).toHaveBeenCalled();
  });

  it('should call the error callback when the "catch" method is called', () => {
    const errorCB = vi.fn();
    request.catch(errorCB);
    request.errorCB('error');
    expect(errorCB).toHaveBeenCalledWith('error');
  });
});
