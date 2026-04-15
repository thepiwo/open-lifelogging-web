import Log from "./log";

export default class LogReturn {
  constructor(opts) {
    if (opts) {
      this.countTotal = opts.countTotal;
      this.logs = (opts.logs || []).map(log => new Log(log));
    } else {
      this.countTotal = 0;
      this.logs = [];
    }
  }
}
