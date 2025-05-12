// ========================================================
// 拖拽容器，分发拖拽事件
// @author wangyb
// @createTime 2023-05-06 15:33:45
// ========================================================
import ContainerModel from './ContainerModel'
import { defineUnenumerableProperty, extendsClass } from '../modules/common'
import { getMousePosition } from '../modules/dom'
import { FIELD_DRAG } from '../modules/fields'
import { getShapePosition } from '../modules/shape'
import { triggerModelEvent } from '../modules/event'
import { autoDecrease, clearScrollInterval, createScrollInterval, isScrolling } from '../modules/scroll'
import bus from '../../bus'
import RDSetting from '../../ruledesigner_setting'
import { debounce } from 'lodash'
import { updateHelpLines } from '../modules/helpLine'
import { createLine } from '../modules/line'
import RuleAuxRect from '../RuleAuxRect'

const global = window

const DragContainerModel = function (props) {
  // 继承父类的实例属性
  ContainerModel.call(this, ...arguments)

  // 对齐辅助线的宽度
  this.help_line_weight = props.help_line_weight || RDSetting.GLOBAL_HELP_LINE_WEIGHT

  defineUnenumerableProperty(this, FIELD_DRAG, null)

  this._handleMouseDown = this.handleMouseDown.bind(this)
  this._handleMouseMove = debounce(this.handleMouseMove.bind(this), 4)
  this._handleMouseUp = this.handleMouseUp.bind(this)
  this._handleMouseMoveForLink = debounce(this.handleMouseMoveForLink.bind(this), 8)
}

extendsClass(DragContainerModel, ContainerModel)

DragContainerModel.prototype.bindEvents = function () {
  ContainerModel.prototype.bindEvents.call(this)
  this.bindDragContainerEvents()
}

/**
  * 在画布上绑定拖拽对象
  * @param {*} model 模型
  * @param {*} mouseEvent 鼠标事件
  */
DragContainerModel.prototype.bindDragObj = function (model, mouseEvent, mousePosition) {
  mousePosition = mousePosition || getMousePosition(this.container, mouseEvent)
  defineUnenumerableProperty(this, FIELD_DRAG, {
    // 记录位置
    ...getShapePosition(model, this.container, mouseEvent),
    // 鼠标初始位置
    mouseX: mousePosition.x,
    mouseY: mousePosition.y,
    // 记录拖动的距离
    offsetX: 0,
    offsetY: 0,
    event: mouseEvent,
    model: model
  })
}

DragContainerModel.prototype.updateDragObjOffset = function (mouseEvent, mousePosition) {
  let dragObj = this[FIELD_DRAG]
  if (!dragObj) {
    return
  }
  mousePosition = mousePosition || getMousePosition(this.container, mouseEvent)
  dragObj.offsetX = mousePosition.x - dragObj.mouseX
  dragObj.offsetY = mousePosition.y - dragObj.mouseY
}

DragContainerModel.prototype.clearDragObj = function () {
  if (FIELD_DRAG in this) {
    this[FIELD_DRAG] = null
  }
}

DragContainerModel.prototype.setDragInfo = function (info) {
  if (!this[FIELD_DRAG]) {
    defineUnenumerableProperty(this, [FIELD_DRAG], {})
  }
  Object.assign(this[FIELD_DRAG], info)
}

DragContainerModel.prototype.getDragInfoValue = function (name) {
  return this[FIELD_DRAG] && this[FIELD_DRAG][name]
}

DragContainerModel.prototype.isDragging = function () {
  return this[FIELD_DRAG] && this[FIELD_DRAG].model
}

DragContainerModel.prototype.getDragObj = function () {
  return this[FIELD_DRAG]
}

DragContainerModel.prototype.getDragModel = function () {
  return this[FIELD_DRAG] && this[FIELD_DRAG].model
}

DragContainerModel.prototype.getDragEvent = function () {
  return this[FIELD_DRAG] && this[FIELD_DRAG].event
}

DragContainerModel.prototype.getDragCurrentPosition = function (model, mouseEvent) {
  let position = {
    x: mouseEvent.layerX + this[FIELD_DRAG].x + this.container.scrollLeft,
    y: mouseEvent.layerY + this[FIELD_DRAG].y + this.container.scrollTop
  }
  // 设置定位的边界
  position.x = Math.min(Math.max(position.x, 0), this.width - model.width)
  position.y = Math.min(Math.max(position.y, 0), this.height - model.height)
  return position
}

DragContainerModel.prototype.bindDragContainerEvents = function () {
  // 获取根shape
  const mainShape = this.shapes[0]
  // 绑定容器事件
  if (mainShape) {
    mainShape.addEventListener('mousedown', this._handleMouseDown)
    mainShape.addEventListener('mousemove', this._handleMouseMoveForLink)
  }
}

DragContainerModel.prototype.handleMouseDown = function (e) {
  if (e.button !== 0) {
    return
  }
  // 防止冒泡
  e.stopPropagation()
  // 记录被点击的元素
  this.bindClickInfo(e)
  // 给图形绑定原生事件
  const mainShape = this.shapes[0]
  // 移除鼠标按下事件
  mainShape.removeEventListener('mousedown', this._handleMouseDown)
  // 移除鼠标移动事件
  mainShape.removeEventListener('mousemove', this._handleMouseMoveForLink)
  // 只读时，不允许拖拽
  if (!this.readonly) {
    // 绑定鼠标移动事件
    mainShape.addEventListener('mousemove', this._handleMouseMove)
  }
  // 绑定鼠标弹起事件
  global.document.body.addEventListener('mouseup', this._handleMouseUp)
}

DragContainerModel.prototype.handleMouseMove = function (e) {
  // 鼠标移动后，进入拖拽状态，将点击模型记录到拖拽模型中，触发拖拽相关事件
  if (!this.isDragging() && this.hasClickModel()) {
    let clickInfo = this.getClickInfo()
    let model = clickInfo.eventModel
    // 是否允许拖拽
    if (model.isDraggable && model.isDraggable()) {
      this.bindDragObj(model, e, { x: clickInfo.mouseX, y: clickInfo.mouseY })
      // 创建辅助线
      if (model.isShowDraggingHelpLine()) {
        this.createHelpLines()
      }
      // 触发拖拽开始事件
      triggerModelEvent(model, 'dragstart', e)
      bus.$emit('dragstart', model)
    }
    this.hideButtons()
  }
  let mousePosition = getMousePosition(this.container, e)
  this.setMousePosition(mousePosition)
  this.updateDragObjOffset(e, mousePosition)
  // 创建自定义滚动
  let dragModel = this.getDragModel()
  if (dragModel && dragModel.isDraggingScroll && dragModel.isDraggingScroll()) {
    createScrollInterval(this, mousePosition, e)
  }
  if (!isScrolling(this)) {
    // 触发拖拽中事件
    triggerModelEvent(this.getDragModel(), 'dragmove', e)
    bus.$emit('dragmove', this.getDragModel())
  }
}

DragContainerModel.prototype.handleMouseUp = function (e) {
  const mainShape = this.shapes[0]
  // 移除鼠标移动事件
  mainShape.removeEventListener('mousemove', this._handleMouseMove)
  // 移除鼠标弹起事件
  global.document.body.removeEventListener('mouseup', this._handleMouseUp)
  // 绑定鼠标按下事件
  mainShape.addEventListener('mousedown', this._handleMouseDown)
  // 绑定鼠标移动事件
  mainShape.addEventListener('mousemove', this._handleMouseMoveForLink)
  // 删除定时拖拽
  clearScrollInterval(this)
  // 鼠标还原
  document.body.style.cursor = undefined
  // 没有发生拖拽，则事件结束
  if (this.isDragging()) {
    let dragModel = this.getDragModel()
    // 触发拖拽结束事件
    triggerModelEvent(dragModel, 'dragend', e)
    // 自动缩放
    autoDecrease(this)
  } else if (this.hasClickModel()) {
    triggerModelEvent(this.getClickModel(), 'click', this.getClickInfo(), e)
  }
  // 清理点击事件
  this.clearClickInfo()
  // 清理拖拽对象
  this.clearDragObj()
  // 清理辅助线
  this.destoryHelpLines()
}

DragContainerModel.prototype.handleMouseMoveForLink = function (e) {
  // 只读时，不允许操作
  if (this.readonly) {
    return
  }
  // 没有在拖拽中，则判断是否靠近了model，并创建startLineBar
  // 获取鼠标在图层中的定位
  let mousePosition = getMousePosition(this.container, e)
  this.setMousePosition(mousePosition)
  let control = this.findControlByPosition(mousePosition)
  if (!control.length) {
    // 移出组件，则隐藏按钮和连线
    this.hideButtons()
    this.hideStartLineBar()
    this.hideEndLineBar()
    return
  }
  //
  let model = control[0]
  // 显示删除按钮
  if (RDSetting.GLOBAL_REMOVE_BTN && !model.readonly) {
    this.showDeleteButton(model)
  }
  // 模型是否可以连线
  if (model.isLinkable && model.isLinkable()) {
    model.showLineBarByPosition(mousePosition, 'start')
  }
}

// 创建辅助矩形
DragContainerModel.prototype.createAuxRect = function () {
  // 构建一个外接矩形
  let auxRect = new RuleAuxRect(this)
  // 添加到图层中
  this.addModel(auxRect)
  // 绑定对象
  defineUnenumerableProperty(this, 'auxRect', auxRect)
}

DragContainerModel.prototype.getAuxRect = function () {
  if (!this.auxRect) {
    this.createAuxRect()
  }
  return this.auxRect
}

// 拖拽时创建对齐辅助线
DragContainerModel.prototype.createHelpLines = function () {
  // 创建辅助线
  if (!RDSetting.GLOBAL_HELP_LINE_ENABLE) {
    return
  }
  // 初始化辅助线
  defineUnenumerableProperty(this, 'helpBackLinies', [])
  // 取容器宽高
  let width = this.attrs.canvasWidth ? this.attrs.canvasWidth : window.innerWidth
  let height = this.attrs.canvasHeight ? this.attrs.canvasHeight : window.innerHeight
  const helpLineAlignColor = RDSetting.GLOBAL_HELP_LINE_ALIGN_COLOR
  // 创建左、右、上、下、水平居中、垂直居中对齐辅助线
  for (let i = 0; i < 6; i++) {
    this.appendHelpLine(createLine(this, { stroke: helpLineAlignColor }))
  }

  // 创建坐标辅助线
  const helpLineColor = RDSetting.GLOBAL_HELP_LINE_COLOR
  const helpLineWeight = 100 // this.help_line_weight || 10

  let meshPosition = this.getHelpLinesMeshPosition()
  let meshSvgEl = global.createSVGElement('svg', this, meshPosition)
  // 生成path
  let meshPathData = []
  // 纵坐标
  for (let i = 0; i < width; i = i + helpLineWeight) {
    meshPathData.push(`M ${i} 0 L ${i} ${meshPosition.height}`)
  }
  // 横坐标
  for (let i = 0; i < height; i = i + helpLineWeight) {
    meshPathData.push(`M 0 ${i} L ${meshPosition.width} ${i}`)
  }
  let meshPath = global.createSVGElement('path', this, {
    d: meshPathData.join(' '),
    stroke: helpLineColor,
    opacity: 0.3,
    strokeWidth: 0.5,
    'stroke-dasharray': [4, 2]
  })
  meshSvgEl.appendChild(meshPath)
  this.backgroundLayer.appendChild(meshSvgEl)
  this.helpBackLinies.push(meshSvgEl)
  this.bindRef('helpLineMesh', meshSvgEl)

  // 创建坐标提示文本
  let spText = global.createSVGElement('text', this, {
    'font-family': '宋体',
    'font-size': 14,
    align: 'center',
    fill: 'red',
    'font-style': 'bold'
  })
  spText.style.userSelect = 'none'
  this.helpBackLinies[this.helpBackLinies.length] = spText
  this.backgroundLayer.appendChild(spText)
}

DragContainerModel.prototype.getHelpLinesMeshPosition = function () {
  let viewerPosition = this.getViewerPosition()
  let padding = 10
  // 将横纵坐标编程一个path
  let meshX = Math.floor(viewerPosition.x / padding) * padding - padding
  let meshY = Math.floor(viewerPosition.y / padding) * padding - padding
  let meshWidth = Math.ceil(viewerPosition.width / padding) * padding + padding * 2
  let meshHeight = Math.ceil(viewerPosition.height / padding) * padding + padding * 2
  return {
    x: meshX,
    y: meshY,
    width: meshWidth,
    height: meshHeight
  }
}

DragContainerModel.prototype.updateHelpLinesMesh = function () {
  let meshEl = this.$refs.helpLineMesh
  if (meshEl) {
    let meshPosition = this.getHelpLinesMeshPosition()
    meshEl.setAttribute('x', meshPosition.x)
    meshEl.setAttribute('y', meshPosition.y)
  }
}

DragContainerModel.prototype.appendHelpLine = function (helpLine) {
  // 记录辅助线
  this.helpBackLinies[this.helpBackLinies.length] = helpLine
  // 添加辅助线到图层
  this.backgroundLayer.appendChild(helpLine)
}

// 更新辅助线
DragContainerModel.prototype.updateHelpLines = function (model, e, align) {
  return updateHelpLines(this, model, e, align)
}

// 销毁对齐辅助线
DragContainerModel.prototype.destoryHelpLines = function () {
  if (!RDSetting.GLOBAL_HELP_LINE_ENABLE || !this.helpBackLinies) {
    return
  }
  this.helpBackLinies.forEach(item => item.remove())
  delete this.helpBackLinies
}

DragContainerModel.prototype.getViewerPosition = function () {
  let { container } = this
  if (!container) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  }
  // 如果触及画布边界，则自动扩展
  let scrollLeft = +container.scrollLeft
  let scrollTop = +container.scrollTop
  return {
    x: scrollLeft,
    y: scrollTop,
    width: container.offsetWidth,
    height: container.offsetHeight
  }
}

export default DragContainerModel
