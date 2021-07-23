import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Farm from "@/views/farm/index.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "home",
    component: () => import("@/views/home/Home.vue"),
    // component: () => import("@/views/test/index.vue"),
  },
  {
    path: "/assets",
    name: "assets",
    component: () => import("../views/assets/index.vue"),
  },
  {
    path: "/trading",
    name: "trading",
    component: () => import("@/views/trading/index.vue"),
  },
  {
    path: "/liquidity",
    name: "liquidity",
    component: () => import("@/views/liquidity/index.vue"),
  },
  {
    path: "/farm",
    name: "farm",
    // component: () => import("@/views/farm/index.vue"),
    component: Farm,
  },
  {
    path: "/info",
    name: "info",
    component: () => import("@/views/info/Info.vue"),
  },
  {
    path: "/test",
    name: "test",
    component: () => import("@/views/test/index.vue"),
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
