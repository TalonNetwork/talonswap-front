import { reactive, toRefs } from "vue";
import { listen, unListen } from "@/api/promiseSocket";
import * as subSocket from "@/api/websocket";
import config from "@/config";
import {
  genId,
  Division,
  divisionAndFix,
  divisionDecimals,
  Times,
  tofix
} from "@/api/util";
import { contractAddress, abi, abiTwo, abiThree } from "./contractConfig";
// @ts-ignore
import { ETransfer } from "@/api/api";
import { ethers } from "ethers";
// @ts-ignore
import { uniAssetPrice } from "@/model";

const url = config.WS_URL;

export interface TalonFarmItem {
  farmHash: string;
  name: string;
  lockedTime: number; // 允许解锁时间
  stakeTokenChainId: number; // 质押资产链id
  stakeTokenAssetId: number; // 质押资产id
  stakeTokenDecimals: number; // 质押资产小数位数
  stakeTokenSymbol: string; // 质押资产简写
  syrupTokenChainId: number; // 奖励资产链id
  syrupTokenAssetId: number; // 奖励资产id
  syrupTokenDecimals: number; // 奖励资产小数位数
  syrupTokenSymbol: string; // 奖励资产简写
  syrupTokenBalance: number; // pool中奖励资产余额
  stakeTokenBalance: number; // pool中质押资产总量
  totalSyrupAmount: number; // pool总的奖励资产
  apr: number; // 年化收益
  tatalStakeTokenUSD: number; // 质押资产总价值
  swapPairAddress: string; // lp资产时，对应的swap交易对地址
  orderNum: number;
  showDetail: boolean;
  stakeAmount: number; // 用户已参与质押数量
  stakeUSD: number; // 用户已参与质押USD
  pendingReward: number; // 用户未领取奖励数量
  pendingRewardUSD: number; // 用户未领取奖励USD
}

interface UserStakeFarm {
  farmHash: string;
  syrupTokenBalance: number;
  stakeTokenBalance: number;
  apr: number;
  tatalStakeTokenUSD: number;
  stakedTokenAmount: number;
  pendingReward: number;
  pendingRewardUSD: number;
}

interface Data {
  talonList: TalonFarmItem[];
  uniList: any[];
}

export default function useData() {
  const state = reactive<Data>({
    talonList: [],
    uniList: []
  });
  async function getFarmData() {
    const channel = "farmList";
    const params = {
      method: channel,
      id: genId()
    };
    const data: any = await listen({
      url,
      channel,
      params: {
        cmd: true,
        channel: "cmd:" + JSON.stringify(params)
      }
    });
    data.map((v: TalonFarmItem) => {
      v.stakeAmount = 0;
      v.stakeUSD = 0;
      v.pendingRewardUSD = 0;
      v.pendingReward = 0;
    });
    state.talonList = data;
  }

  // 用户参与的farm
  function getUserFarm(address: string) {
    if (!address) return;
    const channel = "farmListSub";
    subSocket.listen({
      url,
      channel,
      params: {
        cmd: false,
        channel: channel + ":" + address
      },
      success(data) {
        const totalList = [...state.talonList];
        if (totalList.length) {
          data.map((item: UserStakeFarm) => {
            totalList.map(v => {
              if (v.farmHash === item.farmHash) {
                v.stakeAmount = item.stakedTokenAmount;
                v.stakeUSD = item.tatalStakeTokenUSD;
                v.pendingRewardUSD = item.pendingRewardUSD;
                v.pendingReward = item.pendingReward;
              }
            });
          });
        }
        state.talonList = totalList;
      }
    });
  }

  async function getUniData(address?: string) {
    const transfer = new ETransfer();
    const provider = transfer.provider;
    // pool合约信息
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const poolLengthValue = await contract.poolLength();
    const poolLength = Number(poolLengthValue.toString());
    const tokenList = [];
    const uniList = [...state.uniList];
    for (let item = 0; item < poolLength; item++) {
      const tokenInfo = {
        name: "",
        stakeTokenSymbol: "",
        syrupTokenSymbol: "",
        stakeTokenDecimals: 0,
        lpToken: "", // 质押资产合约
        candyToken: "", // 奖励资产合约
        syrupTokenBalance: "",
        pendingReward: "",
        stakeAmount: "",
        stakeUSD: "",
        stakedTokenAmount: "",
        tatalStakeTokenUSD: "",
        syrupTokenDecimals: "",
        apr: "",
        farmHash: item,
        showDetail: false,

        // earnings: "0",
        // earningsSymbol: "",
        // annualEarnings: "",
        // //APR = 365 * ( 每日出块数量  * candyPrice 1 * candyPerBlock / candyDecimals )
        // //除以
        // //( lpPrice 1 * lpSupply / lpDecimals )
        // totalValue: "",
        // totalReward: "",
        // lpBalance: "0",
        // lpPledged: "0",
        // lpDecimals: "",
        // candyDecimals: "",
        // showId: false,
        // pid: Number(item)
      };

      // console.log(uniList[item], uniList[item]?.showDetail, item, 9966)
      tokenInfo.showDetail = uniList[item]?.showDetail;


      const poolInfoValue = await contract.poolInfo(item);
      tokenInfo.lpToken = poolInfoValue[0];
      tokenInfo.candyToken = poolInfoValue[1];

      //{'lpToken','candyToken','lastRewardBlock','accPerShare','candyPerBlock','lpSupply','candyBalance'};
      //{'name','earnings','annualEarnings','totalValue','totalReward'}

      // 质押资产信息
      const contractTwo = new ethers.Contract(
        tokenInfo.lpToken,
        abiTwo,
        provider
      );
      tokenInfo.name = tokenInfo.stakeTokenSymbol = await contractTwo.symbol();

      const decimalsValue = await contractTwo.decimals();
      tokenInfo.stakeTokenDecimals = decimalsValue.toString();
      tokenInfo.syrupTokenBalance = divisionAndFix(
        poolInfoValue[6],
        tokenInfo.stakeTokenDecimals,
        2
      );
      if (address) {
        const pendingTokenValue = await contract.pendingToken(
          item,
          address
        );
        console.log(pendingTokenValue, "====pendingTokenValue====");
        tokenInfo.pendingReward = divisionDecimals(
          pendingTokenValue.toString(),
          tokenInfo.stakeTokenDecimals
        );

        // console.log(tokenInfo.pendingReward, 99)

        const userInfoValue = await contract.userInfo(item, address);
        tokenInfo.stakeAmount = divisionDecimals(
          userInfoValue[0].toString(),
          tokenInfo.stakeTokenDecimals
        );

        const balanceOfValue = await contractTwo.balanceOf(address);
        tokenInfo.stakeUSD = divisionDecimals(
          balanceOfValue.toString(),
          tokenInfo.stakeTokenDecimals
        );
      }

      // 奖励资产信息
      const contractThree = new ethers.Contract(
        tokenInfo.candyToken,
        abiThree,
        provider
      );
      tokenInfo.syrupTokenSymbol = await contractThree.symbol();

      const earningsDecimals = await contractThree.decimals();
      // tokenInfo.candyDecimals = earningsDecimals.toString();
      tokenInfo.syrupTokenDecimals = earningsDecimals.toString();

      const dayNumber = 5760; //每日出块数量(86400/15=5760)
      // const candyPrice = 1; //todo 待取值
      // const lpPrice = 1; //todo 待取值
      const candyPrice = await uniAssetPrice(tokenInfo.syrupTokenSymbol);
      const lpPrice = await uniAssetPrice(tokenInfo.stakeTokenSymbol);
      // console.log(candyPrice, lpPrice, tokenInfo.syrupTokenSymbol, tokenInfo.stakeTokenSymbol)
      // 每天产生的奖励总价值
      const c = Times(
        Times(dayNumber, candyPrice),
        poolInfoValue[4]
      ).toString();
      //const a = 365 * (5760 * 1 * 88 / tokenInfo.candyDecimals); //365 * ( 每日出块数量  * candyPrice * candyPerBlock / candyDecimals )
      const a = Times("365", Division(c, tokenInfo.syrupTokenDecimals)).toString();
      //const b = 1 * 200000 / 50;  //lpPrice 1 * lpSupply / lpDecimals
      const b = Division(
        Times(lpPrice, poolInfoValue[5]),
        tokenInfo.stakeTokenDecimals
      ).toString();
      //APR = 365 * ( 每日出块数量  * candyPrice 1 * candyPerBlock / candyDecimals )
      //除以
      //( lpPrice 1 * lpSupply / lpDecimals )
      tokenInfo.apr = Division(a, b).toFixed(2);

      tokenInfo.tatalStakeTokenUSD = Times(
        lpPrice.toString(),
        divisionDecimals(poolInfoValue[5], tokenInfo.stakeTokenDecimals)
      ).toString();

      tokenList.push(tokenInfo);
    }
    state.uniList = tokenList;
  }


  async function getUserUniFarm(address: string) {}

  return {
    ...toRefs(state),
    getFarmData,
    getUserFarm,
    getUniData
  };
}
