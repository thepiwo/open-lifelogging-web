import baseApi from "./base-api";
import Log from "../models/log";

export default {
  mapLogs: promise =>
    promise.then(logs => {
      return logs.map(log => {
        return new Log(log);
      });
    }),

  getLogs: date => this.a.mapLogs(baseApi.getAuth(baseApi.LOGS(date))),

  getLocationsLogs: date =>
    this.a.mapLogs(baseApi.getAuth(baseApi.LOGS_KEY("CoordEntity", date))),

  deleteLog: id => baseApi.deleteAuth(baseApi.LOG_DELETE(id))
};
