/**
 * 条件标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { RectShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleConditionItemDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'condition-item',
  headerFill: '#ffffff',
  headerColor: '#2c3e50'
})

const RuleConditionItem = function (rd, props) {
  RuleActivity.call(this, rd, props)

  this.$defaultOptions = RuleConditionItemDefaultOptions

  this.modelType = 'RuleConditionItem'

  // 不允许打断点
  this.debuggable = false
}
// 继承Activity
extendsClass(RuleConditionItem, RuleActivity)

// ============================ 类方法 Start ============================

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleConditionItem.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 End ============================

global.RuleConditionItem = RuleConditionItem

export default RuleConditionItem