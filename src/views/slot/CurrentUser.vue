<template>
  <span>
    <slot :user="user">{{ user.lastName }}</slot>
  </span>
</template>

<script>
export default {
  name: 'CurrentUser',
  data() {
    return {
      user: {
        lastName: '润丰',
        firstName: '李'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
