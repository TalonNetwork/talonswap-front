import {createStore} from 'vuex'

export default createStore({
  state: {
    account: ''
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
    async setAccount({state, commit}, account) {
      commit("setAccount", account);
    },
  },
  modules: {}
})
