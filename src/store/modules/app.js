import Cookies from 'js-cookie'
import axios from 'axios'
import ErrorService from '@/utils/errorHandle/ErrorService'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  todos: [],
  errors: [],
  users: []
}

const getters = {
  getTodo: (state) => (id) => {
    return state.todos.find((todo) => todo.id === id)
  },
  getUser: (state) => (id) => {
    return state.users.find((user) => user.id === id)
  }
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  STORE_TODOS: (state, data) => {
    state.todos = data
  },

  STORE_ERRORS: (state, error) => {
    // Call Error Service here
    ErrorService.onError(error)
    ErrorService.initHandler()

    // Store error to state(optional)
    if (error.response) {
      state.errors = error.response
    }
  },

  STORE_USERS: (state, data) => {
    state.users = data
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  async getTodos({ commit }) {
    try {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/todos`
      )
      const { data } = response
      commit('STORE_TODOS', data)
    } catch (error) {
      // Handling HTTPs Errors
      commit('STORE_ERRORS', error)
    }
  },
  async getUsers({ commit }) {
    try {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com1/users`
      )
      const { data } = response
      commit('STORE_USERS', data)
    } catch (error) {
      // Handling HTTPs Errors
      commit('STORE_ERRORS', error)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
