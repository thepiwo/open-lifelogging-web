import baseApi from "./base-api";
import Log from "../models/log";

export default {
  getLogs: (fromDate, toDate) =>
    Log.mapLogs(
      baseApi.getAuth(
        baseApi.LOGS(
          fromDate.toISOString().slice(0, 10),
          toDate.toISOString().slice(0, 10)
        )
      )
    ),

  getLocationsLogs: (fromDate, toDate, unlimited) =>
    Log.mapLogs(
      baseApi.getAuth(
        baseApi.LOGS_KEY(
          "CoordEntity",
          fromDate.toISOString().slice(0, 10),
          toDate.toISOString().slice(0, 10),
          unlimited
        )
      )
    ),

  deleteLog: id => baseApi.deleteAuth(baseApi.LOG_DELETE(id))
};
