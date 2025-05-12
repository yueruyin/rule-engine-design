// ========================================================
// 允许序列化的模型
// @author wangyb
// @createTime 2023-05-06 15:38:01
// ========================================================

import { create, defineUnenumerableProperty } from '../modules/common'
import { isObject, get } from 'lodash'

const SerializableModel = function () {
  // ['text', { field: 'fill', path: 'attrs.fill'} ]
  defineUnenumerableProperty(this, 'serializableFields', [])
}

SerializableModel.prototype.setSerializableFields = function (fields) {
  this.serializableFields = fields || []
}

SerializableModel.prototype.appendSerializableFields = function (...fields) {
  fields.forEach(item => {
    this.serializableFields.remove(item)
  })
  this.serializableFields = this.serializableFields.concat(fields)
}

const exportByFields = function () {
  let fields = this.serializableFields || []
  if (!fields.length) {
    fields = Object.keys(this)
  }
  let json = {}
  let field, path
  fields.forEach(item => {
    if (isObject(item)) {
      field = item.field
      path = item.path || field
    } else {
      field = path = item
    }
    json[field] = get(this, path)
  })
  return json
}

const exportByOptions = function () {
  let json = {}
  let fields = Object.keys(this.options)
  fields.forEach(field => {
    let value = this.options[field]
    // 排除空值
    if (value === undefined || value === null) {
      return
    }
    json[field] = value
  })
  // 整合基础属性
  json.modelType = this.modelType
  json.baseModelType = this.baseModelType
  return json
}

SerializableModel.prototype.getBaseJSON = function () {
  // 通过设置序列化字段来控制哪些数据要导出
  // return exportByFields.call(this)
  // 通过初始化时传入的options来设置哪些数据要导出，如果后续有新增或删除，也会改变，这样不会导出默认值
  return exportByOptions.call(this)
}

SerializableModel.prototype.toJSON = function () {

}

SerializableModel.intByJSON = function (json) {
  let rd = global.tempSeriDatas['currentRuleCanvas']
  let obj = create(global[json.modelType], rd, json)
  global.tempSeriDatas[obj.id] = obj
  return obj
}

export default SerializableModel
