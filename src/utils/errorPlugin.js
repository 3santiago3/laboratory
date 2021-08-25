/**
 * 全局异常处理
 * @param {
 * } error
 * @param {*} vm
 */

function isPromise(ret) {
  return (
    ret && typeof ret.then === 'function' && typeof ret.catch === 'function'
  )
}
const errorHandler = (error, vm, info) => {
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

  if (vm) {
    var componentName = formatComponentName(vm)
    console.log(
      '组件 ' + componentName + ' 在 ' + info + ' 情况下抛出全局异常：' + error
    )
  } else {
    console.log('在 ' + info + ' 情况下抛出全局异常：' + error)
  }
}
function registerActionHandle(actions) {
  Object.keys(actions).forEach(key => {
    const fn = actions[key]
    actions[key] = function(...args) {
      const ret = fn.apply(this, args)
      if (isPromise(ret)) {
        return ret.catch(errorHandler)
      } else {
        // 默认错误处理
        return ret
      }
    }
  })
}
const registerVuex = instance => {
  if (instance.$options['store']) {
    const actions = instance.$options['store']['_actions'] || {}
    if (actions) {
      const tempActions = {}
      Object.keys(actions).forEach(key => {
        tempActions[key] = actions[key][0]
      })
      registerActionHandle(tempActions)
    }
  }
}
const registerVue = instance => {
  if (instance.$options.methods) {
    const actions = instance.$options.methods || {}
    if (actions) {
      registerActionHandle(actions)
    }
  }
}

const GlobalError = {
  install: (Vue, options) => {
    // window.onerror
    /**
     * 全局异常处理
     * @param {*} error
     * @param {*} vm
     */
    Vue.config.errorHandler = errorHandler
    Vue.mixin({
      beforeCreate() {
        registerVue(this)
        registerVuex(this)
      }
    })
    Vue.prototype.$throw = errorHandler
  }
}

export default GlobalError
