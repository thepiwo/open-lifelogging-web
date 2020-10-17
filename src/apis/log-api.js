import baseApi from "./base-api";
import Log, {LimitType} from "../models/log";

export default {
  getLogs: (fromDate, toDate) =>
    Log.mapLogs(
      baseApi.getAuth(
        baseApi.LOGS(
          fromDate.toISOString().slice(0, 10),
          toDate.toISOString().slice(0, 10),
          LimitType.LIMITED
        )
      )
    ),

  getLocationsLogs: (fromDate, toDate, limitType) =>
    Log.mapLogs(
      baseApi.getAuth(
        baseApi.LOGS_KEY(
          "CoordEntity",
          fromDate.toISOString().slice(0, 10),
          toDate.toISOString().slice(0, 10),
          limitType
        )
      )
    ),

  deleteLog: id => baseApi.deleteAuth(baseApi.LOG_DELETE(id))
};
