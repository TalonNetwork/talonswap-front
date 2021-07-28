<template>
  <div class="farm-item-symbol">
    <div class="mult-img-wrap" v-if="imgList.length > 1">
      <img :src="imgList[0]" alt="" />
      <img :src="imgList[1]" alt="" />
    </div>
    <div class="img-wrap" v-else>
      <img :src="imgList[0]" alt="" />
    </div>
    <div class="name">{{ name }}</div>
  </div>
</template>

<script lang="ts">
type ImgList = string[];
import { defineComponent, PropType } from "vue";
export default defineComponent({
  props: {
    imgList: Array as PropType<ImgList>,
    name: String
  }
});
</script>

<style lang="scss">
.farm-item-symbol {
  width: 265px;
  height: 100%;
  padding: 16px 0;
  display: flex;
  align-items: center;
  .mult-img-wrap,
  .img-wrap {
    width: 65px;
    height: 100%;
    margin-right: 20px;
    img {
      width: 40px;
      height: 40px;
    }
  }
  .mult-img-wrap {
    position: relative;
    img {
      position: absolute;
      &:first-child {
        bottom: 0;
        left: 0;
        z-index: 2;
      }
      &:last-child {
        top: 0;
        right: 0;
      }
    }
  }
  .img-wrap {
    display: flex;
    align-items: center;
  }
  .name {
    font-size: 20px;
    font-weight: bold;
  }
}
</style>
