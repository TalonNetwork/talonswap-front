import { InjectionKey } from "vue";
import { createStore, Store } from "vuex";
import { _networkInfo } from "@/api/util";
import config from "@/config";

// InjectionKey 将store安装到Vue应用程序时提供类型,将类型传递InjectionKey给useStore方法
// 手动声明 state 类型
export interface State {
  addressInfo: any;
  chainId: string;
  showConnect: boolean;
  lang: string | null;
}

// 定义注入类型
const key: InjectionKey<Store<State>> = Symbol();

export default createStore<State>({
  state: {
    // hasTalonAddress: false,
    addressInfo: {},
    chainId: "",
    showConnect: false,
    lang: localStorage.getItem("lang")
  },
  getters: {
    // 异构链名称Ethereum..
    chain(state) {
      const chainId = state.chainId;
      if (!chainId) return "";
      let chain = "";
      Object.keys(_networkInfo).map(v => {
        if (_networkInfo[v][config.ETHNET] === chainId) {
          chain = _networkInfo[v].name;
        }
      });
      return chain;
    },
    // metamask 网络错误
    wrongChain(state) {
      const chainId = state.chainId;
      return Object.keys(_networkInfo).every(v => {
        return _networkInfo[v][config.ETHNET] !== chainId;
      });
    },
    currentAddress(state) {
      const address = state.addressInfo?.address?.Ethereum;
      return address;
    },
    talonAddress(state) {
      const address = state.addressInfo?.address?.Talon;
      return address;
    },
  },
  mutations: {
    setCurrentAddress(state, data) {
      // console.log(data, 7777)
      state.addressInfo = data;
    },
    changeChainId(state, data) {
      // console.log(data, 55)
      state.chainId = data;
    },
    changeConnectShow(state, data) {
      state.showConnect = data;
    },
    switchLang(state, data) {
      state.lang = data;
      localStorage.setItem("lang", data);
    }
  },
  actions: {
    // async setAccount({ state, commit }, account) {
    //   commit("setAccount", account);
    // }
  },
  modules: {}
});
