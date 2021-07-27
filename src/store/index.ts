import { InjectionKey } from "vue";
import { createStore, Store } from "vuex";

// InjectionKey 将store安装到Vue应用程序时提供类型,将类型传递InjectionKey给useStore方法
// 手动声明 state 类型
export interface State {
  address: string;
  showConnect: boolean;
}

// 定义注入类型
const key: InjectionKey<Store<State>> = Symbol();

export default createStore<State>({
  state: {
    // hasTalonAddress: false,
    address: "",
    showConnect: false
  },
  getters: {
    // getAddress(state) {
    //   return state.address;
    // }
  },
  mutations: {
    setCurrentAddress(state, data) {
      // console.log(data, 7777)
      state.address = data;
    },
    changeConnectShow(state, data) {
      state.showConnect = data
    }
  },
  actions: {
    // async setAccount({ state, commit }, account) {
    //   commit("setAccount", account);
    // }
  },
  modules: {}
});
