<template>
  <div class="error-handler">
    {{ $store.state.app.users }}
    <!-- 引入一个不存在的变量 -->
    <!-- 页面不会白屏，但是控制台会有 [Vue warn] -->
    <!-- <p>hello {{ name }}</p> -->

    <!-- 代码逻辑报错 -->
    <!-- 页面白屏 -->
    <!-- <p>{{ foo }}</p> -->

    <p>error-handler</p>

    <img :src="imgSrc" alt="">
  </div>
</template>

<script>
// import { ErrorService } from '@/utils/errorHandle/ErrorService'
// import './makeError'

export default {
  name: 'ErrorHandler',
  props: {
    todo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      imgSrc: 'http://666.com/777.jpg'
    }
  },
  mounted() {
    new Promise((resolve, reject) => {
      reject('reject...')
    })

    console.log(document.getElementById('test').parentNode)
    this.imgSrc = 'http://666.com/666.jpg'
    // this.$refs.form.init()
    // this.delay()
    //   .then(res => {
    //     console.log(res)
    //   })
    // 如果没有 catch 错误，控制台会显示 Uncaught (in promise)
    // this.makeError()
    // this.makeError2()
    // this.tryCatch()
    // this.$store.dispatch('app/getUsers')
  },
  methods: {
    getUserName(id) {
      const user = this.getUser(id)
      if (user) return user.username
    },

    // Handling Errors in component
    methodThrowsException() {
      try {
        // Do unexpected job
      } catch (error) {
        // ErrorService.onError(error)
      }
    },
    // Display Error with SweetAlert (when Name is Click)
    displayAlert() {
      // ErrorService.displayErrorAlert('Testing message')
    },
    delay() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() * 10 > 8) {
            resolve('√ 随机数大于 8')
          } else {
            reject('× 随机数小于等于 8')
          }
        }, 500)
      })
    },
    makeError2() {
      return bar
    },
    makeError() {
      return document.querySelector('#foo').parentNode
    },
    tryCatch() {
      try {
        return document.querySelector('#foo').parentNode
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
