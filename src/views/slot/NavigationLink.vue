<template>
  <a
    :href="url"
    class="nav-link"
  >
    <slot>Submit</slot>
  </a>
</template>

<script>
export default {
  name: 'NavigationLink',
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  beforeCreate() {
    console.log('4')
  },
  created() {
    console.log('5')
  },
  beforeMount() {
    console.log('6')
  },
  mounted() {
    console.log('7')
    // console.log(Object.keys(this.$slots))
    console.log(this.$slots)
  }
}
</script>

<style lang="scss" scoped>
</style>
