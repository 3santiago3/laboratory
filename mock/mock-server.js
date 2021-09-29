const chokidar = require('chokidar')
const bodyParser = require('body-parser')
const chalk = require('chalk')
const path = require('path')
const Mock = require('mockjs')

const mockDir = path.join(process.cwd(), 'mock')

function registerRoutes(app) {
  let mockLastIndex
  // mocks 大概长这样 [{ url: '', type: '', response: config => { return {} } }, ...]
  const { mocks } = require('./index.js')
  const mocksForServer = mocks.map(route => {
    return responseFake(route.url, route.type, route.response)
  })
  for (const mock of mocksForServer) {
    app[mock.type](mock.url, mock.response)
    // app._router.stack 里面不完全是我们注册的路由，还包含其他的东西
    // 我们注册的路由是被 push 到 app._router.stack 里面的
    mockLastIndex = app._router.stack.length
  }
  // 我们注册的路由的长度
  const mockRoutesLength = Object.keys(mocksForServer).length
  return {
    mockRoutesLength: mockRoutesLength,
    mockStartIndex: mockLastIndex - mockRoutesLength // app._router.stack 里面第一个我们注册的路由的索引
  }
}

// 使用 require 语法导入一个模块时，会将该模块缓存在 require.cache
// 当我们修改了 mock 接口文件后，会再次执行 require()，但是因为有缓存了，会导致直接从缓存获取
// 那么修改后的 mock 接口就没法生效了
// 那就可以通过删除 require.cache 里的对应的文件缓存来解决
function unregisterRoutes() {
  // require.cache 是一个 object
  // 大概长这样
  // {
  //   'D:\Desktop\vue-admin-template-master\node_modules\esrecurse\package.json': {},
  //   'D:\Desktop\vue-admin-template-master\mock\mock-server.js': {},
  //   ...
  // }
  Object.keys(require.cache).forEach(key => {
    if (key.includes(mockDir)) {
      // require.resolve() 用来查询某个模块文件的完整绝对路径的文件名
      // 比如 D:\Desktop\vue-admin-template-master\mock\index.js
      // 保证路径和 require.cache 的 key 值一致
      delete require.cache[require.resolve(key)]
    }
  })
}

// for mock server
const responseFake = (url, type, respond) => {
  return {
    // url: new RegExp(`${process.env.VUE_APP_BASE_API}${url}`),
    url: new RegExp(`${url}`),
    type: type || 'get',
    response(req, res) {
      console.log('request invoke:' + req.path)
      res.json(
        Mock.mock(respond instanceof Function ? respond(req, res) : respond)
      )
    }
  }
}

// devServer 的 after 配置
// after：在服务内部的所有其他中间件（express 中间件）之后， 提供执行自定义中间件的功能
module.exports = app => {
  // app是express实例
  // parse app.body
  // https://expressjs.com/en/4x/api.html#req.body
  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  )

  // 注册路由到 webpack-dev-server 启动的服务上（app.get('xxx', (req, res) => {})）
  const mockRoutes = registerRoutes(app)
  var mockRoutesLength = mockRoutes.mockRoutesLength
  var mockStartIndex = mockRoutes.mockStartIndex

  // watch files, hot reload mock server
  chokidar
    .watch(mockDir, {
      ignored: /mock-server/,
      ignoreInitial: true
    })
    .on('all', (event, path) => {
      if (event === 'change' || event === 'add') {
        try {
          // 把我们注册到的路由移除，原本存在于 app._router.stack 的不动
          app._router.stack.splice(mockStartIndex, mockRoutesLength)

          // clear routes cache
          unregisterRoutes()

          // 重新注册路由
          const mockRoutes = registerRoutes(app)
          mockRoutesLength = mockRoutes.mockRoutesLength
          mockStartIndex = mockRoutes.mockStartIndex

          console.log(
            chalk.magentaBright(
              `\n > Mock Server hot reload success! changed  ${path}`
            )
          )
        } catch (error) {
          console.log(chalk.redBright(error))
        }
      }
    })
}
