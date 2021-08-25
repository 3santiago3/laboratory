<template>
  <div id="checkbox">
    <el-button @click="handleClick">点击</el-button>

    <checkboxDialog ref="checkboxDialog" />
  </div>
</template>

<script>
import checkboxDialog from './checkboxDialog.vue'

export default {
  name: 'TableSelectInDialogCheckbox',
  components: {
    checkboxDialog
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    handleClick() {
      this.$refs.checkboxDialog.init()
    }
  }
}
</script>
