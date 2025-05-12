import ZhCmp from '@zh/components-ant'

// 规则设计器
import RuleDesigner from './lib/pages/RuleDesigner/RuleDesigner.vue'

// 规则展示器
import RuleViewer from './lib/pages/RuleDesigner/RuleViewer.vue'

const components = []

const install = (Vue) => {
  Vue.use(ZhCmp)
  components.map(component => Vue.use(component.name, components))
}
export { RuleDesigner, RuleViewer }
export default { install }
