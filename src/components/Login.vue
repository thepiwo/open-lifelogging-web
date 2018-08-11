<template>
  <div class="container login-container card">

    <div class="card-body">
      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <span 
            id="base-url-addon" 
            class="input-group-text">base-url</span>
        </div>
        <input 
          v-model="baseUrl" 
          type="text" 
          class="form-control" 
          placeholder="base-url"
          aria-label="base-url" 
          aria-describedby="base-url-addon">
      </div>

      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <span 
            id="username-addon" 
            class="input-group-text">username</span>
        </div>
        <input 
          v-model="username" 
          type="text" 
          class="form-control" 
          placeholder="username"
          aria-label="username" 
          aria-describedby="username-addon">
      </div>

      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <span 
            id="password-addon" 
            class="input-group-text">password</span>
        </div>
        <input 
          v-model="password" 
          type="password" 
          class="form-control" 
          placeholder="password"
          aria-label="password" 
          aria-describedby="password-addon">
      </div>

      <input 
        id="login" 
        class="btn btn-submit" 
        type="button" 
        value="login" 
        @click="login()">
    </div>

  </div>
</template>

<script>
import api from "../apis/api";
import Storage from "../utils/storage";

export default {
  data() {
    return {
      baseUrl: "//localhost:9001/v1/",
      username: "",
      password: ""
    };
  },

  methods: {
    async login() {
      Storage.setApiUrl(this.baseUrl);
      let data = await api.user.getLoginToken(this.username, this.password);
      Storage.setToken(data.token);
    }
  }
};
</script>

<style lang="scss">
.login-container {
  max-width: 500px;

  #login {
    width: 100%;
  }
}
</style>
