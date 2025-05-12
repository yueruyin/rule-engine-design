// ========================================================
// 允许连线的模型
// @author wangyb
// @createTime 2023-05-08 15:32:47
// ========================================================

import { defineUnenumerableProperty } from '../modules/common'
// import { addLine } from '../modules/canvas'
import {
  checkShapeLink,
  createLinkLine,
  createTempLinkLine
} from '../modules/line'
import { RectSideLineSeq } from '../constants/shape'
import { getShapeSide } from '../modules/shape'
import SvgModel from './SvgModel'
import { RULE_PERMISSION_ENUM } from '../../../config/permission'

const LinkableModel = function (props) {
  // 采用矩形的边作为连线边，后续如果有不同的需求，再由子类去替换
  defineUnenumerableProperty(this, '__link_side_seq__', RectSideLineSeq)
  // 不允许编辑时，不允许连线
  defineUnenumerableProperty(this, '__linkable__', true)
  // 连线控制，比如最大连接数，上级节点类型，下级节点类型等
}

LinkableModel.prototype.isLinkable = function () {
  return this.__linkable__
}

LinkableModel.prototype.getLinkSideSeq = function () {
  return this.__link_side_seq__
}

LinkableModel.prototype.linkValidate = function (distModel, line, event) {
  if (line instanceof Event) {
    event = line
    line = null
  }
  // 默认的校验结果
  let flag =
    distModel &&
    distModel !== this &&
    distModel.isLinkable &&
    distModel.isLinkable()
  // 连线需要编辑权限
  // && this.checkPermission(RULE_PERMISSION_ENUM.MODIFY)

  // 全局注入的校验逻辑
  return flag && checkShapeLink(this, distModel, line, this.getCanvas(), event)
}

LinkableModel.prototype.getLinkedModes = function () {
  // 如果没有开始
  // return 'start' || 'end'
  return {
    start: [],
    end: []
  }
}

LinkableModel.prototype.showLineBarByPosition = function (mousePosition, mode) {
  let side = getShapeSide(mousePosition, this)
  if (side.type !== 'none') {
    this.showLineBar(side, mode)
  } else {
    this.hideLineBar(mode)
  }
}

LinkableModel.prototype.showLineBar = function (side, mode) {
  // 不允许连线时，不显示lineBar
  if (
    !this.__linkable__
    // || !this.checkPermission(RULE_PERMISSION_ENUM.MODIFY)
  ) {
    return
  }
  switch (mode) {
    case 'start':
      this.showStartLineBar(side)
      break
    case 'end':
      this.showEndLineBar(side)
      break
  }
}

LinkableModel.prototype.showStartLineBar = function (side) {
  const canvas = this.getCanvas()
  // 如果当前已经有lineBar了，则需要移除原有的lineBar
  if (!this.isLineBarSideChange(side)) {
    return
  }
  if (this.getLineBar()) {
    this.hideStartLineBar()
  }
  canvas.removeTempLine()
  canvas.showStartLineBar(this, side.type)
  canvas.startLineBar.side = side
  canvas.startLineBar.bindMainModel(this)
  this.setLineBar(canvas.startLineBar)
}

LinkableModel.prototype.showEndLineBar = function (side) {
  const canvas = this.getCanvas()
  // 如果当前已经有lineBar了，则需要移除原有的lineBar
  if (!this.isLineBarSideChange(side)) {
    return
  }
  if (this.getLineBar()) {
    this.hideEndLineBar()
  }
  canvas.removeTempLine()
  canvas.showEndLineBar(this, side.type)
  canvas.endLineBar.side = side
  canvas.endLineBar.bindMainModel(this)
  this.setLineBar(canvas.endLineBar)
}

LinkableModel.prototype.hideLineBar = function (mode) {
  switch (mode) {
    case 'start':
      this.hideStartLineBar()
      break
    case 'end':
      this.hideEndLineBar()
      break
  }
}

LinkableModel.prototype.hideStartLineBar = function () {
  this.getCanvas().hideStartLineBar()
}

LinkableModel.prototype.hideEndLineBar = function () {
  this.getCanvas().hideEndLineBar()
}

LinkableModel.prototype.linkModel = function (
  distModel,
  isTempLine,
  lineIndex
) {
  const canvas = this.getCanvas()
  let createFunc = createLinkLine
  if (isTempLine) {
    createFunc = createTempLinkLine
  }
  let line = createFunc(
    canvas,
    {
      model: this,
      side: this.getLineBarSide(),
      lineIndex
    },
    {
      model: distModel,
      side: distModel.getLineBarSide(),
      lineIndex
    }
  )
  // 将连线加入到画布
  canvas.addModel(line, false)
  return line
}

LinkableModel.prototype.getLine = function (distModel) {
  // 获取当前model与目标model的连线
  return this.getLines.filter(
    (line) =>
      line.startLinkGroup.model === distModel ||
      line.endLinkGroup.model === distModel
  )
}

LinkableModel.prototype.getLines = function (lineType) {
  // 获取所有的连线
  const directTypes = this.getLinkSideSeq() || []
  const allLines = []
  const canvas = this.getCanvas()
  directTypes.forEach((type) => {
    let linkGroupKey = this.id + '_' + type
    let linkGroup = canvas.linkGroups[linkGroupKey]
    let lines = (linkGroup && linkGroup['lines']) || []
    lines.forEach((line) => {
      if (
        // 所有的线
        !lineType ||
        // 作为开始节点的线
        (lineType === 'start' && line.startLinkGroup.model === this) ||
        // 作为结束节点的线
        (lineType === 'end' && line.endLinkGroup.model === this)
      ) {
        allLines.push(line)
      }
    })
  })
  return allLines
}

LinkableModel.prototype.getLineBar = function () {
  return this.__line_bar__
}

LinkableModel.prototype.getLineBarSide = function () {
  let lineBar = this.getLineBar()
  return lineBar && lineBar.side
}

LinkableModel.prototype.isLineBarSideChange = function (currentSide) {
  let oldSide = this.getLineBarSide()
  return (
    !oldSide ||
    oldSide.type !== currentSide.type ||
    oldSide.offsetType !== currentSide.offsetType
  )
}

LinkableModel.prototype.setLineBar = function (lineBar) {
  defineUnenumerableProperty(this, '__line_bar__', lineBar)
}

LinkableModel.prototype.clearLineBar = function () {
  delete this.__line_bar__
}

LinkableModel.prototype.render = function () {
  SvgModel.prototype.render.call(this)
  this.updateLinkLines()
}

LinkableModel.prototype.renderDelay = function () {
  SvgModel.prototype.renderDelay.call(this)
  this.updateLinkLines()
}

LinkableModel.prototype.updateLinkLines = function () {
  // 找到四个方向相关联的线并更新
  const directTypes = this.getLinkSideSeq() || []
  const canvas = this.getCanvas()
  directTypes.forEach((type) => {
    let linkGroupKey = this.id + '_' + type
    let linkGroup = canvas.linkGroups[linkGroupKey]
    let lines = (linkGroup && linkGroup['lines']) || []
    lines.forEach((line) => {
      line.renderDelay()
    })
  })
}

LinkableModel.prototype.findParent = function (parentId) {
  let parents = [this]
  while (parents.length) {
    let current = parents.shift()
    let lines = current.getLines && current.getLines('end')
    let parent
    if (
      lines &&
      lines.some((item) => {
        parent = item.startLinkGroup.model
        if (item.startLinkGroup.model.id === parentId) {
          return true
        }
        parents.push(parent)
        return false
      })
    ) {
      return parent
    }
  }
}

/**
 * 连线对象的删除逻辑
 */
LinkableModel.prototype.remove = function () {
  // 删除
  SvgModel.prototype.remove.call(this)
  // 找到四个方向相关联的线并更新
  const directTypes = this.getLinkSideSeq() || []
  const delLines = []
  const canvas = this.getCanvas()
  directTypes.forEach((type) => {
    let linkGroupKey = this.id + '_' + type
    let linkGroup = canvas.linkGroups[linkGroupKey]
    let lines = (linkGroup && linkGroup['lines']) || []
    lines.forEach((line) => {
      // 删除相同的
      delLines.remove(line)
      delLines.push(line)
    })
    delete canvas.linkGroups[linkGroupKey]
  })
  // 删除线不需要通知
  canvas.removeModel(delLines)
}

export default LinkableModel
