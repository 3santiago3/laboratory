<template>
  <div style="padding: 20px;">
    <el-row>
      <el-col :sm="10" style="margin-bottom: 10px;">
        <el-input v-model="fileName" placeholder="请输入文件名" clearable @input="extract" />
      </el-col>
      <el-col :sm="4" style="text-align: center; margin-bottom: 10px;">
        <el-button @click="extract">提取文件名</el-button>
      </el-col>
      <el-col :sm="10">
        该文件的后缀可能是
        <span v-show="ext.length > 0">
          <el-tag v-for="e in ext" :key="e" effect="dark" style="margin-left: 10px;" disable-transitions>{{ e }}</el-tag>
        </span>
        <span v-show="ext.length === 0">
          <el-tag effect="dark" type="danger" style="margin-left: 10px;" disable-transitions>未知</el-tag>
        </span>
      </el-col>
    </el-row>
    <el-row>
      备注：
      <ul>
        <li>当输入 XXXXjs 时，后缀名结果可能是 js 也可能是 s</li>
        <li>
          这个库底层用的是 https://github.com/jshttp/mime-db，一个 mime
          类型数据库
        </li>
      </ul>
    </el-row>
  </div>
</template>

<script>
import extName from 'ext-name' // 支持 IE 浏览器需要将版本换成 3.X
console.log(extName)

export default {
  name: 'ExtName',
  data() {
    return {
      fileName: '',
      ext: []
    }
  },
  methods: {
    extract() {
      const fileName = this.fileName
      const extArr = []
      const arr = extName(fileName)
      // 当输入 XXXXjs 时，后缀名结果可能是 js 也可能是 s
      // 这个库底层用的是 https://github.com/jshttp/mime-db，一个 mime 类型数据库
      if (arr.length > 0) {
        arr.forEach(item => {
          extArr.push(item.ext)
        })
      } else {
        // 类似于 XXXX.vue 这种文件上述方法是获取不到的
        const dotLastIndex = fileName.lastIndexOf('.')
        if (dotLastIndex > -1) {
          const extName = fileName.substr(dotLastIndex + 1)
          if (extName) extArr.push(extName)
        }
      }
      this.ext = extArr
    }
  }
}
</script>

<style lang="scss" scoped></style>
