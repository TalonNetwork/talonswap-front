import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { getProvider } from "@/hooks/useEthereum";
import { getCurrentAccount } from "@/api/util";
import Farm from "@/views/farm/index.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "home",
    component: () => import("@/views/home/index.vue"),
    // component: () => import("@/views/test/index.vue"),
  },
  {
    path: "/assets",
    name: "assets",
    component: () => import("../views/assets/index.vue"),
    meta: { requireAuth: true }
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
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/index.vue"),
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
});



function getPub() {
  const provider = getProvider();
  const address = provider.selectedAddress;
  // console.log(address, 666999, window.ethereum.selectedAddress)
  const account = getCurrentAccount(address);
  return account ? account.pub : null;
}

router.beforeEach((to, from, next) => {
  // console.log(666999, window.ethereum.selectedAddress)
  if (to.meta.requireAuth) {
    const pub = getPub();
    if (!pub) {
      next("/login")
    } else {
      next();
    }
  } else {
    next();
  }
})


export default router;
