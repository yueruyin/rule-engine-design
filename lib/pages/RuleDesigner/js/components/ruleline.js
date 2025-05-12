/**
 * 连接线，用来连接不同的Activity
 * 线由至少两个端点构成，分别是开始和结束，线中间有一个说明文本，可以用来代表条件。
 */
import RDSetting from '../ruledesigner_setting'
import jspLine from '../jspLine'
import { create, defineUnenumerableProperty, extendsClass, extendsClasses, firstChartToUpperCase } from './modules/common'
import SvgModel from './model/SvgModel'
import SelectableModel from './model/SelectableModel'
import { getPathSide } from './modules/shape'

import bus from '../bus'
import { isTempLine } from './modules/line'
import { ModelStatusEnum } from './constants/status'
import { CornerDirectionEnum, DirectionEnum, DirectionNameEnum } from './constants/border'
import { round, flatten } from 'lodash'

const global = window

/**
 * 创建线结束Arrow
 * @param {RuleLine} line
 * @param {*} { line: 线段, lineId: 线ID, lineColor: 线颜色 }
 * @returns 线段结束Arrow
 */
const createArrow = function (line, {
  lineId,
  lineColor
}) {
  let arrow = global.createSVGElement('marker', line, {
    id: lineId + '_marker',
    markerWidth: '4',
    markerHeight: '4',
    refX: '3',
    refY: '2',
    orient: 'auto',
    markerUnits: 'strokeWidth',
    mid: lineId
  })
  arrow.innerHTML = `<path d="M 0 0 L 4 2 L 0 4 z" fill="${lineColor}"/>`
  return arrow
}

// 路径转点
const pathToPoints = function (pathData) {
  let points = []
  if (!pathData) {
    return points
  }
  let commands = pathData.split(/\s(?=[MLHVCSQTAZ])/)
  commands = commands.map(item => item.split(' '))
  let lastX, lastY
  let x, y
  commands.forEach(command => {
    let type = command[0]
    switch (type) {
      case 'M':
      case 'L':
        x = +command[1]
        y = +command[2]
        break
      case 'A':
        x = +command[5]
        y = +command[6]
        break
      default:
        x = undefined
        y = undefined
    }
    if (!x || !y) {
      return
    }
    lastX = x
    lastY = y
    points.push(x)
    points.push(y)
  })
  return points
}

const inPath = function (position, points) {
  if (!points || !points.length) {
    return false
  }
  // 判断是否在Path的一段上
  return getPathSide(position, points).type !== 'none'
}

const distanceWith = function (sourceP, targetP) {
  return (
    Math.abs(targetP.x - sourceP.x) +
    Math.abs(targetP.y - sourceP.y)
  )
}

/**
 * 计算两个端点的距离
 * @param {*} sourceP 起始点
 * @param {*} targetP 结束点
 * @param {*} sourceD 起始方向
 * @param {*} targetD 结束方向
 */
const calcTerminalPointDistance = function (sourceP, targetP, sourceD = 'Bottom', targetD = 'Bottom') {
  let distance = distanceWith(sourceP, targetP)
  if (
    // 竖直平行
    (sourceD === 'Top' || sourceD === 'Bottom') &&
    (targetD === 'Top' || targetD === 'Bottom')
  ) {
    distance = Math.abs(sourceP.y - targetP.y)
  } else if (
    // 水平平行
    (sourceD === 'Left' || sourceD === 'Right') &&
    (targetD === 'Left' || targetD === 'Right')
  ) {
    distance = Math.abs(sourceP.x - targetP.x)
  }
  return distance
}

/**
 * 计算x轴，y轴的最短距离
 * @param {*} sourceP 开始点
 * @param {*} targetP 结束点
 * @param {*} scale 缩放比例
 */
const calcMinDistance = function (sourceP, targetP, scale = 1, precision = 2) {
  return round(Math.min(Math.abs(sourceP.x - targetP.x), Math.abs(sourceP.y - targetP.y)) * scale, precision)
}

const calcPointDistance = function (sourceP, targetP, field, scale = 0.4, precision = 2) {
  return round(Math.abs(sourceP[field] - targetP[field]) * scale, precision)
}

const directionWith = function (sourceP, targetP) {
  let xVector = targetP.x - sourceP.x
  let xAbsVector = Math.abs(xVector)
  let yVector = targetP.y - sourceP.y
  let yAbsVector = Math.abs(yVector)
  if (yVector === 0) {
    return xVector > 0 ? DirectionEnum.Right : DirectionEnum.Left
  }
  if (xVector === 0) {
    return yVector > 0 ? DirectionEnum.Down : DirectionEnum.Up
  }
  // x向量 > 0 则在右边，否则在左边
  if (xVector > 0) {
    // y向量 > 0 则在右边，否则在左边
    if (yVector > 0) {
      // 下边
      if (yAbsVector === xAbsVector) {
        return DirectionEnum.DownRightCenter
      } else if (yAbsVector > xAbsVector) {
        return DirectionEnum.RightDown
      } else {
        return DirectionEnum.DownRight
      }
    } else {
      if (yAbsVector === xAbsVector) {
        return DirectionEnum.UpRightCenter
      } else if (yAbsVector > xAbsVector) {
        return DirectionEnum.RightUp
      } else {
        return DirectionEnum.UpRight
      }
    }
  } else {
    // 左边
    if (yVector > 0) {
      // 上边
      if (yAbsVector === xAbsVector) {
        return DirectionEnum.UpLeftCenter
      } else if (yAbsVector > xAbsVector) {
        return DirectionEnum.LeftUp
      } else {
        return DirectionEnum.UpLeft
      }
    } else {
      if (yAbsVector === xAbsVector) {
        return DirectionEnum.UpLeftCenter
      } else if (yAbsVector > xAbsVector) {
        return DirectionEnum.LeftUp
      } else {
        return DirectionEnum.UpLeft
      }
    }
  }
}

const cornerDirectionWith = function (firstP, secondP, thirdP) {
  let firstD = directionWith(firstP, secondP)
  let secondD = directionWith(secondP, thirdP)
  return CornerDirectionEnum[firstD][secondD]
}

const getBackPoint = function (firstP, secondP, thirdP) {
  // 三点一线
  if (!firstP || !secondP || !thirdP || !isSameLine(firstP, secondP, thirdP)) {
    return null
  }
  if (distanceWith(firstP, secondP) < distanceWith(secondP, thirdP)) {
    return firstP
  } else {
    return thirdP
  }
}

const isSameLine = function (node1, node2, node3) {
  return (
    (node1.x === node2.x && node2.x === node3.x) || // 在同一列上
    (node1.y === node2.y && node2.y === node3.y) // 在同一行上
  )
}

/**
 * 计算连线路径
 * @param {*} points 点集合
 * @param {*} radius 圆角
 * @returns 路径data
 */
const calcPathData = function (points = [], radius = 0) {
  if (!points.length) {
    return ''
  }
  let data = 'M ' + points[0].x + ' ' + points[0].y
  // radius = 0
  // 计算圆角
  if (radius) {
    let tempP1, tempP2
    for (let i = 1; i < points.length - 1; i++) {
      let d = cornerDirectionWith(points[i - 1], points[i], points[i + 1])
      let type = '0,1'
      // 每个转角的圆角可能不一样，需要根据距离进行计算
      let r
      switch (d) {
        case DirectionEnum.LeftUp:
          r = Math.min(calcPointDistance(points[i - 1], points[i], 'x'), calcPointDistance(points[i], points[i + 1], 'y'), radius)
          tempP1 = { x: points[i].x + r, y: points[i].y }
          tempP2 = { x: points[i].x, y: points[i].y - r }
          type = '0,1'
          break
        case DirectionEnum.UpLeft:
          r = Math.min(calcPointDistance(points[i - 1], points[i], 'y'), calcPointDistance(points[i], points[i + 1], 'x'), radius)
          tempP1 = { x: points[i].x, y: points[i].y + r }
          tempP2 = { x: points[i].x - r, y: points[i].y }
          type = '0,0'
          break
        case DirectionEnum.RightUp:
          r = Math.min(calcPointDistance(points[i - 1], points[i], 'x'), calcPointDistance(points[i], points[i + 1], 'y'), radius)
          tempP1 = { x: points[i].x - r, y: points[i].y }
          tempP2 = { x: points[i].x, y: points[i].y - r }
          type = '0,0'
          break
        case DirectionEnum.UpRight:
          r = Math.min(calcPointDistance(points[i - 1], points[i], 'y'), calcPointDistance(points[i], points[i + 1], 'x'), radius)
          tempP1 = { x: points[i].x, y: points[i].y + r }
          tempP2 = { x: points[i].x + r, y: points[i].y }
          type = '0,1'
          break
        case DirectionEnum.LeftDown:
          r = Math.min(calcPointDistance(points[i - 1], points[i], 'x'), calcPointDistance(points[i], points[i + 1], 'y'), radius)
          tempP1 = { x: points[i].x + r, y: points[i].y }
          tempP2 = { x: points[i].x, y: points[i].y + r }
          type = '0,0'
          break
        case DirectionEnum.DownLeft:
          r = Math.min(calcPointDistance(points[i - 1], points[i], 'y'), calcPointDistance(points[i], points[i + 1], 'x'), radius)
          tempP1 = { x: points[i].x, y: points[i].y - r }
          tempP2 = { x: points[i].x - r, y: points[i].y }
          type = '0,1'
          break
        case DirectionEnum.RightDown:
          r = Math.min(calcPointDistance(points[i - 1], points[i], 'x'), calcPointDistance(points[i], points[i + 1], 'y'), radius)
          tempP1 = { x: points[i].x - r, y: points[i].y }
          tempP2 = { x: points[i].x, y: points[i].y + r }
          type = '0,1'
          break
        case DirectionEnum.DownRight:
          r = Math.min(calcPointDistance(points[i - 1], points[i], 'y'), calcPointDistance(points[i], points[i + 1], 'x'), radius)
          tempP1 = { x: points[i].x, y: points[i].y - r }
          tempP2 = { x: points[i].x + r, y: points[i].y }
          type = '0,0'
          break
        default:
          // 直线
          tempP1 = null
          tempP2 = null
          r = null
      }
      // r = r !== undefined && r !== null ? r : 0
      // 需要足够的距离才生出圆角，如果当前点和增加的两个点形成了回头路，则距离不够，不生成圆角
      if (tempP1 && tempP2 && !getBackPoint(points[i], tempP1, tempP2)) {
        data += ' L ' + tempP1.x + ' ' + tempP1.y + ' A ' + r + ' ' + r + ' 0 ' + type + ' ' + tempP2.x + ' ' + tempP2.y
      } else {
        data += ' L ' + points[i].x + ' ' + points[i].y
      }
    }
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      data += ' L ' + points[i].x + ' ' + points[i].y
    }
  }
  data += ' L ' + points[points.length - 1].x + ' ' + points[points.length - 1].y
  return data
}

const toPositionList = function (points = []) {
  let list = []
  for (let i = 0; i < points.length - 2; i += 2) {
    list.push({
      x: points[i],
      y: points[i + 1]
    })
  }
  return list
}

const RDLineDefaultOptions = {
  fontSize: 14,
  lineColor: '#ffffff',
  lineColorSelected: '#01FBF2',
  lineDash: '0,1,1',
  lineOpacity: 1,
  lineWeight: 2
}

const RDLine = function (rd, props) {
  // 继承父类的实例属性
  SvgModel.call(this, props)
  SelectableModel.call(this)

  // 不允许批量选中
  this.setMuiltipleSelectable(false)
  // 不允许采用原生事件选中
  this.setEventSelectable(false)

  this.id = props.id
  // 线的开始端点所在的坐标
  this.start = props.start || { x: 0, y: 0, width: 4, height: 4 }
  // 线开始端点所在的关联控件组,一个关联控件组中包含了一个Activity，一个方向上所有关联的线
  this.startLinkGroup = props.startLinkGroup

  // 线的结束端点所在的坐标
  this.end = props.end || { x: 0, y: 0, width: 4, height: 4 }
  // 线结束端点所在的关联控件组,一个关联控件组中包含了一个Activity，一个方向上所有关联的线
  this.endLinkGroup = props.endLinkGroup

  // 线的类型， 2折线，1直线 缺省为直线
  this.lineType = props.lineType ? props.lineType : 1

  // 是否开始执行动画，要播放动画，将此属性设置为true并重绘就可以播放了
  this.playAnim = false

  this.modelType = 'RDLine'
  this.baseModelType = 'Line'
  this.rd = rd

  // 所属图层和在图层中的索引
  this.layer = 'lineLayer'
  this.layerIndex = props.layerIndex !== undefined && props.layerIndex !== null ? props.layerIndex : 0

  this.code = props.code
  this.controlType = props.controlType

  this.attrs = this.attrs || {}

  // 是否允许删除
  this.canDel = props.canDel ? props.canDel : RDSetting.DEFAULT_ACTIVITY_CANDEL

  this.$defaultOptions = RDLineDefaultOptions

  // 记录所有的点
  defineUnenumerableProperty(this, 'points', [])
}

extendsClass(RDLine, SvgModel)
extendsClasses(RDLine, SelectableModel)

// ============================ 类方法 Start ============================

// 创建图形方法
RDLine.prototype.buildShape = function () {
  this.$el = global.createSVGElement('svg', this, {
    mid: this.id,
    id: 'line_' + this.id
  })

  // 生成折线线段，目前折线的坐标是通过位置关系自动计算的
  // 根据计算好的路径，生成线段
  let shapeLine = global.createSVGElement('path', this, {
    fillEnabled: false,
    lineCap: 'round',
    lineJoin: 'round',
    pointIndex: 0,
    fill: 'none',
    'marker-end': 'url(#' + this.id + '_marker)',
    mid: this.id
  })
  // 将线段加入图形
  this.$el.appendChild(shapeLine)
  this.bindRef('line', shapeLine)
  // 镜像实线，避免需要空白处无法触发事件的情况
  let bgLineEl = global.createSVGElement('path', this, {
    'stroke-width': this.lineWeight,
    stroke: 'transparent',
    lineCap: 'round',
    lineJoin: 'round',
    pointIndex: 0,
    mid: this.id,
    fill: 'none',
    'marker-end': 'url(#' + this.id + '_marker)'
  })
  this.$el.appendChild(bgLineEl)
  this.bindRef('bgLine', bgLineEl)
  // 生成箭头
  let spArrow = createArrow(this, {
    lineId: this.id
  })
  this.$el.appendChild(spArrow)
  this.bindRef('arrow', spArrow)

  this.bindEvents()
}

// 更新图形
RDLine.prototype.updateShape = function () {
  this.updateByStyle()
}

/**
 * 计算线的位置，通过判断线端点与模型的位置关系和收折状态来计算
 * @param {*} line 线
 * @param {*} tm 与线连接的模型
 * @param {*} td 端点的方向
 * @param {*} lines 一共有多少线
 * @param {*} collect 收折模式
 */
const calcLineTerminalPointPosition = function (line, tm, td, lines = [], collect = false) {
  if (!line || !tm || !td) {
    return null
  }
  let p = { x: 0, y: 0, width: 4, height: 4 }
  let type = 'horizontal'
  // 根据方位计算初始位置
  td = firstChartToUpperCase(td)
  let { lineWeight = 2 } = line
  switch (td) {
    case DirectionNameEnum.Top:
      p.x = tm.x + tm.width / 2
      p.y = tm.y - lineWeight
      break
    case DirectionNameEnum.Right:
      p.x = tm.x + tm.width + lineWeight
      p.y = tm.y + tm.height / 2
      type = 'vertical'
      break
    case DirectionNameEnum.Bottom:
      p.x = tm.x + tm.width / 2
      p.y = tm.y + tm.height + lineWeight
      break
    case DirectionNameEnum.Left:
      p.x = tm.x - lineWeight
      p.y = tm.y + tm.height / 2
      type = 'vertical'
      break
    default:
      // 居中点
      p.x = tm.x + tm.width / 2
      p.y = tm.y + tm.height / 2
  }
  // 已合并，或者只有一条线，或者线不在组内，则直接返回位置
  let index = lines.indexOf(line)
  if (collect || lines.length < 2 || index === -1) {
    return p
  }
  // 根据index、total、type、width、height、padding来计算x、y
  const isHorizontal = type === 'horizontal'
  let containerSize = isHorizontal ? tm.width : tm.height
  // 如果是横向的则取宽作为size，纵向取高，后续可以扩展在多种计算方式来满足斜线等情况
  let size = 4
  let padding = 2
  let total = lines.length
  // 计算总长度
  let totalSize = total * size + padding * (total - 1)
  // 计算偏移量
  let offset = (containerSize - totalSize) * 0.5 + index * padding + index * size
  // 横向修改x的位置，纵向修改y的位置
  if (isHorizontal) {
    p.x = tm.x + offset + line.getStatusOption('lineWeight')
  } else {
    p.y = tm.y + offset + line.getStatusOption('lineWeight')
  }
  return p
}

const calcLineTerminalPointPositionByLinkGroup = function (line, linkGroup) {
  return calcLineTerminalPointPosition(line, linkGroup?.model, linkGroup?.type, linkGroup?.lines, linkGroup?.collect === 1 || linkGroup?.collect === '1')
}

// 更新图形
RDLine.prototype.updateByStyle = function (forcedUpdate = true) {
  // 根据线段在startLinkGroup以及endLinkGroup中的下标关系，修改线段的开始坐标和结束坐标
  this.start = calcLineTerminalPointPositionByLinkGroup(this, this.startLinkGroup)
  this.end = calcLineTerminalPointPositionByLinkGroup(this, this.endLinkGroup)
  if (!this.start || !this.end) {
    this.$refs.line.setAttribute('d', '')
    this.$refs.bgLine.setAttribute('d', '')
    return
  }
  // 获取线的颜色
  let lineColor = this.getStatusOption('lineColor')
  let lineWeight = this.getStatusOption('lineWeight')
  let lineDash = this.getStatusOption('lineDash')
  // 设置颜色、宽度、虚线
  this.$refs.line.setAttribute('stroke', lineColor)
  this.$refs.arrow.setAttribute('fill', lineColor)
  this.$refs.line.setAttribute('stroke-width', lineWeight)
  this.$refs.bgLine.setAttribute('stroke-width', lineWeight)
  this.$refs.line.setAttribute('stroke-dasharray', lineDash)
  // 默认取上一次的路径
  let data = this.$refs.line.getAttribute('d')
  // 处理折线类型，计算位置等信息
  if (this.lineType == 2) {
    let sourceType = firstChartToUpperCase(this.startLinkGroup.type)
    let targetType = firstChartToUpperCase(this.endLinkGroup.type)
    let pathParam = {
      sourcePos: [this.start.x, this.start.y],
      targetDirection: targetType,
      targetPos: [this.end.x, this.end.y],
      sourceDirection: sourceType
    }
    // 计算路径
    data = jspLine.jspLine(pathParam)
    this.points = pathToPoints(data)
  } else {
    let pointX = this.start.x
    let pointY = this.start.y
    let pointEndX = this.end.x
    let pointEndY = this.end.y
    this.points = [pointX, pointY, pointEndX, pointEndY]
    data = 'M ' + pointX + ' ' + pointY + ' L ' + pointEndX + ' ' + pointEndY
  }
  this.$refs.line.setAttribute('d', data)
  this.$refs.bgLine.setAttribute('d', data)
}

// 清空选中状态
RDLine.prototype.clearSelection = function () {
  this.selected = false
  this.removeStatus(ModelStatusEnum.Selected)
}

// 设置选中状态
RDLine.prototype.makeSelection = function () {
  // 选中状态为true
  this.selected = true
  this.addStatus(ModelStatusEnum.Selected)
}

RDLine.prototype.handleModelClick = function ({ model }, e) {
  this.getCanvas().makeSelection(model, e)
}

RDLine.prototype.handleModelDblclick = function (e) {
  const canvas = this.getCanvas()
  if (canvas.readonly) {
    return
  }
  // 修改线段的类型
  if (this.lineType == 2 || this.lineType == '2') {
    this.lineType = 1
  } else {
    this.lineType = 2
  }
  this.attrs['lineType'] = this.lineType
  this.renderDelay()
  // 触发vue全局事件
  bus.$emit('modelLineChange', this)
}

RDLine.prototype.isInSelectArea = function ({ x, y, width = 0, height = 0 }) {
  // 默认以矩形来判断
  if (x === undefined || y === undefined) {
    return false
  }
  // 判断线是否在矩形范围内
  if (width && height) {
    return false
  }
  // 判断位置是否在鼠标周围
  return inPath({ x, y }, this.points)
}

const destoryLinkGroup = function (line, linkGroup) {
  linkGroup && linkGroup.lines && linkGroup.lines.remove(line)
}

// 删除关联关系
RDLine.prototype.destoryLinkGroup = function () {
  this.destoryStartLinkGroup()
  this.destoryEndLinkGroup()
}

const renderLinkGroup = function (canvas, linkGroup) {
  if (!linkGroup || canvas.linkGroups) {
    return
  }
  let lines = canvas.linkGroups[linkGroup.model.id + '_' + linkGroup.type]['lines']
  for (let i = 0; i < lines.length; i++) {
    lines[i].updateByStyle()
  }
}

RDLine.prototype.renderLinkGroup = function () {
  const canvas = this.getCanvas()
  // 更新所有关联分组的控件
  renderLinkGroup(canvas, this.startLinkGroup)
  renderLinkGroup(canvas, this.endLinkGroup)
}

RDLine.prototype.render = function () {
  SvgModel.prototype.render.call(this)
  // 更新连接的点
  this.renderLinkGroup()
}

RDLine.prototype.getEndLinkGroup = function () {
  return this.endLinkGroup
}

RDLine.prototype.getEndLinkModel = function () {
  return this.endLinkGroup?.model
}

// 删除关联关系
RDLine.prototype.destoryEndLinkGroup = function () {
  destoryLinkGroup(this, this.endLinkGroup)
  // 删除对应的点
  this.__end_point__ && this.__end_point__.deleteFromLineBar()
}

RDLine.prototype.getStartLinkGroup = function () {
  return this.startLinkGroup
}

RDLine.prototype.getStartLinkModel = function () {
  return this.startLinkGroup?.model
}

// 删除关联关系
RDLine.prototype.destoryStartLinkGroup = function () {
  destoryLinkGroup(this, this.startLinkGroup)
  // 删除对应的点
  this.__start_point__ && this.__start_point__.deleteFromLineBar()
}

// 删除控件，移除图形
RDLine.prototype.destoryModelAndShapes = function () {
  // 移除图形
  for (var i = 0; i < this.shapes.length; i++) {
    this.shapes[i].remove()
  }
  this.shapes = []
}

RDLine.prototype.remove = function (slient = false) {
  // 删除图形
  SvgModel.prototype.remove.call(this)
  // 删除LinkGroup
  this.destoryLinkGroup()
  // 更新关联关系
  this.startLinkGroup.lines.forEach(line => line.updateShape())
  this.endLinkGroup.lines.forEach(line => line.updateShape())
  // 触发vue全局事件
  if (!slient && !isTempLine(this)) {
    bus.$emit('modelLineRemove', this)
  }
}

// 把基本属性转换为JSON
RDLine.prototype.getBaseJSON = function () {
  var json = {
    'id': this.id,
    'lineType': this.lineType,
    'text': this.text,
    'modelType': this.modelType,
    'baseModelType': this.baseModelType,
    'attrs': this.attrs,
    'controlType': this.controlType,
    'startLinkGroupId': this.startLinkGroup.model.id + '_' + this.startLinkGroup.type,
    'endLinkGroupId': this.endLinkGroup.model.id + '_' + this.endLinkGroup.type,
    'start': this.start,
    'end': this.end,
    'layer': this.layer,
    'layerIndex': this.layerIndex
  }
  return json
}

// 转换为JSON的序列化方法
RDLine.prototype.toJSON = function () {
  var json = this.getBaseJSON()
  if (this.font != RDSetting.DEFAULT_ACTIVITY_FONT) {
    json.font = this.font
  }
  if (this.fill != RDSetting.DEFAULT_ACTIVITY_FILL) {
    json.fill = this.fill
  }
  return json
}

// ============================ 类方法 End ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RDLine.initByJson = function (json) {
  let rd = global.tempSeriDatas['currentRuleCanvas']
  let obj = create(global[json.modelType], rd, json)
  global.tempSeriDatas[obj.id] = obj
  return obj
}

// ============================ 静态方法 Start ============================

global.RDLine = RDLine

export default RDLine
