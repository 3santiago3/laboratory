import Vue from 'vue'
import store from '@/store'

function formatComponentName(vm) {
  if (vm.$root === vm) return 'root'
  var name = vm._isVue
    ? (vm.$options && vm.$options.name) ||
      (vm.$options && vm.$options._componentTag)
    : vm.name
  return (
    (name ? 'component <' + name + '>' : 'anonymous component') +
    (vm._isVue && vm.$options && vm.$options.__file
      ? ' at ' + (vm.$options && vm.$options.__file)
      : '')
  )
}

// Vue.config.errorHandler = (error, vm, info) => {
//   // Don't ask me why I use Vue.nextTick, it just a hack.
//   // detail see https://forum.vuejs.org/t/dispatch-in-vue-config-errorhandler-has-some-problem/23500
//   Vue.nextTick(() => {
//     store.dispatch('errorLog/addErrorLog', {
//       error,
//       vm,
//       info,
//       url: window.location.href
//     })
//   })
// }

// window.onerror = (message, url, lineNo, columnNo, error) => {
//   // console.log('message', message) // Uncaught TypeError: Cannot read property 'd' of undefined
//   // console.log('url', url) // webpack-internal:///./src/utils/test.js
//   // console.log('lineNo', lineNo) // 3
//   // console.log('columnNo', columnNo) // 13
//   // console.log(error) // TypeError: Cannot read property 'd' of undefined

//   // console.log(typeof error)
//   // console.log(Object.keys(error))
//   console.log(error.__proto__)
//   // for (var key in error) {
//   //   console.log(key)
//   //   // console.log(key + ' => ' + error[key])
//   // }
// }
