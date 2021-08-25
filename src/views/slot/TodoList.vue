<template>
  <ul>
    <li
      v-for="todo in filteredTodos"
      :key="todo.id"
    >
      <!--
        我们为每个 todo 准备了一个插槽，
        将 `todo` 对象作为一个插槽的 prop 传入。
      -->
      <slot
        name="todo"
        :todo="todo"
      >
        <!-- 后备内容 -->
        {{ todo.text }}
      </slot>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TodoList',
  props: {
    todos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  computed: {
    filteredTodos() {
      return this.todos
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
