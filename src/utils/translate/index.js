const fs = require('fs')
const path = require('path')
const { baseUrl, dealFileUrl } = require('./config/index.js')
;(() => {
  const result = {}
  // 截取中文
  const matchChinese = function(file) {
    const data = fs.readFileSync(file)
    const reg = /('|"|`|\(|（|>|\/|\})[^\u0000-\u00FF].*?('|"|`|）|\)|<|\/|\{｜\$)[^\u0000-\u00FF]*/g
    const saveChinese = data.toString().match(reg)
    const key = file.split(baseUrl + '\\')[1]
    if (saveChinese && saveChinese.length > 0) {
      saveChinese
        .reduce((current, ch) => {
          return [
            ...current,
            ...(ch.match(
              /[\u4E00-\u9FA5]+[\,|，|?|？｜！｜\!｜：]?[\u4E00-\u9FA5]*/g
            ) || [])
          ]
        }, [])
        .map((item, i) => {
          // 翻译直接翻译en即可
          result[key] = [
            ...(result[key] || []),
            {
              en: item,
              url: key
            }
          ]
        })
    }
  }
  // 递归文件夹
  const recursionFile = function(entry) {
    const dirInfo = fs.readdirSync(entry)
    dirInfo.forEach(item => {
      const location = path.join(entry, item)
      const info = fs.statSync(location)
      if (info.isDirectory()) {
        if (
          /node_modules|locale|lang|.cache-loader|.git|build/.test(location)
        ) {
          return false
        }
        recursionFile(location)
      } else {
        // 指定翻译的目录
        if (!/src\\views\\vueI18\\index/.test(location)) {
          return false
        }
        const fileExt = path.extname(location)
        const allowFileType = ['.js', '.html', '.vue', '.json']
        const filterRes = allowFileType.findIndex(item => item === fileExt)
        ~filterRes && matchChinese(location)
      }
    })
  }
  recursionFile(path.resolve(__dirname, `../../../../${baseUrl}/src/views/vueI18`))
  //
  fs.writeFileSync(path.resolve(__dirname, dealFileUrl), JSON.stringify(result))
  console.log('successful and file num:' + Object.keys(result).length)
})()
