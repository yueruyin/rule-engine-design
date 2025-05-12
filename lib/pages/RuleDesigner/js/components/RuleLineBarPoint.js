// ========================================================
// LineBar上的点
// @author wangyb
// @createTime 2023-05-08 16:12:46
// ========================================================

import { defineOptionObserveFields, defineUnenumerableProperty, extendsClass, extendsClasses } from './modules/common'
import { getMousePosition } from './modules/dom'
import { normalLineToTempLine, setLineEndLinkGroup, setLineStartLinkGroup, tempLineToNormalLine } from './modules/line'
import AttachModel from './model/AttachModel'
import DraggableModel from './model/DraggableModel'

import bus from '../bus'

const DEFAULT_SIZE = 4

const DEFAULT_PADDING = 2

const DEFAULT_COLOR = 'blue'

const DEFAULT_SELECTED_COLOR = 'black'

const RuleLineBarPoint = function (lineBar, line, props) {
  // 继承父类的实例属性
  AttachModel.call(this, lineBar)
  DraggableModel.call(this, lineBar.getCanvas())

  // 拖拽时不移动位置
  this.setDraggingMove(false)
  // 拖拽时不需要辅助线
  this.setShowDraggingHelpLine(false)

  this.lineId = line.id
  // 点在线的位置，开始或结束
  this.linePonit = props.linePonit || 'start'
  // 排列方式 horizontal / vertical 横向或者纵向
  this.type = props.type || 'horizontal'
  // 排序号，每个Point对应在bar中的位置
  this.index = props.index || 0
  // 总点数
  this.total = props.total || 1
  // 基础大小
  this.width = props.width || DEFAULT_SIZE
  this.height = props.height || DEFAULT_SIZE
  this.padding = props.padding || DEFAULT_PADDING
  // 容器大小
  this.containerSize = Math.ceil(props.containerSize)

  // 样式
  this.color = props.color || DEFAULT_COLOR
  this.selectedColor = props.selectedColor || DEFAULT_SELECTED_COLOR

  // 保存与线的关系
  defineUnenumerableProperty(this, 'line', line)
  // 绑定线与点的关系
  defineUnenumerableProperty(line, `__${this.linePonit}_point__`, this)

  // 构建图形
  this.buildShape()
  // 绑定事件
  this.bindEvents()
}

extendsClass(RuleLineBarPoint, AttachModel)
extendsClasses(RuleLineBarPoint, DraggableModel)

RuleLineBarPoint.prototype.updatePosition = function () {
  // 根据index、total、type、width、height、padding来计算x、y
  const { index, total, type, width, height, padding, containerSize } = this
  const isHorizontal = type === 'horizontal'
  // 如果是横向的则取宽作为size，纵向取高，后续可以扩展在多种计算方式来满足斜线等情况
  let size = isHorizontal ? width : height
  // 计算总长度
  let totalSize = total * size + padding * (total - 1)
  // 计算偏移量
  let offset = (containerSize - totalSize) * 0.5 + index * padding + index * size
  // 横向修改x的位置，纵向修改y的位置
  this.x = isHorizontal ? offset : 0
  this.y = !isHorizontal ? offset : 0
}

RuleLineBarPoint.prototype.buildShape = function () {
  // 计算坐标
  this.updatePosition()
  // 创建图形
  const { x, y, width, height, color } = this
  this.shapes[0] = global.createSVGElement('rect', this.getMainModel(), {
    x,
    y,
    width,
    height,
    fill: color
  })
  defineUnenumerableProperty(this.shapes[0], 'model', this)
}

RuleLineBarPoint.prototype.render = function ({ index, total, width, height, padding, color, selectedColor, containerSize } = {}) {
  // 如果下标和total改变了
  this.setAttribute('index', index, 0)
  this.setAttribute('total', total, 1)
  this.setAttribute('width', width, DEFAULT_SIZE)
  this.setAttribute('height', height, DEFAULT_SIZE)
  this.setAttribute('padding', padding, DEFAULT_PADDING)
  this.setAttribute('color', color, DEFAULT_COLOR)
  this.setAttribute('selectedColor', selectedColor, DEFAULT_SELECTED_COLOR)
  this.setAttribute('containerSize', containerSize)
  this.updateShape()
}

RuleLineBarPoint.prototype.updateShape = function () {
  this.updatePosition()
  const mainShape = this.getMainShape()
  mainShape.setAttribute('x', this.x)
  mainShape.setAttribute('y', this.y)
  mainShape.setAttribute('width', this.width)
  mainShape.setAttribute('height', this.height)
  mainShape.setAttribute('fill', this.color)
}

RuleLineBarPoint.prototype.bindShapeEvents = function () {
  // 增加一个鼠标移入移出事件
  if (!this._handleMouseEnter) {
    this._handleMouseEnter = this.handleMouseEnter.bind(this)
  }
  if (!this._handleMouseOut) {
    this._handleMouseOut = this.handleMouseOut.bind(this)
  }
  this.shapes[0].addEventListener('mouseenter', this._handleMouseEnter)
  this.shapes[0].addEventListener('mouseout', this._handleMouseOut)
}

/**
 * 处理鼠标移入事件，改变颜色
 * @param {*} e 事件
 */
RuleLineBarPoint.prototype.handleMouseEnter = function (e) {
  this.shapes[0].fill(this.selectedColor)
}

/**
 * 处理鼠标移出事件，改变颜色
 * @param {*} e 事件
 */
RuleLineBarPoint.prototype.handleMouseOut = function (e) {
  this.shapes[0].fill(this.color)
}

RuleLineBarPoint.prototype.handleDragStart = function (e) {
  const lineBar = this.getMainModel()
  const canvas = lineBar.getCanvas()
  // 阻止冒泡
  e.stopPropagation()
  // 显示拖拽图标
  document.body.style.cursor = 'grabbing'
  // 创建连线缓存信息
  defineUnenumerableProperty(canvas, '__link__', {})
  // 判断移动线段，当鼠标落点位于线的开始位置或者结束位置时，为移动线段，否则为创建线段
  // 取得当前依附的model，依附的方向，取得关联关系
  let line = this.getLine()
  let linePoint = this.linePonit
  let lineIndex = this.index
  let linkGroup = this.getLinkGroup()
  let otherLinkGroup = this.getOtherLinkGroup()
  let otherLineIndex = otherLinkGroup.lines.indexOf(line)
  // 开始创建线
  canvas.__link__.changing = true
  // 记录当前对应的线
  canvas.__link__.line = line
  canvas.__link__.linePoint = linePoint
  canvas.__link__.linkGroup = linkGroup
  canvas.__link__.lineIndex = lineIndex
  canvas.__link__.otherLinkGroup = otherLinkGroup
  canvas.__link__.otherLineIndex = otherLineIndex
  // 记录当前linkgroup的状态，以便恢复
  canvas.__link__.collect = linkGroup.collect
  linkGroup.collect = 0
  // 暂时移除当前线段与关系
  canvas.removeControl(line, true)
  // 移除关联的, 重新显示LineBar
  if (linePoint == 'start') {
    canvas.hideStartLineBar()
    line.startLinkGroup = null
  } else {
    canvas.hideEndLineBar()
    line.endLinkGroup = null
  }
  // 显示另一端的LineBar
  this.getOtherLinkModel().showLineBar({ type: this.getOtherLinkType() }, this.getOtherLinePoint())
}

RuleLineBarPoint.prototype.handleDragMove = function (e) {
  const lineBar = this.getMainModel()
  const canvas = lineBar.getCanvas()
  // 获取鼠标在图层中的定位
  let mousePosition = getMousePosition(canvas.container, e)
  let control = canvas.findControlByPosition(mousePosition)
  let model = control[0]
  let otherModel = this.getOtherLinkModel()
  // 记录开始Model和结束Model
  let startModel = model
  let endModel = otherModel
  let linePoint = this.linePonit
  if (linePoint === 'end') {
    startModel = otherModel
    endModel = model
  }
  // 图形外 或 图形不能被连线 或 开始图形和结束图形不能被连线则隐藏结束图形的endLineBar
  if (!model || !model.isLinkable || !model.isLinkable()) {
    this.hideLineBar()
    // 还原鼠标
    document.body.style.cursor = 'grabbing'
    return
  }
  // 不要重复校验
  if (
    // 对端模型改变且两者不允许连线时
    (model !== canvas.__link__.otherModel && !startModel.linkValidate(endModel, e)) ||
    // 对端模型未改变且上次验证为不允许连线时
    (model === canvas.__link__.otherModel && !canvas.__link__.otherModelLinkable)
  ) {
    this.hideLineBar()
    // 记录当前目标Model
    canvas.__link__.otherModel = model
    canvas.__link__.otherModelLinkable = false
    // 鼠标禁用标志
    document.body.style.cursor = 'not-allowed'
    return
  }
  // 记录当前目标Model
  canvas.__link__.otherModel = model
  canvas.__link__.otherModelLinkable = true
  // 显示连线bar
  model.showLineBarByPosition(mousePosition, linePoint)
  // 如果有结束的边线
  if (canvas.startLineBar && canvas.endLineBar && !canvas.__link__.tempLine) {
    // 将原来的线段转为临时的线
    canvas.__link__.tempLine = normalLineToTempLine(canvas.__link__.line)
    setLineStartLinkGroup(canvas, canvas.__link__.tempLine, {
      model: startModel,
      side: canvas.startLineBar.side
    })
    setLineEndLinkGroup(canvas, canvas.__link__.tempLine, {
      model: endModel,
      side: canvas.endLineBar.side
    })
    // 重新添加线，触发线的折线计算和重绘
    canvas.addModel(canvas.__link__.tempLine)
    // 显示LineBar的Points
    canvas.startLineBar.showPoints()
    canvas.endLineBar.showPoints()
  }
}

RuleLineBarPoint.prototype.handleDragEnd = function () {
  const lineBar = this.getMainModel()
  const canvas = lineBar.getCanvas()
  if (canvas.__link__.tempLine) { // 创建新的线
    tempLineToNormalLine(canvas.__link__.tempLine)
    canvas.__link__.tempLine.renderDelay()
    // 触发vue全局事件
    bus.$emit('modelLinked', this)
  } else { // 还原老的线
    const { line, linePoint, linkGroup, lineIndex, otherLinkGroup, otherLineIndex } = canvas.__link__
    // 临时线转正式线
    tempLineToNormalLine(line)
    // 插入老的线
    linkGroup['lines'].splice(lineIndex, 0, line)
    // 恢复另一端点的关系
    otherLinkGroup['lines'].splice(otherLineIndex, 0, line)
    if (linePoint === 'start') {
      line.startLinkGroup = linkGroup
    } else {
      line.endLinkGroup = linkGroup
    }
    canvas.addModel([line])
    // 重绘关联的模型
    line.startLinkGroup?.model?.renderDelay()
    line.endLinkGroup?.model?.renderDelay()
  }
  // 选中线
  canvas.makeSelection(canvas.__link__.line)
  // 清理连线缓存值
  delete canvas.__link__
  // 隐藏连线工具栏
  canvas.hideStartLineBar()
  canvas.hideEndLineBar()
  // 还原鼠标
  document.body.style.cursor = null
}

RuleLineBarPoint.prototype.getLine = function () {
  return this.line
}

RuleLineBarPoint.prototype.getLinePoint = function () {
  return this.linePonit
}

RuleLineBarPoint.prototype.getOtherLinePoint = function () {
  return this.linePonit === 'start' ? 'end' : 'start'
}

RuleLineBarPoint.prototype.getLinkModel = function () {
  return this.getLinkGroup().model
}

RuleLineBarPoint.prototype.getLinkGroup = function () {
  return this.linePonit === 'start' ? this.line.startLinkGroup : this.line.endLinkGroup
}

RuleLineBarPoint.prototype.getLinkType = function () {
  return this.getLinkGroup().type
}

RuleLineBarPoint.prototype.getOtherLinkModel = function () {
  return this.getOtherLinkGroup().model
}

RuleLineBarPoint.prototype.getOtherLinkGroup = function () {
  return this.linePonit === 'end' ? this.line.startLinkGroup : this.line.endLinkGroup
}

RuleLineBarPoint.prototype.getOtherLinkType = function () {
  return this.getOtherLinkGroup().type
}

RuleLineBarPoint.prototype.hideLineBar = function () {
  const canvas = this.getMainModel().getCanvas()
  this.linePonit === 'start' ? canvas.hideStartLineBar() : canvas.hideEndLineBar()
  canvas.removeTempLine()
}

RuleLineBarPoint.prototype.deleteFromLineBar = function () {
  const lineBar = this.getMainModel()
  lineBar.removePoint(this)
  lineBar.updatePoints()
}

export default RuleLineBarPoint
