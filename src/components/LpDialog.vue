<template>
  <el-dialog
    title=""
    center
    width="470px"
    custom-class="add-minus-dialog"
    v-model="show"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div
      v-loading="loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
      <div class="titles">
        {{ addOrMinus === "add" ? $t("farm.farm20") : $t("farm.farm10") }}LP
      </div>
      <div class="infos">
        <div class="in flex-between">
          <span>
            {{ addOrMinus === "add" ? $t("farm.farm20") : $t("farm.farm10") }}LP
          </span>
          <label>
            {{ $t("public.public16") }}
            <span class="el-icon-loading" v-if="!balance"></span>
            <span v-else>{{ balance }}</span>
          </label>
        </div>
        <div class="clear"></div>
        <div class="to">
          <el-input class="no-border" placeholder="0.0" v-model="numberValue">
            <template #append><span @click="clickMax">Max</span></template>
          </el-input>
          <span class="fr lp">{{ lpName }}</span>
        </div>
        <span class="error-tip" v-if="amountErrorTip">
          {{ amountErrorTip }}
        </span>
      </div>
      <div class="dialog-footer">
        <el-button @click="closeAddOrMinus">
          {{ $t("public.public8") }}
        </el-button>
        <el-button
          type="primary"
          @click="confirmAddOrMinus"
          :disabled="disableTx"
        >
          {{ $t("public.public9") }}
        </el-button>
      </div>
      <div class="dialog-footer_mobile">
        <el-button @click="closeAddOrMinus">
          {{ $t("public.public8") }}
        </el-button>
        <el-button
          type="primary"
          @click="confirmAddOrMinus"
          :disabled="disableTx"
        >
          {{ $t("public.public9") }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, watch, computed } from "vue";
import { Minus } from "@/api/util";
import { useI18n } from "vue-i18n";
export default defineComponent({
  props: {
    showLPDialog: Boolean,
    balance: String,
    loading: Boolean,
    addOrMinus: String,
    lpName: String,
    decimal: String
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const show = ref(false);
    watch(
      () => props.showLPDialog,
      val => (show.value = val),
      { immediate: true }
    );

    const disableTx = computed(() => {
      return !!(!Number(numberValue.value) || amountErrorTip.value);
    });

    const numberValue = ref("");

    const amountErrorTip = ref("");
    watch(
      () => numberValue.value,
      val => {
        if (val) {
          let decimals = props.decimal || 0;
          let patrn = "";
          if (!decimals) {
            patrn = new RegExp("^([1-9][\\d]{0,20}|0)(\\.[\\d])?$");
          } else {
            patrn = new RegExp(
              "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
            );
          }
          if (!patrn.exec(val)) {
            amountErrorTip.value = t("transfer.transfer17") + decimals;
          } else if (!Number(props.balance) || Minus(props.balance, val) < 0) {
            amountErrorTip.value = t("transfer.transfer15");
          } else {
            amountErrorTip.value = "";
          }
        }
      }
    );

    function clickMax() {
      if (!Number(props.balance)) return;
      numberValue.value = props.balance;
    }

    function closeAddOrMinus() {
      emit("update:showLPDialog", false);
      numberValue.value = "";
    }
    function confirmAddOrMinus() {
      emit("confirm", numberValue.value);
      numberValue.value = "";
    }
    return {
      show,
      numberValue,
      amountErrorTip,
      disableTx,
      clickMax,
      closeAddOrMinus,
      confirmAddOrMinus
    };
  }
});
</script>

<style lang="scss">
.add-minus-dialog {
  border-radius: 10px;
  .el-dialog__header {
    padding: 0;
  }
  .el-dialog__body {
    .titles {
      font-size: 24px;
      font-weight: 600;
      line-height: 36px;
      text-align: center;
      margin: 0 0 20px 20px;
    }
    .infos {
      width: 417px;
      height: 98px;
      padding: 15px 20px;
      background: #ffffff;
      border: 1px solid #e3eeff;
      border-radius: 15px;
      position: relative;
      .in {
        font-size: 14px;
        font-weight: 500;
        color: #7e87c2;
        margin-bottom: 4px;
      }
      .to {
        display: flex;
        align-items: center;
        .el-input {
          flex: 1;
          .el-input__inner {
            font-size: 20px;
          }
        }
        .el-input-group__append,
        .el-input-group__prepend {
          background-color: transparent;
          border: none;
          padding-right: 0;
          span {
            display: inline-block;
            padding: 3px 6px;
            color: #4b7cf7;
            background-color: #e4e7ff;
            cursor: pointer;
            border-radius: 5px;
          }
        }
        .lp {
          min-width: 100px;
          font-size: 14px;
          font-weight: 600;
          text-align: right;
        }
      }
      .error-tip {
        position: absolute;
        left: 0;
        top: 98px;
        font-size: 13px;
        color: #f56c6c;
      }
    }
  }

  .dialog-footer {
    display: block;
    padding: 40px 0 30px 0;
    .el-button {
      width: 185px;
      height: 48px;
      background: #ffffff;
      border: 1px solid #4a5ef2;
    }
    .el-button--primary {
      background: #4a5ef2;
      margin-left: 20px;
    }
  }
  .dialog-footer_mobile {
    display: none;
  }
}
@media screen and (max-width: 1200px) {
  .el-dialog {
    //margin: 15vh auto;
    width: 100% !important;
    max-width: 470px !important;
    min-width: 280px !important;
    .infos {
      width: 100% !important;
      max-width: 417px !important;
    }
  }
}
@media screen and (max-width: 470px) {
  .dialog-footer {
    display: none !important;
  }
  .dialog-footer_mobile {
    margin-top: 20px !important;
    display: flex !important;
    align-items: center;
    justify-content: space-around;
    .el-button_mobile {
      max-width: 85px;
      width: 100%;
    }
  }
}
</style>
