<template>
  <div class="w1300 farm">
    <div class="top clear">
      <div
        class="fl tab-item"
        :class="{ isActive: current === 1 }"
        @click="current = 1"
      >
        Uniswap Farm
      </div>
      <div
        class="fr tab-item"
        :class="{ isActive: current === 2 }"
        @click="current = 2"
      >
        Curium Farm
      </div>
    </div>
    <div class="search">
      <div class="sort">
        <el-select
          v-model="sortValue"
          placeholder=""
          popper-class="farm-select"
        >
          <el-option :label="$t('farmRankType.apr')" value="1"></el-option>
          <el-option :label="$t('farmRankType.usd')" value="2"></el-option>
        </el-select>
      </div>
      <div class="mortgage">
        <el-switch
          v-model="mortgageValue"
          active-color="#5F71F5"
          inactive-color="#D0D6FF"
          :active-text="$t('farm.farm1')"
          :width="35"
        ></el-switch>
      </div>
    </div>
    <farm-item
      v-show="current === 1"
      :list="uniList"
      :loading="uniLoading"
      @handleLoading="handleLoading"
    ></farm-item>
    <farm-item
      v-show="current === 2"
      :list="talonList"
      :loading="talonLoading"
      @handleLoading="handleLoading"
      isTalon
    ></farm-item>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  ref,
  onUnmounted,
  watch
} from "vue";
import FarmItem from "./FarmItem.vue";
import useFarmData from "@/hooks/farm/useData";

export default defineComponent({
  name: "Farm",
  setup() {
    const uniLoading = ref(true);
    const talonLoading = ref(true);
    const current = ref(1); // uniFarm -1 / talonFarm -2
    const state = reactive({
      sortValue: "1", // 下拉框值
      mortgageValue: false // 只看已质押
    });
    const {
      talonList,
      getFarmData,
      getUserFarm,
      uniList,
      getUniData,
      filterList
    } = useFarmData();
    watch(
      () => [state.sortValue, state.mortgageValue],
      ([type, status]) => {
        console.log(type, status, 999);
        // @ts-ignore
        filterList(type, status);
      }
    );
    onMounted(async () => {
      // init();
      await getFarmData();
      getUserFarm();
      talonLoading.value = false;
    });

    let timer: any;
    onMounted(async () => {
      await getUniData();
      uniLoading.value = false;
      timer = setInterval(async () => {
        await getUniData();
      }, 10000);
    });
    onUnmounted(() => clearInterval(timer));

    function handleLoading(status: boolean) {
      if (current.value === 1) {
        uniLoading.value = status;
      } else {
        talonLoading.value = status;
      }
    }

    return {
      current,
      uniLoading,
      talonLoading,
      ...toRefs(state),
      talonList,
      uniList,
      handleLoading
    };
  },
  components: {
    FarmItem
  },
  computed: {
    /*account() {
        return this.$store.state.account;
      }*/
  },
  mounted() {
    // this.init();
    // let setIn = setInterval(async () => {
    //   let tokenList = await this.getTokenList(this.contractAddress);
    //   for (let item of tokenList) {
    //     for (let k of this.tokenList) {
    //       if (k.pid === item.pid) {
    //         k.earnings = item.earnings;
    //         k.totalReward = item.totalReward;
    //         k.lpPledged = item.lpPledged;
    //         k.lpBalance = item.lpBalance;
    //       }
    //     }
    //   }
    // }, 5000);
  }

  // methods: {
  //   /**
  //    * @disc: init
  //    * @params:
  //    * @date: 2021-05-18 16:40
  //    * @author: Wave
  //    */
  //   async init() {
  //     this.farmLoading = true;
  //     this.tokenList = await this.getTokenList(this.contractAddress);
  //     //console.log(this.tokenList);
  //     this.farmLoading = false;
  //   },

  //   //详情
  //   showId(tokenInfo) {
  //     for (let item of this.tokenList) {
  //       if (item.pid === tokenInfo.pid) {
  //         item.showId = !item.showId;
  //       } else {
  //         item.showId = false;
  //       }
  //     }
  //   },

  //   /**
  //    * @disc:  获取token 列表
  //    * @params: contractAddress
  //    * @date: 2021-05-20 17:05
  //    * @author: Wave
  //    */
  //   async getTokenList(contractAddress) {
  //     // The Contract interface
  //     let abi = [
  //       "function owner() public view returns (address)",
  //       "function pendingToken(uint256 _pid, address _user) external view returns (uint256)",
  //       "function poolInfo(uint256 input) external view returns (address,address,uint256,uint256,uint256,uint256,uint256)",
  //       "function poolLength() external view returns (uint256)",
  //       "function userInfo(uint256 _pid, address _user) external view returns (uint256,uint256)"
  //     ];
  //     // Connect to the network
  //     let provider = ethers.getDefaultProvider("ropsten");
  //     // 使用Provider 连接合约，将只有对合约的可读权限
  //     let contract = new ethers.Contract(contractAddress, abi, provider);
  //     //console.log(contract);

  //     let poolLengthValue = await contract.poolLength();
  //     let poolLength = Array.from({
  //       length: Number(poolLengthValue.toString())
  //     });
  //     //console.log(poolLength);

  //     let tokenList = [];
  //     for (let item in poolLength) {
  //       let tokenInfo = {
  //         name: "",
  //         earnings: "0",
  //         earningsSymbol: "",
  //         annualEarnings: "",
  //         //APR = 365 * ( 每日出块数量  * candyPrice 1 * candyPerBlock / candyDecimals )
  //         //除以
  //         //( lpPrice 1 * lpSupply / lpDecimals )
  //         totalValue: "",
  //         totalReward: "",
  //         lpToken: "",
  //         lpBalance: "0",
  //         lpPledged: "0",
  //         candyToken: "",
  //         lpDecimals: "",
  //         candyDecimals: "",
  //         showId: false,
  //         pid: Number(item)
  //       };
  //       let poolInfoValue = await contract.poolInfo(Number(item));
  //       tokenInfo.lpToken = poolInfoValue[0];
  //       tokenInfo.candyToken = poolInfoValue[1];

  //       //{'lpToken','candyToken','lastRewardBlock','accPerShare','candyPerBlock','lpSupply','candyBalance'};
  //       //{'name','earnings','annualEarnings','totalValue','totalReward'}
  //       let abiTwo = [
  //         "function symbol() public view returns (string)",
  //         "function balanceOf(address account) external view returns (uint256)",
  //         "function decimals() public view returns (uint8)"
  //       ];
  //       let contractTwo = new ethers.Contract(
  //         tokenInfo.lpToken,
  //         abiTwo,
  //         provider
  //       );
  //       let symbolValue = await contractTwo.symbol();
  //       tokenInfo.name = symbolValue.toString();
  //       let decimalsValue = await contractTwo.decimals();
  //       tokenInfo.lpDecimals = decimalsValue.toString();
  //       tokenInfo.totalReward = divisionDecimals(
  //         poolInfoValue[6].toString(),
  //         Number(tokenInfo.lpDecimals)
  //       ).toString();

  //       if (this.$store.state.account) {
  //         let pendingTokenValue = await contract.pendingToken(
  //           Number(item),
  //           this.$store.state.account
  //         );
  //         tokenInfo.earnings = divisionDecimals(
  //           pendingTokenValue.toString(),
  //           Number(tokenInfo.lpDecimals)
  //         ).toString();

  //         let userInfoValue = await contract.userInfo(
  //           Number(item),
  //           this.$store.state.account
  //         );
  //         tokenInfo.lpPledged = divisionDecimals(
  //           userInfoValue[0].toString(),
  //           Number(tokenInfo.lpDecimals)
  //         ).toString();

  //         let balanceOfValue = await contractTwo.balanceOf(
  //           this.$store.state.account
  //         );
  //         tokenInfo.lpBalance = divisionDecimals(
  //           balanceOfValue.toString(),
  //           Number(tokenInfo.lpDecimals)
  //         ).toString();
  //       }

  //       let abiThree = [
  //         "function symbol() public view returns (string)",
  //         "function decimals() public view returns (uint8)"
  //       ];
  //       let contractThree = new ethers.Contract(
  //         tokenInfo.candyToken,
  //         abiThree,
  //         provider
  //       );
  //       let earningsSymbol = await contractThree.symbol();
  //       tokenInfo.earningsSymbol = earningsSymbol.toString();

  //       let earningsDecimals = await contractThree.decimals();
  //       tokenInfo.candyDecimals = earningsDecimals.toString();

  //       let dayNumber = 5760; //每日出块数量(86400/15=5760)
  //       let candyPrice = 1; //todo 待取值
  //       let lpPrice = 1; //todo 待取值
  //       let c = Times(
  //         Times(dayNumber.toString(), candyPrice.toString()).toString(),
  //         poolInfoValue[4].toString()
  //       ).toString();
  //       //let a = 365 * (5760 * 1 * 88 / tokenInfo.candyDecimals); //365 * ( 每日出块数量  * candyPrice * candyPerBlock / candyDecimals )
  //       let a = Times(
  //         "365",
  //         Division(c, tokenInfo.candyDecimals).toString()
  //       ).toString();
  //       //let b = 1 * 200000 / 50;  //lpPrice 1 * lpSupply / lpDecimals
  //       let b = Division(
  //         Times(lpPrice.toString(), poolInfoValue[5].toString()).toString(),
  //         tokenInfo.lpDecimals
  //       ).toString();
  //       //APR = 365 * ( 每日出块数量  * candyPrice 1 * candyPerBlock / candyDecimals )
  //       //除以
  //       //( lpPrice 1 * lpSupply / lpDecimals )
  //       tokenInfo.annualEarnings = tofix(
  //         Division(a.toString(), b.toString()).toString(),
  //         2,
  //         1
  //       );

  //       tokenInfo.totalValue = Times(
  //         lpPrice.toString(),
  //         divisionDecimals(poolInfoValue[5], Number(tokenInfo.lpDecimals))
  //       ).toString();

  //       tokenList.push(tokenInfo);
  //     }
  //     return tokenList;
  //   },

  //   /**
  //    * @disc: 获取收益
  //    * @params:
  //    * @date: 2021-05-25 17:22
  //    * @author: Wave
  //    */
  //   charge(tokenInfo) {
  //     this.tokenInfo = tokenInfo;
  //     this.LPOperation(this.numberValue, 2);
  //   },

  //   //打开加减弹框
  //   openDialogAddOrMinus(tokenInfo, addOrMinus) {
  //     this.numberValue = "";
  //     this.dialogAddOrMinus = true;
  //     this.addOrMinus = addOrMinus;
  //     this.tokenInfo = tokenInfo;
  //   },

  //   //选择最大
  //   clickMax() {
  //     this.numberValue =
  //       this.addOrMinus === "add"
  //         ? this.tokenInfo.lpBalance
  //         : this.tokenInfo.lpPledged;
  //   },

  //   //确定提交
  //   async confirmAddOrMinus() {
  //     if (!this.numberValue) {
  //       ElMessage.warning({
  //         message: "请输入正确的数量",
  //         type: "warning",
  //         center: true
  //       });
  //       return;
  //     }

  //     if (this.addOrMinus === "add") {
  //       console.log(
  //         this.tokenInfo.lpToken,
  //         this.contractAddress,
  //         this.$store.state.account
  //       );
  //       //查询是否授权
  //       let allOwance = await this.getERC20Allowance(
  //         this.tokenInfo.lpToken,
  //         this.contractAddress,
  //         this.$store.state.account
  //       );
  //       //console.log(allOwance, "allOwance");
  //       if (!allOwance) {
  //         //没授权先授权
  //         let resData = await this.getApproveERC20Hex(
  //           this.tokenInfo.lpToken,
  //           this.contractAddress,
  //           this.$store.state.account
  //         );
  //         //console.log("授权结果：", resData);
  //         ElMessage.success({
  //           message: "ERC20授权信息已发出，请稍等几分钟重试！",
  //           type: "success",
  //           center: true
  //         });
  //         this.dialogAddOrMinus = false;
  //       } else {
  //         this.LPOperation(this.numberValue, 0);
  //       }
  //     } else {
  //       this.LPOperation(this.numberValue, 1);
  //     }
  //   },

  //   /**
  //    * @disc: 添加 、减少 lp  领取收益
  //    * @params: 金额
  //    * @type: 类型 0:添加 1：减少 2：领取收益
  //    * @date: 2021-05-25 17:16
  //    * @author: Wave
  //    */
  //   async LPOperation(amount: string, type: number) {
  //     let abi = [
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "user",
  //             type: "address"
  //           },
  //           {
  //             indexed: true,
  //             internalType: "uint256",
  //             name: "pid",
  //             type: "uint256"
  //           },
  //           {
  //             indexed: false,
  //             internalType: "uint256",
  //             name: "amount",
  //             type: "uint256"
  //           }
  //         ],
  //         name: "Deposit",
  //         type: "event"
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "user",
  //             type: "address"
  //           },
  //           {
  //             indexed: true,
  //             internalType: "uint256",
  //             name: "pid",
  //             type: "uint256"
  //           },
  //           {
  //             indexed: false,
  //             internalType: "uint256",
  //             name: "amount",
  //             type: "uint256"
  //           }
  //         ],
  //         name: "EmergencyWithdraw",
  //         type: "event"
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "previousOwner",
  //             type: "address"
  //           },
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "newOwner",
  //             type: "address"
  //           }
  //         ],
  //         name: "OwnershipTransferred",
  //         type: "event"
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "user",
  //             type: "address"
  //           },
  //           {
  //             indexed: true,
  //             internalType: "uint256",
  //             name: "pid",
  //             type: "uint256"
  //           },
  //           {
  //             indexed: false,
  //             internalType: "uint256",
  //             name: "amount",
  //             type: "uint256"
  //           }
  //         ],
  //         name: "Withdraw",
  //         type: "event"
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "contract IERC20",
  //             name: "_lpToken",
  //             type: "address"
  //           },
  //           {
  //             internalType: "contract IERC20",
  //             name: "_candyToken",
  //             type: "address"
  //           },
  //           {
  //             internalType: "uint256",
  //             name: "_candyPerBlock",
  //             type: "uint256"
  //           },
  //           { internalType: "uint256", name: "_amount", type: "uint256" },
  //           {
  //             internalType: "bool",
  //             name: "_withUpdate",
  //             type: "bool"
  //           }
  //         ],
  //         name: "add",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [
  //           { internalType: "uint256", name: "_pid", type: "uint256" },
  //           {
  //             internalType: "uint256",
  //             name: "_amount",
  //             type: "uint256"
  //           },
  //           { internalType: "bool", name: "_withUpdate", type: "bool" }
  //         ],
  //         name: "addCandy",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [
  //           { internalType: "uint256", name: "_pid", type: "uint256" },
  //           {
  //             internalType: "uint256",
  //             name: "_amount",
  //             type: "uint256"
  //           }
  //         ],
  //         name: "deposit",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [{ internalType: "uint256", name: "_pid", type: "uint256" }],
  //         name: "emergencyWithdraw",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "uint256",
  //             name: "_startBlock",
  //             type: "uint256"
  //           },
  //           { internalType: "address", name: "_devAddr", type: "address" }
  //         ],
  //         name: "initialize",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [],
  //         name: "massUpdatePools",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [],
  //         name: "owner",
  //         outputs: [{ internalType: "address", name: "", type: "address" }],
  //         stateMutability: "view",
  //         type: "function"
  //       },
  //       {
  //         inputs: [
  //           { internalType: "uint256", name: "_pid", type: "uint256" },
  //           {
  //             internalType: "address",
  //             name: "_user",
  //             type: "address"
  //           }
  //         ],
  //         name: "pendingToken",
  //         outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  //         stateMutability: "view",
  //         type: "function"
  //       },
  //       {
  //         inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  //         name: "poolInfo",
  //         outputs: [
  //           {
  //             internalType: "contract IERC20",
  //             name: "lpToken",
  //             type: "address"
  //           },
  //           {
  //             internalType: "contract IERC20",
  //             name: "candyToken",
  //             type: "address"
  //           },
  //           {
  //             internalType: "uint256",
  //             name: "lastRewardBlock",
  //             type: "uint256"
  //           },
  //           { internalType: "uint256", name: "accPerShare", type: "uint256" },
  //           {
  //             internalType: "uint256",
  //             name: "candyPerBlock",
  //             type: "uint256"
  //           },
  //           { internalType: "uint256", name: "lpSupply", type: "uint256" },
  //           {
  //             internalType: "uint256",
  //             name: "candyBalance",
  //             type: "uint256"
  //           }
  //         ],
  //         stateMutability: "view",
  //         type: "function"
  //       },
  //       {
  //         inputs: [],
  //         name: "poolLength",
  //         outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  //         stateMutability: "view",
  //         type: "function"
  //       },
  //       {
  //         inputs: [],
  //         name: "renounceOwnership",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [
  //           { internalType: "address", name: "newOwner", type: "address" }
  //         ],
  //         name: "transferOwnership",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [{ internalType: "uint256", name: "_pid", type: "uint256" }],
  //         name: "updatePool",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       },
  //       {
  //         inputs: [
  //           { internalType: "uint256", name: "", type: "uint256" },
  //           {
  //             internalType: "address",
  //             name: "",
  //             type: "address"
  //           }
  //         ],
  //         name: "userInfo",
  //         outputs: [
  //           { internalType: "uint256", name: "amount", type: "uint256" },
  //           {
  //             internalType: "uint256",
  //             name: "rewardDebt",
  //             type: "uint256"
  //           }
  //         ],
  //         stateMutability: "view",
  //         type: "function"
  //       },
  //       {
  //         inputs: [
  //           { internalType: "uint256", name: "_pid", type: "uint256" },
  //           {
  //             internalType: "uint256",
  //             name: "_amount",
  //             type: "uint256"
  //           }
  //         ],
  //         name: "withdraw",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function"
  //       }
  //     ];
  //     let providers = new ethers.providers.Web3Provider(window.ethereum);
  //     let wallet = await providers.getSigner();
  //     let contracts = new ethers.Contract(this.contractAddress, abi, wallet);
  //     let resData = {};
  //     if (type === 0) {
  //       resData = await contracts.deposit(
  //         this.tokenInfo.pid,
  //         Number(timesDecimals(amount, 8))
  //       );
  //     } else if (type === 1) {
  //       resData = await contracts.withdraw(
  //         this.tokenInfo.pid,
  //         Number(timesDecimals(amount, 8))
  //       );
  //     } else if (type === 2) {
  //       resData = await contracts.deposit(this.tokenInfo.pid, 0);
  //     }
  //     console.log(resData);
  //     if (resData.hash) {
  //       ElMessage({
  //         message: "交易已发出，等待区块确认！",
  //         type: "success",
  //         center: true
  //       });
  //       this.dialogAddOrMinus = true;
  //       if (this.dialogAddOrMinus) {
  //         this.dialogAddOrMinus = false;
  //       }
  //     }
  //   },

  //   /**
  //    * 查询erc20资产授权额度
  //    * @param contractAddress ERC20合约地址
  //    * @param multySignAddress 多签地址
  //    * @param address 账户eth地址
  //    */
  //   async getERC20Allowance(
  //     contractAddress: string,
  //     multySignAddress: string,
  //     address: string
  //   ) {
  //     const ERC20_ABI = [
  //       "function allowance(address owner, address spender) external view returns (uint256)"
  //     ];
  //     let provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const contract = new ethers.Contract(
  //       contractAddress,
  //       ERC20_ABI,
  //       provider
  //     );
  //     const allowancePromise = contract.allowance(address, multySignAddress);
  //     return allowancePromise
  //       .then(allowance => {
  //         const baseAllowance = "396000000000000000";
  //         //已授权额度小于baseAllowance，则需要授权
  //         return Number(Minus(allowance.toString(), baseAllowance)) >= 0;
  //       })
  //       .catch(e => {
  //         console.error("获取erc20资产授权额度失败" + e);
  //         return true;
  //       });
  //   },

  //   /**
  //    * 授权erc20额度
  //    * @param contractAddress ERC20合约地址
  //    * @param multySignAddress 多签地址
  //    * @param address 账户eth地址
  //    */
  //   async getApproveERC20Hex(
  //     contractAddress: string,
  //     multySignAddress: string,
  //     address: string
  //   ) {
  //     const ERC20_ABI = [
  //       "function approve(address spender, uint256 amount) external returns (bool)"
  //     ];
  //     let provider = new ethers.providers.Web3Provider(window.ethereum);
  //     let wallet = await provider.getSigner();
  //     const nonce = await wallet.getTransactionCount();
  //     const gasPrice = await provider.getGasPrice();
  //     const gasLimit = "100000";
  //     const iface = new ethers.utils.Interface(ERC20_ABI);
  //     const data = iface.functions.approve.encode([
  //       multySignAddress,
  //       new ethers.utils.BigNumber(
  //         "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  //       )
  //     ]);
  //     const transaction = {
  //       to: contractAddress,
  //       from: address,
  //       value: "0x00",
  //       data: data,
  //       nonce,
  //       gasLimit: Number(gasLimit),
  //       gasPrice
  //     };
  //     const failed = await this.validate(transaction);
  //     if (failed) {
  //       console.error("failed approveERC20" + failed);
  //       return null;
  //     }
  //     delete transaction.from;
  //     //return await wallet.sign(transaction);
  //     // delete transaction.from   //etherjs 4.0 from参数无效 报错
  //     return wallet.sendTransaction(transaction);
  //   },

  //   //验证交易参数
  //   async validate(tx: any) {
  //     try {
  //       let provider = new ethers.providers.Web3Provider(window.ethereum);
  //       //console.log(provider);
  //       const result = await provider.call(tx);
  //       return ethers.utils.toUtf8String("0x" + result.substr(138));
  //     } catch (e) {
  //       return false;
  //     }
  //   },

  //   /**
  //    * @disc: url 连接
  //    * @params: name 路由名称
  //    * @params: parameter 路由参数
  //    * @params: url 跳转链接
  //    * @date: 2021-05-12 11:02
  //    * @author: Wave
  //    */
  //   toUrl(name, parameter = "", url = "") {
  //     if (url) {
  //       //let newUrl = EXPLORER_URL + 'address/info?address=' + name;
  //       window.open(url);
  //     } else {
  //       this.$router.push({ name: name });
  //     }
  //   }
  // }
});
</script>

<style lang="scss">
.farm {
  min-height: 750px;
  .top {
    width: 360px;
    height: 48px;
    margin: 0 auto;
    border-radius: 24px;
    background-color: #fff;
    .tab-item {
      width: 180px;
      height: 48px;
      text-align: center;
      line-height: 48px;
      color: #4a5ef2;
      font-size: 16px;
      cursor: pointer;
    }
    .isActive {
      background-color: #5f71f5;
      border-radius: 24px;
      margin: 0 0 0 -1px;
      color: #fff;
      border: 0 solid #5f71f5;
    }
  }
  .search {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    margin: 10px 0 20px;
    .sort {
      width: 150px;
      height: 40px;
      .el-input__inner {
        background: #5f71f5;
        border: none;
        border-radius: 12px;
        color: #fff;
      }
      ::-webkit-input-placeholder {
        color: #fff;
      }
      .el-select__caret {
        color: #fff;
      }
    }
    .el-switch {
      .el-switch__label {
        color: #fff;
      }
    }
  }
  .info {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px 0 80px;
    min-height: 200px;
    position: relative;
    .lis {
      font-family: PingFang SC;
      .title {
        height: 90px;
        border-bottom: 1px solid #e4efff;
        display: flex;
        align-items: center;
        padding: 0 40px;
        .symbol {
          min-width: 200px;
          .names {
            font-size: 20px;
            font-weight: bold;
          }
        }
        ul {
          /* width: 1000px; */
          flex: 1;
          li {
            width: 25%;
            text-align: center;
            p {
              font-size: 14px;
              color: #7e87c2;
              line-height: 1;
              margin-bottom: 8px;
            }
            h2 {
              font-size: 18px;
              font-family: Roboto;
              font-weight: bold;
              line-height: 1;
            }
          }
        }
        .view {
          font-size: 15px;
        }
      }
    }
    .more {
      position: absolute;
      width: 100%;
      text-align: center;
      bottom: 20px;
    }
  }
}
.farm-select.el-select__popper.el-popper[role="tooltip"] {
  background: #5f71f5 !important;
  border: 0 !important;
  border-radius: 10px;
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    background: #5f71f5;
  }
  .el-select-dropdown__item {
    span {
      color: #fff;
    }
    &:hover {
      background: #596ae8;
    }
  }
  .el-popper__arrow:before {
    background: #5f71f5;
    border: 0 !important;
  }
}
@media screen and (max-width: 800px) {
  .farm .top {
    width: 300px;
    .tab-item {
      width: 150px;
    }
  }
}
</style>
