/**
 * 执行标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { RectShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleJsonDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'http-1'
})

const RuleJson = function (rd, props) {
  RuleActivity.call(this, rd, props)

  this.$defaultOptions = RuleJsonDefaultOptions

  this.modelType = 'RuleJson'
}
// 继承Activity
extendsClass(RuleJson, RuleActivity)

// ============================ 类方法 Start ============================

RuleJson.prototype.getText = function () {
  let attrs = this.options.attrs || {}
  return (attrs.executeHttp && attrs.executeHttp.url) || 'JSON节点'
}

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleJson.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 End ============================

global.RuleJson = RuleJson

export default RuleJson