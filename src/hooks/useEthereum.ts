import { reactive, toRefs } from "vue";
// import { Web3Provider } from "ethers";
import MetaMask from "@/assets/img/metamask.svg";
import CoinBase from "@/assets/img/coinbase.svg";
import Nabox from "@/assets/img/nabox.svg";
import OKEx from "@/assets/img/okexchain.png";

interface State {
  address: string | null;
  chainId: string;
  networkError: string;
}

const isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(
  navigator.userAgent
);
const MetaMaskProvider = "ethereum";
const NaboxProvier = "NaboxWallet";
const OKExProvier = "okexchain";

export const providerList = [
  { name: "MetaMask", src: MetaMask, provider: MetaMaskProvider },
  { name: "Nabox", src: Nabox, provider: NaboxProvier }
  // { name: "OKEx Wallet", src: OKEx, provider: OKExProvier },
];

export function getProvider(type?: string) {
  if (type) return window[type];
  const providerType = isMobile
    ? MetaMaskProvider
    : localStorage.getItem("providerType");
  return providerType ? window[providerType] : null;
}

export default function useEthereum() {
  const state: State = reactive({
    address: "",
    chainId: "",
    networkError: ""
  });

  function initProvider() {
    const provider = getProvider();
    if (provider) {
      state.address = provider.selectedAddress;
      state.chainId = provider.chainId;
      // console.log(state.address, 8)
      listenAccountChange();
      listenNetworkChange();
    }
  }

  // 监听插件账户变动
  function listenAccountChange() {
    const provider = getProvider();
    provider?.on("accountsChanged", (accounts: string) => {
      console.log(accounts, "=======accountsChanged");
      reload()
      if (accounts.length) {
        state.address = accounts[0];
      } else {
        state.address = "";
      }
    });
  }

  // 监听插件网络变动
  function listenNetworkChange() {
    const provider = getProvider();
    provider?.on("chainChanged", (chainId: string) => {
      console.log(chainId, "=======chainId");
      if (chainId) {
        state.chainId = provider.chainId;
        reload()
        // checkNetwork(chainId);
      }
    });
  }

  function checkNetwork(chainId: string) {
    console.log(chainId);
  }

  // 连接provider
  async function connect(providerType: string) {
    const provider = getProvider(providerType);
    await provider?.request({ method: "eth_requestAccounts" });
    state.address = provider?.selectedAddress;
    localStorage.setItem("providerType", providerType);
    listenAccountChange();
    listenNetworkChange();
    reload()
  }

  function disconnect() {
    localStorage.removeItem("providerType");
    state.address = "";
    reload()
  }

  function reload() {
    window.location.reload()
  }

  return {
    initProvider,
    connect,
    disconnect,
    ...toRefs(state)
  };
}
