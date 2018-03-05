<template>
    <div class="container login-container card">

        <div class="card-body">
            <div class="input-group mb-3">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="username-addon">username</span>
                </div>
                <input type="text" class="form-control" placeholder="username" aria-label="username"
                       aria-describedby="username-addon" v-model="username"/>
            </div>

            <div class="input-group mb-3">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="password-addon">password</span>
                </div>
                <input type="password" class="form-control" placeholder="password" aria-label="password"
                       aria-describedby="password-addon" v-model="password"/>
            </div>

            <input class="btn btn-submit" type="button" id="login" value="login" @click="login()"/>
        </div>

    </div>
</template>

<script>
import api from "../apis/api";

export default {
  data() {
    return {
      username: "",
      password: ""
    };
  },

  methods: {
    async login() {
      let data = await api.login(this.username, this.password);
      console.log(data);
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
