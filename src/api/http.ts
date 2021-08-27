import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { genId } from "./util";
// import { Message, Modal } from 'view-design' // UI组件库
// import { Dialog, Toast } from "vant";
// import router from "@/router";

import config from "@/config";
axios.defaults.headers.post["Content-Type"] = "application/json";
const service = axios.create({
  baseURL: config.API_URL,
  timeout: config.timeout,
  withCredentials: false // send cookies when cross-domain requests
  // headers: {
  // 	// clear cors
  // 	'Cache-Control': 'no-cache',
  // 	Pragma: 'no-cache'
  // }
});
// Request interceptors
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  (error: any) => {
    Promise.reject(error);
  }
);
// Response interceptors
service.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response.data;
  },
  (error: any) => {
    // store.auth.clearAuth()
    // store.dispatch("clearAuth")
    return Promise.reject(error);
  }
);

export default service;

export function post(methodName: string, data: Array<any>) {
  return new Promise((resolve, reject) => {
    data.unshift(config.chainId);
    if (
      methodName === "getSymbolInfo" ||
      methodName === "getHeterogeneousMainAsset" ||
      methodName === "getBestSymbolPrice"
    ) {
      data.shift();
    }
    //console.log(data);
    const params = {
      jsonrpc: "2.0",
      method: methodName,
      params: data,
      id: genId()
    };
    //console.log(params);
    service.post("", params).then(
      response => {
        console.log(response, 456);
        // resolve(response.data);
      },
      err => {
        reject(err);
      }
    );
  });
}
