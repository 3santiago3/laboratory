const path = require('path')
const { exists, FILE, FOLDER, READABLE } = require('@kwsites/file-exists')
const fs = require('fs')
const mv = require('mv')
const mkdirp = require('mkdirp')
const express = require('express')
const del = require('del')
const cors = require('cors')
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()

const app = express()
const port = 3099

app.use(cors())

const UPLOAD_PATH = 'uploads'

function getChunkDirectory(md5Hash) {
  return path.resolve(__dirname, UPLOAD_PATH, md5Hash)
}

// 返回类似：/uploads/7b38560e7dbf868e58e29984509f2f96
function getChunkFileName(md5Hash, number) {
  return path.resolve(__dirname, UPLOAD_PATH, md5Hash, 'chunk-' + number)
}

// 返回类似：/uploads/7b38560e7dbf868e58e29984509f2f96.mp4
function getFileName(md5Hash, originFileName) {
  const extname = path.extname(originFileName)
  return path.resolve(__dirname, UPLOAD_PATH, md5Hash + extname)
}

// 检查当前文件的所有 chunk 是否都齐全
// 按照顺序 1、2、3、4...
function checkAllChunkExist(
  md5Hash,
  currentChunkNum,
  totalChunkCount,
  callback = function() {}
) {
  const currentChunkFileName = getChunkFileName(md5Hash, currentChunkNum)
  const isCurrentChunkExist = exists(currentChunkFileName, FILE)
  if (isCurrentChunkExist) {
    currentChunkNum++
    // 当前 chunk 的序号大于所有的 chunk 数量，意味着所有的 chunk 都上传好了
    if (currentChunkNum > totalChunkCount) {
      callback(true)
    } else {
      // 递归调用，检查下一块 chunk
      checkAllChunkExist(md5Hash, currentChunkNum, totalChunkCount, callback)
    }
  } else {
    // 有任何一块 chunk 找不到，都意味着还有某些 chunk 没有上传好
    callback(false)
  }
}

// 合并 chunk
function pipeChunk(writeStream, md5Hash, number) {
  const chunkFileName = getChunkFileName(md5Hash, number)
  const isChunkExist = exists(chunkFileName, FILE)

  if (isChunkExist) {
    const sourceStream = fs.createReadStream(chunkFileName)
    sourceStream.pipe(writeStream, {
      end: false
    })
    sourceStream.on('end', function() {
      pipeChunk(writeStream, md5Hash, number + 1)
    })
  } else {
    // 直到找不到下一个 chunk 了，表示所有的 chunk 都处理了
    writeStream.end()
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/is-exist', (req, res) => {
  const { md5Hash, filename: originFileName } = req.query
  const fileName = getFileName(md5Hash, originFileName)
  const isExist = exists(fileName, FILE)
  res.status(200).send({
    isExist
  })
})

// 检查 chunk 是否已经上传过
app.get('/upload', (req, res) => {
  const { md5Hash, flowChunkNumber } = req.query
  const chunkFileName = getChunkFileName(md5Hash, flowChunkNumber) // chunk 命名
  const chunkExist = exists(chunkFileName, FILE)
  console.log(chunkFileName + ' : ' + chunkExist)
  if (chunkExist) {
    res.status(200).send({ isExist: true })
  } else {
    // 我也不知道设置为 204 的意义，只是知道在 flow.js 里面 204 是不属于 successStatuses 的范围
    // 所以 flow.js 就会认为这个检查 chunk 是否存在的结果是：不存在
    res.status(204).send()
  }
})

// 不能在 post 请求里检验 chunk 是否已经上传，因为 post 请求里要拿到 file 数据，是很花时间的
app.post('/upload', multipartMiddleware, (req, res) => {
  // 在 /upload 之前都会对文件先进行 md5Hash 的检验，能进入到这里，证明该文件在服务器尚不存在
  const fields = req.body
  const files = req.files
  const md5Hash = fields['md5Hash'] // 文件 md5 哈希值
  const chunkNumber = fields['flowChunkNumber'] // 第几块 chunk
  const totalChunkCount = fields['flowTotalChunks']
  const chunkFileName = getChunkFileName(md5Hash, chunkNumber) // chunk 命名

  // 先创建 chunk 目录
  // mkdirp：如果 chunk 目录不存在则创建，如果已经存在则什么事情都不做
  const chunkDirectory = getChunkDirectory(md5Hash) // chunk 目录，以文件 md5 哈希值命名
  mkdirp.sync(chunkDirectory)

  mv(files.file.path, chunkFileName, async function(err) {
    if (err) {
      console.log('mv 报错：' + err)
      res.status(500).send('mv 报错：' + err)
      return
    }

    checkAllChunkExist(md5Hash, 1, totalChunkCount, function(checkResult) {
      res.status(200).send({
        chunkUploadSuccess: true,
        canMerge: checkResult
      })
    })
  })
})

app.post('/merge', (req, res) => {
  const { md5Hash, filename: originFileName } = req.query
  const fileName = getFileName(md5Hash, originFileName)
  const writeStream = fs.createWriteStream(fileName)

  writeStream.on('finish', () => {
    const chunkDirectory = getChunkDirectory(md5Hash)
    del(chunkDirectory).then(() => {
      console.log('删除目录 ' + chunkDirectory)
    })
    res.status(200).send('合并成功')
  })

  pipeChunk(writeStream, md5Hash, 1)
})

app.get('/download', (req, res) => {
  const { md5Hash, filename: originFileName } = req.query
  const fileName = getFileName(md5Hash, originFileName)
  console.log(fileName)
  console.log(originFileName)
  res.download(fileName, originFileName)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
