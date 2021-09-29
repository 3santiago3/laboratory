<template>
  <div class="big-file-upload">
    <div>
      注意点
      <ul>
        <li>
          会根据文件的相对路径 relativePath
          来为每个文件生成唯一标识，如果两个文件的唯一标识一样，代表着是同一路径的同一文件，则不再
          push 到 f.files 里了
        </li>
        <li>
          如何知道某个文件的上传状态是成功还是失败，在 fileObj
          是没有提供字段的，只能通过事件（fileSuccess、fileError）监听来获取
        </li>
      </ul>
    </div>

    <el-row>
      <el-col :span="14">
        <div class="top">
          <div
            ref="dropFileContainer"
            style="height: 100px; width: 100px; background-color: #f1f1f1;"
          >
            将文件或文件夹拖拽到此处
          </div>
          <el-button
            ref="singleFileButton"
            type="primary"
          >选择单个文件</el-button>
          <el-button
            ref="multipleFileButton"
            type="primary"
          >选择多个文件</el-button>
          <el-button
            ref="videoFileButton"
            type="primary"
          >选择视频文件</el-button>
          <el-button
            ref="directoryFileButton"
            type="primary"
          >选择文件夹</el-button>
          <el-button type="primary" @click="startAll">开始全部</el-button>
          <el-button type="primary" @click="pauseAll">暂停全部</el-button>
        </div>
        <div class="main">
          <el-table
            :data="files"
            style="width: 100%"
            highlight-current-row
            :row-class-name="initRowClassName"
            @row-click="handleRowClick"
          >
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="formatSize" label="大小" />
            <el-table-column label="信息">
              <template slot-scope="{ row }">
                <div>唯一标识：{{ row.uniqueIdentifier }}</div>
                <div>平均速率：{{ formatAverageSpeed(row.averageSpeed) }}</div>
                <div>进度：{{ formatProgress(row.progress) }}</div>
                <div>剩余时间：{{ formatTimeRemaining(row.timeRemaining) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="{ row }">
                <div>paused：{{ row.paused }}</div>
                <span v-show="row.paused">
                  <i class="el-icon-video-pause" />
                </span>
                <div>上传状态：{{ row.status }}</div>
                <span v-show="row.status === 'success'">
                  <i class="el-icon-success" style="color: #67C23A;" />
                </span>
                <span v-show="row.status === 'error'">
                  <i class="el-icon-error" style="color: #F56C6C;" />
                </span>
                <span v-show="row.status === 'uploading'">
                  <i class="el-icon-more" style="color: #409EFF;" />
                </span>
                <span v-show="row.status === 'pending' && !row.paused">
                  <i class="el-icon-loading" style="color: #E6A23C;" />
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="{ row }">
                <el-button
                  v-show="
                    row.status !== 'success' &&
                      row.status !== 'error' &&
                      row.paused
                  "
                  type="text"
                  @click="start(row.uniqueIdentifier)"
                >开始</el-button>
                <el-button
                  v-show="
                    row.status !== 'success' &&
                      row.status !== 'error' &&
                      !row.paused
                  "
                  type="text"
                  @click="pause(row.uniqueIdentifier)"
                >暂停</el-button>
                <el-button
                  type="text"
                  @click="cancel(row.uniqueIdentifier)"
                >取消</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="8" :offset="2">
        <div v-if="currentFile" class="cube-container">
          <div
            v-for="cube in currentFile.chunks"
            :key="cube.offset"
            :class="{
              cube: true,
              reading: cube.status === 'reading',
              uploading: cube.status === 'uploading',
              pending: cube.status === 'pending',
              success: cube.status === 'success',
              error: cube.status === 'error',
            }"
          >
            <span>offset: {{ cube.offset }}</span>
            <!-- <span>size: {{ cube.bytes && cube.bytes.size }}</span>
            <span>pendingRetry: {{ cube.pendingRetry }}</span>
            <span>retries: {{ cube.retries }}</span>
            <span>tested: {{ cube.tested }}</span>
            <span>progress: {{ formatProgress(cube.progress) }}</span>
            <span>status: {{ cube.status }}</span> -->
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// import Flow from '@flowjs/flow.js'

export default {
  name: 'BigFileUpload',
  data() {
    return {
      flow: null, // Flow 实例
      files: [],
      currentFile: null
    }
  },
  computed: {
    originFileObjs() {
      if (!this.flow) {
        return []
      } else {
        if (!this.flow.files) {
          return []
        } else {
          return this.flow.files
        }
      }
    }
  },
  mounted() {
    this.flow = new window.Flow({
      target: 'http://localhost:3000/upload',
      testChunks: false,
      chunkSize: 3 * 1024 * 1024
    })

    if (!this.flow.support) this.$message.error('你的浏览器版本太低了')

    this.flow.assignDrop(this.$refs.dropFileContainer) // 将文件或文件夹拖拽到此处
    this.flow.assignBrowse(this.$refs.singleFileButton.$el, false, true) // 选择单个文件
    this.flow.assignBrowse(this.$refs.multipleFileButton.$el, false, false) // 选择多个文件
    this.flow.assignBrowse(this.$refs.videoFileButton.$el, false, false, {
      accept: 'video/*'
    }) // 选择视频文件
    this.flow.assignBrowse(this.$refs.directoryFileButton.$el, true) // 选择文件夹

    this.flow.on('filesSubmitted', files => {
      // Flow 已经根据 relativePath 把相同文件过滤了
      files.forEach(fileObj => {
        // averageSpeed // 文件平均上传速率
        // chunkSize // 每一块 chunk 的大小
        // chunks // 存放 chunkObj 的数组
        // currentSpeed // 文件此刻上传速率
        // error // Indicated if file has encountered an error
        // file // 原生文件 File 对象
        // flowObj // Flow 实例
        // name // 文件名称
        // paused // 文件是否处于暂停状态
        // relativePath // 文件相对路径
        // size // 文件大小
        // uniqueIdentifier // 文件唯一标识
        // _lastProgressCallback // 上次进入 progress 事件的时间戳
        // _prevProgress // 在这个文件暂停上传之后，又恢复上传时，可以马上显示上传进度
        // _prevUploadedSize // 上次进入 progress 事件时已上传的文件大小

        // fileObj.paused = true// 我们不希望马上发起上传请求，希望等到我们点击了“开始上传”按钮才上传
        const { name, size, uniqueIdentifier, paused } = fileObj
        this.files.push({
          name,
          size,
          formatSize: this.$filesize(size),
          uniqueIdentifier,
          averageSpeed: 0,
          progress: 0,
          timeRemaining: Number.POSITIVE_INFINITY,
          paused,
          status: 'pending' // 状态：'pending' 'uploading'、'success'、'error'，业务定义的，与 Flow 无关
        })
      })

      this.flow.upload()
    })

    this.flow.on('uploadStart', () => {
      this.updateFileAndChunkInfo(this.originFileObjs)
    })

    // 可以用来更新文件状态/信息的事件 fileProgress、fileProgress、fileError
    this.flow.on('fileSuccess', (fileObj, message, chunk) =>
      this.updateFileAndChunkInfo([fileObj], 'success')
    )
    this.flow.on('fileError', (fileObj, message, chunk) =>
      this.updateFileAndChunkInfo([fileObj], 'error')
    )
    this.flow.on('fileProgress', (fileObj, chunk) =>
      this.updateFileAndChunkInfo([fileObj])
    )
  },
  methods: {
    handleRowClick(row) {
      const file = this.files.find(file => row.uniqueIdentifier === file.uniqueIdentifier)
      if (file) {
        this.currentFile = file
      }
    },
    // 更新文件的进度、速率、剩余事件、状态等
    updateFileAndChunkInfo(fileObjs, status) {
      const length = fileObjs.length
      for (let i = 0; i < length; i++) {
        const fileObj = fileObjs[i]
        const file = this.files.find(
          file => file.uniqueIdentifier === fileObj.uniqueIdentifier
        )

        if (file) {
          // 先更新 chunks
          const chunkObjs = fileObj.chunks
          const chunks = file.chunks
          if (chunkObjs && !chunks) {
            const arr = []
            fileObj.chunks.forEach(chunkObj => {
              // bytes // Blob 对象，使用 Blob.slice() 返回的值
              // chunkSize // 当前 chunk 的大小
              // endByte
              // fileObj // FlowFile 实例
              // filename
              // flowObj // Flow 实例
              // loaded // 当前 chunk 已上传的字节大小
              // offset // 第几块 chunk
              // pendingRetry // 是否等待重试上传
              // preprocessState // 预处理阶段
              // readState // 读取 File 阶段
              // retries // 重试次数
              // startByte
              // tested
              // total
              // xhr // XHR 实例
              const {
                bytes,
                offset,
                pendingRetry,
                retries,
                tested
              } = chunkObj
              arr.push({
                bytes,
                offset,
                pendingRetry,
                retries,
                tested,
                progress: chunkObj.progress(),
                status: chunkObj.status()
              })
            })
            this.$set(file, 'chunks', arr)
          } else if (chunkObjs && chunks) {
            chunkObjs.forEach(chunkObj => {
              const chunk = file.chunks.find(chunk => chunk.offset === chunkObj.offset)
              if (chunk) {
                chunk.bytes = chunkObj.bytes // chunk 在还没 send() 的时候，bytes 是没有的，所以这一步骤是需要的
                chunk.pendingRetry = chunkObj.pendingRetry
                chunk.retries = chunkObj.retries
                chunk.tested = chunkObj.tested
                chunk.progress = chunkObj.progress()
                chunk.status = chunkObj.status()
              }
            })
          }

          // 再更新 file
          file.averageSpeed = fileObj.averageSpeed
          file.progress = fileObj.progress()
          file.timeRemaining = fileObj.timeRemaining()

          if (status) {
            file.status = status
          } else {
            if (fileObj.isUploading()) {
              file.status = 'uploading'
              continue
            }

            const chunks = fileObj.chunks
            const pending = chunks.every(chunk => chunk.status() === 'pending')
            if (pending) {
              file.status = 'pending'
              continue
            }

            file.status = ''
          }
        }
      }
    },
    initRowClassName({ row, rowIndex }) {
      if (row.status === 'success') {
        return 'success'
      } else if (row.status === 'error') {
        return 'error'
      }
    },
    formatAverageSpeed(speed) {
      return this.$filesize(speed) + ' / 秒'
    },
    formatProgress(value) {
      return Math.floor(value * 100) + '%'
    },
    formatTimeRemaining(value) {
      return this.secondsToStr(value)
    },
    secondsToStr(temp) {
      var years = Math.floor(temp / 31536000)
      if (years) {
        return years + ' 年'
      }
      var days = Math.floor((temp %= 31536000) / 86400)
      if (days) {
        return days + ' 天'
      }
      var hours = Math.floor((temp %= 86400) / 3600)
      if (hours) {
        return hours + ' 小时'
      }
      var minutes = Math.floor((temp %= 3600) / 60)
      if (minutes) {
        return minutes + ' 分钟'
      }
      var seconds = temp % 60
      return seconds + ' 秒'
    },
    startAll() {
      this.flow.resume()
      this.files.forEach(file => {
        file.paused = false
      })
      this.updateFileAndChunkInfo(this.originFileObjs)
    },
    pauseAll() {
      this.flow.pause()
      this.files.forEach(file => {
        file.paused = true
      })
      this.updateFileAndChunkInfo(this.originFileObjs)
    },
    start(uniqueIdentifier) {
      const fileObj = this.originFileObjs.find(
        fileObj => fileObj.uniqueIdentifier === uniqueIdentifier
      )
      const file = this.files.find(
        file => file.uniqueIdentifier === uniqueIdentifier
      )
      if (fileObj) {
        fileObj.resume()
        this.updateFileAndChunkInfo([fileObj])
      }
      if (file) {
        file.paused = false
      }
    },
    pause(uniqueIdentifier) {
      const fileObj = this.originFileObjs.find(
        fileObj => fileObj.uniqueIdentifier === uniqueIdentifier
      )
      const file = this.files.find(
        file => file.uniqueIdentifier === uniqueIdentifier
      )
      if (fileObj) {
        fileObj.pause()
        this.updateFileAndChunkInfo([fileObj])
      }
      if (file) {
        file.paused = true
      }
    },
    cancel(uniqueIdentifier) {
      const fileObj = this.originFileObjs.find(
        fileObj => fileObj.uniqueIdentifier === uniqueIdentifier
      )
      if (fileObj) {
        fileObj.cancel()
      }
      for (var i = this.files.length - 1; i >= 0; i--) {
        if (this.files[i].uniqueIdentifier === uniqueIdentifier) {
          this.files.splice(i, 1)
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
/* ::v-deep .el-table__row.success td{
  background-color: rgb(225, 243, 216);
}

::v-deep .el-table__row.error td{
  background-color: rgb(253, 226, 226);
} */

.cube-container {
  border: 1px solid #000;
  padding: 2px;
  overflow: hidden;
  width: 100%;
  .cube {
    // width: 120px;
    // height: 120px;
    width: 40px;
    height: 40px;
    border: 1px solid #000;
    float: left;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    font-size: 10px;
    &.reading {
      background-color: #409EFF;
    }
    &.uploading {
      background-color: #FAECD8;
    }
    &.pending {
      background-color: #909399;
    }
    &.success {
      background-color: #67C23A;
    }
    &.error {
      background-color: #F56C6C;
    }
    span {
      display: block;
    }
  }
}
</style>
