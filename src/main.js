import Vue from 'vue'
import moment from 'moment'
import Storage from 'store2'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

const md5 = require('md5')

// window.addEventListener('error', event => {
//   // console.log('************* error ****************')
//   const { target, colno, lineno, error, filename, message } = event
//   const source = target.src || target.href
//   const errorInfo = {
//     catchSource: 'addEventListener error', // 使用何种方法捕获的
//     type: event.type // 错误类型
//   }
//   if (source) {
//     errorInfo.message = target.nodeName + ' 加载错误' // 错误信息
//     errorInfo.info = '资源地址 ' + source // 其他信息，例如 mounted hook
//   } else {
//     errorInfo.message = message // 错误信息
//     errorInfo.fileName = filename // 文件名、组件名
//     errorInfo.info = '第 ' + colno + ' 行，第 ' + lineno + ' 列' // 其他信息，例如 mounted hook
//     errorInfo.stack = error.stack // 错误堆栈
//   }
//   // console.log(errorInfo)
//   storeErrors(errorInfo)
// }, true)

// window.addEventListener('unhandledrejection', promiseRejectionEvent => {
//   // console.log('************* unhandledrejection ****************')
//   const errorInfo = {
//     message: promiseRejectionEvent.reason, // 错误信息
//     //   fileName, // 文件名、组件名
//     //   stack: error.stack, // 错误堆栈
//     //   info, // 其他信息，例如 mounted hook
//     catchSource: 'addEventListener unhandledrejection', // 使用何种方法捕获的
//     type: promiseRejectionEvent.type // 错误类型
//   }
//   // console.log(errorInfo)
//   storeErrors(errorInfo)
// })

// Vue.config.errorHandler = (error, vm, info) => {
//   Vue.nextTick(() => {
//     // console.log('************* errorHandler ****************')
//     let fileName = ''
//     if (vm) fileName = formatComponentName(vm)
//     const errorInfo = {
//       message: error.message, // 错误信息
//       fileName, // 文件名、组件名
//       stack: error.stack, // 错误堆栈
//       info, // 其他信息，例如 mounted hook
//       catchSource: 'Vue.config.errorHandler' // 使用何种方法捕获的
//     }
//     // console.log(errorInfo)
//     storeErrors(errorInfo)
//   })
// }

// function formatComponentName(vm) {
//   if (vm.$root === vm) return 'root'
//   var name = vm._isVue
//     ? (vm.$options && vm.$options.name) ||
//       (vm.$options && vm.$options._componentTag)
//     : vm.name
//   return (
//     (name ? 'component <' + name + '>' : 'anonymous component') +
//     (vm._isVue && vm.$options && vm.$options.__file
//       ? ' at ' + (vm.$options && vm.$options.__file)
//       : '')
//   )
// }

// function storeErrors(errorInfo) {
//   const id = md5(JSON.stringify(errorInfo))
//   // console.log(id)

//   errorInfo.time = moment().format('YYYY-MM-DD HH:mm:ss') // 错误发生的时间
//   errorInfo.timestamp = moment().valueOf() // 错误发生的时间戳
//   errorInfo.url = window.location.href // 路由地址、链接

//   const ERRORS_KEY = 'errors'
//   let errors = Storage.get(ERRORS_KEY)
//   if (Array.isArray(errors)) {
//     const index = errors.findIndex(error => error.id === id)
//     if (index === -1) {
//       errorInfo.id = id
//       errors.push(errorInfo)
//     }
//   } else {
//     errorInfo.id = id
//     errors = [errorInfo]
//   }
//   Storage.set(ERRORS_KEY, errors)
// }

import '@/icons' // icon
import '@/permission' // permission control

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false

// import VueI18n from 'vue-i18n'
// Vue.use(VueI18n)

// // 准备翻译的语言环境信息
// const messages = {
//   en: {
//     message: {
//       hello: '{msg} world'
//     }
//   },
//   ja: {
//     message: {
//       hello: 'こんにちは、世界'
//     }
//   }
// }

// // 通过选项创建 VueI18n 实例
// const i18n = new VueI18n({
//   locale: 'ja', // 设置地区
//   messages // 设置地区信息
// })

import VueFormMaker from '@/components/DynamicForm/index'
Vue.use(VueFormMaker)

new Vue({
  el: '#app',
  router,
  store,
  // i18n,
  render: h => h(App)
})
