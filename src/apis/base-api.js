import axios from "axios";
import Storage from "../utils/storage";

export default {
  LOGS: (fromDate, toDate) => `logs?date=${fromDate}&toDate=${toDate}`,

  USERS_ME: "users/me",

  AUTH_SIGN_IN: "auth/signIn",

  LOGS_KEY: (key, fromDate, toDate, unlimited) =>
    `logs/key/${key}?date=${fromDate}&toDate=${toDate}&unlimited=${unlimited}`,

  LOG_DELETE: id => `logs/${id}`,

  getClient: () =>
    axios.create({
      baseURL: Storage.getApiUrl()
    }),

  getAuthClient: () =>
    axios.create({
      baseURL: Storage.getApiUrl(),
      headers: { Token: Storage.getToken() }
    }),

  getAuth: route =>
    this.a
      .getAuthClient()
      .get(route)
      .then(response => response.data)
      .catch(error => console.error(error)),

  deleteAuth: route =>
    this.a
      .getAuthClient()
      .delete(route)
      .then(response => response.data)
      .catch(error => console.error(error)),

  post: (route, data) =>
    this.a
      .getClient()
      .post(route, data)
      .then(response => response.data)
      .catch(error => console.error(error))
};
