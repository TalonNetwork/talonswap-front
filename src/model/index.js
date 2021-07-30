import { listen, unListen } from "@/api/promiseSocket";
import { createRPCParams } from "@/api/util";
import config from "@/config";

const url = config.WS_URL;

//广播hex
export async function broadcastHex(txHex) {
  const channel = "broadcastTx";
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
  return res;
}

// 获取账户资产列表
export async function getAssetList(address) {
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
  return res;
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
