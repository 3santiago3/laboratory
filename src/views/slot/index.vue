<template>
  <div class="slot-demo">
    <navigation-link url="profile">
      <template v-slot:default>
        Clicking here will send you to
      </template>
    </navigation-link>

    <hr>

    <!-- 有时让插槽内容能够访问子组件中才有的数据是很有用的。 -->
    <current-user v-slot:default="slotProps">
      {{ slotProps.user.firstName }}
    </current-user>

    <hr>
    <!-- 插槽 prop 允许我们将插槽转换为可复用的模板，这些模板可以基于输入的 prop 渲染出不同的内容 -->
    <!-- 这在设计封装数据逻辑同时允许父级组件自定义部分布局的可复用组件时是最有用的。 -->
    <todo-list :todos="todos">
      <template v-slot:todo="{ todo }">
        <span v-if="todo.isComplete">✓</span>
        {{ todo.text }}
      </template>
    </todo-list>
  </div>
</template>

<script>
import NavigationLink from './NavigationLink.vue'
import CurrentUser from './CurrentUser.vue'
import TodoList from './TodoList.vue'

export default {
  name: 'SlotDemo',
  components: {
    NavigationLink,
    CurrentUser,
    TodoList
  },
  data() {
    return {
      todos: [
        { id: 1, text: '写语文作业', isComplete: false },
        { id: 2, text: '玩电脑', isComplete: true }
      ]
    }
  },
  beforeCreate() {
    console.log('1')
  },
  created() {
    console.log('2')
  },
  beforeMount() {
    console.log('3')
  },
  mounted() {
    console.log('8')
  }
}
</script>

<style lang="scss" scoped>
</style>
