import SparkMD5 from 'spark-md5'
const delay = require('delay')

onmessage = (e) => {
  const { fileChunkList } = e.data
  if (!fileChunkList) return

  const spark = new SparkMD5.ArrayBuffer()
  let percentage = 0
  let count = 0
  const loadNext = async(index) => {
    await delay(Math.random() * 2000)

    const reader = new FileReader()
    reader.readAsArrayBuffer(fileChunkList[index].file)
    reader.onload = (e) => {
      count++
      spark.append(e.target.result)
      if (count === fileChunkList.length) {
        self.postMessage({
          percentage: 100,
          hash: spark.end()
        })
        self.close()
      } else {
        percentage += 100 / fileChunkList.length
        self.postMessage({
          percentage
        })
        loadNext(count)
      }
    }
  }

  loadNext(0)
}
