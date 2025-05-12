/**
 * 执行标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { RectShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleHttpDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'http-1'
})

const RuleHttp = function (rd, props) {
  RuleActivity.call(this, rd, props)

  this.$defaultOptions = RuleHttpDefaultOptions

  this.modelType = 'RuleHttp'
}
// 继承Activity
extendsClass(RuleHttp, RuleActivity)

// ============================ 类方法 Start ============================

RuleHttp.prototype.getText = function () {
  let attrs = this.options.attrs || {}
  return (attrs.executeHttp && attrs.executeHttp.url) || 'HTTP节点'
}

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleHttp.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 End ============================

global.RuleHttp = RuleHttp

export default RuleHttp