// ========================================================
// 聚合设计器功能按钮
// @author wangyb
// @createTime 2023-05-26 09:27:21
// ========================================================

const componentMapping = {
}

// 装配按钮
let ctxs = require.context('./btns', true, /Btn\.vue$/)
ctxs.keys().forEach(key => {
  let comp = ctxs(key).default
  componentMapping[comp.name] = comp
})

const install = function (Vue) {
  let component
  for (let key in componentMapping) {
    component = componentMapping[key]
    if (component.name) {
      Vue.component(component.name, component)
    }
    if (key !== component.name) {
      Vue.component(key, component)
    }
  }
}

export const components = componentMapping

export default {
  install,
  ...componentMapping
}