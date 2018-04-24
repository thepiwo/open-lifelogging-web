import apiClients from "./api-clients";

export default {
  LOGS: (fromDate, toDate) => `logs?date=${fromDate}&toDate=${toDate}`,

  USERS_ME: "users/me",

  AUTH_SIGN_IN: "auth/signIn",

  LOGS_KEY: (key, fromDate, toDate, unlimited) =>
    `logs/key/${key}?date=${fromDate}&toDate=${toDate}&unlimited=${unlimited}`,

  LOG_DELETE: id => `logs/${id}`,

  getAuth: route =>
    apiClients
      .getAuthClient()
      .get(route)
      .then(response => response.data)
      .catch(error => console.error(error)),

  deleteAuth: route =>
    apiClients
      .getAuthClient()
      .delete(route)
      .then(response => response.data)
      .catch(error => console.error(error)),

  post: (route, data) =>
    apiClients
      .getClient()
      .post(route, data)
      .then(response => response.data)
      .catch(error => console.error(error))
};
