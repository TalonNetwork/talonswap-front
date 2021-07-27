type EnvType = "beta" | "prod";

const env = process.env.BUILD_ENV as EnvType;
const IS_DEV = process.env.NODE_ENV === "development";
console.log(env, 789789, process.env);

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
    API_URL: "/api",
    WS_URL,
    chainId: 5,
    timeout
  },
  prod: {
    isBeta: false,
    API_URL: "/api",
    WS_URL,
    chainId: 9,
    timeout
  }
};

export default config[env];

