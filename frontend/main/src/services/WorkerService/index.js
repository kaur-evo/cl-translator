import WorkerServiceRequest from './WorkerRequest';
import workerRegistry from './workerRegistry';

export default class WorkerService {
  constructor() {
    this.loadedWorkers = {};
    this.runningWorkerProcesses = {};
  }

  process(workerName, data) {
    if (!workerRegistry[workerName]) {
      throw new Error(`Unknown worker ${workerName}`);
    }
    if (!this.loadedWorkers[workerName]) {
      this.loadedWorkers[workerName] = workerRegistry[workerName]();

      this.loadedWorkers[workerName].onmessage = (ev) => {
        const { data: message } = ev;
        if (this.runningWorkerProcesses[workerName][0].successCB !== null) {
          this.runningWorkerProcesses[workerName][0].successCB(message);
        }
        this.runningWorkerProcesses[workerName][0] = null;
        this.runningWorkerProcesses[workerName].shift();
      };

      this.loadedWorkers[workerName].onerror = (ev) => {
        if (this.runningWorkerProcesses[workerName][0].errorCB !== null) {
          this.runningWorkerProcesses[workerName][0].errorCB(ev.message);
        }
        this.runningWorkerProcesses[workerName][0] = null;
        this.runningWorkerProcesses[workerName].shift();
      };
    }
    this.loadedWorkers[workerName].postMessage(data);
    if (!this.runningWorkerProcesses[workerName]) {
      this.runningWorkerProcesses[workerName] = [];
    }
    const processRequest = new WorkerServiceRequest();
    this.runningWorkerProcesses[workerName].push(processRequest);
    return processRequest;
  }

  cancelFirstInQueue(workerName) {
    if (this.runningWorkerProcesses[workerName]?.length) {
      this.runningWorkerProcesses[workerName][0].successCB = null;
      this.runningWorkerProcesses[workerName][0].errorCB = null;
      this.runningWorkerProcesses[workerName][0].cancelCB();
    }
  }
}
window.WorkerService = new WorkerService();
