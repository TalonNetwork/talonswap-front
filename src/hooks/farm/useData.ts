import { reactive, toRefs } from "vue";
import { listen, unListen } from "@/api/websocket";
import config from "@/config";
import { genId } from "@/api/util";

const url = config.WS_URL;

export interface TalonFarmItem {
  farmHash: string
  name: string,
  logo: string,
  logo2: string | undefined
  lockedTime: number, // 允许解锁时间
  stakeTokenChainId: number, // 质押资产链id
  stakeTokenAssetId: number, // 质押资产id
  stakeTokenDecimals: number, // 质押资产小数位数
  stakeTokenSymbol: string, // 质押资产简写
  syrupTokenChainId: number, // 奖励资产链id
  syrupTokenAssetId: number, // 奖励资产id
  syrupTokenDecimals: number, // 奖励资产小数位数
  syrupTokenSymbol: string, // 奖励资产简写
  syrupTokenBalance: number, // pool中奖励资产余额
  stakeTokenBalance: number, // pool中质押资产总量
  totalSyrupAmount: number, // pool总的奖励资产
  apr: number, // 年化收益
  tatalStakeTokenUSD: number, // 质押资产总价值
  swapPairAddress: string, // lp资产时，对应的swap交易对地址
  orderNum: number,
  logoList: string[],
  showDetail: boolean,
  stakeAmount: number, // 用户已参与质押数量
  stakeUSD: number, // 用户已参与质押USD
  pendingReward: number, // 用户未领取奖励数量
  pendingRewardUSD: number, // 用户未领取奖励USD
}



interface UserStakeFarm {
  farmHash: string,
  syrupTokenBalance: number,
  stakeTokenBalance: number,
  apr: number,
  tatalStakeTokenUSD: number,
  stakedTokenAmount: number,
  pendingReward: number,
  pendingRewardUSD: number
}


export default function useData() {
  const state = reactive({
    talonList: [] as TalonFarmItem[]
  });
  function getFarmData() {
    const channel = "farmList"
    const params = {
      method: channel,
      id: genId()
    };
    listen({
      url,
      channel,
      params: {
        cmd: true,
        channel: "cmd:" + JSON.stringify(params)
      },
      success: (data: TalonFarmItem[]) => {
        console.log(data, "===listen===");
        data.map((v: TalonFarmItem) => {
          v.logoList = v.logo2 ? [v.logo, v.logo2] : [v.logo]
          v.stakeAmount = 0;
          v.stakeUSD = 0;
          v.pendingRewardUSD = 0;
          v.pendingReward = 0;
        })
        state.talonList = data;
      }
    });
  }
  // 用户参与的farm
  function getUserFarm(address: string) {
    if (!address) return;
    const channel = "farmListSub"
    listen({
      url,
      channel,
      params: {
        cmd: false,
        channel: channel + ":" + address
      },
      success: (data: UserStakeFarm[]) => {
        console.log(data, "===listen===");
        const totalList = [...state.talonList]
        if (totalList.length) {
          data.map(item => {
            totalList.map(v => {
              if (v.farmHash === item.farmHash) {
                v.stakeAmount = item.stakedTokenAmount;
                v.stakeUSD = item.tatalStakeTokenUSD;
                v.pendingRewardUSD = item.pendingRewardUSD;
                v.pendingReward = item.pendingReward;
              }
            })
          })
          
        }
        state.talonList = totalList;
      }
    });
  }
  return {
    ...toRefs(state),
    getFarmData,
    getUserFarm
  };
}
