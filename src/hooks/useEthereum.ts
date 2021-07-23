import { reactive, toRefs } from "vue";
// import { Web3Provider } from "ethers";
import MetaMask from "@/assets/img/metamask.svg";
import Nabox from "@/assets/img/nabox.svg";
import OKEx from "@/assets/img/okexchain.png";

interface State {
  address: string | null;
  chainId: string;
  networkError: string;
  provider: any
}


const isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
const MetaMaskProvider = "ethereum"
const NaboxProvier = "NaboxWallet"
const OKExProvier = "okexchain"

export const providerList = [
  { name: "MetaMask", src: MetaMask, provider: MetaMaskProvider },
  { name: "Nabox", src: Nabox, provider: NaboxProvier },
  // { name: "OKEx Wallet", src: OKEx, provider: OKExProvier },
]

export default function useEthereum() {
  const state: State = reactive({
    address: "",
    chainId: "",
    networkError: "",
    provider: null
  });
  const providerType = isMobile ? MetaMaskProvider : localStorage.getItem("providerType");
  // let provider: Web3Provider | null;
  if (providerType) {
    state.provider = window[providerType];
    state.address = window[providerType].selectedAddress;
    listenAccountChange();
    listenNetworkChange();
  }

  // 监听插件账户变动
  function listenAccountChange() {
    state.provider.on("accountsChanged", (accounts: string) => {
      console.log(accounts, "=======accountsChanged", providerType);
      if (!providerType) return;
      if (accounts.length) {
        state.address = accounts[0];
      } else {
        state.address = "";
      }
    });
  }

  // 监听插件网络变动
  function listenNetworkChange() {
    state.provider.on("chainChanged", (chainId: string) => {
      console.log(chainId, "=======chainId", providerType);
      if (!providerType) return;
      if (chainId) {
        checkNetwork(chainId);
      }
    });
  }

  function checkNetwork(chainId: string) {
    console.log(chainId);
  }

  // 连接provider
  async function connect(providerType: string) {
    // console.log(type, 456)
    state.provider = window[providerType];
    await state.provider.request({method: 'eth_requestAccounts'});
    state.address = state.provider.selectedAddress;
    localStorage.setItem("providerType", providerType);
    listenAccountChange();
    listenNetworkChange();
  }
  return {
    connect,
    ...toRefs(state)
  };
}
