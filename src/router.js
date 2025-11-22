import { createRouter, createWebHistory } from "vue-router";
import Login from "./components/Login.vue";
import Feed from "./components/Feed.vue";
import Map from "./components/Map.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "login", component: Login },
    { path: "/feed", name: "feed", component: Feed },
    { path: "/map", name: "map", component: Map }
  ]
});

export default router;
