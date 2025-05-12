/**
 * 标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { RectShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleBeginDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'begin',
  fill: '#3662ec'
})

const RuleEndDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'end',
  fill: '#27c9a5'
})

const RuleBegin = function (rd, props) {
  RuleActivity.call(this, rd, props, 'Text')

  if (props.attrs && props.attrs.type === '结束') {
    this.$defaultOptions = RuleEndDefaultOptions
  } else {
    this.$defaultOptions = RuleBeginDefaultOptions
  }

  this.modelType = 'RuleBegin'
}

// 继承Activity
extendsClass(RuleBegin, RuleActivity)

// ============================ 类方法 Start ============================

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleBegin.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 End ============================

global.RuleBegin = RuleBegin

export default RuleBegin
