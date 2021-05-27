<template>
  <div class="w1300 header">
    <div class="fl logo" @click="toUrl('home')"><img class="fl" src="./../assets/talon.svg"><span
            class="fl">Talon</span></div>
    <el-menu class="fl menu" mode="horizontal" @select="handleSelect" :default-active="activeIndex"
             background-color="#3A4BE1"
             text-color="#fff"
             active-text-color="#ffd04b">
      <!--  <el-menu-item index="assets">资产</el-menu-item>
        <el-menu-item index="trading">交易</el-menu-item>
        <el-menu-item index="liquidity">流动性</el-menu-item>
        <el-menu-item index="farm">Farm</el-menu-item>
        <el-menu-item index="info">Info</el-menu-item>-->
    </el-menu>
    <div class="fr account">
      <!--<i class="el-icon-s-finance"></i>-->
      <div class="connection" v-if="!account" @click="chooseWallet">连接钱包</div>
      <div class="fr click address" v-else>{{superLong(account,5)}}</div>
    </div>
    <div class="clear"></div>

    <el-dialog title="Connect to a wallet" custom-class="connect-dialog" width="420px" v-model="walletDialog">
      <div class="list">
        <div class="lis" @click="connectTo('MetaMast')">
          <span>MetaMast</span>
          <img style="width: 42px;" src="./../assets/img/nabox.svg"/>
        </div>
        <div class="lis lis-d" @click="connectTo('Nabox')">
          <span>Nabox</span>
          <img src="./../assets/img/walletconnect-logo.svg"/>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import {ref, defineComponent} from 'vue'
  //import {superLong} from './../../utils/utils.js'
  import {superLong} from "../api/util";

  export default defineComponent({
    name: 'Header',
    props: {
      /*msg: {
        type: String,
        required: true
      }*/
    },
    setup: () => {
      const count = ref(0);
      return {count}
    },
    data() {
      return {
        account: '',
        activeIndex: 'home',
        walletDialog: false,
      };
    },
    mounted() {
      this.metamask = window.ethereum;
      if (this.metamask) {
        this.account = window.ethereum.selectedAddress;
        this.$store.dispatch("setAccount", this.account);
      } else {
        this.hasMetaMask = false
      }
      setInterval(() => {
        this.account = window.ethereum.selectedAddress;
        this.$store.dispatch("setAccount", this.account);
      }, 1000)
    },
    methods: {

      /**
       * @disc: 导航跳转
       * @params:
       * @date: 2021-05-18 16:40
       * @author: Wave
       */
      handleSelect(key) {
        this.toUrl(key)
      },

      superLong(str, len = 9) {
        return superLong(str, len);
      },

      //连接钱包
      chooseWallet() {
        this.walletDialog = true
      },

      /**
       * @disc: 连接到插件
       * @params: wallet name
       * @date: 2021-03-10 13:52
       * @author: Wave
       */
      connectTo(walletName) {
        if (walletName === 'MetaMast') {
          this.getAccount();
        }
      },

      //连接metamask
      async getAccount() {
        if (window.ethereum) {
          try {
            await window.ethereum.request({method: 'eth_requestAccounts'});
            this.walletDialog = false;
            this.account = window.ethereum.selectedAddress;
            this.$store.dispatch("setAccount", this.account);
          } catch (e) {
            console.error('连接metamask失败' + e);
            this.walletDialog = false;
          }
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
  .header {
    .logo {
      width: 98px;
      height: 28px;
      margin: 20px 80px 0 0;
      img {
        width: 30px;
      }
      span {
        color: #ffffff;
        padding: 3px 0 0 5px;
        font-weight: bold;
        font-size: 16px;
      }
    }
    .menu {
      background-color: #3A4BE1;
      border-bottom: 0;
      margin-top: 15px;
      .el-menu-item {
        font-size: 16px;
        font-family: PingFang SC;
        font-weight: 500;
        color: #FFFFFF;
        line-height: 36px;
      }
      .is-active {
        border-bottom: 0;
      }
      &:hover {
        background-color: transparent;
      }
    }
    .account {
      width: 185px;
      height: 36px;
      margin: 20px 0 0 0;
      font-size: 30px;
      font-family: PingFang SC;
      font-weight: 500;
      color: #fff;
      line-height: 36px;
      padding: 0 10px 0 20px;
      .connection {
        text-align: center;
        outline: none;
        text-decoration: none;
        -webkit-box-pack: center;
        justify-content: center;
        position: relative;
        z-index: 1;
        font-size: 16px;
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        -webkit-box-align: center;
        align-items: center;
        padding: 5px;
        border-radius: 10px;
        cursor: pointer;
        user-select: none;
        font-weight: 500;
        background-color: rgba(21, 61, 111, 0.44);
        border: 1px solid rgba(21, 61, 111, 0.44);
        color: #fff;
      }
      .address {
        width: 120px;
        height: 36px;
        border: 1px solid #4A5EF2;
        border-radius: 18px;
        font-size: 16px;
        color: #4A5EF2;
        padding: 0 0 0 15px;
        background-color: #fff;
      }
    }
    .connect-dialog {
      .el-dialog__header {
        flex-flow: row nowrap;
        padding: 1rem;
        font-weight: 500;
        color: inherit;
        line-height: 0;
      }
      .el-dialog__body {
        padding: 0;
        .list {
          background-color: rgb(247, 248, 250);
          padding: 2rem;
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
          .lis {
            background-color: rgb(247, 248, 250);
            outline: none;
            border: 1px solid rgb(237, 238, 242);
            border-radius: 12px;
            display: flex;
            flex-direction: row;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: justify;
            justify-content: space-between;
            padding: 1rem;
            opacity: 1;
            height: 80px;
            margin-bottom: 1rem;
            cursor: pointer;
            &:hover {
              border-color: #53b8a9;
            }
            span {
              flex-flow: row nowrap;
              color: rgb(0, 0, 0);
              font-size: 1rem;
              font-weight: 500;
            }
            img {
              width: 50px;
              float: right;
            }
          }
          .lis-d {
            cursor: default;
            span {
              color: #c0c4cc;
            }
            &:hover {
              border-color: #edeef2;
            }
          }
        }
      }
    }
  }
</style>
