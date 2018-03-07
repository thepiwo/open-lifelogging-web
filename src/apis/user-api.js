import baseApi from "./base-api";
import User from "../models/user";

export default {
  getLoginToken: (username, password) =>
    baseApi.post(baseApi.AUTH_SIGN_IN, {
      login: username,
      password: password
    }),

  getCurrentUser: () =>
    baseApi.getAuth(baseApi.USERS_ME).then(user => new User(user))
};
