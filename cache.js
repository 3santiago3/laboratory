export default class Cache {
  constructor(axios, config = {}) {
    this.axios = axios
    this.caches = []
    if (!this.axios) {
      throw new Error('请传入axios实例')
    }
    this.config = config
    this.defaultConfig = {
      cache: false,
      expire: 100 * 1000 // 100秒
    }
    this.CancelToken = this.axios.CancelToken
    this.init()
  }

  init() {
    this.requestInterceptor(this.config.requestInterceptorFn)
    this.responseInterceptor(this.config.responseInterceptorFn)
    window.onbeforeunload = () => {
      this.mapStorage()
    }
  }

  requestInterceptor(callback) {
    this.axios.interceptors.request.use(async config => {
      const newConfig = callback && (await callback(config))
      config = newConfig || config
      const { url, data, params, cacheMode, cache = this.defaultConfig.cache, expire = this.defaultConfig.expire } = config
      if (cache === true) {
        const getKey = data ? `${url}?cacheParams=${data}` : `${url}?cacheParams=${params}`
        const obj = this.getStorage(cacheMode, getKey)
        // 判断缓存数据是否存在
        if (obj) {
          const curTime = this.getExpireTime()
          const source = this.CancelToken.source()
          config.cancelToken = source.token
          // 判断缓存数据是否存在，存在的话是否过期，如果没过期就停止请求返回缓存
          if (curTime - obj.expire < expire) {
            source.cancel(obj)
          } else {
            this.removeStorage(cacheMode, url)
          }
        }
      } else {
        this.clearStorage(url)
      }
      return config
    }, error => {
      return Promise.reject(error)
    })
  }

  responseInterceptor(callback) {
    this.axios.interceptors.response.use(async response => {
      const newResponse = callback && (await callback(response))
      response = newResponse || response
      // the http request error, do not store the result, direct return result
      if (response.status !== 200 || response.data.ret || !response.data.success) {
        return response.data
      }
      /*
           * `data` is the data to be sent as the request body, only applicable for request methods 'PUT', 'POST', and 'PATCH'
           * `params` are the URL parameters to be sent with the request, can be applicable for request methods 'GET'
           */
      const { url, cache, cacheMode, data, params } = response.config
      if (cache === true) {
        const obj = {
          expire: this.getExpireTime(),
          params,
          data,
          result: response.data
        }
        const setKey = data ? `${url}?cacheParams=${data}` : `${url}?cacheParams=${params}`
        this.caches.push(setKey)
        this.setStorage(cacheMode, setKey, obj)
      }
      return response.data
    }, async error => {
      const newError = callback && (await callback(newError))
      error = newError || error
      // 返回缓存数据
      if (this.axios.isCancel(error)) {
        return Promise.resolve(error.message.result)
      }
      return Promise.reject(error)
    })
  }

  // 设置缓存
  setStorage(mode = 'sessionStorage', key, cache) {
    window[mode].setItem(key, JSON.stringify(cache))
  }

  // 获取缓存
  getStorage(mode = 'sessionStorage', key) {
    const data = window[mode].getItem(key)
    return JSON.parse(data)
  }

  // 清除缓存
  removeStorage(mode = 'sessionStorage', key) {
    window[mode].removeItem(key)
  }

  // 设置过期时间
  getExpireTime() {
    return new Date().getTime()
  }

  // 清空缓存
  clearStorage(key) {
    if (window.localStorage.getItem(key)) {
      window.localStorage.removeItem(key)
    } else {
      window.sessionStorage.removeItem(key)
    }
  }

  // 清空没用到的缓存
  mapStorage() {
    const length = window.localStorage.length
    if (length) {
      for (let i = 0; i < length; i++) {
        const key = window.localStorage.key(i)
        if (!this.caches.includes(key) && key.includes('?cacheParams=')) {
          window.localStorage.removeItem(key)
        }
      }
    }
  }
}

