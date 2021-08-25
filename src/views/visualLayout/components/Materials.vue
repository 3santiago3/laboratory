<template>
  <div class="materials">
    <div
      v-for="comp in data"
      :key="comp.name"
      class="comp droppable-element"
      draggable="true"
      unselectable="on"
      @drag="drag"
      @dragend="dragend(comp.component)"
    >
      <svg-icon :icon-class="comp.icon" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'Materials',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    drag(e) {
      this.$emit('drag', e)
    },
    dragend(component) {
      this.$emit('dragend', component)
    }
  }
}
</script>

<style lang="scss" scoped>
.materials {
  display: flex;
  padding: 20px 20px 0 20px;
  flex-wrap: wrap;
  justify-content: space-between;
  .comp {
    width: 100px;
    height: 100px;
    flex-grow: 0; // 如果存在剩余空间，也不放大
    flex-shrink: 0; // 如果控件不足，也不缩小
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    .svg-icon {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
