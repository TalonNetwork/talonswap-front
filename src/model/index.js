import { listen } from "@/api/promiseSocket";
import { createRPCParams, divisionAndFix, Plus, Times } from "@/api/util";
import config from "@/config";

const url = config.WS_URL;

//广播hex
export async function broadcastHex(txHex) {
  const channel = "broadcastTx";
  // const channel = "validateTx";
  const params = createRPCParams(channel);
  params.params = params.params.concat([txHex]);
  const res = await listen({
    url,
    channel,
    params: {
      cmd: true,
      channel: "psrpc:" + JSON.stringify(params)
    }
  });
  // console.log(res, 999)
  return res;
}

// 获取账户资产列表
export async function getAssetList(address) {
  if (!address) return [];
  const channel = "getAccountLedgerList";
  const params = createRPCParams(channel);
  params.params.push(address);
  const res = await listen({
    url,
    channel,
    params: {
      cmd: true,
      channel: "psrpc:" + JSON.stringify(params)
    }
  });
  if (!res) return [];
  res.map(item => {
    const decimal = item.decimals;
    item.number = divisionAndFix(item.totalBalanceStr, decimal, decimal);
    item.locking = divisionAndFix(
      Plus(item.timeLock, item.consensusLockStr),
      decimal
    );
    item.available = divisionAndFix(item.balanceStr, decimal, decimal);
    item.valuation = Times(item.number, item.usdPrice).toFixed(2);
  });
  // 返回按字母排序
  const sortDataBySymbol = [...res].sort((a, b) => {
    return a.symbol > b.symbol ? 1 : -1;
  });
  return sortDataBySymbol;
}

// 获取区块信息
export async function getBlockInfo() {
  const channel = "getNodeInfo";
  const params = createRPCParams(channel);
  const res = await listen({
    url,
    channel,
    params: {
      cmd: true,
      channel: "psrpc:" + JSON.stringify(params)
    }
  });
  return res;
}

// 通过symbol获取资产价格
export async function uniAssetPrice(symbol) {
  const channel = "uniAssetPrice";
  const params = {
    method: channel,
    params: {
      symbol
    }
  };
  const res = await listen({
    url,
    channel,
    params: {
      cmd: true,
      channel: "cmd:" + JSON.stringify(params)
    }
  });
  return res;
}

// 通过chainId assetId查询资产价格
export async function getAssetPrice(chainId, assetId) {
  const channel = "assetPrice";
  const params = {
    method: channel,
    params: {
      chainId: Number(chainId),
      assetId: Number(assetId)
    }
  };
  const res = await listen({
    url,
    channel,
    params: {
      cmd: true,
      channel: "cmd:" + JSON.stringify(params)
    }
  });
  return res;
}

// 查询资产详情
export async function getAssetBalance(chainId, assetId, address) {
  const channel = "getAccountBalance";
  const params = createRPCParams(channel);
  params.params = params.params.concat([
    Number(chainId),
    Number(assetId),
    address
  ]);
  const res = await listen({
    url,
    channel,
    params: {
      cmd: true,
      channel: "psrpc:" + JSON.stringify(params)
    }
  });
  return res;
}

/**
 * swap 寻找最佳交易路径
 * data: {
 *  tokenInStr: "5-1", from资产chainId-assetId
 *  tokenInAmount: "100000000", from数量*精度
 *  tokenOutStr
 * }
 */
export async function getBestTradeExactIn(data) {
  const maxPairSize = data.maxPairSize || 3;
  const channel = "getBestTradeExactIn";
  const params = {
    method: channel,
    params: { ...data, maxPairSize }
  };
  const res = await listen({
    url,
    channel,
    params: {
      cmd: true,
      channel: "cmd:" + JSON.stringify(params)
    }
  });
  return res;
}
