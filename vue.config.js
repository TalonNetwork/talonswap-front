const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];
const isProduction = process.env.NODE_ENV === "production";
const proxyUrl =
  process.env.BUILD_ENV === "prod"
    ? "https://wallet.nerve.network/"
    : "http://seeda.nuls.io:8009";
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  configureWebpack: config => {
    // if (isProduction) {
    //   config.plugins.push(
    //     new CompressionWebpackPlugin({
    //       algorithm: "gzip",
    //       test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
    //       threshold: 10240,
    //       minRatio: 0.8
    //     })
    //   );
    // }
    config.plugins.push(
      new webpack.DefinePlugin({
        //定义全局变量
        "process.env": {
          BUILD_ENV: JSON.stringify(process.env.BUILD_ENV)
        }
      })
    );
    /* config.externals = {
      'vue': 'Vue',
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'moment': 'moment',
      'element-ui': 'ELEMENT',
      'echarts': 'echarts',
    } */
  },

  devServer: {
    port: 8031,
    host: "0.0.0.0",
    https: false,
    open: true,
    proxy: {
      "/api": {
        target: proxyUrl,
        changeOrigin: true,
        pathRewrite: {
          // "^/api": ""
        }
      },
      "/test": {
        target: "http://xm_mp_dev.zhoulijun.top/api",
        changeOrigin: true,
        pathRewrite: {
          "^/test": ""
        }
      }
    }
  }
};
