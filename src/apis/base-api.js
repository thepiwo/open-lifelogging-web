import apiClients from "./api-clients";

export default {
  LOGS: (fromDate, toDate, limitType) => `logs?date=${fromDate}&toDate=${toDate}&limitType=${limitType}`,

  USERS_ME: "users/me",

  AUTH_SIGN_IN: "auth/signIn",

  LOGS_KEY: (key, fromDate, toDate, limitType) =>
    `logs/key/${key}?date=${fromDate}&toDate=${toDate}&limitType=${limitType}`,

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
