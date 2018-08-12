import Log from "./log";

export default class LogReturn {
  constructor(opts) {
    this.countTotal = opts.countTotal;
    this.logs = opts.logs.map(log => new Log(log));
  }
}
