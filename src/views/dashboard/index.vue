<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>

    父组件 {{ data.msg }} {{ random }}
    <el-button @click="genMsg">随机生成一段文字</el-button>
    <el-button @click="genTime">获取当前时间</el-button>

    <v-model-comp v-model="data.msg" />

    <sync-comp :msg.sync="data.msg" :random.sync="random" />

    <hr>

    <p>包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器</p>
    <p>它可以通过 v-on="$listeners" 传入内部组件——在创建更高层次的组件时非常有用。</p>
    <!-- 不要有 .navitve 修饰符 -->
    <image-comp
      style="width: 200px; height: 200px;"
      foo="foo"
      @click.stop="handleClick"
      @mousemove="handleMouseMove"
    />
  </div>
</template>

<script>
import { aikatsu } from 'aikatsu-cli'
import { mapGetters } from 'vuex'
import VModelComp from './VModelComp.vue'
import SyncComp from './SyncComp.vue'
import ImageComp from './ImageComp.vue'

export default {
  name: 'Dashboard',
  components: {
    VModelComp,
    SyncComp,
    ImageComp
  },
  data() {
    return {
      random: Date.now(),
      data: {
        msg: '初始化文字'
      }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {
    this.a = a
  },
  methods: {
    handleMouseMove() {
      console.log('mousemove...')
    },
    handleClick(e) {
      console.log(e.target)
      console.log(e.currentTarget)
    },
    genTime() {
      this.random = Date.now()
    },
    async genMsg() {
      const randomKakugen = await aikatsu()
      this.data.msg = randomKakugen.title
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
