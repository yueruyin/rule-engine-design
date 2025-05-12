// ========================================================
// 与连线相关的方法
// @author wangyb
// @createTime 2023-04-25 15:49:54
// ========================================================

import RDSetting from '../../ruledesigner_setting'
import RDLine from '../ruleline'
import { defineUnenumerableProperty } from './common'

const FIELD_TEMP_LINE = '__temp_line__'

const LINE_POINT_STRUCTURE = {
  model: null, // 连接对象
  side: {} // 连接的边 type 矩形 top/right/bottom/left, offsetType 顶点在边的位置 left/right
}

const LINE_OPACITY = {
  TEMP: 0.4,
  NORMAL: 1
}

// 获取全局对象
const global = window

/**
 * 判断是否允许连线
 * @param {*} model 当前对象
 * @param {*} lineModel 已有的连线对象
 * @param {*} canvas 画布
 * @param {*} mouseEvent 鼠标事件
 * @returns 是否允许 true/false
 */
export function checkLineLink (model, lineModel, canvas, mouseEvent) {
  let flag = false
  if (canvas.underLinePoint == 'start') {
    flag = checkShapeLink(model, lineModel.endLinkGroup.model, lineModel, canvas, mouseEvent)
  } else if (canvas.underLinePoint == 'end') {
    flag = checkShapeLink(lineModel.startLinkGroup.model, model, lineModel, canvas, mouseEvent)
  }
  return flag
}

/**
 * 判断两个图形是否允许连接
 * @param {*} startModel 开始节点
 * @param {*} endModel 目标节点
 * @param {*} lineModel 已有的连线
 * @param {*} canvas 画布
 * @param {*} mouseEvent 事件
 * @returns 是否允许 true/false
 */
export function checkShapeLink (startModel, endModel, lineModel = null, canvas, mouseEvent) {
  let flag = false
  if (RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR) {
    let validator = global[RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR]
    try {
      flag = validator(startModel, endModel, lineModel, canvas, mouseEvent)
    } catch (e) {
      console.error(e)
    }
  }
  return flag
}

export function isTempLine (lineModel) {
  return lineModel && lineModel[FIELD_TEMP_LINE]
}

export function createTempLinkLine (canvas, startPoint, endPoint, options) {
  return createLinkLine(
    canvas, startPoint, endPoint,
    Object.assign({}, options, { [FIELD_TEMP_LINE]: true, lineOpacity: LINE_OPACITY.TEMP })
  )
}

export function tempLineToNormalLine (tempLineModel) {
  delete tempLineModel[FIELD_TEMP_LINE]
  tempLineModel.lineOpacity = LINE_OPACITY.NORMAL
  tempLineModel.attrs['lineOpacity'] = LINE_OPACITY.NORMAL
  return tempLineModel
}

export function normalLineToTempLine (tempLineModel) {
  delete tempLineModel[FIELD_TEMP_LINE]
  tempLineModel.lineOpacity = LINE_OPACITY.TEMP
  tempLineModel.attrs['lineOpacity'] = LINE_OPACITY.TEMP
  return tempLineModel
}

export function createLinkLine (canvas, startPoint, endPoint, options) {
  // 获取画布序列号
  let curIndex = canvas.curIndex
  canvas.curIndex++
  let lineModel = new RDLine(canvas, Object.assign({
    id: 'rd_line_' + curIndex,
    code: 'rd_line_' + curIndex,
    lineType: '2',
    start: { x: 0, y: 0, width: 4, height: 4 },
    end: { x: 0, y: 0, width: 4, height: 4 },
    controlType: '4000001'
  }, options))
  if (options[FIELD_TEMP_LINE]) {
    defineUnenumerableProperty(lineModel, FIELD_TEMP_LINE, true)
  }
  // 设置线的透明度
  if ('lineOpacity' in options) {
    let lineOpacity = options['lineOpacity'] === undefined || options['lineOpacity'] === null ? 1 : options['lineOpacity']
    lineModel.lineOpacity = lineOpacity
    lineModel.attrs['lineOpacity'] = lineOpacity
  }
  setLineLinkGroup(canvas, lineModel, startPoint, endPoint)
  return lineModel
}

/**
 * 创建普通的线
 * @param {*} container 辅助线容器
 * @param {*} props 辅助线参数
 * @returns 辅助线
 */
export const createLine = function (container, {
  x1 = 0,
  y1 = 0,
  x2 = 0,
  y2 = 0,
  stroke,
  opacity,
  strokeWidth = 0.6,
  strokeDasharray = [0, 1, 1]
}) {
  return global.createSVGElement('line', container, {
    x1,
    y1,
    x2,
    y2,
    stroke,
    opacity,
    'stroke-width': strokeWidth,
    'stroke-dasharray': strokeDasharray
  })
}

export function setLineLinkGroup (canvas, lineModel, startPoint, endPoint) {
  // 创建或者合并线段组
  setLineStartLinkGroup(canvas, lineModel, startPoint)
  setLineEndLinkGroup(canvas, lineModel, endPoint)
}

export function setLineStartLinkGroup (canvas, lineModel, point) {
  let linkGroup = mergeOrCreateLinkGroup(canvas, lineModel, point)
  defineUnenumerableProperty(lineModel, 'startLinkGroup', linkGroup)
  canvas.linkGroups[linkGroup.model.id + '_' + linkGroup.type] = linkGroup
}

export function setLineEndLinkGroup (canvas, lineModel, point) {
  let linkGroup = mergeOrCreateLinkGroup(canvas, lineModel, point)
  defineUnenumerableProperty(lineModel, 'endLinkGroup', linkGroup)
  canvas.linkGroups[linkGroup.model.id + '_' + linkGroup.type] = linkGroup
}

export function mergeOrCreateLinkGroup (canvas, lineModel, point) {
  let groupKey = point.model.id + '_' + point.side.type
  if (canvas.linkGroups[groupKey]) {
    let lineIndex = point.lineIndex
    if (lineIndex === undefined) {
      lineIndex = point.side.offsetType === 'left' ? 0 : canvas.linkGroups[groupKey].lines.length
    }
    mergeLinkGroup(canvas.linkGroups[groupKey], lineModel, lineIndex)
    return canvas.linkGroups[groupKey]
  }
  return createLinkGroup(lineModel, point)
}

export function createLinkGroup (lineModel, point) {
  let linkGroup = { 'type': point.side.type, 'collect': 0 }
  // 不允许序列化，避免循环序列化导致浏览器崩溃
  defineUnenumerableProperty(linkGroup, 'id', point.model.id + '_' + point.side.type)
  defineUnenumerableProperty(linkGroup, 'model', point.model)
  defineUnenumerableProperty(linkGroup, 'lines', [lineModel])
  return linkGroup
}

export function mergeLinkGroup (linkGroup, lineModel, lineIndex = 0) {
  linkGroup.lines.splice(lineIndex, 0, lineModel)
}
