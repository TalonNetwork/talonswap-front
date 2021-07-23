<template>
  <div class="transfer-page">
    <div class="top">
      <div class="back"><i class="el-icon-back" @click="back"></i></div>
      <div class="tab-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane
            :label="$t('transfer.transfer1')"
            name="first"
          ></el-tab-pane>
          <el-tab-pane
            :label="$t('transfer.transfer2')"
            name="second"
          ></el-tab-pane>
          <el-tab-pane
            :label="$t('transfer.transfer3')"
            name="third"
          ></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="bottom">
      <cross-in :network="network" v-show="activeName === 'first'"></cross-in>
      <common-transfer v-show="activeName === 'second'"></common-transfer>
      <withdrawal
        :network="network"
        v-show="activeName === 'third'"
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
  props: {
    showTransfer: Boolean,
    network: String,
    currentTab: String
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
  width: 470px;
  margin: 0 auto;
  border-radius: 20px;
  background-color: #5b6fff;
  .top {
    height: 173px;
    padding: 40px;
    .el-icon-back {
      font-size: 30px;
      color: #fff;
      margin: -10px 0 30px -5px;
      cursor: pointer;
    }
  }
  .bottom {
    padding: 50px 40px;
    min-height: 400px;
    background-color: #fff;
    border-radius: 20px;
  }
}
</style>
