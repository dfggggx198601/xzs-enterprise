const state = {
  routes: []
}

const mutations = {
  initRoutes: (state) => {
    const { constantRoutes } = require('@/router')
    state.routes = constantRoutes
  }
}

const actions = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
