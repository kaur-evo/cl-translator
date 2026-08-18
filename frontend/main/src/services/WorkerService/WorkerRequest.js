export default class WorkerServiceRequest {
  constructor() {
    this.successCB = null;
    this.cancelCB = null;
    this.errorCB = null;
  }

  then(cb) {
    this.successCB = cb;
    return this;
  }

  cancel(cb) {
    this.cancelCB = cb;
    return this;
  }

  catch(cb) {
    this.errorCB = cb;
    return this;
  }
}
