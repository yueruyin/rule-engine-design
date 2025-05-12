/**
 * 执行标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { RectShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleActionDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'execute'
})

const RuleAction = function (rd, props) {
  // 父类构造方法
  RuleActivity.call(this, rd, props)

  // 设置默认属性
  this.$defaultOptions = RuleActionDefaultOptions

  // 设置额外需要序列化的字段
  this.appendSerializableFields('name', 'descText')

  this.modelType = 'RuleAction'
}

// 继承Activity
extendsClass(RuleAction, RuleActivity)

// ============================ 类方法 Start ============================

RuleAction.prototype.getText = function () {
  let attrs = this.options.attrs || {}
  return (attrs.execute && attrs.execute.executeCustom) || '执行节点'
}

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleAction.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 End ============================

global.RuleAction = RuleAction

export default RuleAction
