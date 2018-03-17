import baseApi from "./base-api";
import Log from "../models/log";

export default {
  mapLogs: promise =>
    promise.then(logs => {
      return logs.map(log => {
        return new Log(log);
      });
    }),

  getLogs: (fromDate, toDate) =>
    this.a.mapLogs(
      baseApi.getAuth(
        baseApi.LOGS(
          fromDate.toISOString().slice(0, 10),
          toDate.toISOString().slice(0, 10)
        )
      )
    ),

  getLocationsLogs: (fromDate, toDate) =>
    this.a.mapLogs(
      baseApi.getAuth(
        baseApi.LOGS_KEY(
          "CoordEntity",
          fromDate.toISOString().slice(0, 10),
          toDate.toISOString().slice(0, 10)
        )
      )
    ),

  deleteLog: id => baseApi.deleteAuth(baseApi.LOG_DELETE(id))
};
