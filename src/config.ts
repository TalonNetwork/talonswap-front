type EnvType = "beta" | "prod";

const env = process.env.BUILD_ENV as EnvType;
const IS_DEV = process.env.NODE_ENV === "development";
// console.log(env, 789789, process.env);

function getWSUrl(): string {
  let url;
  if (IS_DEV) {
    // url = "ws://192.168.1.111:8009/ws";
    url = "ws://seeda.nuls.io:8009/ws";
  } else {
    const { host, protocol } = window.location;
    const wsProtocol = protocol === "http:" ? "ws:" : "wss:";
    url = wsProtocol + "//" + host + "/ws";
  }
  return url;
}

const WS_URL = getWSUrl();
const timeout = 15000;

const config = {
  beta: {
    isBeta: true,
    API_URL: "http://beta.public.nerve.network",
    WS_URL,
    chainId: 5,
    assetId: 1,
    prefix: "TNVT",
    symbol: "NVT",
    timeout,
    ETHNET: "ropsten",
    feeAddress: "TNVTdTSPP9oSLvdtVSVFiUYCvXJdj1ZA1nyQU", //提现费用地址
    destroyAddress: "TNVTdTSPGwjgRMtHqjmg8yKeMLnpBpVN5ZuuY" // 黑洞地址
  },
  prod: {
    isBeta: false,
    API_URL: "/api",
    WS_URL,
    chainId: 9,
    assetId: 1,
    prefix: "NVT",
    symbol: "NVT",
    timeout,
    ETHNET: "homestead",
    feeAddress: "",
    destroyAddress: ""
  }
};

export default config[env];
