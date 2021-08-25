<template>
  <el-dialog title="收货地址" :visible.sync="dialogTableVisible">
    <el-table :data="gridData">
      <el-table-column property="date" label="日期" width="150" />
      <el-table-column property="name" label="姓名" width="200" />
      <el-table-column property="address" label="地址" />
    </el-table>

    <el-pagination
      :current-page="tableData.current"
      :page-sizes="[10, 20, 30, 50, 100, 200]"
      :page-size="tableData.size"
      :total="tableData.total"
      class="custom-pagination"
      background
      layout="total, sizes, prev, pager, next ,jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-dialog>
</template>

<script>
import { getList } from '@/api/table'

export default {
  data() {
    return {
      dialogTableVisible: false,
      gridData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }]
    }
  },
  methods: {
    init(selection) {
      this.dialogTableVisible = true
      getList().then(response => {
        console.log(response)
        // this.list = response.data.items
        // this.listLoading = false
      })
    }
  }
}
</script>
