import {ethers} from "ethers";
import {Minus} from "./util";

const RPC_URL = {
  BSC: {
    ropsten: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    homestead: "https://bsc-dataseed.binance.org/"
  },
  Heco: {
    ropsten: "https://http-testnet.hecochain.com",
    homestead: "https://http-mainnet.hecochain.com"
  },
  OKExChain: {
    ropsten: "https://exchaintestrpc.okex.org",
    homestead: "https://exchainrpc.okex.org"
  }
};
const ERC20_ABI = [
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];
let chain = 'Ethereum';
let network = 'main';
let provider = {};

export class ETransfer {

  constructor(props: any) {
    if (!props.chain) {
      throw "未获取到网络，组装交易失败";
    }
    const validChains = ["Ethereum", "BSC", "Heco", "OKExChain"];
    const validNetwork = ["beta", "main"];
    if (validChains.indexOf(props.chain) === -1) {
      throw "invalid chain";
    }
    if (validNetwork.indexOf(props.network) === -1) {
      throw "invalid network";
    }
    chain = props.chain; //链网络
    network = props.network; //网络 beta or main
    provider = this.getProvider(chain, network);
  }

  getProvider(chain: string, network: string) {
    const ETHNET = network === "main" ? "homestead" : "ropsten";
    if (chain === "Ethereum") {
      return ethers.getDefaultProvider(ETHNET);
    } else {
      return new ethers.providers.JsonRpcProvider(RPC_URL[chain][ETHNET]);
    }
  }

  /**
   * 查询erc20资产授权额度
   * @param contractAddress ERC20合约地址
   * @param multySignAddress 多签地址
   * @param address 账户eth地址
   */
  async getERC20Allowance(contractAddress: string, multySignAddress: string, address: string) {
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const allowancePromise = contract.allowance(address, multySignAddress);
    return allowancePromise
      .then(allowance => {
        const baseAllowance = '39600000000000000000000000000';
        //已授权额度小于baseAllowance，则需要授权
        return Number(Minus(baseAllowance, allowance)) >= 0;
      })
      .catch(e => {
        console.error("获取erc20资产授权额度失败" + e);
        return true;
      });
  }

  /**
   * 授权erc20额度
   * @param contractAddress ERC20合约地址
   * @param multySignAddress 多签地址
   * @param address 账户eth地址
   */
  async getApproveERC20Hex(contractAddress: string, multySignAddress: string, address: string) {
    const wallet = await this.getWallet();
    const nonce = await wallet.getTransactionCount();
    const gasPrice = await provider.getGasPrice();
    const gasLimit = "100000";

    const iface = new ethers.utils.Interface(ERC20_ABI);
    const data = iface.functions.approve.encode([
      multySignAddress,
      new ethers.utils.BigNumber("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ]);
    const transaction = {
      to: contractAddress,
      from: address,
      value: "0x00",
      data: data,
      nonce,
      gasLimit: Number(gasLimit),
      gasPrice
    };
    const failed = await this.validate(transaction);
    if (failed) {
      console.error("failed approveERC20" + failed);
      return null;
    }
    delete transaction.from;
    return await wallet.sign(transaction);
    // delete transaction.from   //etherjs 4.0 from参数无效 报错
    // return wallet.sendTransaction(transaction);
  }

  //验证交易参数
  async validate(tx: any) {
    try {
      const result = await provider.call(tx);
      return ethers.utils.toUtf8String("0x" + result.substr(138));
    } catch (e) {
      return false;
    }
  }

}
