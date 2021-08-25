window.addEventListener('error', (event) => {
  console.log(event)
  console.log(event.error)
})

window.onerror = (message, url, lineNo, columnNo, error) => {
  // console.log('message', message) // Uncaught TypeError: Cannot read property 'd' of undefined
  // console.log('url', url) // webpack-internal:///./src/utils/test.js
  // console.log('lineNo', lineNo) // 3
  // console.log('columnNo', columnNo) // 13
  // console.log(error) // TypeError: Cannot read property 'd' of undefined

  // console.log(typeof error)
  // console.log(Object.keys(error))
  console.log(error)
  // for (var key in error) {
  //   console.log(key)
  //   // console.log(key + ' => ' + error[key])
  // }
}

setTimeout(() => {
  console.log('cccccccccc')
  const c = c.d
}, 500)

