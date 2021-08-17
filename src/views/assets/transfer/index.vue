<template>
  <div class="transfer-page">
    <div class="top">
      <div class="back"><i class="iconfont icon-fanhui" @click="back"></i></div>
      <div class="tab-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane name="first" :disabled="father.disableTx">
            <template #label>
              <span>
                <i class="iconfont icon-chongzhi"></i>
                {{ $t("transfer.transfer1") }}
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="second">
            <template #label>
              <span>
                <i class="iconfont icon-L2zhuanzhang"></i>
                {{ $t("transfer.transfer2") }}
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="third" :disabled="father.disableTx">
            <template #label>
              <span>
                <i class="iconfont icon-tixian"></i>
                {{ $t("transfer.transfer3") }}
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="bottom">
      <cross-in
        v-show="activeName === 'first'"
        :transferAsset="transferAsset"
      ></cross-in>
      <common-transfer
        v-show="activeName === 'second'"
        :transferAsset="transferAsset"
      ></common-transfer>
      <withdrawal
        v-show="activeName === 'third'"
        :transferAsset="transferAsset"
      ></withdrawal>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import CrossIn from "./CrossIn.vue";
import CommonTransfer from "./CommonTransfer.vue";
import Withdrawal from "./Withdrawal.vue";
export default defineComponent({
  name: "transfer",
  components: {
    CrossIn,
    CommonTransfer,
    Withdrawal
  },
  inject: ["father"],
  props: {
    showTransfer: Boolean,
    currentTab: String,
    transferAsset: Object
  },
  setup(props, { emit }) {
    const crossInVal = ref("");
    const activeName = ref("first");
    watch(
      () => props.currentTab,
      val => {
        activeName.value = val;
      },
      {
        immediate: true
      }
    );
    function back() {
      emit("update:show", false);
    }
    function handleClick(index) {
      console.log(index);
    }
    return {
      activeName,
      crossInVal,
      handleClick,
      back
    };
  }
});
</script>

<style lang="scss">
.transfer-page {
  max-width: 470px;
  margin: 0 auto;
  border-radius: 20px;
  background-color: #5b6fff;
  .top {
    height: 173px;
    padding: 40px;
    .back {
      margin-bottom: 30px;
      .iconfont {
        font-size: 25px;
        color: #fff;
        /* margin: -10px 0 30px -5px; */
        cursor: pointer;
      }
    }
  }
  .el-tabs__item .iconfont {
    font-size: 20px;
  }
  .bottom {
    padding: 50px 40px;
    min-height: 400px;
    background-color: #fff;
    border-radius: 20px;
  }
}
</style>
