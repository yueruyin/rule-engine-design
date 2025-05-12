/**
 * 执行标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { RectShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleSqlDefaultOptions = Object.assign({}, RectShapeConfig, {
  icon: 'sql-1'
})

const RuleSql = function (rd, props) {
  RuleActivity.call(this, rd, props)

  this.$defaultOptions = RuleSqlDefaultOptions

  this.modelType = 'RuleSql'
}
// 继承Activity
extendsClass(RuleSql, RuleActivity)

// ============================ 类方法 Start ============================

RuleSql.prototype.getText = function () {
  let attrs = this.options.attrs || {}
  return (attrs.executeSql && attrs.executeSql.sql) || 'SQL节点'
}

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleSql.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 Start ============================

global.RuleSql = RuleSql

export default RuleSql