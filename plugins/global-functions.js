export default {
  install (Vue) {
    Vue.prototype.$eventBus = new Vue()
    Vue.prototype.$showLoading = () => {
      Vue.prototype.$eventBus.$emit('showLoading')
    }
    Vue.prototype.$hideLoading = () => {
      Vue.prototype.$eventBus.$emit('hideLoading')
    }
  }
}