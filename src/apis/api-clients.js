import axios from "axios";
import Storage from "../utils/storage";

export default {
  getClient: () =>
    axios.create({
      baseURL: Storage.getApiUrl()
    }),

  getAuthClient: () =>
    axios.create({
      baseURL: Storage.getApiUrl(),
      headers: { Token: Storage.getToken() }
    })
};
