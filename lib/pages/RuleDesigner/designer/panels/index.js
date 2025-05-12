// ========================================================
// 注册设计器功能面板
// @author wangyb
// @createTime 2023-05-25 09:03:25
// ========================================================

// Panel容器
import RuleDesignTabs from './tabs.vue'
// 功能Panel
import RuleExecutePanel from './execute.vue'

const componentMapping = {
  RuleDesignTabs,
  RuleExecutePanel
}

const panelMapping = {}

const install = function (Vue) {
  if (install.installed) {
    return
  }
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

const getRuleDesignPanel = function (panelId) {
  return panelMapping[panelId]
}

// 默认公开对象
export default {
  install,
  ...componentMapping
}
