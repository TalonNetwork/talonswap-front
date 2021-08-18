<template>
  <div class="w1300">
    <div
        class="create-farm"
        v-loading="loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
    >
      <div class="head">
        <div class="back"><i class="el-icon-back" @click="back"></i></div>
        <h3>{{ $t("farm.farm12") }}</h3>
      </div>
      <el-form label-position="top" :model="model" :rules="rules" ref="form">
        <el-form-item :label="$t('farm.farm13')" prop="tokenA">
          <el-select
              v-model="model.tokenA"
              filterable
              :placeholder="$t('createFarm.createFarm1')"
          >
            <el-option
                :label="item.symbol + '(' + item.assetKey + ')'"
                :value="item.assetKey"
                v-for="item in assetList"
                :key="item.assetKey"
                :disabled="item.assetKey === model.tokenB"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('farm.farm14')" prop="lockedTime">
          <el-date-picker
              :placeholder="$t('createFarm.createFarm2')"
              v-model="model.lockedTime"
              type="datetime"
              :disabledDate="disableTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('farm.farm15')" prop="tokenB">
          <el-select
              v-model="model.tokenB"
              filterable
              :placeholder="$t('createFarm.createFarm3')"
          >
            <el-option
                :label="item.symbol + '(' + item.assetKey + ')'"
                :value="item.assetKey"
                v-for="item in assetList"
                :key="item.assetKey"
                :disabled="item.assetKey === model.tokenA"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('farm.farm16')" prop="syrupPerDay">
          <el-input
              v-model="model.syrupPerDay"
              :placeholder="$t('createFarm.createFarm4')"
          ></el-input>
        </el-form-item>
        <div class="balance">{{ $t("public.public12") }}{{ balance }}</div>
        <el-form-item :label="$t('farm.farm17')" prop="syrupTotalAmount">
          <el-input
              v-model="model.syrupTotalAmount"
              :placeholder="$t('createFarm.createFarm5')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('farm.farm22')" prop="startTime">
          <el-date-picker
              :placeholder="$t('createFarm.createFarm6')"
              v-model="model.startTime"
              type="datetime"
              :disabledDate="disableTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item class="checkbox-item" prop="check">
          <el-checkbox
              :label="$t('farm.farm18')"
              v-model="model.check"
          ></el-checkbox>
        </el-form-item>
        <el-form-item class="confirm-wrap">
          <el-button type="primary" @click="submitForm">
            {{ $t("farm.farm19") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
  computed
} from "vue";
import nerve from "nerve-sdk-js";
import { useRouter } from "vue-router";
import { NTransfer } from "@/api/api";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { getAssetList, getBlockInfo } from "@/model";
import { divisionAndFix, _networkInfo, Minus, timesDecimals } from "@/api/util";
import config from "@/config";
import dayjs from "dayjs";

function parseChainInfo(key) {
  const arrry = key.split("-");
  return arrry.map(v => Number(v));
}

export default defineComponent({
  name: "CreateFarm",
  setup() {
    const store = useStore();
    const { t } = useI18n();
    const form = ref(null);
    const loading = ref(false);
    const model = reactive({
      tokenA: "", // 质押的token
      lockedTime: "", // 质押token解锁时间
      tokenB: "", // 奖励的token
      syrupPerDay: "", // 每天可获得token奖励
      syrupTotalAmount: "", // 奖励token总量
      startTime: "", // 开始时间
      check: false
    });
    const rules = reactive({
      tokenA: [
        {
          required: true,
          message: t("createFarm.createFarm1"),
          trigger: "change"
        }
      ],
      lockedTime: [
        {
          type: "date",
          required: true,
          message: t("createFarm.createFarm2"),
          trigger: "change"
        }
      ],
      tokenB: [
        {
          required: true,
          message: t("createFarm.createFarm3"),
          trigger: "change"
        }
      ],
      syrupPerDay: [
        {
          required: true,
          message: t("createFarm.createFarm4"),
          trigger: "change"
        },
        { validator: validateSyrupTotalAmount, trigger: "blur" }
      ],
      syrupTotalAmount: [
        {
          required: true,
          message: t("createFarm.createFarm5"),
          trigger: "change"
        },
        { validator: validateSyrupTotalAmount, trigger: "blur" }
      ],
      startTime: [
        {
          type: "date",
          required: true,
          message: t("createFarm.createFarm6"),
          trigger: "change"
        }
      ],
      check: [{ validator: validateCheck, trigger: "blur" }]
    });
    const balance = computed(() => {
      const tokenB = assetList.value.find(v => v.assetKey === model.tokenB);
      if (!tokenB) return 0;
      return tokenB.available;
    });
    function validateSyrupPerDay(rule, value, callback) {
      // const reg = new RegExp("^([1-9][\\d]{0,20}|0)(\\.[\\d])?$");
      const reg = new RegExp("^([1-9][\\d]{0,1})$");
      if (!reg.exec(value)) {
        callback(t("createFarm.createFarm8"));
      } else {
        callback();
      }
    }
    function validateSyrupTotalAmount(rule, value, callback) {
      if (!model.tokenB) {
        const reg = new RegExp("^([1-9][\\d]*|0)(\\.[\\d]*)?$");
        if (!reg.exec(value)) {
          callback(t("createFarm.createFarm11"));
        } else {
          callback();
        }
      } else {
        const tokenB = assetList.value.find(v => v.assetKey === model.tokenB);
        const { decimals, available } = tokenB;
        const reg = new RegExp(
          "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
        );
        // console.log(available, value, available < value);
        if (Minus(available, value) < 0) {
          callback(t("createFarm.createFarm10"));
        } else if (!reg.exec(value)) {
          callback(t("createFarm.createFarm9") + decimals);
        } else {
          callback();
        }
      }
    }
    function validateCheck(rule, value, callback) {
      if (!value) {
        callback(t("createFarm.createFarm7"));
      } else {
        callback();
      }
    }

    function disableTime(date) {
      // console.log(date, 132465)
      return new Date().getTime() > new Date(date).getTime();
    }
    const assetList = ref([]);
    onMounted(() => {
      const address = store.state.addressInfo.address.Talon;
      getAssetList(address).then(res => {
        assetList.value = res;
      });
    });

    function submitForm() {
      console.log(model, 999);
      form.value.validate(valid => {
        if (valid) {
          createFarm();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
    async function createFarm() {
      loading.value = true;
      try {
        const { lockedTime, syrupPerDay, syrupTotalAmount, startTime } = model;
        const tokenA = assetList.value.find(v => v.assetKey === model.tokenA);
        const tokenB = assetList.value.find(v => v.assetKey === model.tokenB);
        const addressInfo = store.state.addressInfo;
        const syrupPerBlock = timesDecimals(
          syrupPerDay / ((24 * 60 * 60) / 2),
          tokenB.decimals
        ).split(".")[0];
        const lockTo = dayjs(lockedTime).unix();
        const remark = "";
        const blockInfo = await getBlockInfo();
        const currentHeight = blockInfo.blockHeight;
        const diffSeconds = dayjs(startTime).diff(dayjs(new Date()), "seconds");
        const startBlockHeight = Math.floor(
          Number(currentHeight) + diffSeconds / 2
        );
        const tx = await nerve.swap.farmCreate(
          addressInfo.address.Talon,
          nerve.swap.token(tokenA.chainId, tokenA.assetId),
          nerve.swap.token(tokenB.chainId, tokenB.assetId),
          config.chainId,
          timesDecimals(syrupTotalAmount, tokenB.decimals),
          syrupPerBlock,
          startBlockHeight,
          lockTo,
          config.prefix,
          remark
        );
        /* console.log(
          addressInfo.address.Talon,
          nerve.swap.token(tokenA.chainId, tokenA.assetId),
          nerve.swap.token(tokenB.chainId, tokenB.assetId),
          config.chainId,
          timesDecimals(syrupTotalAmount, tokenB.decimals),
          syrupPerBlock,
          startBlockHeight,
          lockTo,
          config.prefix,
          remark,
          888
        ); */
        const tAssemble = nerve.deserializationTx(tx.hex);

        const transfer = new NTransfer({ chain: "NERVE" });

        const txHex = await transfer.getTxHex({
          tAssemble,
          pub: addressInfo.pub,
          signAddress: addressInfo.address.Ethereum
        });
        // console.log(txHex, 666);
        const result = await transfer.broadcastHex(txHex);
        if (result && result.hash) {
          ElMessage.success({
            message: t("transfer.transfer14"),
            type: "success"
          });
          back();
        } else {
          ElMessage.warning({
            message: "Create farm failed",
            type: "warning"
          });
        }
      } catch (e) {
        console.log(e, "create-farm-error");
        ElMessage.warning({
          message: e.message || e,
          type: "warning"
        });
      }
      loading.value = false;
    }
    const router = useRouter();
    function back() {
      router.go(-1);
    }
    return {
      loading,
      form,
      model,
      rules,
      balance,
      assetList,
      disableTime,
      submitForm,
      back
    };
  }
});
</script>

<style lang="scss">
.create-farm {
  max-width: 470px;
  width: 100%;
  margin: 0 auto;
  border-radius: 20px;
  padding: 40px;
  background: #fff;
  .head {
    position: relative;
    margin-bottom: 20px;
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
  .el-form {
    .el-form-item {
      margin-bottom: 16px;
    }
    .el-form-item__label {
      line-height: 30px;
      padding-bottom: 0;
      color: #7e87c2;
    }
    .balance {
      float: right;
      line-height: 30px;
      padding-bottom: 0;
      color: #7e87c2;
      font-size: 14px;
    }
    .el-select {
      width: 100%;
    }
    .checkbox-item {
      .el-form-item__content {
        line-height: initial;
      }
    }
    .el-checkbox {
      white-space: inherit;
    }
    .el-checkbox__inner {
      border-color: #4a5ef2;
    }
    .el-checkbox__input.is-checked .el-checkbox__inner,
    .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color: #4a5ef2;
    }
    .el-checkbox__label {
      color: #4a5ef2;
      display: inline;
    }
    .el-date-editor.el-input,
    .el-date-editor.el-input__inner {
      width: 100%;
    }
    .confirm-wrap {
      margin-top: 30px;
    }
  }
}
@media screen and (max-width: 1200px) {
  .create-farm {
    padding: 25px;
  }
}
</style>
