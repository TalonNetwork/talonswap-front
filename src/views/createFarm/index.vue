<template>
  <div class="create-farm">
    <div class="head">
      <div class="back"><i class="el-icon-back" @click="back"></i></div>
      <h3>{{ $t("farm.farm12") }}</h3>
    </div>
    <el-form label-position="top" :model="model">
      <el-form-item :label="$t('farm.farm13')">
        <el-select v-model="model.fromToken" placeholder="请选择活动区域">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('farm.farm14')">
        <el-input v-model="model.fromToken"></el-input>
      </el-form-item>
      <el-form-item :label="$t('farm.farm15')">
        <el-select v-model="model.fromToken" placeholder="请选择活动区域">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('farm.farm16')">
        <el-input v-model="model.fromToken"></el-input>
      </el-form-item>
      <el-form-item :label="$t('farm.farm17')">
        <el-input v-model="model.fromToken"></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox :label="$t('farm.farm18')" name="type"></el-checkbox>
      </el-form-item>
      <el-form-item class="confirm-wrap">
        <el-button type="primary" @click="submitForm('ruleForm')">
          {{ $t("farm.farm19") }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from "vue";
import { useRouter } from "vue-router";
export default defineComponent({
  name: "CreateFarm",
  setup() {
    const model = reactive({
      fromToken: "",
      unlockTime: "",
      toToken: "",
      day: "",
      total: "",
      clear: false
    });
    const router = useRouter();
    function back() {
      router.go(-1);
    }
    return {
      model,
      back
    };
  }
});
</script>

<style lang="scss">
.create-farm {
  width: 470px;
  margin: 0 auto;
  border-radius: 20px;
  padding: 40px;
  background: #fff;
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
  .el-form {
    .el-form-item {
      margin-bottom: 16px;
    }
    .el-form-item__label {
      line-height: 30px;
      padding-bottom: 0;
      color: #7e87c2;
    }
    .el-select {
      width: 100%;
    }
    .el-checkbox {
      white-space: inherit;
    }
    .el-checkbox__label {
      color: #4a5ef2;
      display: inline;
    }
  }
}
</style>
