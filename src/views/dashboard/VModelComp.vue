<template>
  <div>
    <el-tag>v-model</el-tag>  子组件 {{ msg }}
    <el-button @click="genMsg">随机生成一段文字</el-button>
  </div>
</template>

<script>
import { aikatsu } from 'aikatsu-cli'

export default {
  model: {
    prop: 'msg',
    event: 'selfInput'
  },
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  methods: {
    async genMsg() {
      const randomKakugen = await aikatsu()
      this.$emit('selfInput', randomKakugen.title)
    }
  }
}
</script>
