import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { Store } from '@zh/common-utils/store'
import FeiLiu from '@zh/feiliu-ant'

import storage from '@zh/common-utils/utils/storage'
import GlobalFunctions from '../plugins/global-functions'

import RuleDesign from '../lib'

// 兼容老板本浏览器
import 'core-js'

// 安装设计器
Vue.use(RuleDesign)

const store = new Store(Vue)
Vue.use(FeiLiu)
Vue.use(GlobalFunctions)
Vue.config.productionTip = false

storage.setToken('token', 24 * 3600)
const app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

const _showLoading = Vue.prototype.$showLoading
Vue.prototype.$showLoading = function () {
  _showLoading.start = new Date().getTime()
  return _showLoading()
}
const _hideLoading = Vue.prototype.$hideLoading
Vue.prototype.$hideLoading = function () {
  let end = new Date().getTime()
  if (end - _showLoading.start < 300) {
    setTimeout(_hideLoading, 300)
    return
  }
  return _hideLoading()
}

// 扩展弹框, 增加设置样式名和皮肤的能力
const _dialog = Vue.prototype.dialog
Vue.prototype.dialog = function ({ className = 'rule-design-dialog', theme = 'default', onClose, ...options }) {
  return new Promise((resolve, reject) => {
    // 给外出包装本地化Provider，避免组件报错
    // if (options.body && options.body.constructor.name === 'VNode') {
    //   options.body = app.$createElement(ConfigProvider, {
    //     props: {
    //       locale: zhCN
    //     }
    //   }, [options.body])
    // }
    _dialog(options).then((vueComp, ...params) => {
      let elClassName = vueComp.$el.className || ''
      vueComp.$el.className = [elClassName, className, className + '--' + theme].join(' ')
      // 绑定关闭事件
      vueComp.$on('update:visible', function (visible) {
        if (!visible) {
          onClose && onClose(visible)
        }
      })
      // 返回对象
      resolve(vueComp, ...params)
    }).catch(reject)
  })
}