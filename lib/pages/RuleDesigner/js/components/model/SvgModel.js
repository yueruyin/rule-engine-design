// ========================================================
// Svg模型类，建立原生Svg元素与模型类的关系
// @author wangyb
// @createTime 2023-05-06 17:17:47
// ========================================================

import {
  ModelStatusEnum,
  ModelStatusPostfixMap,
  ModelStatusPrefixMap,
  ModelStatusPriorityMap
} from '../constants/status'
import {
  defineOptionObserveFields,
  defineUnenumerableProperty,
  extendsClass,
  isEmpty
} from '../modules/common'
import SerializableModel from './SerializableModel'

import { cloneDeep, merge, set as setByPath } from 'lodash'

const SvgModel = function (props = {}) {
  // 继承父类的实例属性
  SerializableModel.call(this)

  // 设置状态属性, 多个状态并存时，保存 按位或 的值
  this.status = null
  // 设置状态数组，保存当前的状态集合，并按照优先级排序
  defineUnenumerableProperty(this, 'statusArray', [])
  // 保存所有模型
  defineUnenumerableProperty(this, 'shapes', [])
  // 建立svg属性绑定
  defineUnenumerableProperty(this, 'svgFields', props.svgFields || [])
  // 绑定dom元素
  defineUnenumerableProperty(this, '$el', null)
  // 绑定所有dom元素
  defineUnenumerableProperty(this, '$refs', {})
  // 记录当前传入的可选项
  defineUnenumerableProperty(this, 'options', props)
  // 记录计算后的可选项，渲染时应该使用这个对象下的值来计算
  defineUnenumerableProperty(this, '$options', cloneDeep(props))
  // 记录默认配置项，由子类覆盖
  defineUnenumerableProperty(this, '$defaultOptions', {})
  // 延迟重绘计时器
  defineUnenumerableProperty(this, '__renderDelayTimer', null)
  // 设置快捷取值的属性
  defineOptionObserveFields(
    this,
    'id',
    'controlType',
    'text',
    'title',
    'attrs',
    { field: 'x', defaultValue: 0 },
    { field: 'y', defaultValue: 0 },
    { field: 'width', defaultValue: 0 },
    { field: 'height', defaultValue: 0 }
  )
}

extendsClass(SvgModel, SerializableModel)

// 普通节点的创建图形方法
SvgModel.prototype.buildShape = function () {
  // 只负责构建图形结构，不需要具体的渲染
}

// 更新图形
SvgModel.prototype.updateShape = function () {
  this.updateByStyle()
}

// 更新图形
SvgModel.prototype.updateByStyle = function () {}

SvgModel.prototype.bindEvents = function () {
  this.bindModelEvents()
  this.bindShapeEvents()
}

/**
 * 绑定dom事件
 */
SvgModel.prototype.bindShapeEvents = function () {}

SvgModel.prototype.bindModelEvents = function () {}

SvgModel.prototype.rebuildAnchors = function (useModel) {
  // 为节点追加事件
  this.bindEvents()
}

SvgModel.prototype.getMainShape = function () {
  return this.$el || this.shapes[0]
}

/**
 * 模型重绘
 */
SvgModel.prototype.render = function () {
  if (!this.getMainShape()) {
    return
  }
  this.updateShape()
}

/**
 * 延迟重绘，当创建了延迟重绘后，延迟期间不会再接收延迟重绘
 * @param delay
 */
SvgModel.prototype.renderDelay = function (delay = 1000 / 60) {
  // if (this.__renderDelayTimer) {
  //   return
  // }
  // this.__renderDelayTimer = setTimeout(() => {
  //   // let start = performance.now()
  //   this.render()
  //   // console.log(this.id || this.modelType, '渲染耗时: ' + (performance.now() - start) + '毫秒')
  //   this.__renderDelayTimer = null
  // }, delay)

  this.getCanvas().addRenderQueue(this)
}

SvgModel.prototype.show = function (flag = true) {
  if (flag) {
    this.getMainShape().show()
  } else {
    this.hide()
  }
}

SvgModel.prototype.hide = function () {
  this.getMainShape().hide()
}

SvgModel.prototype.isShow = function () {
  const mainShap = this.getMainShape()
  return mainShap && mainShap.style.display !== 'none'
}

/**
 * 复制一个对象
 */
SvgModel.prototype.clone = function (props = {}) {
  let json = cloneDeep(this.getBaseJSON())
  merge(json, props)
  return this.constructor.initByJson(json)
}

/**
 * 修改Model的属性
 * @param {*} name 属性名
 * @param {*} value 值
 * @param {*} defaultValue 默认值
 * @return 是否修改
 */
SvgModel.prototype.setAttribute = function (name, value, defaultValue) {
  // 没有传value值
  if (value === undefined) {
    return false
  }
  if (value === null && defaultValue !== null && defaultValue !== undefined) {
    value = defaultValue
  }
  // 如果已经与当前值相同，则不再修改
  if (value === this[name]) {
    return false
  }
  this[name] = value
  return true
}

SvgModel.prototype.setAttributes = function (attrs) {
  if (!attrs) {
    return
  }
  let changed = false
  for (let key in attrs) {
    if (this.setAttribute(key, attrs[key])) {
      changed = true
    }
  }
  return changed
}

SvgModel.prototype.getShapeAttribute = function (name, shapeIndex = 0) {
  let shape = this.shapes[shapeIndex]
  return shape && shape[name]
}

SvgModel.prototype.setShapeAttribute = function (name, value, shapeIndex = 0) {
  let shape = this.shapes[shapeIndex]
  shape && shape.setAttribute(name, value)
}

SvgModel.prototype.setShapeAttributes = function (attrs, shapeIndex = 0) {
  let shape = this.shapes[shapeIndex]
  if (!shape) {
    return
  }
  for (let key in attrs) {
    shape.setAttribute(key, attrs[key])
  }
}

SvgModel.prototype.setPosition = function (x, y) {
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }
  this.x = x
  this.y = y
}

SvgModel.prototype.move = function (offsetX, offsetY) {
  this.x += offsetX
  this.y += offsetY
}

SvgModel.prototype.remove = function () {
  this.destroy()
}

SvgModel.prototype.destroy = function () {
  const mainShap = this.getMainShape()
  mainShap && mainShap.remove()
}

SvgModel.prototype.bindRef = function (name, svgEl) {
  this.$refs[name] = svgEl
  svgEl.setAttribute('name', name)
}

SvgModel.prototype.insertChild = function (child, index, layer = 'shapeLayer') {
  let layerEl = this[layer]
  if (!layerEl) {
    console.error('指定图层不存在')
    return
  }
  // 在元素前插入
  let beforeChildEl = layerEl.children[index]
  // 最后插入
  if (!beforeChildEl) {
    this.appendChild(child, layer)
    return
  }
  this.insertBefore(child, beforeChildEl, layer)
}

SvgModel.prototype.insertBefore = function (
  child,
  beforeChild,
  layer = 'shape'
) {
  let mainShap = this.getMainShape()
  if (!mainShap) {
    if (process.env.NODE_ENV !== 'dev') {
      console.error('模型未初始化')
    }
    return
  }
  let childEl
  if (child instanceof SvgModel) {
    childEl = child.getMainShape()
  } else {
    childEl = child
  }
  if (!childEl) {
    if (process.env.NODE_ENV !== 'dev') {
      console.error('子模型未初始化')
    }
    return
  }
  let beforeChildEl
  if (beforeChild instanceof SvgModel) {
    beforeChildEl = beforeChild.getMainShape()
  } else {
    beforeChildEl = beforeChild
  }
  if (!beforeChildEl) {
    if (process.env.NODE_ENV !== 'dev') {
      console.error('指定位置模型未初始化')
    }
    return
  }
  let layerEl = this[layer]
  if (!layerEl) {
    console.error('指定图层不存在')
    return
  }
  layerEl.insertBefore(childEl, beforeChildEl, layer)
}

SvgModel.prototype.insertAfter = function (
  child,
  afterChild,
  layer = 'shapeLayer'
) {
  let mainShap = this.getMainShape()
  if (!mainShap) {
    if (process.env.NODE_ENV !== 'dev') {
      console.error('模型未初始化')
    }
    return
  }
  let childEl
  if (child instanceof SvgModel) {
    childEl = child.getMainShape()
  } else {
    childEl = child
  }
  if (!childEl) {
    if (process.env.NODE_ENV !== 'dev') {
      console.error('子模型未初始化')
    }
    return
  }
  let afterChildEl
  if (afterChild instanceof SvgModel) {
    afterChildEl = afterChild.getMainShape()
  } else {
    afterChildEl = afterChild
  }
  if (!afterChildEl) {
    if (process.env.NODE_ENV !== 'dev') {
      console.error('指定位置模型未初始化')
    }
    return
  }
  let layerEl = this[layer]
  if (!layerEl) {
    console.error('指定图层不存在')
    return
  }
  let index = layerEl.children.length
  for (let i = index - 1; i >= 0; i--) {
    if (layerEl.children[i] === afterChildEl) {
      index = i
      break
    }
  }
  if (index > 0 && layerEl.children[index]) {
    layerEl.insertBefore(childEl, layerEl.children[index], layer)
  } else {
    layerEl.appendChild(childEl)
  }
}

SvgModel.prototype.appendChild = function (child, layer = 'shapeLayer') {
  let mainShap = this.getMainShape()
  if (!mainShap) {
    if (process.env.NODE_ENV !== 'dev') {
      console.error('模型未初始化')
    }
    return
  }
  let childEl
  if (child instanceof SvgModel) {
    childEl = child.getMainShape()
  } else {
    childEl = child
  }
  if (!childEl) {
    if (process.env.NODE_ENV !== 'dev') {
      console.error('子模型未初始化')
    }
    return
  }
  let layerEl = this[layer]
  if (!layerEl) {
    console.error('指定图层不存在')
    return
  }
  layerEl.appendChild(childEl)
}

SvgModel.prototype.refreshLayerIndex = function () {
  let mainShap = this.getMainShape()
  this.layers.forEach((layerName, index) => {
    let layerEl = mainShap.children[index]
    let model
    for (let i in layerEl.children) {
      model = layerEl.children[i].model
      if (!model) {
        return
      }
      model.layerIndex = +i
    }
  })
}

const getStatusArray = function (status) {
  let statusArray = []
  for (let key in ModelStatusEnum) {
    if ((status & ModelStatusEnum[key]) === ModelStatusEnum[key]) {
      statusArray.push(ModelStatusEnum[key])
    }
  }
  // 按照优先级越高排序
  statusArray.sort(
    (statusA, statusB) =>
      ModelStatusPriorityMap[statusB] - ModelStatusPriorityMap[statusA]
  )
  return statusArray
}

SvgModel.prototype.getStatus = function () {
  return this.status
}

SvgModel.prototype.setStatus = function (status = ModelStatusEnum.Default) {
  this.status = status
  this.updateStatusArray()
}

SvgModel.prototype.addStatus = function (status = 0) {
  this.status = this.status | status
  this.updateStatusArray()
}

SvgModel.prototype.removeStatus = function (status = 0) {
  this.status = this.status & ~status
  this.updateStatusArray()
}

SvgModel.prototype.hasStatus = function (status = 0) {
  return (this.status & status) === status
}

SvgModel.prototype.updateStatusArray = function () {
  this.statusArray = getStatusArray(this.status)
}

SvgModel.prototype.getStatusOption = function (name, status) {
  // 按照当前状态，取值
  let statusArray = this.statusArray
  if (status && status !== this.status) {
    statusArray = getStatusArray(status)
  }
  let value = this.getOption(name)
  statusArray.some((item) => {
    let statusName =
      ModelStatusPrefixMap[item] + name + ModelStatusPostfixMap[item]
    let statusValue = this.getOption(statusName)
    if (!isEmpty(statusValue)) {
      value = statusValue
      return true
    }
  })
  return value
}

SvgModel.prototype.setOption = function (name, value, autoRender = true) {
  // 记录属性
  setByPath(this.options, name, value)
  // 更新已计算的属性
  setByPath(this.$options, name, value)
  // 特殊属性需要单独处理，如边框属性
  // 更新
  autoRender && this.renderDelay()
}

SvgModel.prototype.setOptions = function (options, autoRender = true) {
  // 设置属性
  Object.assign(this.options, options)
  // 更新已计算的属性
  Object.assign(this.$options, options)
  // 特殊属性需要单独处理，如边框属性
  // 更新
  autoRender && this.renderDelay()
}

SvgModel.prototype.getOption = function (name, origin = false) {
  if (origin) {
    return this.options[name]
  }
  // 按照当前状态，取值
  let value = this.$options[name]
  if (isEmpty(value)) {
    value = this.$defaultOptions[name]
  }
  return value
}

SvgModel.prototype.getOptions = function (origin = false) {
  if (origin) {
    return this.options
  }
  return Object.assign({}, this.$defaultOptions, this.$options)
}

SvgModel.prototype.removeOption = function (name) {
  delete this.options[name]
  delete this.$options[name]
}

SvgModel.prototype.checkPermission = function (permission) {
  // 权限校验未开启则返回有权限
  if (!this.getCanvas()?.isPermissionEnable()) {
    return true
  }
  // 没有传入权限值时，返回有权限
  if (permission === undefined || permission === null) {
    return true
  }
  // 获取权限设置，为null或者undefined则表示没有设置权限
  let permissionConfig = this.options?.permission
  if (permissionConfig === undefined || permissionConfig === null) {
    return true
  }
  // 匹配权限值
  return (permissionConfig & permission) === permission
}

export default SvgModel
