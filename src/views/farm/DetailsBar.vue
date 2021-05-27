<template>
  <div class="w1300 details" v-show="showId">
    <div class="fl getLp">
      <p class="click">获取NULS-ETH LP <i class=""></i></p>
      <p class="click">查看交易对信息 <i class=""></i></p>
    </div>
    <div class="fr biaoge">
      <div class="fl gain">
        <div class="fl">
          <h6>Tolon收益</h6>
          <h5>{{tokenInfo.earnings}}</h5>
          <h4>≈$8.88888</h4>
        </div>
        <div class="fr">
          <el-button class="btns" type="primary" size="small" @click="gather(tokenInfo)">
            收取
          </el-button>
        </div>
      </div>
      <div class="fl alter">
        <div class="fl">
          <h6>已质押LP</h6>
          <h5>{{tokenInfo.lpPledged}}</h5>
        </div>
        <div class="fr">
          <el-button class="btns" type="primary" size="small" icon="el-icon-minus" @click="minusLP(tokenInfo)">
          </el-button>
          <el-button class="btns" type="primary" size="small" icon="el-icon-plus" @click="addLP(tokenInfo)">
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    name: "details-bar",
    props: {
      tokenInfo: {
        type: Object,
        default: () => {
        }
      },
      showId: {
        type: Boolean,
        default: () => {
          false
        }
      }
    },
    mounted() {
      //console.log(this.tokenInfo);
    },
    methods: {

      /**
       * @disc: 收取
       * @params: tokenInfo token信息
       * @date: 2021-05-21 16:06
       * @author: Wave
       */
      gather(tokenInfo) {
        //console.log(tokenInfo);
        this.$emit('charge', tokenInfo);
      },

      /**
       * @disc: 减少 LP
       * @params: tokenInfo token信息
       * @date: 2021-05-21 16:06
       * @author: Wave
       */
      minusLP(tokenInfo) {
        this.$emit('openDialogAddOrMinus', tokenInfo, 'minus');
      },

      /**
       * @disc: 添加 LP
       * @params: tokenInfo token信息
       * @date: 2021-05-21 16:06
       * @author: Wave
       */
      addLP(tokenInfo) {
        this.$emit('openDialogAddOrMinus', tokenInfo, 'add');
      },
    }
  }
</script>

<style lang="scss">
  .details {
    margin: 0 0 0 0;
    height: 148px;
    font-family: PingFang SC;
    background: #FAFCFF;
    .getLp {
      width: 300px;
      text-align: center;
      margin: 40px 0 0 0;
      p {
        font-size: 16px;
        font-weight: 500;
        color: #4A5EF2;
        line-height: 30px;
      }
    }
    .biaoge {
      width: 1000px;
      margin: 20px 0 0 0;
      .gain, .alter {
        height: 108px;
        width: 390px;
        background: #FFFFFF;
        border: 1px solid #E4EFFF;
        border-radius: 5px;
        h6 {
          font-size: 14px;
          font-weight: 500;
          color: #3A3C44;
          padding: 20px 0 0 0;
          margin: 0 0 0 40px;
        }
        h5 {
          font-size: 20px;
          font-weight: bold;
          color: #3A3C44;
          margin: 0 0 0 40px;
        }
        h4 {
          font-size: 14px;
          font-weight: bold;
          color: #858FB1;
          margin: 0 0 0 40px;
        }
        .btns {
          width: 100px;
          height: 38px;
          background: #4A5EF2;
          margin: 35px 40px 35px 0;
        }
      }
      .alter {
        margin: 0 0 0 60px;
        h6 {
          font-size: 14px;
          font-weight: 500;
          color: #3A3C44;
        }
        h5 {
          font-size: 20px;
          font-weight: bold;
          color: #3A3C44;
        }
        .btns {
          width: 70px;
          i {
            font-size: 20px;
          }
        }
      }
    }

  }
</style>
