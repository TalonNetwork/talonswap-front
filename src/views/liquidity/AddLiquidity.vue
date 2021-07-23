<template>
  <div class="add-liquidity">
    <div class="head">
      <div class="back"><i class="el-icon-back" @click="back"></i></div>
      <h3>{{ $t("liquidity.liquidity7") }}</h3>
    </div>
    <custom-input></custom-input>
    <div class="add">
      <div></div>
    </div>
    <custom-input></custom-input>
    <div class="liquidity-info">
      <div class="name">{{ $t("liquidity.liquidity8") }}</div>
      <div class="content">
        <div class="flex1">
          <div>3764.47</div>
          <p>ETH Per USDT</p>
        </div>
        <div class="flex1">
          <div>0.0034</div>
          <p>ETH Per USDT</p>
        </div>
        <div class="flex1">
          <div>3.56%</div>
          <p>{{ $t("liquidity.liquidity11") }}</p>
        </div>
      </div>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary">{{ $t("liquidity.liquidity9") }}</el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import CustomInput from "@/components/CustomInput.vue";
export default defineComponent({
  name: "addLiquidity",
  components: {
    CustomInput
  },
  setup(props, context) {
    function back() {
      context.emit("update:show", false);
    }
    return {
      back
    };
  }
});
</script>

<style lang="scss" scoped>
.add-liquidity {
  padding: 40px;
  .head {
    position: relative;
    margin-bottom: 40px;
    h3 {
      text-align: center;
      font-size: 24px;
    }
    .back {
      position: absolute;
      top: -3px;
      left: 0;
      font-size: 30px;
      cursor: pointer;
      i {
        font-weight: 600;
      }
    }
  }
  .add {
    display: flex;
    justify-content: center;
    div {
      width: 32px;
      height: 32px;
      background-color: red;
    }
    margin: 12px 0;
  }
  .liquidity-info {
    margin: 30px 0 40px;
    .name {
      color: #7e87c2;
      margin-bottom: 8px;
    }
    .content {
      border: 1px solid #e4efff;
      border-radius: 15px;
      display: flex;
      height: 94px;
      .flex1 {
        height: 100%;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        div {
          font-size: 18px;
        }
        p {
          font-size: 14px;
          color: #7e87c2;
        }
      }
    }
  }
  .confirm-wrap {
    margin-bottom: 20px;
  }
}
</style>
