import Vue from "vue";
import Router from "vue-router";
import Login from "./components/Login.vue";
import Feed from "./components/Feed.vue";
import Map from "./components/Map.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "login",
      component: Login
    },
    {
      path: "/feed",
      name: "feed",
      component: Feed
    },
    {
      path: "/map",
      name: "map",
      component: Map
    }
  ]
});
