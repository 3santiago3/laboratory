<template>
  <div class="image-comp">
    {{ $attrs.foo }}
    <img src="https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg" alt="" v-on="$listeners">
  </div>
</template>

<script>
export default {
  // 如果为 true（默认）则 <div class="image-comp" foo="foo">
  // 如果为 false，则 <div class="image-comp">
  // inheritAttrs: false,
  mounted() {
    console.log(this.$listeners)
  }
}
</script>

<style lang="scss" scoped>
.image-comp {
  border: 1px dashed #ccc;
  padding: 40px;
}

img {
  width: 100%;
  height: 100%;
}
</style>
