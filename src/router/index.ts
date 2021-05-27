import {createRouter, createWebHashHistory} from 'vue-router'

import Home from "../views/home/home.vue";
import Assets from "../views/assets/Assets.vue";
import Trading from "../views/trading/Trading.vue";
import Liquidity from "../views/liquidity/Liquidity.vue";
import Farm from "../views/farm/Farm.vue";
import Info from "../views/info/Info.vue";

const router = createRouter({
  //history: "history",
  history: createWebHashHistory(),
  routes: [
    {
      path: '',
      name: 'home',
      component: Farm,
    },
    {
      path: "/assets",
      name: "assets",
      component: Assets,
    },
    {
      path: "/trading",
      name: "trading",
      component: Trading,
    },
    {
      path: "/liquidity",
      name: "liquidity",
      component: Liquidity,
    },
    {
      path: "/farm",
      name: "farm",
      component: Farm,
    },
    {
      path: "/info",
      name: "info",
      component: Info,
    },

  ]
});

export default router;
