<template>
  <div>
    <el-tag>sync</el-tag>  子组件 {{ msg }} {{ random }}
    <el-button @click="genMsg">随机生成一段文字</el-button>
    <el-button @click="genTime">获取当前时间</el-button>
  </div>
</template>

<script>
import { aikatsu } from 'aikatsu-cli'

export default {
  props: {
    msg: {
      type: String,
      required: true
    },
    random: {
      type: Number,
      required: true
    }
  },
  methods: {
    async genMsg() {
      const randomKakugen = await aikatsu()
      this.$emit('update:msg', randomKakugen.title)
    },
    genTime() {
      this.$emit('update:random', Date.now())
    }
  }
}
</script>
