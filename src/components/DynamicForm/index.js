import VueFormMaker from './components/VueFormMaker'

const install = function(Vue, opts = {}) {
  Vue.component('VueFormMaker', VueFormMaker)
}

const API = {
  install,
  version: ''
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default API
