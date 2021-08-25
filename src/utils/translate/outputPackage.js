const fs = require('fs')
const path = require('path')
const pathResolve = (url) => { return path.resolve(__dirname, url) }
const { baseUrl, translateResultUrl } = require('./config/index.js')
const outputUrl = `./outputData/lang/`
// 删除
const deleteFolder = (path) => {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);
    (files instanceof Array ? files : []).forEach(function(file, index) {
      const curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
// 创建文件
const createDirsSync = (folderName, fileName, data, lang) => {
  if (!fs.existsSync(pathResolve(`${lang}/${folderName}`))) {
    fs.mkdirSync(
      pathResolve(`${lang}/${folderName}`),
      { recursive: true },
      (err) => {
        if (err) throw err
      }
    )
  }
  let oldData = {}
  if (fs.existsSync(pathResolve(`${lang}/${folderName}/${fileName}.js`))) {
    oldData = JSON.parse(
      (fs
        .readFileSync(pathResolve(`${lang}/${folderName}/${fileName}.js`))).toString()
        .replace('export default ', '')
    )
  } else {
    fs.appendFileSync(
      pathResolve(`${lang}/index.js`),
      `import ${`${folderName}-${fileName}`.replace(/-(\w)/g, (a, b) => {
        return b.toUpperCase()
      })} from "./${folderName}/${fileName}"\n`
    )
  }
  const pushData = data.reduce((current, item) => {
    return {
      ...current,
      [item.id]: item[lang.split('/').pop()]
    }
  }, {})

  const result = {
    ...oldData,
    ...pushData
  }
  fs.writeFileSync(
    pathResolve(`${lang}/${folderName}/${fileName}.js`),
    `export default ${JSON.stringify(result)}`
  )
}
;(function() {
  const data = JSON.parse(
    fs.readFileSync(pathResolve(translateResultUrl)).toString()
  )
  deleteFolder(pathResolve(outputUrl + 'en'))
  deleteFolder(pathResolve(outputUrl + 'zh-cn'))
  let totalImport = ''
  const dealComponents = 'src\\components\\'
  const dealView = 'src\\views\\'
  const dealFile = Object.keys(data).filter((obj) => {
    // 只处理view下方的文件
    return obj.includes(dealComponents) || obj.includes(dealView)
  })
  dealFile.map((item, index) => {
    const commonPath = item.includes(dealComponents) ? dealComponents : dealView
    const fileExt = path.extname(item)
    const dealUrl = item.split(commonPath)[1].split('\\')
    const folderName = dealUrl[0]
    const fileName = dealUrl.pop().split(fileExt)[0]
    totalImport += `...${`${folderName}-${fileName}`.replace(/-(\w)/g, (a, b) => {
      return b.toUpperCase()
    })},`
    createDirsSync(folderName, fileName, data[item], outputUrl + 'en')
    createDirsSync(folderName, fileName, data[item], outputUrl + 'zh-cn')
    if (dealFile.length === index + 1) {
      fs.appendFileSync(
        pathResolve(outputUrl + 'en/index.js'),
        `export default {${totalImport}}`
      )
      fs.appendFileSync(
        pathResolve(outputUrl + 'zh-cn/index.js'),
        `export default {${totalImport}}`
      )
    }
  })
  console.log('successful!')
})()
