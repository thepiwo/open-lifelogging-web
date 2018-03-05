import axios from "axios";

export default {
  login: (username, password) =>
    axios
      .post("//localhost:9001/v1/auth/signIn", {
        login: username,
        password: password
      })
      .then(res => res.data)
      .catch(err => console.error(err))
};
