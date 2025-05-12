// ========================================================
// 处理设计器升级程序
// @author wangyb
// @createTime 2023-06-19 15:51:29
// ========================================================

import { safeJsonParse } from './components/modules/common'

/**
 * 老版本直接升到2.0.4，修改设计器json
 * @param {*} json 设计器JSON对象
 */
const To2_0_4 = function (json) {
  if (!json) {
    return
  }
  if (json.modelType === 'RuleConditionItem') {
    json.attrs.conditionJson = json.conditionJson
    json.attrs.defaultCondition = json.defaultCondition
  }
  // 根据
  delete json.conditionText
  delete json.conditionJson
  delete json.defaultCondition
  delete json.border
  delete json.fill
  delete json.text
  delete json.descText
  delete json.font
  delete json.together
  delete json.help_line_weight
  delete json.align
  delete json.valign
  delete json.feed
  delete json.autoScaleFill
  delete json.bindField

  // 移除attrs与图形和模型相关的属性，只保留执行过程中的属性
  if (json.attrs) {
    let attrs = json.attrs
    if (attrs.type === '结束') {
      attrs.name = attrs.text
    } else {
      json.text = attrs.text || attrs.descText
    }
    delete attrs.id
    delete attrs.border
    delete attrs.font
    delete attrs.fill
    delete attrs.descText
    delete attrs.x
    delete attrs.y
    delete attrs.width
    delete attrs.height
    delete attrs.canvasWidth
    delete attrs.canvasHeight
    delete attrs.mouseoutlistener
    delete attrs.mouseoverlistener
    delete attrs.text
    delete attrs.headerProps
    delete attrs.imageInfo
    delete attrs.align
    delete attrs.valign
    delete attrs.feed
    delete attrs.autoScaleFill
    delete attrs.bindField
    if (json.modelType === 'RDLine') {
      json.start = json.start || attrs.start
      delete attrs.start
      json.end = json.end || attrs.end
      delete attrs.end
    }
  }
  if (json.rootModels) {
    for (let modelId in json.rootModels) {
      To2_0_4(json.rootModels[modelId])
    }
  }
}

const To2_0_5 = To2_0_4
const To2_0_6 = To2_0_4
const ToLast = To2_0_4

export default {
  To2_0_4,
  To2_0_5,
  To2_0_6,
  ToLast
}