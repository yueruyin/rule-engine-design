// ========================================================
// 框选对象
// @author wangyb
// @createTime 2023-04-27 17:17:25
// ========================================================
import { defineUnenumerableProperty, extendsClass, extendsClasses } from './modules/common'
import { getShapesPosition } from './modules/shape'
import { FIELD_CANVAS } from './modules/fields'
import DraggableModel from './model/DraggableModel'
import ContainerModel from './model/ContainerModel'
import SelectableModel from './model/SelectableModel'

import bus from '../bus'

const global = window

const DEFAULT_EXPAND_SIZE = 4

const DEFAULT_BORDER_SIZE = 1

const RuleAuxRect = function (canvas, props = {}) {
  // 继承父类的实例参数
  ContainerModel.call(this, props)
  DraggableModel.call(this, canvas)
  SelectableModel.call(this)

  this.modelType = 'RuleAuxRect'

  this.layer = 'anchorLayer'
  this.layerIndex = props.layerIndex !== undefined && props.layerIndex !== null ? props.layerIndex : 0

  // 不允许直接选中，但继承选择事件
  this.setSelectable(false)
  this.setMuiltipleSelectable(false)

  defineUnenumerableProperty(this, FIELD_CANVAS, canvas)

  defineUnenumerableProperty(this, 'modelPositions', [])

  this.expandSize = props.expandSize !== undefined ? +props.expandSize : DEFAULT_EXPAND_SIZE
  this.borderSize = props.borderSize !== undefined ? +props.borderSize : DEFAULT_BORDER_SIZE
}

extendsClass(RuleAuxRect, ContainerModel)

extendsClasses(RuleAuxRect, DraggableModel, SelectableModel)

RuleAuxRect.prototype.buildShape = function (canvas) {
  // 创建图形
  this.shapes[0] = global.createSVGElement('rect', this, {
    id: 'aue_rect_' + canvas.id,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    cornerRadius: 5,
    stroke: '#3662ec', // #22ee11 绿色
    'stroke-width': this.borderSize,
    fill: canvas.attrs.canvasBgColor,
    'fill-opacity': 0.0,
    'stroke-dasharray': [5, 5]
  })
  defineUnenumerableProperty(this.shapes[0], 'model', this)
}

RuleAuxRect.prototype.updateShape = function () {
  const mainShape = this.getMainShape()
  mainShape.setAttribute('x', (this.x || 0) - this.expandSize)
  mainShape.setAttribute('y', (this.y || 0) - this.expandSize)
  mainShape.setAttribute('width', (this.width || 0) + this.expandSize * 2)
  mainShape.setAttribute('height', (this.height || 0) + this.expandSize * 2)
}

RuleAuxRect.prototype.handleDragStart = function (e) {
  // 隐藏连线
  const canvas = this.getCanvas()
  canvas.hideStartLineBar()
  canvas.hideEndLineBar()
}

// 替代默认拖拽结束方法
RuleAuxRect.prototype.handleDragEnd = function (e) {
  // 触发vue全局事件
  bus.$emit('modelDragend', this)
}
// 替代默认双击结束方法
RuleAuxRect.prototype.handleContainerDblclick = function (e) {

}

RuleAuxRect.prototype.handleModelClick = function ({ models }, e) {
  // 第一个不是框选的Model
  this.getCanvas().makeSelection(models.find(item => item != this), e)
}

RuleAuxRect.prototype.setAttributeN = function (protocol, name, value) {
  const mainShape = this.getMainShape()
  if (!mainShape) {
    console.error('model没有创建dom元素')
    return
  }
  mainShape.setAttributeNS(protocol, name, value)
}

RuleAuxRect.prototype.setPosition = function (x, y, isUpdateRelationModels = true) {
  if (typeof x === 'object') {
    isUpdateRelationModels = y === undefined ? isUpdateRelationModels : !!y
    y = x.y
    x = x.x
  }
  // 设置辅助框的位置
  if (isUpdateRelationModels) {
    // 更新子模型时，以最终子模型的位置来确定框选的位置，避免出现错位的问题
    this.moveModelsPosition(x - this.x, y - this.y, false)
    this.updateSizeByModels()
  } else {
    this.x = x
    this.y = y
  }
}

RuleAuxRect.prototype.setSize = function ({ width, height }) {
  this.width = width
  this.height = height
}

RuleAuxRect.prototype.setModels = function (models) {
  this.models = [].concat(models)
  this.updateModelPostions()
  this.updateSizeByModels()
}

RuleAuxRect.prototype.updateModelPostions = function () {
  // 记录原始值，方便拖拽时能以原始值进行移动
  this.modelPositions = this.models.map(item => ({ x: item.x, y: item.y }))
}

RuleAuxRect.prototype.updateSizeByModels = function () {
  // 计算所有选中图形的坐标，求出外接矩形
  let { x, y, width, height } = getShapesPosition(...this.models)
  // 边框位置扩展
  this.setAttributes({ x, y, width, height })
  this.renderDelay()
}

/**
 * 偏移量
 * @param {*} offsetX
 * @param {*} offsetY
 */
RuleAuxRect.prototype.moveModelsPosition = function (offsetX, offsetY, autoRender = true) {
  // 如果有选中模型，则更新选中位置
  this.models.forEach(item => {
    item.setOptions({
      x: item.x + offsetX,
      y: item.y + offsetY
    }, autoRender)
  })
}

/**
 * 偏移量
 * @param {*} x
 * @param {*} y
 */
RuleAuxRect.prototype.updateModelsPosition = function (x, y, autoRender = true) {
  let oldX = this.x
  let oldY = this.y
  // 如果有选中模型，则更新选中位置
  this.models.forEach(item => {
    item.setOptions({
      x: item.x - oldX + x,
      y: item.y - oldY + y
    }, autoRender)
  })
}

global.RuleAuxRect = RuleAuxRect

export default RuleAuxRect
