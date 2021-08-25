import Storage from 'store2'

const ERRORS = 'errors'

const state = {
  errors: []
}

const mutations = {
  STORE_ERRORS: (state, errorInfo) => {
    state.errors.push(errorInfo)
    Storage.set(ERRORS, state.errors)
  }
}

const actions = {
  storeErrors({ commit }, errorInfo) {
    commit('STORE_ERRORS', errorInfo)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
