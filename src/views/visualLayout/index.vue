<template>
  <div class="visual-layout">
    <div
      style="width: 100%; flex-shrink: 0; border: 1px solid black; background-color: #ddd; margin-bottom: 20px;"
    >
      Displayed as <code>[x, y, w, h]</code>:
      <div class="columns">
        <div v-for="item in layout" :key="item.i" style="display: inline-block; margin-right: 20px; background-color: yellow;">
          <b>{{ item.i }}</b>: [{{ item.x }}, {{ item.y }}, {{ item.w }}, {{ item.h }}]
        </div>
      </div>
    </div>
    <div class="left">
      <materials
        :data="materials"
        @drag="handleDrag"
        @dragend="handleDragend"
      />
    </div>
    <div id="content" class="right">
      <grid-layout
        ref="gridlayout"
        :layout.sync="layout"
        :col-num="24"
        :row-height="10"
        :margin="[20, 20]"
        :is-draggable="true"
        :is-resizable="true"
        :is-mirrored="false"
        :auto-size="true"
        :vertical-compact="false"
        :prevent-collision="true"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          drag-allow-from=".vue-draggable-handle"
          drag-ignore-from=".no-drag"
        >
          <div class="vue-draggable-handle">
            <i class="el-icon-s-operation" />
          </div>
          <div class="remove-handle" @click="removeItem(item.i)">
            <i class="el-icon-delete" />
          </div>
          <component :is="item.component" class="no-drag" />
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'
import TableDemo from './components/TableDemo.vue'
import AvatarDemo from './components/AvatarDemo.vue'
import ProgressDemo from './components/ProgressDemo.vue'
import Materials from './components/Materials.vue'

const mouseXY = { x: null, y: null }
const DragPos = { x: null, y: null, w: 1, h: 1, i: null }

export default {
  name: 'VisualLayout',
  components: {
    GridLayout,
    GridItem,
    TableDemo,
    AvatarDemo,
    ProgressDemo,
    Materials
  },
  data() {
    return {
      materials: [
        { name: '实验室/项目一览表', icon: 'table', component: TableDemo },
        { name: '头像', icon: 'avatar', component: AvatarDemo },
        { name: '环形进度条', icon: 'progress', component: ProgressDemo }
      ],
      layout: []
    }
  },
  mounted() {
    document.addEventListener(
      'dragover',
      function(e) {
        mouseXY.x = e.clientX
        mouseXY.y = e.clientY
      },
      false
    )
  },
  methods: {
    removeItem(val) {
      const index = this.layout.map(item => item.i).indexOf(val)
      this.layout.splice(index, 1)
    },
    handleDrag(e) {
      const parentRect = document
        .getElementById('content')
        .getBoundingClientRect()
      let mouseInGrid = false
      if (
        mouseXY.x > parentRect.left &&
        mouseXY.x < parentRect.right &&
        mouseXY.y > parentRect.top &&
        mouseXY.y < parentRect.bottom
      ) {
        mouseInGrid = true
      }
      if (
        mouseInGrid === true &&
        this.layout.findIndex(item => item.i === 'drop') === -1
      ) {
        this.layout.push({
          x: (this.layout.length * 2) % (this.colNum || 12),
          y: this.layout.length + (this.colNum || 12), // puts it at the bottom
          w: 4,
          h: 4,
          i: 'drop'
        })
      }
      const index = this.layout.findIndex(item => item.i === 'drop')
      if (index !== -1) {
        try {
          this.$refs.gridlayout.$children[
            this.layout.length
          ].$refs.item.style.display = 'none'
          // eslint-disable-next-line no-empty
        } catch {}
        const el = this.$refs.gridlayout.$children[index]
        el.dragging = {
          top: mouseXY.y - parentRect.top,
          left: mouseXY.x - parentRect.left
        }
        const new_pos = el.calcXY(
          mouseXY.y - parentRect.top,
          mouseXY.x - parentRect.left
        )
        if (mouseInGrid === true) {
          this.$refs.gridlayout.dragEvent(
            'dragstart',
            'drop',
            new_pos.x,
            new_pos.y,
            4,
            4
          )
          DragPos.i = String(index)
          DragPos.x = this.layout[index].x
          DragPos.y = this.layout[index].y
        }
        if (mouseInGrid === false) {
          this.$refs.gridlayout.dragEvent(
            'dragend',
            'drop',
            new_pos.x,
            new_pos.y,
            4,
            4
          )
          this.layout = this.layout.filter(obj => obj.i !== 'drop')
        }
      }
    },
    handleDragend(component) {
      const parentRect = document
        .getElementById('content')
        .getBoundingClientRect()
      let mouseInGrid = false
      if (
        mouseXY.x > parentRect.left &&
        mouseXY.x < parentRect.right &&
        mouseXY.y > parentRect.top &&
        mouseXY.y < parentRect.bottom
      ) {
        mouseInGrid = true
      }
      if (mouseInGrid === true) {
        // alert(
        //   `Dropped element props:\n${JSON.stringify(
        //     DragPos,
        //     ['x', 'y', 'w', 'h'],
        //     2
        //   )}`
        // )
        this.$refs.gridlayout.dragEvent(
          'dragend',
          'drop',
          DragPos.x,
          DragPos.y,
          4,
          4
        )
        this.layout = this.layout.filter(obj => obj.i !== 'drop')
        this.layout.push({
          x: DragPos.x,
          y: DragPos.y,
          w: 4,
          h: 4,
          i: DragPos.i,
          component
        })
        this.$refs.gridLayout.dragEvent(
          'dragend',
          DragPos.i,
          DragPos.x,
          DragPos.y,
          4,
          4
        )
        try {
          this.$refs.gridLayout.$children[
            this.layout.length
          ].$refs.item.style.display = 'block'
        // eslint-disable-next-line no-empty
        } catch {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.visual-layout {
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  min-height: calc(100vh - 50px);
  .left {
    width: 260px;
    margin-right: 20px;
    border: 1px solid #ccc;
  }
  .right {
    width: calc(100% - 280px);
    background-color: #f2f2f2;
  }
  .vue-grid-layout {
    .vue-grid-item {
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      .vue-draggable-handle,
      .remove-handle {
        height: 22px;
        width: 22px;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 9;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .remove-handle {
        right: 28px;
        &:hover {
          color: #f00;
        }
      }
      ::v-deep .el-table {
        max-height: 100%;
        max-width: 100%;
      }
    }
  }
}
</style>
