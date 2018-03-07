import axios from "axios";

export default {
  LOGS: date => `logs?date=${date}`,

  USERS_ME: "users/me",

  AUTH_SIGN_IN: "auth/signIn",

  LOGS_KEY: (key, date) => {
    if (date) {
      return `logs/key/${key}?date=${date}`;
    } else {
      return `logs/key/${key}`;
    }
  },

  LOG_DELETE: id => `logs/${id}`,

  getApiUrl: () => localStorage.getItem("apiUrl"),

  getToken: () => localStorage.getItem("token"),

  getClient: () =>
    axios.create({
      baseURL: this.a.getApiUrl(),
      timeout: 1000
    }),

  getAuthClient: () =>
    axios.create({
      baseURL: this.a.getApiUrl(),
      timeout: 1000,
      headers: { Token: this.a.getToken() }
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
