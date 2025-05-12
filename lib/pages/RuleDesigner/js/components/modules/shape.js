/**
 * 提取一些公共的方法
 * 把相似的图形构建逻辑提取出来，后续可以考虑封装为继承的方式
 * @author wangyb
 * @createTime 2023-04-19 09:41:09
 */

import RDSetting from '../../ruledesigner_setting'
import { getEllipsisText } from './dom'
import { calcTriangleHeight, calcTriangleOffsetType, inPolygon } from './math'
import {
  RectShapeConfig,
  RectSideCompareTypes,
  RectSideLinePropMap,
  RectSideLineSeq,
  DiamondShapeConfig
} from '../constants/shape'
import { isString, upperFirst } from 'lodash'
import { safeJsonParse } from './common'
import { BorderTypeDashArrayMap } from '../constants/border'
import { RULE_PERMISSION_ENUM } from '../../../config/permission'

const global = window

const toPointStr = function (pointArray) {
  if (!pointArray) {
    return ''
  }
  let pointStr = ''
  pointArray.forEach((item, index) => {
    pointStr += item
    if (index % 2 === 0) {
      pointStr += ','
    } else {
      pointStr += ' '
    }
  })
  return pointStr
}

/**
 * 构建矩形
 * 参数结构
 * {
 *   font: "{}",
 *   border: "{}",
 *   fill: "{}"
 * }
 */
export function buildRectShape(ins, props) {
  const {
    id,
    x,
    y,
    height,
    width,
    radius,
    padding,
    headerHeight,
    text,
    descText,
    fontSize,
    fontFamily,
    iconWidth,
    iconHeight,
    headerColor,
    headerFontSize,
    headerFill,
    bodyFontSize,
    bodyFill,
    descFill,
    descHeight,
    descFontSize
  } = ins.getOptions()

  // 第一个元素为svg，包括后续所有子元素
  ins.$el = global.createSVGElement('svg', ins, {
    x: x,
    y: y,
    mid: id,
    id: 'shape_' + id
  })
  ins.$el.$model = ins.$el.model = ins

  // 矩形四个点的位置
  const points = [0, 0, width, 0, width, height, 0, height]
  // 创建边线
  let lines = buildPolygonSideLine(ins, points, RectSideLineSeq)
  RectSideLineSeq.forEach((lineName, index) => {
    ins.bindRef('border' + upperFirst(lineName), lines[index])
  })

  // 创建填充矩形
  let bgEl = global.createSVGElement('rect', ins, {
    x: 0,
    y: 0,
    rx: radius,
    ry: radius,
    width: '100%',
    height: '100%',
    fill: ins.getOption('fill')
  })
  ins.bindRef('bg', bgEl)

  // 创建图标控件
  let iconEl = global.createSVGElement('image', ins, {
    x: padding,
    y: (headerHeight - iconHeight) / 2,
    width: iconWidth,
    height: iconHeight
  })
  ins.bindRef('icon', iconEl)

  let debuggerEl = global.createSVGElement('svg', ins, {
    x: padding + iconWidth + padding / 2,
    y: 0
  })

  let debuggerIcon = global.createSVGElement('circle', ins, {
    cx: iconWidth / 2,
    cy: headerHeight / 2,
    r: iconHeight / 2 - 2,
    stroke: '#ffffff',
    strokeWidth: '1',
    fill: '#c75450'
  })
  let debuggerConditionIcon = global.createSVGElement('circle', ins, {
    cx: iconWidth / 2,
    cy: headerHeight / 2,
    r: 2,
    fill: '#ffffff'
  })
  debuggerEl.appendChild(debuggerIcon)
  debuggerEl.appendChild(debuggerConditionIcon)
  debuggerConditionIcon.hide()

  ins.bindRef('debugger', debuggerEl)
  debuggerEl.hide()
  debuggerEl.showDebuggerConditionIcon = function () {
    debuggerConditionIcon.show()
  }
  debuggerEl.hideDebuggerConditionIcon = function () {
    debuggerConditionIcon.hide()
  }

  // 创建中间区域
  let contentEl = global.createSVGElement('svg', ins, {
    x: padding,
    y: (height - headerHeight - descHeight) / 2 + headerHeight,
    width: width - padding * 2,
    height: descHeight
  })
  ins.bindRef('content', contentEl)

  // 创建背景
  let contextBgEl = global.createSVGElement('rect', ins, {
    x: 0,
    y: 0,
    rx: radius,
    ry: radius,
    width: width - padding * 2,
    height: descHeight,
    fill: descFill
  })
  ins.bindRef('contentBg', contextBgEl)

  // 内容文字
  let contentTextEl = global.createSVGElement('text', ins, {
    x: padding,
    y: descFontSize + 4,
    width: width - padding * 4 - iconWidth,
    height: descFontSize + 4,
    fontSize: descFontSize || fontSize,
    fontFamily: fontFamily
  })
  ins.bindRef('contentText', contentTextEl)

  // 描述文字
  let titleEl = global.createSVGElement('text', ins, {
    x: padding * 2 + iconWidth,
    y: headerFontSize + 4.5,
    width: width - padding * 3 - iconWidth,
    height: headerFontSize + 4,
    fontSize: descFontSize || fontSize,
    fontFamily: fontFamily,
    fill: headerColor
  })
  ins.bindRef('title', titleEl)

  // 创建图标控件
  let contentMoreIconEl = global.createSVGElement('image', ins, {
    x: width - padding * 2.5 - iconWidth,
    y: (descHeight - iconHeight) / 2,
    width: iconWidth,
    height: iconHeight,
    'xlink:href': RDSetting.ICOS['icon-right']
  })
  ins.bindRef('contentMoreIcon', contentMoreIconEl)

  // 头部, 使用path绘制可以实现不同角不同的弧度
  let headerEl = global.createSVGElement('path', ins, {
    d: `M 0 0 l ${
      width - radius
    } 0 a ${radius} ${radius} 0 0,1 ${radius} ${radius} l 0 ${
      headerHeight - radius
    } l ${-width} 0 l 0 ${
      -descHeight + radius
    } a ${radius} ${radius} 0 0,1 ${radius} ${-radius} Z`,
    fill: headerFill
  })
  ins.bindRef('header', headerEl)

  contentEl.appendChild(contextBgEl)
  contentEl.appendChild(contentTextEl)
  contentEl.appendChild(contentMoreIconEl)

  ins.$el.appendChild(bgEl)
  ins.$el.appendChild(headerEl)
  ins.$el.appendChild(ins.$refs.borderTop)
  ins.$el.appendChild(ins.$refs.borderRight)
  ins.$el.appendChild(ins.$refs.borderBottom)
  ins.$el.appendChild(ins.$refs.borderLeft)
  ins.$el.appendChild(iconEl)
  ins.$el.appendChild(debuggerEl)
  ins.$el.appendChild(contentEl)
  ins.$el.appendChild(titleEl)

  // 让文本不能被选中
  contentTextEl.style.userSelect = 'none'
  contentTextEl.style.pointerEvents = 'none'
  titleEl.style.userSelect = 'none'
  titleEl.style.pointerEvents = 'none'

  return []
}

export function updateRectShapeByStyle(ins, shapes) {
  // 位置改变
  ins.$el.setAttribute('x', ins.x)
  ins.$el.setAttribute('y', ins.y)
  // 固定大小，避免图形变形
  ins.$el.setAttribute('width', ins.width)
  ins.$el.setAttribute('height', ins.height)
  // 处理边框
  ins.updateBorders()
  // 处理填充
  ins.updateFillRect()
  // 更新文本，计算缩略文本
  let width = ins.width
  let padding = ins.padding || RectShapeConfig.padding
  let iconWidth = ins.iconWidth || RectShapeConfig.iconWidth
  let fontSize =
    ins.descFontSize || ins.fontSize || RectShapeConfig.descFontSize
  let fontFamily = ins.fontFamily || RectShapeConfig.fontFamily
  // 更新文本
  ins.$refs.contentText.innerHTML = getEllipsisText(
    ins.getText(),
    width - padding - iconWidth,
    { fontSize, fontFamily: fontFamily }
  )
  let titleWidth =
    width - padding * 3 - iconWidth - (ins.debugger ? iconWidth : 0)
  let titleX = padding * 2 + iconWidth + (ins.debugger ? iconWidth : 0)
  // 更新描述文本
  ins.$refs.title.innerHTML = getEllipsisText(ins.getTitle(), titleWidth, {
    fontSize,
    fontFamily: fontFamily
  })
  ins.$refs.title.setAttribute('x', titleX)
  // 是否显示断点
  if (ins.debugger) {
    ins.$refs.debugger.show()
    if (ins.getOption('debuggerCondition')) {
      ins.$refs.debugger.showDebuggerConditionIcon()
    } else {
      ins.$refs.debugger.hideDebuggerConditionIcon()
    }
  } else {
    ins.$refs.debugger.hide()
  }
  // 处理图标更新
  ins.$refs.icon.setAttribute(
    'href',
    RDSetting.ICOS[ins.getStatusOption('icon')]
  )
  // 选中状态处理
  ins.$refs.header.setAttribute('fill', ins.getStatusOption('headerFill'))
  // 图片文字颜色
  ins.$refs.title.setAttribute('fill', ins.getStatusOption('headerColor'))
  // 如果没有编辑权限，文字颜色置灰
  if (!ins.checkPermission(RULE_PERMISSION_ENUM.MODIFY)) {
    ins.$refs.title.setAttribute('fill', '#afafaf')
    ins.$refs.contentText.setAttribute('fill', '#afafaf')
  } else {
    ins.$refs.contentText.setAttribute('fill', '')
    ins.$refs.title.setAttribute('fill', ins.getStatusOption('headerColor'))
  }
}

/**
 * 构建矩形
 * 参数结构
 * {
 *   font: "{}",
 *   border: "{}",
 *   fill: "{}"
 * }
 */
export function buildTextRectShape(ins, props) {
  const {
    id,
    x,
    y,
    height,
    width,
    radius,
    iconWidth,
    iconHeight,
    padding,
    color,
    fontSize,
    fontFamily
  } = ins.getOptions()

  // 返回一组图形, 调用不方便，弃用
  let shapes = []

  // 第一个元素为svg，包括后续所有子元素
  ins.$el = global.createSVGElement('svg', ins, {
    x: x,
    y: y,
    mid: id,
    id: 'shape_' + id
  })

  // 填充文本，文本编辑，纯文本时使用
  let titleEl = global.createSVGElement('text', ins, {
    x: ins.width / 2,
    y: ins.height / 2 + fontSize / 2 - 2,
    fontSize: fontSize,
    fontFamily: fontFamily,
    fill: color,
    align: 'center',
    'text-anchor': 'middle',
    style: 'user-select: none; pointer-events: none;',
    mid: ins.id
  })
  ins.bindRef('title', titleEl)

  // 矩形四个点的位置
  const points = [0, 0, width, 0, width, height, 0, height]
  // 创建边线
  let lines = buildPolygonSideLine(ins, points, RectSideLineSeq)
  RectSideLineSeq.forEach((lineName, index) => {
    ins.bindRef('border' + upperFirst(lineName), lines[index])
  })

  let debuggerEl = global.createSVGElement('svg', ins, {
    x: padding,
    y: 0
  })

  let debuggerIcon = global.createSVGElement('circle', ins, {
    cx: iconWidth / 2,
    cy: height / 2,
    r: iconHeight / 2 - 2,
    stroke: '#ffffff',
    strokeWidth: '1',
    fill: '#c75450'
  })
  let debuggerConditionIcon = global.createSVGElement('circle', ins, {
    cx: iconWidth / 2,
    cy: height / 2,
    r: 2,
    fill: '#ffffff'
  })
  debuggerEl.appendChild(debuggerIcon)
  debuggerEl.appendChild(debuggerConditionIcon)
  debuggerConditionIcon.hide()

  ins.bindRef('debugger', debuggerEl)
  debuggerEl.hide()
  debuggerEl.showDebuggerConditionIcon = function () {
    debuggerConditionIcon.show()
  }
  debuggerEl.hideDebuggerConditionIcon = function () {
    debuggerConditionIcon.hide()
  }

  // 创建填充矩形
  let bgEl = global.createSVGElement('rect', ins, {
    x: 0,
    y: 0,
    rx: radius,
    ry: radius,
    width: width,
    height: height,
    fill: ins.getOption('fill')
  })
  ins.bindRef('bg', bgEl)

  ins.$el.appendChild(bgEl)
  ins.$el.appendChild(ins.$refs.borderTop)
  ins.$el.appendChild(ins.$refs.borderRight)
  ins.$el.appendChild(ins.$refs.borderBottom)
  ins.$el.appendChild(ins.$refs.borderLeft)
  ins.$el.appendChild(debuggerEl)
  ins.$el.appendChild(titleEl)

  // 让文本不能被选中
  titleEl.style.userSelect = 'none'
  titleEl.style.pointerEvents = 'none'

  return shapes
}

export function updateTextRectShapeByStyle(ins, shapes) {
  let { x, y, width, height, iconWidth, padding, fontSize, fontFamily } =
    ins.getOptions()
  // 位置改变
  ins.$el.setAttribute('x', x)
  ins.$el.setAttribute('y', y)
  // 固定大小，避免图形变形
  ins.$el.setAttribute('width', width)
  ins.$el.setAttribute('height', height)
  // 处理边框
  ins.updateBorders()
  // 处理填充
  ins.updateFillRect()
  // 更新文本，计算缩略文本
  let titleWidth =
    width - padding * 2 - (ins.debugger ? iconWidth + padding : 0)
  ins.$refs.title.innerHTML = getEllipsisText(ins.getTitle(), titleWidth, {
    fontSize,
    fontFamily: fontFamily
  })
  // 更新标题样式
  ins.$refs.title.setAttribute('fill', ins.getStatusOption('color'))
  ins.$refs.title.setAttribute('fontFamily', ins.getStatusOption('fontFamily'))
  ins.$refs.title.setAttribute('fontSize', ins.getStatusOption('fontSize'))
  // 是否显示断点
  if (ins.debugger) {
    ins.$refs.debugger.show()
    if (ins.getOption('debuggerCondition')) {
      ins.$refs.debugger.showDebuggerConditionIcon()
    } else {
      ins.$refs.debugger.hideDebuggerConditionIcon()
    }
  } else {
    ins.$refs.debugger.hide()
  }
  // 如果没有编辑权限，文字颜色置灰
  if (!ins.checkPermission(RULE_PERMISSION_ENUM.MODIFY)) {
    ins.$refs.title.setAttribute('fill', '#afafaf')
  } else {
    ins.$refs.title.setAttribute('fill', ins.getStatusOption('color'))
  }
}

/**
 * 构建菱形
 * 参数结构
 * {
 *   font: "{}",
 *   border: "{}",
 *   fill: "{}"
 * }
 */
export function buildDiamondShape(ins, props) {
  const {
    id,
    x,
    y,
    height,
    width,
    padding,
    color,
    fill,
    fontSize,
    fontFamily,
    iconWidth,
    iconHeight
  } = ins.getOptions()

  // 取得字体，边框，填充的配置信息
  let borderInfo = safeJsonParse(props.border)

  // 返回一组图形
  let shapes = []

  // 第一个元素为svg，包括后续所有子元素
  ins.$el = global.createSVGElement('svg', ins, {
    x: x,
    y: y,
    mid: id,
    id: 'shape_' + id
  })

  // 菱形四个点的位置 左-上-右-下
  const points = [
    0,
    height / 2,
    width / 2,
    0,
    width,
    height / 2,
    width / 2,
    height
  ]
  // 创建边线 跟矩形使用相同的边顺序
  let lines = buildPolygonSideLine(ins, points, RectSideLineSeq, borderInfo)
  RectSideLineSeq.forEach((lineName, index) => {
    ins.bindRef('border' + upperFirst(lineName), lines[index])
  })

  // 创建填充菱形
  let bgEl = global.createSVGElement('polygon', ins, {
    points: toPointStr(points),
    fill: fill
  })
  ins.bindRef('bg', bgEl)

  // 创建图标控件
  let iconEl = global.createSVGElement('image', ins, {
    x: width / 2 - iconWidth / 2,
    y: height / 2 - padding / 2 - iconHeight,
    width: iconWidth,
    height: iconHeight
  })
  ins.bindRef('icon', iconEl)

  // 内容文字
  let titleEl = global.createSVGElement('text', ins, {
    x: width / 2,
    y: height / 2 + padding,
    width: width / 2,
    height: height / 4,
    fontSize: fontSize,
    fontFamily: fontFamily,
    fill: color,
    style: 'dominant-baseline:middle;text-anchor:middle;'
  })
  ins.bindRef('title', titleEl)

  let debuggerEl = global.createSVGElement('svg', ins, {
    x: width / 2 + padding / 2,
    y: height / 2 - padding / 2 - iconHeight
  })

  let debuggerIcon = global.createSVGElement('circle', ins, {
    cx: iconWidth / 2,
    cy: iconHeight / 2,
    r: iconHeight / 2 - 2,
    stroke: '#ffffff',
    strokeWidth: '1',
    fill: '#c75450'
  })
  let debuggerConditionIcon = global.createSVGElement('circle', ins, {
    cx: iconWidth / 2,
    cy: iconHeight / 2,
    r: 2,
    fill: '#ffffff'
  })
  debuggerEl.appendChild(debuggerIcon)
  debuggerEl.appendChild(debuggerConditionIcon)
  debuggerConditionIcon.hide()

  ins.bindRef('debugger', debuggerEl)
  debuggerEl.hide()
  debuggerEl.showDebuggerConditionIcon = function () {
    debuggerConditionIcon.show()
  }
  debuggerEl.hideDebuggerConditionIcon = function () {
    debuggerConditionIcon.hide()
  }

  ins.$el.appendChild(bgEl)
  ins.$el.appendChild(ins.$refs.borderTop)
  ins.$el.appendChild(ins.$refs.borderRight)
  ins.$el.appendChild(ins.$refs.borderBottom)
  ins.$el.appendChild(ins.$refs.borderLeft)
  ins.$el.appendChild(iconEl)
  ins.$el.appendChild(debuggerEl)
  ins.$el.appendChild(titleEl)
  // 让文本不能被选中
  titleEl.style.userSelect = 'none'
  titleEl.style.pointerEvents = 'none'
  return shapes
}

export function updateDiamondShapeByStyle(ins, shapes) {
  let { x, y, width, height, iconWidth, padding, fontSize, fontFamily } =
    ins.getOptions()
  // 位置改变
  ins.$el.setAttribute('x', x)
  ins.$el.setAttribute('y', y)
  // 固定大小，避免图形变形
  ins.$el.setAttribute('width', width)
  ins.$el.setAttribute('height', height)
  // 取得字体，边框，填充的配置信息
  let lineShaps = [
    ins.$refs.borderTop,
    ins.$refs.borderRight,
    ins.$refs.borderBottom,
    ins.$refs.borderLeft
  ]
  lineShaps.forEach((item, index) =>
    setLineEleAttrs(item, ins.getBorderOption(RectSideLineSeq[index]))
  )
  // 处理边框
  ins.updateBorders()
  // 处理填充
  ins.updateFillRect()
  // 更新文本，计算缩略文本
  ins.$refs.title.innerHTML = getEllipsisText(
    ins.getTitle(),
    width - padding * 2,
    { fontSize, fontFamily: fontFamily }
  )
  // 处理图标更新
  ins.$refs.icon.setAttribute(
    'href',
    RDSetting.ICOS[ins.getStatusOption('icon')]
  )
  // 是否显示断点
  if (ins.debugger) {
    ins.$refs.icon.setAttribute('x', width / 2 - iconWidth / 2 - padding)
    ins.$refs.debugger.show()
    if (ins.getOption('debuggerCondition')) {
      ins.$refs.debugger.showDebuggerConditionIcon()
    } else {
      ins.$refs.debugger.hideDebuggerConditionIcon()
    }
  } else {
    ins.$refs.icon.setAttribute('x', width / 2 - iconWidth / 2)
    ins.$refs.debugger.hide()
  }
  // 如果没有编辑权限，文字颜色置灰
  if (!ins.checkPermission(RULE_PERMISSION_ENUM.MODIFY)) {
    ins.$refs.title.setAttribute('fill', '#afafaf')
  } else {
    ins.$refs.title.setAttribute('fill', ins.getStatusOption('color'))
  }
}

/**
 * 计算多边形边线的位置
 * @param {*} points 多边形的点位置
 * @param {*} lineSeq 多边形的边的顺序
 * @returns 位置定位
 */
export const calcPolygonSidePositions = function (
  points,
  lineSeq,
  lineCompareTypes = RectSideCompareTypes
) {
  return lineSeq.map((item, index) => {
    let currentPointIndex = index * 2
    let nextPointIndex = (index + 1) * 2
    // 最后一条边的下一个点在最前面
    if (index === lineSeq.length - 1) {
      nextPointIndex = 0
    }
    let point1 = {
      x: points[currentPointIndex],
      y: points[currentPointIndex + 1]
    }
    let point2 = {
      x: points[nextPointIndex],
      y: points[nextPointIndex + 1]
    }
    // 根据大小交换点位置，x小的在前，一样则y小在前
    let temp
    if (point1.x > point2.x || point1.y > point2.y) {
      temp = point1
      point1 = point2
      point2 = temp
    }
    return {
      type: item,
      compareType: lineCompareTypes[item],
      x1: point1.x,
      y1: point1.y,
      x2: point2.x,
      y2: point2.y
    }
  })
}

/**
 * 设置边线的属性
 * @param {*} config 边线配置
 * @param {*} props 属性
 * @returns
 */
const setLineProps = function (config, props) {
  if (!config || !props) {
    return
  }
  config['stroke'] = props['color'] || props['stroke'] || ''
  config['stroke-width'] = props['width'] || props['size'] || ''
  config['stroke-dasharray'] =
    props['dash'] ||
    (props['type'] && BorderTypeDashArrayMap[props['type']]) ||
    ''
}

const setLineEleAttrs = function (ele, props) {
  if (!ele || !props) {
    return
  }
  let key, propName
  for (key in RectSideLinePropMap) {
    propName = RectSideLinePropMap[key]
    if (propName in props) {
      ele.setAttributeNS(null, key, props[propName])
    }
  }
}

/**
 * 创建多边形的边
 * @param {*} ins 创建图形的实例
 * @param {*} points 多边形点的坐标
 * @param {*} lineSeq 边的顺序
 * @returns
 */
export function buildPolygonSideLine(ins, points, lineSeq) {
  let lineConfigs = calcPolygonSidePositions(points, lineSeq)
  // 设置线段配置
  lineConfigs.forEach((item, index) =>
    setLineProps(item, ins.getBorderOption([lineSeq[index]]))
  )
  // 返回线段图形
  return lineConfigs.map((item) => global.createSVGElement('line', ins, item))
}

/**
 * 缩放图形
 * @param {*} shape 图形
 * @param {*} scale 比例
 */
export function scale(shape, scale) {}

const betweenNumbers = function (p, [a, b]) {
  let t
  if (a > b) {
    t = b
    b = a
    a = t
  }
  return p >= a && p <= b
}

const findNearLine = function (p, lines, height) {
  return lines.filter((item) => {
    // 判断点到边的距离是否小于sideSize/2
    // 必须在线中间, 离边线的高要小于指定的高
    return (
      betweenNumbers(p.x, [item.x1 - height, item.x2 + height]) &&
      betweenNumbers(p.y, [item.y1 - height, item.y2 + height]) &&
      calcTriangleHeight(
        p,
        { x: item.x1, y: item.y1 },
        { x: item.x2, y: item.y2 }
      ) <= height
    )
  })
}

/**
 * 获取鼠标在图形中的方位，必须要靠近图形，
 *
 * @param {*} position
 * @param {*} shape
 * @param {*} halfSideSize 线段大小的一半
 */
export function getShapeSide(
  position,
  shape,
  halfSideSize = 5,
  multipleLine = false,
  points
) {
  const { x, y, width, height } = shape
  // x, y距离
  let rxd = Math.abs(position.x - x)
  let ryd = Math.abs(position.y - y)
  // 计算边位置，可以自己传入位置， 默认按照矩形计算
  points = points || [0, 0, width, 0, width, height, 0, height]
  let lineConfigs = calcPolygonSidePositions(points, RectSideLineSeq)
  // 判断在哪一条边
  let lines = lineConfigs.filter((item) => {
    // 判断点到边的距离是否小于sideSize/2
    return (
      calcTriangleHeight(
        { x: rxd, y: ryd },
        { x: item.x1, y: item.y1 },
        { x: item.x2, y: item.y2 }
      ) < halfSideSize
    )
  })
  // 不在边上
  if (lines.length === 0) {
    return { type: 'none' }
  }
  if (lines.length === 1 || !multipleLine) {
    return {
      type: lines[0].type,
      lines: [lines[0]],
      // 判断位置线的左边还是右边
      offsetType: calcTriangleOffsetType(
        { x: rxd, y: ryd },
        { x: lines[0].x1, y: lines[0].y1 },
        { x: lines[0].x2, y: lines[0].y2 }
      )
    }
  }
  // 在多条边上
  return {
    type: lines.map((item) => item.type).join('-'),
    lines: lines,
    // 判断位置线的左边还是右边
    offsetType: 'multiple'
  }
}

export function getPathSide(
  position,
  points,
  halfSideSize = 3,
  multipleLine = false
) {
  let lineSeq = []
  // 计算有多少边
  let lineCount = points.length / 2
  for (let i = 0; i < lineCount; i++) {
    lineSeq.push('line' + i)
  }
  let lineConfigs = calcPolygonSidePositions(points, lineSeq)
  // 判断在哪一条边
  let lines = findNearLine(position, lineConfigs, halfSideSize)
  // 不在边上
  if (lines.length === 0) {
    return { type: 'none' }
  }
  if (lines.length === 1 || !multipleLine) {
    return {
      type: lines[0].type,
      lines: [lines[0]],
      // 判断位置线的左边还是右边
      offsetType: calcTriangleOffsetType(
        position,
        { x: lines[0].x1, y: lines[0].y1 },
        { x: lines[0].x2, y: lines[0].y2 }
      )
    }
  }
  // 在多条边上
  return {
    type: lines.map((item) => item.type).join('-'),
    lines: lines,
    // 判断位置线的左边还是右边
    offsetType: 'multiple'
  }
}

export function getShapePosition(shape, containerEl, event) {
  if (!containerEl) {
    containerEl = {
      scrollLeft: 0,
      scrollTop: 0
    }
  }
  return {
    x: shape.x - (event.layerX + containerEl.scrollLeft),
    y: shape.y - (event.layerY + containerEl.scrollTop)
  }
}

/**
 * 获取一组图形的宽高
 * @param shapes
 */
export function getShapesPosition(...shapes) {
  shapes = shapes.filter((item) => !!item)
  if (!shapes.length) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  let x = Infinity
  let y = Infinity
  let width = 0
  let height = 0
  shapes.forEach((item) => {
    x = Math.min(+item.x, x)
    y = Math.min(+item.y, y)
  })
  shapes.forEach((item) => {
    width = Math.max(Math.floor(+item.x + +item.width - x), width)
    height = Math.max(Math.floor(+item.y + +item.height - y), height)
  })
  return { x, y, width, height, x1: x + width, y1: y + height }
}

/**
 * 计算是否在图形范围内
 * @param {*} position 坐标
 * @param {*} shape 图形参数
 * @param {*} points 图形顶点坐标
 * @param {*} lineSeq 边序列
 * @param {*} lineCompareTypes 边比较类型
 * @returns true/false
 */
export function inPolygonShape(
  position,
  shape,
  points,
  lineSeq = RectSideLineSeq,
  lineCompareTypes = RectSideCompareTypes
) {
  const { x, y, width, height } = shape
  // 计算边位置，可以自己传入位置， 默认按照矩形计算
  points = points || [x, y, x + width, y, x + width, y + height, x, y + height]
  let lineConfigs = calcPolygonSidePositions(points, lineSeq, lineCompareTypes)
  return inPolygon(position, lineConfigs)
}

/**
 * 计算是否在图形范围内
 * @param {*} position 坐标
 * @param {*} shape 图形参数
 * @param {*} points 图形顶点坐标
 * @param {*} lineSeq 边序列
 * @param {*} lineCompareTypes 边比较类型
 * @returns true/false
 */
export function inDiamondShape(
  position,
  shape,
  points,
  lineSeq = RectSideLineSeq,
  lineCompareTypes = RectSideCompareTypes
) {
  const { x, y, width, height } = shape
  points = points || [
    x,
    y + height / 2,
    x + width / 2,
    y,
    x + width,
    y + height / 2,
    x + width / 2,
    y + height
  ]
  return inPolygonShape(position, shape, points, lineSeq, lineCompareTypes)
}
