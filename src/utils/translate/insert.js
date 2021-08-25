const fs = require('fs')
const path = require('path')
const {
  baseUrl,
  translateResultUrl,
  outputFolder
} = require('./config/index.js')
const lang = 'zh-cn'
const pathResolve = (url) => {
  return path.resolve(__dirname, url)
}
const insertFile = (fileUrl, langFile) => {
  let targetFile = fs
    .readFileSync(fileUrl, 'utf-8')
    .toString()
  // const translateFile = `../${baseUrl}/src/locale/lang/${lang}/${langFile}`
  const translateFile = `.\\${outputFolder}\\lang\\zh-cn\\vueI18\\index.js`
  const translateData = JSON.parse(
    fs
      .readFileSync(pathResolve(translateFile), 'utf-8')
      .toString()
      .replace('export default ', '')
  )
  // console.log(translateData)
  Object.keys(translateData).forEach((key) => {
    const replaceWord = translateData[key]
    targetFile = targetFile
      .replace(new RegExp(`>${replaceWord}：`, 'g'), `>{{$t('${key}')}}:`)
      .replace(new RegExp(`>${replaceWord}<\/`, 'g'), `>{{$t('${key}')}}</`)
      .replace(new RegExp(`\'${replaceWord}：\'`, 'g'), `this.$t('${key}')+':'`)
      .replace(new RegExp(`\'${replaceWord}！\'`, 'g'), `this.$t('${key}')!`)
      .replace(new RegExp(`\'${replaceWord}\'`, 'g'), `this.$t('${key}')`)
      .replace(
        new RegExp(`([a-zA-Z_-]+=")(${replaceWord})"`, 'g'),
        `:$1$t('${key}')"`
      )
      .replace(
        new RegExp(
          `([a-zA-Z_-]+=")(${replaceWord})((\/|[a-zA-Z]|\:|：)*)(")`,
          'g'
        ),
        `:$1$t('${key}')+'$3'`
      )
      .replace(new RegExp(`${replaceWord}`, 'g'), `$t('${key}')`)
  })
  fs.writeFileSync(pathResolve(fileUrl), targetFile)
}

;(function() {
  const data = JSON.parse(fs.readFileSync(pathResolve(translateResultUrl)))
  Object.entries(data).forEach(([key, value]) => {
    const dealComponents = 'src\\components'
    const dealView = 'src\\views\\vueI18\\index'
    if (key.includes(dealComponents) || key.includes(dealView)) {
      const arr = key.replace(dealComponents, '').replace(dealView, '').split('\\')
      // insertFile(`../${baseUrl}/${key}`, `${arr[1]}/${arr.pop().split('.')[0]}.js`)
      insertFile(path.resolve(__dirname, `..\\..\\..\\..\\${baseUrl}\\${key}`))
    }
  })
  console.log('successful!')
})()
