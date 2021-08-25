<template>
  <div style="padding: 20px;">
    <el-row>
      <el-col>
        <el-upload
          drag
          action=""
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleChange"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <ul>
          <li v-for="item in fileTypes" :key="item.typename">{{ item }}</li>
        </ul>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import filetype from 'magic-bytes.js'

export default {
  name: 'FileSignature',
  data() {
    return {
      fileTypes: []
    }
  },
  methods: {
    handleChange(file) {
      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file.raw)
      fileReader.onloadend = f => {
        const bytes = new Uint8Array(f.target.result)
        this.fileTypes = filetype(bytes)
        console.log(filetype(bytes))
      }
    }
  }
}
</script>
