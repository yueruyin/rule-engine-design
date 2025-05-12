/**
 * 计算标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { RectShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleComputeDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'calculate'
})

const RuleCompute = function (rd, props) {
  RuleActivity.call(this, rd, props)

  // 设置默认属性
  this.$defaultOptions = RuleComputeDefaultOptions

  this.modelType = 'RuleCompute'
}
// 继承Activity
extendsClass(RuleCompute, RuleActivity)

// ============================ 类方法 Start ============================

RuleCompute.prototype.getText = function () {
  let attrs = this.options.attrs || {}
  // 获取变量名
  let name = attrs.expressionArguments || attrs.name || '计算'
  // 获取表达式
  let expression = attrs.expression
  return expression ? `${name} = ${expression}` : '计算节点'
}

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleCompute.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 End ============================

global.RuleCompute = RuleCompute

export default RuleCompute
