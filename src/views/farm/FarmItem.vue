<template>
  <div
    class="farm-item"
    v-loading="loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
  >
    <el-empty description="No Data" v-if="!list.length"></el-empty>
    <template v-if="true">
      <div class="lis" v-for="(item, index) of list" :key="index">
        <div class="title">
          <farm-symbol :name="item.name"></farm-symbol>
          <ul>
            <li class="fl">
              <p>{{ $t("farm.farm2") }}</p>
              <h2>{{ item.pendingReward }} {{ item.syrupTokenSymbol }}</h2>
            </li>
            <li class="fl">
              <p>{{ $t("farm.farm3") }}</p>
              <h2>{{ item.apr }}%</h2>
            </li>
            <li class="fl">
              <p>{{ $t("farm.farm4") }}</p>
              <h2>${{ item.tatalStakeTokenUSD }}</h2>
            </li>
            <li class="fl">
              <p>{{ $t("farm.farm5") }}</p>
              <h2>{{ item.syrupTokenBalance }} {{ item.syrupTokenSymbol }}</h2>
            </li>
          </ul>
          <div class="link view" @click="showId(item.farmHash)">
            {{ $t("farm.farm6") }}
            <i
              :class="{ 'el-icon-arrow-right': true, expand: item.showDetail }"
            ></i>
          </div>
        </div>
        <collapse-transition>
          <DetailsBar
            :tokenInfo="item"
            :isTalon="isTalon"
            :talonAddress="talonAddress"
            v-show="item.showDetail"
            @loading="handleLoading"
          ></DetailsBar>
        </collapse-transition>
      </div>
    </template>
    <div class="mobile-item">
      <div v-for="(item, index) in list" :key="index">
        <div class="farm-item_mobile">
          <span class="mr-2">{{ item.name }}</span>
          <div class="farm-info">
            <div class="mb_10">
              <span class="info-title">{{ $t("farm.farm2") }}:</span>
              <span>{{ item.pendingReward }} {{ item.syrupTokenSymbol }}</span>
            </div>
            <div class="mb_10">
              <span class="info-title">{{ $t("farm.farm3") }}:</span>
              <span>{{ item.apr }}%</span>
            </div>
            <div class="mb_10">
              <span class="info-title">{{ $t("farm.farm4") }}:</span>
              <span>${{ item.tatalStakeTokenUSD }}</span>
            </div>
            <div class="mb_10">
              <span class="info-title">{{ $t("farm.farm5") }}:</span>
              <span>
                {{ item.syrupTokenBalance }} {{ item.syrupTokenSymbol }}
              </span>
            </div>
          </div>
          <div class="link view" @click="showId(item.farmHash)">
            {{ $t("farm.farm6") }}
            <i
              :class="{ 'el-icon-arrow-right': true, expand: item.showDetail }"
            ></i>
          </div>
        </div>
        <collapse-transition>
          <DetailsBar
            :tokenInfo="item"
            :isTalon="isTalon"
            :talonAddress="talonAddress"
            v-show="item.showDetail"
            @loading="handleLoading"
          ></DetailsBar>
        </collapse-transition>
      </div>
    </div>
    <div class="more" v-if="isTalon && talonAddress">
      <span class="link" @click="createFarm">{{ $t("farm.farm11") }}</span>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed } from "vue";
import DetailsBar from "./DetailsBar.vue";
import CollapseTransition from "@/components/CollapseTransition.vue";
import FarmSymbol from "./FarmSymbol.vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "FarmItem",
  props: {
    loading: Boolean,
    list: Array,
    isTalon: Boolean
  },
  setup(props, { emit }) {
    const router = useRouter();
    const store = useStore();
    const state = reactive({
      contractAddress: "0x0faee22173db311f4c57c81ec6867e5deef6c218" //合约地址
    });

    const talonAddress = computed(() => {
      return store.getters.talonAddress;
    });

    async function createFarm() {
      router.push("/create-farm");
    }

    //详情
    function showId(hash) {
      for (let item of props.list) {
        if (item.farmHash === hash) {
          item.showDetail = !item.showDetail;
        }
      }
    }
    function handleLoading(status) {
      emit("handleLoading", status);
    }

    return {
      ...toRefs(state),
      talonAddress,
      showId,
      handleLoading,
      createFarm
    };
  },
  components: {
    DetailsBar,
    CollapseTransition,
    FarmSymbol
  },
  computed: {},
  mounted() {}
});
</script>

<style lang="scss" scoped>
.farm-item {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 0 80px;
  min-height: 200px;
  position: relative;
  overflow: hidden;
  .lis {
    font-family: PingFang SC;
    .title {
      height: 90px;
      border-bottom: 1px solid #e4efff;
      display: flex;
      align-items: center;
      padding: 0 40px;
      .symbol {
        min-width: 200px;
        .names {
          font-size: 20px;
          font-weight: bold;
        }
      }
      ul {
        /* width: 1000px; */
        flex: 1;
        li {
          width: 25%;
          text-align: center;
          p {
            font-size: 14px;
            color: #7e87c2;
            line-height: 1;
            margin-bottom: 8px;
          }
          h2 {
            font-size: 18px;
            font-family: Roboto;
            font-weight: bold;
            line-height: 1;
          }
        }
      }
      .view {
        font-size: 15px;
      }
    }
  }
  .farm-item_mobile {
    display: none;
  }
  .more {
    position: absolute;
    width: 100%;
    text-align: center;
    bottom: 20px;
  }
}
.mobile-item {
  display: none;
  padding: 10px;
  font-size: 14px;
  .farm-item_mobile {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .farm-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .info-title {
        //width: 50px;
        margin-bottom: 10px;
        text-align: right;
      }
    }
    .mr-2 {
      margin-right: 20px;
      width: 50px;
      font-weight: bold;
    }
    .mb_10 {
      margin-bottom: 10px;
    }
  }
}
@media screen and (max-width: 1200px) {
  .farm-item .lis {
    font-size: 20px !important;
  }
}
@media screen and (max-width: 800px) {
  .lis {
    display: none !important;
  }
  .mobile-item {
    display: block;
  }
  .farm-item {
    padding: 15px;
  }
}
</style>
