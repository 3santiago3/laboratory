setTimeout(() => {
  console.log(document.getElementById('test').parentNode)

  new Promise((resolve, reject) => {
    reject('reject...')
  })
}, 500)
