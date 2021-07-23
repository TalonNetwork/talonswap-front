import { InjectionKey } from "vue";
import { createStore, Store } from "vuex";

// InjectionKey 将store安装到Vue应用程序时提供类型,将类型传递InjectionKey给useStore方法
// 手动声明 state 类型
export interface State {
  account: string;
}

// 定义注入类型
const key: InjectionKey<Store<State>> = Symbol();

export default createStore<State>({
  state: {
    account: ""
  },
  getters: {
    getAccount(state) {
      return state.account;
    }
  },
  mutations: {
    setAccount(state, data) {
      state.account = data;
    }
  },
  actions: {
    async setAccount({ state, commit }, account) {
      commit("setAccount", account);
    }
  },
  modules: {}
});
