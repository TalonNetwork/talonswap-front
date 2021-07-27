<template>
  <div class="custom-input">
    <div class="info flex-between">
      <span>{{ $t("public.public11") }}</span>
      <span>{{ $t("public.public12") }}: {{ "123456" }}</span>
    </div>
    <div class="inner flex-between">
      <el-input class="no-border" v-model="crossInVal" placeholder="0.0">
        <template #append><span>Max</span></template>
      </el-input>
      <div class="select-wrap flex-center">
        <img src="" alt="" />
        <span>BNB</span>
        <i class="el-icon-arrow-down"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  setup() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.custom-input {
  border: 1px solid #E3EEFF;
  border-radius: 15px;
  padding: 15px 20px;
  .info {
    margin-bottom: 10px;
    color: #7e87c2;
    font-size: 12px;
  }
  .el-input {
    margin-right: 20px;
    .el-input-group__append {
    }
  }
  .select-wrap {
    img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: red;
    }
  }
  :deep(.el-input) {
    .el-input-group__append, .el-input-group__prepend {
      background-color: transparent;
      border: none;
      span {
        display: inline-block;
        padding: 3px 6px;
        color: #4B7CF7;
        background-color: #E4E7FF;
        cursor: pointer;
        border-radius: 5px;
      }
    }
  }
}
</style>
