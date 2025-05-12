// ========================================================
// 用于连线的对象，分为开始和结束两种
// @author wangyb
// @createTime 2023-05-04 11:59:44
// ========================================================

import RDSetting from '../ruledesigner_setting'
import { defineOptionObserveFields, defineSvgObserveFields, defineUnenumerableProperty, extendsClass, extendsClasses } from './modules/common'
import { clearSelectionText, getMousePosition } from './modules/dom'
import RuleActivity from './RuleActivity'
import { FIELD_CANVAS, FIELD_MODEL } from './modules/fields'
import { tempLineToNormalLine } from './modules/line'
import { RectSideLineSeq } from './constants/shape'
import DraggableModel from './model/DraggableModel'
import AttachModel from './model/AttachModel'
import RuleLineBarPoint from './RuleLineBarPoint'

import bus from '../bus'

const global = window

const THEMES = {
  'start': {
    bgColor: 'rgba(255, 0, 0, 0.4)'
  },
  'end': {
    bgColor: 'rgba(0, 255, 0, 0.4)'
  }
}

/**
 * @param {*} canvas 所属画布
 * @param {*} model 所属模型
 * @param {*} props 配置
 */
const RuleLineBar = function (canvas, model, props) {
  // 继承父类的实例属性
  DraggableModel.call(this, canvas)
  AttachModel.call(this, model)

  // 拖拽时不移动位置
  this.setDraggingMove(false)
  // 拖拽时不需要辅助线
  this.setShowDraggingHelpLine(false)

  // 类型，开始/结束 start/end
  this.type = props.type || 'start'
  // 是否收折连接点
  this.collect = props.collect ? 1 : 0
  // 设置与model的关系，应该是直接计算
  this.directtype = props.directtype || 'top'
  // 绑定默认属性
  defineUnenumerableProperty(this, FIELD_CANVAS, canvas)
  defineUnenumerableProperty(this, FIELD_MODEL, model)
  // 用来保存所有的点
  defineUnenumerableProperty(this, 'points', [])
  // 绑定图形
  this.buildShape()
  // 绑定事件
  this.rebuildAnchors()
  // 设置模型
  this.setModel(model, props.directtype || 'top')
}

extendsClass(RuleLineBar, AttachModel)
extendsClasses(RuleLineBar, DraggableModel)

// ============================ 类方法 Start ============================

// 普通节点的创建图形方法
RuleLineBar.prototype.buildShape = function () {
  // 构建图形
  this.shapes[0] = global.createSVGElement('svg', this, {
    id: 'line_bar_' + this.type + '_' + this.id
  })
  this.shapes[0].setAttributeNS(null, 'mtype', this.type + 'LineBar')

  this.shapes[1] = global.createSVGElement('g', this, {
  })

  this.shapes[2] = global.createSVGElement('rect', this, {
    x: 0,
    y: 0,
    fill: THEMES[this.type].bgColor
  })

  this.shapes[2].setAttributeNS(null, 'mtype', this.type + 'LineBar')

  this.shapes[3] = global.createSVGElement('text', this, {
    x: 1,
    y: 5,
    width: 3,
    height: 3,
    fontFamily: RDSetting.DEFAULT_ACTIVITY_FONT_FAMILY,
    fill: '#000000',
    fontSize: 8,
    align: 'center',
    anchor: 'middle'
  })
  this.shapes[3].style.userSelect = 'none'
  this.shapes[1].appendChild(this.shapes[2])
  this.shapes[1].appendChild(this.shapes[3])

  this.shapes[0].appendChild(this.shapes[1])

  defineUnenumerableProperty(this.shapes[0], 'model', this)
}

RuleLineBar.prototype.updateByStyle = function () {
  let { x, y, width, height } = this.getOptions()
  let $el = this.getMainShape()
  $el.setAttribute('x', x)
  $el.setAttribute('y', y)
  $el.setAttribute('width', width)
  $el.setAttribute('height', height)
  this.shapes[0].children[0].children[0].setSize({
    width: width,
    height: height
  })
}

RuleLineBar.prototype.bindShapeEvents = function () {
  const me = this
  const canvas = this.getCanvas()
  // 给收折按钮添加事件
  this.shapes[1].addEventListener('click', function (e) {
    e.stopPropagation()
    clearSelectionText()
    // 改变收折打开状态
    let linkGroupKey = me.getAttribute('mid') + '_' + me.getAttribute('directtype')
    let linkGroup = canvas.linkGroups[linkGroupKey]
    if (linkGroup) {
      // 切换状态, 收起变为打开
      linkGroup['collect'] = linkGroup['collect'] ? 0 : 1
      // 切换显示
      me.showPoints()
      // 线重绘
      let lines = linkGroup.lines || []
      lines.forEach(line => line.renderDelay())
    }
    // 触发vue全局事件
    bus.$emit('modelLineBarChange', this)
    return false
  })
}

RuleLineBar.prototype.handleDragStart = function (e) {
  const canvas = this.getCanvas()
  // 阻止冒泡
  e.stopPropagation()
  // 显示拖拽图标
  document.body.style.cursor = 'grabbing'
  // 创建连线缓存信息
  defineUnenumerableProperty(canvas, '__link__', {})
}

RuleLineBar.prototype.handleDragMove = function (e) {
  const canvas = this.getCanvas()
  // 获取鼠标在图层中的定位
  let mousePosition = getMousePosition(canvas.container, e)
  let control = canvas.findControlByPosition(mousePosition)
  let model = control[0]
  if (!canvas.startLineBar) {
    return
  }
  let startModel = canvas.startLineBar.getMainModel()
  // 图形外 或 图形不能被连线 或 开始图形和结束图形不能被连线则隐藏结束图形的endLineBar
  if (!model || !model.isLinkable || !model.isLinkable()) {
    canvas.hideEndLineBar()
    canvas.removeTempLine()
    // 还原鼠标
    document.body.style.cursor = 'grabbing'
    return
  }
  // 不要重复校验
  if (
    // 对端模型改变且两者不允许连线时
    (model !== canvas.__link__.otherModel && !startModel.linkValidate(model, e)) ||
    // 对端模型未改变且上次验证为不允许连线时
    (model === canvas.__link__.otherModel && !canvas.__link__.otherModelLinkable)
  ) {
    canvas.hideEndLineBar()
    canvas.removeTempLine()
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
  // 显示连线的bar，内部会校验是否允许连线
  model.showLineBarByPosition(mousePosition, 'end')
  // 如果有结束的边线
  if (canvas.endLineBar && !canvas.__link__.tempLine) {
    // 创建临时关联线段
    canvas.__link__.tempLine = startModel.linkModel(model, true)
    // 显示LineBar的Points
    canvas.startLineBar.showPoints()
    canvas.endLineBar.showPoints()
  }
}

RuleLineBar.prototype.handleDragEnd = function (e) {
  const canvas = this.getCanvas()
  // 通知画布绘制线，或者调整线
  if (canvas.__link__.tempLine) {
    tempLineToNormalLine(canvas.__link__.tempLine)
    // 重新渲染
    canvas.__link__.tempLine.renderDelay()
    // 触发vue全局事件
    bus.$emit('modelLinked', this)
  }
  // 选中线
  canvas.makeSelection(canvas.__link__.tempLine)
  // 清理连线缓存值
  delete canvas.__link__
  // 隐藏连线工具栏
  canvas.hideStartLineBar()
  canvas.hideEndLineBar()
  // 还原鼠标
  document.body.style.cursor = null
}

/**
 * 移除与主模型的关系
 */
RuleLineBar.prototype.unbindMainModel = function () {
  const mainModel = this.getMainModel()
  mainModel && mainModel.clearLineBar && mainModel.clearLineBar()
  delete this.__main_model__
}

RuleLineBar.prototype.getCanvas = function () {
  return this.__canvas__
}

RuleLineBar.prototype.setAttributeNS = function (protocol, name, value) {
  if (!this.shapes[0]) {
    console.error('model没有创建dom元素')
    return
  }
  this.shapes[0].setAttributeNS(protocol, name, value)
}

RuleLineBar.prototype.setPosition = function (x, y) {
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }
  this.x = x
  this.y = y
  this.renderDelay()
}

RuleLineBar.prototype.getAttribute = function (name) {
  return this.shapes[0].getAttribute(name) || this[name]
}

RuleLineBar.prototype.setSize = function (width, height) {
  if (typeof width === 'object') {
    height = width.height
    width = width.width
  }
  width = width || 0
  height = height || 6
  this.width = width
  this.height = height
  this.renderDelay()
}

RuleLineBar.prototype.setModel = function (model, directtype) {
  this[FIELD_MODEL] = model
  this.mid = model.id
  // 计算边线位置
  directtype = directtype || RectSideLineSeq[0]
  this.directtype = directtype
  if (directtype === 'left') {
    this.setPosition({
      x: model.x, // model.x - 3,
      y: model.y
    })
    this.setSize({
      width: 6,
      height: model.height
    })
  } else if (directtype === 'right') {
    this.setPosition({
      x: model.x + model.width - 6, // model.x + model.width - 5,
      y: model.y
    })
    this.setSize({
      width: 6,
      height: model.height
    })
  } else if (directtype === 'top') {
    this.setPosition({
      x: model.x,
      y: model.y // model.y - 3
    })
    this.setSize({
      width: model.width,
      height: 6
    })
  } else if (directtype === 'bottom') {
    this.setPosition({
      x: model.x,
      y: model.y + model.height - 6 // model.y + model.height - 5
    })
    this.setSize({
      width: model.width,
      height: 6
    })
  }
}

RuleLineBar.prototype.getModel = function () {
  return this[FIELD_MODEL]
}

RuleLineBar.prototype.show = function () {
  this.shapes[0].show()

  this.showPoints()
}

RuleLineBar.prototype.removePoint = function (point) {
  const points = this.points || []
  points.remove(point)
  point.remove()
}

RuleLineBar.prototype.removePoints = function () {
  const points = this.points || []
  points.forEach(point => point.remove())
  this.points = []
}

RuleLineBar.prototype.showPoints = function () {
  this.updatePoints()
}

RuleLineBar.prototype.createPoints = function () {
  // 先采用删了重新创建连接点的方式
  this.removePoints()
  // 获取当前lineBar对应的节点，并获取这个位置所有的线
  const canvas = this.getCanvas()
  // 取得当前依附的model，依附的方向，取得关联关系
  let mainShap = this.getMainShape()
  let linkGroupKey = this.getAttribute('mid') + '_' + this.getAttribute('directtype')
  let linkGroup = canvas.linkGroups[linkGroupKey]
  // 没有连线时不需要处理
  if (!linkGroup || !linkGroup.lines || !linkGroup.lines.length) {
    return
  }
  let linkLines = linkGroup['lines']
  let collect = !!linkGroup['collect']
  // 设置收折文本
  this.setCollectText(linkLines.length > 0 ? (collect ? '+' : '-') : '')
  // 判断当前鼠标落点是否在lines的其中一条的端点上面
  let lineCount = linkLines.length
  let pointType = 'horizontal'
  let pointWidth = 4, pointHeight = 4
  let containerSize
  if (this.directtype === 'left' || this.directtype === 'right') {
    pointType = 'vertical'
    pointWidth = this.width
    containerSize = this.height
  } else {
    pointType = 'horizontal'
    pointHeight = this.height
    containerSize = this.width
  }
  let pointPadding = 2
  linkLines.forEach((line, index) => {
    let point = new RuleLineBarPoint(this, line, {
      type: pointType,
      index: index,
      total: lineCount,
      containerSize: containerSize,
      width: pointWidth,
      height: pointHeight,
      padding: pointPadding,
      linePonit: line.startLinkGroup === linkGroup ? 'start' : 'end'
    })
    this.points.push(point)
    // 根据收折状态改变点的显示状态
    point.show(!collect)
    // 图形添加到LineBar上
    mainShap.appendChild(point.getMainShape())
    // 更新line
    line.updateByStyle()
  })
}

RuleLineBar.prototype.updatePoints = function () {
  // 判断点和线的数量是否一致, 不一致则创建
  // 获取当前lineBar对应的节点，并获取这个位置所有的线
  const canvas = this.getCanvas()
  let linkGroupKey = this.getAttribute('mid') + '_' + this.getAttribute('directtype')
  let linkGroup = canvas.linkGroups[linkGroupKey]
  // 没有连线时不需要处理
  if (!linkGroup || !linkGroup.lines || !linkGroup.lines.length) {
    return
  }
  let linkLines = linkGroup['lines']
  let collect = !!linkGroup['collect']
  // 设置收折文本
  this.setCollectText(linkLines.length > 0 ? (collect ? '+' : '-') : '')
  let lineCount = linkLines.length
  // 点和线的数量不一致时，重新创建点
  if (lineCount !== this.points.length) {
    this.createPoints()
    return
  }
  // 更新点的位置
  linkLines.forEach((line, index) => {
    let point = this.points[index]
    point.render({
      index: index,
      total: lineCount
    })
    // 改变点的显示状态
    point.show(!collect)
  })
}

RuleLineBar.prototype.setCollectText = function (text) {
  this.shapes[0].children[0].children[1].innerHTML = text
}

RuleLineBar.prototype.getSideType = function () {
  return this.side && this.side.type
}

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleLineBar.initByJson = function (json) {
  return RuleActivity.initByJson(json)
}

// ============================ 静态方法 Start ============================

export default RuleLineBar
