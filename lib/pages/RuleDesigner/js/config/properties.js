// ========================================================
// 扫描controls下面的组件配置
// @author wangyb
// @createTime 2023-05-17 14:01:51
// ========================================================
import { cloneDeep } from 'lodash'
const ctx = require.context('./controls/', true, /\.js$/)
const properties = {}
const defaultIdGroup = Symbol('default')

const uniqueIdMap = {}
const getUniqueId = function (prefix, length = 3) {
  prefix = prefix || defaultIdGroup
  if (!uniqueIdMap[prefix]) {
    uniqueIdMap[prefix] = 0
  }
  let id = ++uniqueIdMap[prefix]
  // 转换为3位数
  id = id.toString()
  while (id.length < length) {
    id = '0' + id
  }
  return prefix + id
}

const parseControlProperty = function (controlId, propertyId, property = {}) {
  property = cloneDeep(property)
  property.id = propertyId
  property.children = property.children || []
  property.children.forEach((item) => {
    item.CP_ID = getUniqueId(propertyId)
    item.CONTROL_ID = controlId
    item.GROUPNAME = property.name
  })
  // 排序
  property.children.sort((a, b) => a.orderno - b.orderno)
  return property
}

let control, attributes, shapeAttributes, events, controlId
for (const key of ctx.keys()) {
  control = ctx(key).default
  controlId = control.CONTROL_ID
  if (!controlId) {
    continue
  }
  // 处理属性配置, 控件ID + '01'作为属性ID
  attributes = parseControlProperty(
    controlId,
    controlId + '01',
    ctx(key).attributes
  )
  // 处理图形属性配置, 控件ID + 02为图形属性ID
  shapeAttributes = parseControlProperty(
    controlId,
    controlId + '02',
    ctx(key).shapeAttributes
  )
  // 处理事件, 控件ID + 03为事件ID
  events = parseControlProperty(controlId, controlId + '03', ctx(key).events)
  // 设置配置
  properties[controlId] = [attributes, shapeAttributes, events]
}

export default properties
