// ========================================================
// 调用子规则节点模型
// @author wangyb
// @createTime 2023-06-12 16:16:10
// ========================================================

import { RectShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleCallDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'execute'
})

const RuleCall = function (rd, props) {
  RuleActivity.call(this, rd, props)

  // 设置默认属性
  this.$defaultOptions = RuleCallDefaultOptions

  this.modelType = 'RuleCall'
}
// 继承Activity
extendsClass(RuleCall, RuleActivity)

// ============================ 类方法 Start ============================

RuleCall.prototype.getText = function () {
  let attrs = this.options.attrs || {}
  return (attrs.executeCallRule && attrs.executeCallRule.ruleName) || '子规则节点'
}

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleCall.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 End ============================

global.RuleCall = RuleCall

export default RuleCall