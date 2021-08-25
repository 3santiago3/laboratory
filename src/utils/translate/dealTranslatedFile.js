const fs = require('fs')
const path = require('path')
const {
  dealFileUrl,
  translateFileUrl,
  translateResultUrl
} = require('./config/index.js')
const pathResolve = (url) => {
  return path.resolve(__dirname, url)
}
;(function() {
  const data = JSON.parse(fs.readFileSync(pathResolve(dealFileUrl)).toString())
  const translatedData = JSON.parse(
    fs.readFileSync(pathResolve(translateFileUrl)).toString()
  )
  const lastData = Object.keys(data).reduce((current, item) => {
    return {
      ...current,
      // 1.文件内去重 2.方便后续方便插入，中文由长到短排序
      [item]: data[item].reduce((arr, obj, i) => {
        return [
          ...arr,
          {
            ...obj,
            // 1.去除英文缩写 2.驼峰写法
            id: translatedData[item][i]['en']
              .replace(/\'|？|\?|\!|！|,/gi, function(a, b) {
                return ''
              })
              .replace(/\s(\w)/g, function(a, b) {
                return b.toUpperCase()
              })
              .replace(/\b(\w)|\s(\w)/g, function(m) {
                return m.toLowerCase()
              }),
            'zh-cn': obj.en,
            en: translatedData[item][i]['en']
          }
        ].sort((a, b) => {
          return b['zh-cn'].length - a['zh-cn'].length
        }, [])
      }, [])
    }
  }, {})
  fs.writeFileSync(pathResolve(translateResultUrl), JSON.stringify(lastData))
  console.log('successful!')
})()
