<template>
  <div class="w1300 farm" v-loading="farmLoading"
       element-loading-text="拼命加载中"
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.5)">
    <div class="top">
      <div class="fl uni isActive">Uniswap Farm</div>
      <div class="fr click talon">Talon Farm</div>
    </div>
    <div class="clear"></div>
    <div class="w1300 search" v-show="false">
      <div class="fl sort">
        <el-select v-model="sortValue" placeholder="请选择">
          <el-option
                  v-for="item in sortList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div class="fr mortgage">
        <el-switch
                style="display: block"
                v-model="mortgageValue"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="只看已抵押"
                inactive-text="">
        </el-switch>
      </div>
    </div>
    <div class="clear"></div>
    <div class="info">
      <div class="lis" v-for="item of tokenList">
        <div class="title">
          <div class="fl symbol">
            <div class="logos">
              <!--<img src="./../assets/imges/eth.png" />
              <img src="./../assets/imges/usdt.png" />-->
            </div>
            <!--  <div class="names">NVT/USDT</div>-->
            <div class="names">{{item.name}}</div>
          </div>
          <ul class="fl">
            <li class="fl">
              <p>收益</p>
              <h2>{{item.earnings}} {{item.earningsSymbol}}</h2>
            </li>
            <li class="fl">
              <p>年化收益</p>
              <h2>{{item.annualEarnings}}%</h2>
            </li>
            <li class="fl">
              <p>流动性总价值</p>
              <h2>${{item.totalValue}}</h2>
            </li>
            <li class="fl">
              <p>剩余总奖励</p>
              <h2>{{item.totalReward}} {{item.earningsSymbol}}</h2>
            </li>
          </ul>
          <div class="fr click view" @click="showId(item)">
            详情
            <i :class="item.showId ? 'el-icon-arrow-down':'el-icon-arrow-right'"></i>
          </div>
        </div>
        <div class="clear"></div>
        <DetailsBar :tokenInfo="item" :showId="item.showId" @openDialogAddOrMinus="openDialogAddOrMinus"
                    @charge="charge">
        </DetailsBar>
        <div class="clear"></div>
      </div>
    </div>

    <el-dialog title="" center width="470px" custom-class="addOrMinus" v-model="dialogAddOrMinus"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :show-close="false">
      <div class="titles">{{addOrMinus ==='add' ? '添加':'取回'}}LP</div>
      <div class="infos">
        <div class="in">
          <span class="fl">{{addOrMinus ==='add' ? '添加':'取回'}}LP</span>
          <label class="fr">余额：{{tokenInfo.lpBalance}}</label>
        </div>
        <div class="clear"></div>
        <div class="to">
          <el-input v-model="numberValue" class="fl" placeholder="0"></el-input>
          <span class="fl click max" @click="clickMax">最大</span>
          <span class="fr lp">{{tokenInfo.name}}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogAddOrMinus = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddOrMinus">确 定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts">
  import {ethers} from 'ethers';
  import {ElMessage} from 'element-plus'
  import {divisionDecimals, Minus, timesDecimals, Division, Times, tofix} from "../../api/util";
  import DetailsBar from './DetailsBar.vue'

  export default ({
    name: 'Farm',
    data() {
      return {
        contractAddress: "0x0faee22173db311f4c57c81ec6867e5deef6c218",//合约地址
        sortList: [
          {value: '选项1', label: '黄金糕'},
          {value: '选项2', label: '双皮奶'},
        ],
        sortValue: '',
        mortgageValue: false,

        farmLoading: true,//加载动画
        tokenList: [],//token list
        tokenInfo: {},//弹框显示inof

        dialogAddOrMinus: false, //加减弹框
        formAddOrMinus: {
          nums: '',
        },
        addOrMinus: 'add',//加减类型
        numberValue: '',//数量

      }
    },
    components: {
      DetailsBar
    },
    computed: {
      /*account() {
        return this.$store.state.account;
      }*/
    },
    mounted() {
      this.init();
      let setIn = setInterval(async () => {
        let tokenList = await this.getTokenList(this.contractAddress);
        for (let item of tokenList) {
          for (let k of this.tokenList) {
            if (k.pid === item.pid) {
              k.earnings = item.earnings;
              k.totalReward = item.totalReward;
              k.lpPledged = item.lpPledged;
              k.lpBalance = item.lpBalance;
            }
          }
        }

        //clearInterval(setIn);
      }, 5000)
    },

    watch: {
      /*"$store.state.app.account": function () {
        console.log(this.$store.state.account, 'account')
      }*/
    },
    beforeDestroy() {
      //clearInterval(this.timer);
    },
    methods: {

      /**
       * @disc: init
       * @params:
       * @date: 2021-05-18 16:40
       * @author: Wave
       */
      async init() {
        this.farmLoading = true;
        this.tokenList = await this.getTokenList(this.contractAddress);
        //console.log(this.tokenList);
        this.farmLoading = false;
      },

      //详情
      showId(tokenInfo) {
        for (let item of this.tokenList) {
          if (item.pid === tokenInfo.pid) {
            item.showId = !item.showId;
          } else {
            item.showId = false;
          }
        }
      },

      /**
       * @disc:  获取token 列表
       * @params: contractAddress
       * @date: 2021-05-20 17:05
       * @author: Wave
       */
      async getTokenList(contractAddress) {
        // The Contract interface
        let abi = [
          "function owner() public view returns (address)",
          "function pendingToken(uint256 _pid, address _user) external view returns (uint256)",
          "function poolInfo(uint256 input) external view returns (address,address,uint256,uint256,uint256,uint256,uint256)",
          "function poolLength() external view returns (uint256)",
          "function userInfo(uint256 _pid, address _user) external view returns (uint256,uint256)"
        ];
        // Connect to the network
        let provider = ethers.getDefaultProvider('ropsten');
        // 使用Provider 连接合约，将只有对合约的可读权限
        let contract = new ethers.Contract(contractAddress, abi, provider);
        //console.log(contract);

        let poolLengthValue = await contract.poolLength();
        let poolLength = Array.from({length: Number(poolLengthValue.toString())});
        //console.log(poolLength);

        let tokenList = [];
        for (let item in poolLength) {
          let tokenInfo = {
            name: '',
            earnings: '0',
            earningsSymbol: '',
            annualEarnings: '',
            //APR = 365 * ( 每日出块数量  * candyPrice 1 * candyPerBlock / candyDecimals )
            //除以
            //( lpPrice 1 * lpSupply / lpDecimals )
            totalValue: '',
            totalReward: '',
            lpToken: '',
            lpBalance: '0',
            lpPledged: '0',
            candyToken: '',
            lpDecimals: '',
            candyDecimals: '',
            showId: false,
            pid: Number(item),
          };
          let poolInfoValue = await contract.poolInfo(Number(item));
          tokenInfo.lpToken = poolInfoValue[0];
          tokenInfo.candyToken = poolInfoValue[1];

          //{'lpToken','candyToken','lastRewardBlock','accPerShare','candyPerBlock','lpSupply','candyBalance'};
          //{'name','earnings','annualEarnings','totalValue','totalReward'}
          let abiTwo = [
            "function symbol() public view returns (string)",
            "function balanceOf(address account) external view returns (uint256)",
            "function decimals() public view returns (uint8)",
          ];
          let contractTwo = new ethers.Contract(tokenInfo.lpToken, abiTwo, provider);
          let symbolValue = await contractTwo.symbol();
          tokenInfo.name = symbolValue.toString();
          let decimalsValue = await contractTwo.decimals();
          tokenInfo.lpDecimals = decimalsValue.toString();
          tokenInfo.totalReward = divisionDecimals(poolInfoValue[6].toString(), Number(tokenInfo.lpDecimals)).toString();

          if (this.$store.state.account) {
            let pendingTokenValue = await contract.pendingToken(Number(item), this.$store.state.account);
            tokenInfo.earnings = divisionDecimals(pendingTokenValue.toString(), Number(tokenInfo.lpDecimals)).toString();

            let userInfoValue = await contract.userInfo(Number(item), this.$store.state.account);
            tokenInfo.lpPledged = divisionDecimals(userInfoValue[0].toString(), Number(tokenInfo.lpDecimals)).toString();

            let balanceOfValue = await contractTwo.balanceOf(this.$store.state.account);
            tokenInfo.lpBalance = divisionDecimals(balanceOfValue.toString(), Number(tokenInfo.lpDecimals)).toString();
          }


          let abiThree = [
            "function symbol() public view returns (string)",
            "function decimals() public view returns (uint8)"
          ];
          let contractThree = new ethers.Contract(tokenInfo.candyToken, abiThree, provider);
          let earningsSymbol = await contractThree.symbol();
          tokenInfo.earningsSymbol = earningsSymbol.toString();

          let earningsDecimals = await contractThree.decimals();
          tokenInfo.candyDecimals = earningsDecimals.toString();

          let dayNumber = 5760;//每日出块数量(86400/15=5760)
          let candyPrice = 1;//todo 待取值
          let lpPrice = 1;//todo 待取值
          let c = Times(Times(dayNumber.toString(), candyPrice.toString()).toString(), poolInfoValue[4].toString()).toString();
          //let a = 365 * (5760 * 1 * 88 / tokenInfo.candyDecimals); //365 * ( 每日出块数量  * candyPrice * candyPerBlock / candyDecimals )
          let a = Times('365', (Division(c, tokenInfo.candyDecimals).toString())).toString();
          //let b = 1 * 200000 / 50;  //lpPrice 1 * lpSupply / lpDecimals
          let b = Division(Times(lpPrice.toString(), poolInfoValue[5].toString()).toString(), tokenInfo.lpDecimals).toString();
          //APR = 365 * ( 每日出块数量  * candyPrice 1 * candyPerBlock / candyDecimals )
          //除以
          //( lpPrice 1 * lpSupply / lpDecimals )
          tokenInfo.annualEarnings = tofix(Division(a.toString(), b.toString()).toString(), 2, 1);

          tokenInfo.totalValue = Times(lpPrice.toString(), divisionDecimals(poolInfoValue[5], Number(tokenInfo.lpDecimals))).toString();

          tokenList.push(tokenInfo);
        }
        return tokenList
      },

      /**
       * @disc: 获取收益
       * @params:
       * @date: 2021-05-25 17:22
       * @author: Wave
       */
      charge(tokenInfo) {
        this.tokenInfo = tokenInfo;
        this.LPOperation(this.numberValue, 2)
      },

      //打开加减弹框
      openDialogAddOrMinus(tokenInfo, addOrMinus) {
        this.numberValue = "";
        this.dialogAddOrMinus = true;
        this.addOrMinus = addOrMinus;
        this.tokenInfo = tokenInfo
      },

      //选择最大
      clickMax() {
        this.numberValue = this.addOrMinus === 'add' ? this.tokenInfo.lpBalance : this.tokenInfo.lpPledged;
      },

      //确定提交
      async confirmAddOrMinus() {
        if (!this.numberValue) {
          ElMessage.warning({message: '请输入正确的数量', type: 'warning', center: true});
          return;
        }

        if (this.addOrMinus === 'add') {
          console.log(this.tokenInfo.lpToken, this.contractAddress, this.$store.state.account);
          //查询是否授权
          let allOwance = await this.getERC20Allowance(this.tokenInfo.lpToken, this.contractAddress, this.$store.state.account);
          //console.log(allOwance, "allOwance");
          if (!allOwance) { //没授权先授权
            let resData = await this.getApproveERC20Hex(this.tokenInfo.lpToken, this.contractAddress, this.$store.state.account);
            //console.log("授权结果：", resData);
            ElMessage.success({message: 'ERC20授权信息已发出，请稍等几分钟重试！', type: 'success', center: true});
            this.dialogAddOrMinus = false;
          } else {
            this.LPOperation(this.numberValue, 0)
          }
        } else {
          this.LPOperation(this.numberValue, 1)
        }

      },

      /**
       * @disc: 添加 、减少 lp  领取收益
       * @params: 金额
       * @type: 类型 0:添加 1：减少 2：领取收益
       * @date: 2021-05-25 17:16
       * @author: Wave
       */
      async LPOperation(amount: string, type: number) {
        let abi = [{
          "anonymous": false,
          "inputs": [{"indexed": true, "internalType": "address", "name": "user", "type": "address"}, {
            "indexed": true,
            "internalType": "uint256",
            "name": "pid",
            "type": "uint256"
          }, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "Deposit",
          "type": "event"
        }, {
          "anonymous": false,
          "inputs": [{"indexed": true, "internalType": "address", "name": "user", "type": "address"}, {
            "indexed": true,
            "internalType": "uint256",
            "name": "pid",
            "type": "uint256"
          }, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "EmergencyWithdraw",
          "type": "event"
        }, {
          "anonymous": false,
          "inputs": [{
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          }, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
          "name": "OwnershipTransferred",
          "type": "event"
        }, {
          "anonymous": false,
          "inputs": [{"indexed": true, "internalType": "address", "name": "user", "type": "address"}, {
            "indexed": true,
            "internalType": "uint256",
            "name": "pid",
            "type": "uint256"
          }, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "Withdraw",
          "type": "event"
        }, {
          "inputs": [{
            "internalType": "contract IERC20",
            "name": "_lpToken",
            "type": "address"
          }, {"internalType": "contract IERC20", "name": "_candyToken", "type": "address"}, {
            "internalType": "uint256",
            "name": "_candyPerBlock",
            "type": "uint256"
          }, {"internalType": "uint256", "name": "_amount", "type": "uint256"}, {
            "internalType": "bool",
            "name": "_withUpdate",
            "type": "bool"
          }], "name": "add", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
          "inputs": [{"internalType": "uint256", "name": "_pid", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }, {"internalType": "bool", "name": "_withUpdate", "type": "bool"}],
          "name": "addCandy",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [{"internalType": "uint256", "name": "_pid", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
          "inputs": [{"internalType": "uint256", "name": "_pid", "type": "uint256"}],
          "name": "emergencyWithdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [{
            "internalType": "uint256",
            "name": "_startBlock",
            "type": "uint256"
          }, {"internalType": "address", "name": "_devAddr", "type": "address"}],
          "name": "initialize",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [],
          "name": "massUpdatePools",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [],
          "name": "owner",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [{"internalType": "uint256", "name": "_pid", "type": "uint256"}, {
            "internalType": "address",
            "name": "_user",
            "type": "address"
          }],
          "name": "pendingToken",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "name": "poolInfo",
          "outputs": [{
            "internalType": "contract IERC20",
            "name": "lpToken",
            "type": "address"
          }, {"internalType": "contract IERC20", "name": "candyToken", "type": "address"}, {
            "internalType": "uint256",
            "name": "lastRewardBlock",
            "type": "uint256"
          }, {"internalType": "uint256", "name": "accPerShare", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "candyPerBlock",
            "type": "uint256"
          }, {"internalType": "uint256", "name": "lpSupply", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "candyBalance",
            "type": "uint256"
          }],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [],
          "name": "poolLength",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [{"internalType": "uint256", "name": "_pid", "type": "uint256"}],
          "name": "updatePool",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
            "internalType": "address",
            "name": "",
            "type": "address"
          }],
          "name": "userInfo",
          "outputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "rewardDebt",
            "type": "uint256"
          }],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [{"internalType": "uint256", "name": "_pid", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }];
        let providers = new ethers.providers.Web3Provider(window.ethereum);
        let wallet = await providers.getSigner();
        let contracts = new ethers.Contract(this.contractAddress, abi, wallet);
        let resData = {};
        if (type === 0) {
          resData = await contracts.deposit(this.tokenInfo.pid, Number(timesDecimals(amount, 8)));
        } else if (type === 1) {
          resData = await contracts.withdraw(this.tokenInfo.pid, Number(timesDecimals(amount, 8)));
        } else if (type === 2) {
          resData = await contracts.deposit(this.tokenInfo.pid, 0);
        }
        console.log(resData);
        if (resData.hash) {
          ElMessage({message: '交易已发出，等待区块确认！', type: 'success', center: true});
          this.dialogAddOrMinus = true;
          if (this.dialogAddOrMinus) {
            this.dialogAddOrMinus = false;
          }
        }
      },

      /**
       * 查询erc20资产授权额度
       * @param contractAddress ERC20合约地址
       * @param multySignAddress 多签地址
       * @param address 账户eth地址
       */
      async getERC20Allowance(contractAddress: string, multySignAddress: string, address: string) {
        const ERC20_ABI = [
          "function allowance(address owner, address spender) external view returns (uint256)"
        ];
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
        const allowancePromise = contract.allowance(address, multySignAddress);
        return allowancePromise
          .then(allowance => {
            const baseAllowance = '396000000000000000';
            //已授权额度小于baseAllowance，则需要授权
            return Number(Minus(allowance.toString(), baseAllowance)) >= 0;
          })
          .catch(e => {
            console.error("获取erc20资产授权额度失败" + e);
            return true;
          });
      },

      /**
       * 授权erc20额度
       * @param contractAddress ERC20合约地址
       * @param multySignAddress 多签地址
       * @param address 账户eth地址
       */
      async getApproveERC20Hex(contractAddress: string, multySignAddress: string, address: string) {
        const ERC20_ABI = [
          "function approve(address spender, uint256 amount) external returns (bool)"
        ];
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let wallet = await provider.getSigner();
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
        //return await wallet.sign(transaction);
        // delete transaction.from   //etherjs 4.0 from参数无效 报错
        return wallet.sendTransaction(transaction);
      },

      //验证交易参数
      async validate(tx: any) {
        try {
          let provider = new ethers.providers.Web3Provider(window.ethereum);
          //console.log(provider);
          const result = await provider.call(tx);
          return ethers.utils.toUtf8String("0x" + result.substr(138));
        } catch (e) {
          return false;
        }
      },

      /**
       * @disc: url 连接
       * @params: name 路由名称
       * @params: parameter 路由参数
       * @params: url 跳转链接
       * @date: 2021-05-12 11:02
       * @author: Wave
       */
      toUrl(name, parameter = '', url = '') {
        if (url) {
          //let newUrl = EXPLORER_URL + 'address/info?address=' + name;
          window.open(url)
        } else {
          this.$router.push({name: name})
        }

      }
    }

  })
</script>

<style lang="scss">
  .farm {
    min-height: 750px;
    .top {
      width: 360px;
      height: 48px;
      margin: 46px auto 0;
      border-radius: 24px;
      background-color: #fff;
      .uni, .talon {
        width: 180px;
        height: 48px;
        text-align: center;
        line-height: 48px;
        color: #4A5EF2;
        font-size: 16px;
      }
      .isActive {
        background-color: #5F71F5;
        border-radius: 24px;
        margin: 0 0 0 -1px;
        color: #fff;
        border: 0 solid #5F71F5;
      }
    }
    .search {
      .sort {
        width: 150px;
        height: 40px;
        background: #5F71F5;
      }

    }
    .info {
      margin: 70px auto 0;
      background: #FFFFFF;
      border-radius: 20px;
      .lis {
        min-height: 114px;
        font-family: PingFang SC;
        .title {
          padding: 30px 0 0 0;
          height: 84px;
          border-bottom: 1px solid #E4EFFF;
          .symbol {
            margin: 0 0 0 40px;
            .logos {
            }
            .names {
              width: 110px;
              height: 16px;
              font-size: 20px;
              font-weight: bold;
              color: #3A3C44;
              line-height: 54px;
            }
          }
          ul {
            width: 1000px;
            li {
              width: 25%;
              text-align: center;
              p {
                font-size: 14px;
                font-weight: 400;
                color: #7E87C2;
                line-height: 30px;
              }
              h2 {
                font-size: 18px;
                font-family: Roboto;
                font-weight: bold;
                color: #3A3C44;
                line-height: 30px;
              }
            }
          }
          .view {
            width: 100px;
            font-size: 16px;
            font-weight: 500;
            color: #4A5EF2;
            line-height: 36px;
            margin: 10px 0 0 0;
          }
        }

      }
    }
    .addOrMinus {
      border-radius: 10px;
      .el-dialog__header {
        padding: 0;
      }
      .el-dialog__body {
        font-family: PingFang SC;
        .titles {
          font-size: 24px;
          font-weight: 600;
          color: #3A3C44;
          line-height: 36px;
          text-align: center;
          margin: 0 0 20px 20px;
        }
        .infos {
          width: 417px;
          height: 94px;
          background: #FFFFFF;
          border: 1px solid #E3EEFF;
          border-radius: 10px;
          .in {
            font-size: 14px;
            font-weight: 500;
            color: #7E87C2;
            padding: 15px 20px 15px 20px;
            height: 20px;
          }
          .to {
            .el-input {
              width: 100px;
              margin: 0 0 0 20px;
              .el-input__inner {
                border: transparent;
                height: 30px;
                line-height: 30px;
              }
            }
            span {
              font-size: 14px;
              font-weight: 600;
              color: #3A3C44;
            }
            .max {
              width: 36px;
              height: 24px;
              background: #E4E7FF;
              font-size: 12px;
              font-weight: 400;
              color: #4A5EF2;
              border-radius: 5px;
              text-align: center;
              line-height: 22px;
              margin: 8px 0 0 10px;
            }
            .lp {
              margin: 8px 20px 0 0;
            }
          }
        }
      }
      .el-dialog__footer {
        padding: 10px 0 60px 0;
        .dialog-footer {
          .el-button {
            width: 185px;
            height: 48px;
            background: #FFFFFF;
            border: 1px solid #4A5EF2;
          }
          .el-button--primary {
            background: #4A5EF2;
            margin: 0 0 0 30px;
          }
        }
      }
    }
  }
</style>
