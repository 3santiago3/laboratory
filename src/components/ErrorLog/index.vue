<template>
  <div>
    <el-badge :is-dot="true" style="line-height: 25px;margin-top: -5px;" @click.native="dialogTableVisible=true">
      <el-button style="padding: 8px 10px;" size="small" type="danger">
        <svg-icon icon-class="bug" />
      </el-button>
    </el-badge>

    <el-dialog :visible.sync="dialogTableVisible" width="80%" append-to-body>
      <div slot="title">
        <span style="padding-right: 10px;">Error Log</span>
        <el-button size="mini" type="primary" icon="el-icon-delete" @click="clearAll">Clear All</el-button>
      </div>
      <el-table :data="errorLogs" border>
        <el-table-column label="ID">
          <template slot-scope="{row}">
            {{ row.id }}
          </template>
        </el-table-column>
        <el-table-column label="错误信息">
          <template slot-scope="{row}">
            {{ row.message }}
          </template>
        </el-table-column>
        <el-table-column label="文件名 / 组件名">
          <template slot-scope="{row}">
            {{ row.fileName }}
          </template>
        </el-table-column>
        <el-table-column label="路由地址、链接">
          <template slot-scope="{row}">
            {{ row.url }}
          </template>
        </el-table-column>
        <el-table-column label="其他信息">
          <template slot-scope="{row}">
            {{ row.info }}
          </template>
        </el-table-column>
        <el-table-column label="堆栈信息">
          <template slot-scope="{row}">
            <div style="white-space: pre-line;" v-html="row.stack" />
          </template>
        </el-table-column>
        <el-table-column label="捕获方式">
          <template slot-scope="{row}">
            {{ row.catchSource }}
          </template>
        </el-table-column>
        <el-table-column label="时间">
          <template slot-scope="{row}">
            <div>{{ row.time }}</div>
            <div>{{ row.timestamp }}</div>
          </template>
        </el-table-column>
        <el-table-column label="错误类型">
          <template slot-scope="{row}">
            {{ row.type }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import Storage from 'store2'

export default {
  name: 'ErrorLog',
  data() {
    return {
      dialogTableVisible: false,
      errorLogs: []
    }
  },
  watch: {
    dialogTableVisible: {
      handler(newVal) {
        if (!newVal) return
        this.errorLogs = Storage.get('errors')
      }
    }
  },
  methods: {
    clearAll() {
      this.dialogTableVisible = false
      this.$store.dispatch('errorLog/clearErrorLog')
    }
  }
}
</script>

<style scoped>
.message-title {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  padding-right: 8px;
}
</style>
