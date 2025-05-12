/**
 * 条件标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */

import { DiamondShapeConfig } from './constants/shape'
import { extendsClass } from './modules/common'
import RuleActivity from './RuleActivity'

const global = window

const RuleConditionDefaultOptions = Object.assign({}, DiamondShapeConfig, {
  icon: 'condition',
  fill: '#3662ec',
  fillSelected: '#233661'
})

const RuleCondition = function (rd, props) {
  RuleActivity.call(this, rd, props, 'Diamond')

  this.$defaultOptions = RuleConditionDefaultOptions

  this.modelType = 'RuleCondition'
}
// 继承Activity
extendsClass(RuleCondition, RuleActivity)

// ============================ 类方法 Start ============================
// /**
//  * 自定义菱形的选中范围判断
//  * @param {*} param0 图形参数
//  * @param {*} checkOutRect 是否检查外围矩形
//  * @returns true/false
//  */
// RuleCondition.prototype.isInSelectArea = function ({ x, y, width = 0, height = 0 }, checkOutRect = true) {
//   // 以面积来判断
//   if (checkOutRect) {
//     return SelectableModel.prototype.isInSelectArea.call(this, { x, y, width, height })
//   }
//   // 方法1：如果当前点的位置与菱形四个边组成的三角形面积之和是否与菱形面积一致，计算量大
//   // 方法2：构建x,y的四个边的二元一次方程，然后判断是否在目标范围内，这个更合理
//   if (!width || !height) {
//     // todo 框选时, 计算四个点在矩形外部
//     return false
//   }
//   return inDiamondShape({ x, y }, this)
// }

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleCondition.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 End ============================

global.RuleCondition = RuleCondition

export default RuleCondition