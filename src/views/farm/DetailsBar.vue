<template>
  <div class="details">
    <div class="getLp">
      <p class="click">
        获取NULS-ETH LP
        <i class=""></i>
      </p>
      <p class="click">
        查看交易对信息
        <i class=""></i>
      </p>
    </div>
    <div class="biaoge">
      <div class="gain">
        <div class="left">
          <div class="info-title">{{ tokenInfo.syrupTokenSymbol }}收益</div>
          <p>{{ tokenInfo.pendingReward }}</p>
          <span>≈${{ tokenInfo.pendingRewardUSD }}</span>
        </div>
        <div class="right">
          <el-button
            class="btns"
            type="primary"
            size="small"
            @click="gather(tokenInfo)"
          >
            收取
          </el-button>
        </div>
      </div>
      <div class="alter">
        <div class="left">
          <div class="info-title">已质押LP</div>
          <p>{{ tokenInfo.stakedTokenAmount }}</p>
        </div>
        <div class="right">
          <el-button
            class="btns"
            type="primary"
            size="small"
            icon="el-icon-minus"
            @click="minusLP(tokenInfo)"
          ></el-button>
          <el-button
            class="btns"
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="addLP(tokenInfo)"
          ></el-button>
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
      default: () => {}
    },
    showId: {
      type: Boolean,
      default: false
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
    gather(tokenInfo: any) {
      //console.log(tokenInfo);
      // this.$emit("charge", tokenInfo);
    },

    /**
     * @disc: 减少 LP
     * @params: tokenInfo token信息
     * @date: 2021-05-21 16:06
     * @author: Wave
     */
    minusLP(tokenInfo: any) {
      // this.$emit("openDialogAddOrMinus", tokenInfo, "minus");
    },

    /**
     * @disc: 添加 LP
     * @params: tokenInfo token信息
     * @date: 2021-05-21 16:06
     * @author: Wave
     */
    addLP(tokenInfo: any) {
      // this.$emit("openDialogAddOrMinus", tokenInfo, "add");
    }
  }
};
</script>

<style lang="scss">
.details {
  /* height: 148px; */
  padding: 20px 60px 20px 40px;
  background: #fafcff;
  border-bottom: 1px solid #e4efff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .getLp {
    min-width: 200px;
    p {
      font-size: 16px;
      font-weight: 500;
      color: #4a5ef2;
      line-height: 24px;
      margin-top: 8px;
      &:first-child {
        margin: 0;
      }
    }
  }
  .biaoge {
    flex: 1;
    display: flex;
    .gain,
    .alter {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-left: 60px;
      height: 108px;
      padding: 20px 40px;
      background: #fff;
      border: 1px solid #e4efff;
      border-radius: 10px;
      .left {
        .info-title {
          font-size: 14px;
          margin-bottom: 5px;
        }
        p {
          font-size: 20px;
          font-weight: bold;
        }
        span {
          font-size: 14px;
          font-weight: bold;
          color: #858fb1;
        }
      }
      .btns {
        width: 100px;
        height: 38px;
        background: #4a5ef2;
        border-radius: 6px;
      }
    }
    .alter {
      .btns {
        width: 70px;
        margin-left: 20px;
        i {
          font-size: 20px;
        }
      }
    }
  }
}
</style>
