// ========================================================
// 服务线相关的方法
// @author wangyb
// @createTime 2023-04-27 16:14:01
// ========================================================

import RDSetting from '../../ruledesigner_setting'
import { getActivities } from './canvas'
import { getDragOffset } from './drag'
import { getShapesPosition } from './shape'

/**
 * 计算当前位置自动对齐网格线的坐标
 * @param {*} position 当前位置
 * @param {*} meshSize 网格线大小
 */
export function autoAlign (position, meshSize = 10) {
  var mod = position.x % meshSize
  if (mod > meshSize / 2) {
    position.x = position.x + (meshSize - mod)
  } else {
    position.x = position.x - mod
  }
  mod = position.y % meshSize
  if (mod > meshSize / 2) {
    position.y = position.y + (meshSize - mod)
  } else {
    position.y = position.y - mod
  }
}

/**
 * 修改辅助线提示
 * @param {*} text 提示文本
 * @param {*} position 位置
 */
export function setHelpLineHint (canvas, position) {
  let hintEl = canvas.helpBackLinies[canvas.helpBackLinies.length - 1]
  // 修改提示文本
  if (hintEl) {
    hintEl.innerHTML = position.x + ',' + position.y
    hintEl.setAttributeNS(null, 'x', position.x - 20)
    hintEl.setAttributeNS(null, 'y', position.y - 5)
  }
}

export function setHelpLinePoints (canvas, index, points) {
  let helpLine = canvas.helpBackLinies[index]
  if (!helpLine) {
    return
  }
  helpLine.setPoints(points)
}

/**
 * 获取当前画布中，所有需要对齐的活动对象，并远近排序
 * @param {*} canvas 画布
 * @param {*} sourceP 需要对齐图形的坐标和宽高
 *              x 对齐对象的x坐标
 *              y 对齐对象的y坐标
 *              width 对齐对象的宽度
 *              height 对齐对象的高度
 */
export function getAlignActivites (canvas, sourceModel, sourceModelPosition) {
  let models = {
    leftAlignModels: [],
    rightAlignModels: [],
    topAlignModels: [],
    bottomAlignModels: [],
    horizontalCenterAlignModels: [],
    verticalCenterAlignModels: []
  }
  // 是否分组元素（由多个节点组合而成），目前只有辅助线组件
  let isGroupModel = !!sourceModel.includeModel
  // 计算每个模型与位置的关系
  let sourceP = sourceModelPosition || { x: +sourceModel.x, y: +sourceModel.y, width: +sourceModel.width, height: +sourceModel.height }
  let distP
  getActivities(canvas).forEach(model => {
    // 排除相同的模型
    if (model.id === sourceModel.id) {
      return
    }
    // 包含在分组内则跳过
    if (isGroupModel && sourceModel.includeModel(model)) {
      return
    }
    distP = { x: model.x, y: model.y, width: model.width, height: model.height }
    if (isLeftAlign(sourceP, distP)) {
      models.leftAlignModels.push(model)
    }
    if (isRightAlign(sourceP, distP)) {
      models.rightAlignModels.push(model)
    }
    if (isTopAlign(sourceP, distP)) {
      models.topAlignModels.push(model)
    }
    if (isBottomAlign(sourceP, distP)) {
      models.bottomAlignModels.push(model)
    }
    if (isHorizontalCenterAlign(sourceP, distP)) {
      models.horizontalCenterAlignModels.push(model)
    }
    if (isVerticalCenterAlign(sourceP, distP)) {
      models.verticalCenterAlignModels.push(model)
    }
  })
  // 按照远近关系排序
  let sortFunc = function (aModel, bModel) {
    let xr = aModel.x - bModel.x
    if (xr !== 0) {
      return xr
    }
    return aModel.y - bModel.y
  }
  for (let key in models) {
    models[key].sort(sortFunc)
  }
  return models
}

/**
 * 是否左对齐
 * 源图形的左上顶点与图形的左边线或右边线处于一个x
 * @param {*} sourceP 源图形位置 { x }
 * @param {*} distP 目标图形位置 { x, width }
 * @returns
 */
export function isLeftAlign (sourceP, distP) {
  return sourceP.x === distP.x || sourceP.x === distP.x + distP.width
}

/**
 * 是否右对齐
 * 源图形的右上顶点与图形的左边线或右边线处于一个x
 * @param {*} sourceP 源图形位置 { x, width }
 * @param {*} distP 目标图形位置 { x, width }
 * @returns
 */
export function isRightAlign (sourceP, distP) {
  return sourceP.x + sourceP.width === distP.x || sourceP.x + sourceP.width === distP.x + distP.width
}

/**
 * 是否顶部对齐
 * 源图形的右上顶点与图形的上边线或下边线处于一个y
 * @param {*} sourceP 源图形位置 { y }
 * @param {*} distP 目标图形位置 { y, height }
 * @returns
 */
export function isTopAlign (sourceP, distP) {
  return sourceP.y === distP.y || sourceP.y === distP.y + distP.height
}

/**
 * 是否低部对齐
 * 源图形的右上顶点与图形的上边线或下边线处于一个y
 * @param {*} sourceP 源图形位置 { y, height }
 * @param {*} distP 目标图形位置 { y, height }
 * @returns
 */
export function isBottomAlign (sourceP, distP) {
  return sourceP.y + sourceP.height === distP.y || sourceP.y + sourceP.height === distP.y + distP.height
}

/**
 * 水平居中对齐
 * @param {*} sourceP 源图形位置 { y, height }
 * @param {*} distP 目标图形位置 { y, height }
 * @returns true/false
 */
export function isHorizontalCenterAlign (sourceP, distP) {
  return sourceP.y + sourceP.height / 2 === distP.y + distP.height / 2
}

/**
 * 垂直居中对齐
 * @param {*} sourceP 源图形位置 { x, width }
 * @param {*} distP 目标图形位置 { x, width }
 * @returns true/false
 */
export function isVerticalCenterAlign (sourceP, distP) {
  return sourceP.x + sourceP.width / 2 === distP.x + distP.width / 2
}

export function getModelPosition (model) {
  let { x, y, width, height } = model
  return {
    x, y, width, height
  }
}

export function showLeftHelpLine (canvas, model, alignModels) {
  if (alignModels.length > 0) {
    let mp = getShapesPosition(model, ...alignModels)
    setHelpLinePoints(canvas, 0, [model.x, mp.y - 50, model.x, mp.y + mp.height + 50])
  } else {
    setHelpLinePoints(canvas, 0, null)
  }
}

export function showRightHelpLine (canvas, model, alignModels) {
  if (alignModels.length > 0) {
    let mp = getShapesPosition(model, ...alignModels)
    setHelpLinePoints(canvas, 1, [model.x + model.width, mp.y - 50, model.x + model.width, mp.y + mp.height + 50])
  } else {
    setHelpLinePoints(canvas, 1)
  }
}

export function showTopHelpLine (canvas, model, alignModels) {
  if (alignModels.length > 0) {
    let mp = getShapesPosition(model, ...alignModels)
    setHelpLinePoints(canvas, 2, [mp.x - 50, model.y, mp.x + mp.width + 50, model.y])
  } else {
    setHelpLinePoints(canvas, 2)
  }
}

export function showBottomHelpLine (canvas, model, alignModels) {
  if (alignModels.length > 0) {
    let mp = getShapesPosition(model, ...alignModels)
    setHelpLinePoints(canvas, 3, [mp.x - 50, model.y + model.height, mp.x + mp.width + 50, model.y + model.height])
  } else {
    setHelpLinePoints(canvas, 3)
  }
}

export function showHorizontalCenterHelpLine (canvas, model, alignModels) {
  if (alignModels.length > 0) {
    let mp = getShapesPosition(model, ...alignModels)
    setHelpLinePoints(canvas, 4, [mp.x - 50, mp.y + mp.height / 2, mp.x + mp.width + 50, mp.y + mp.height / 2])
  } else {
    setHelpLinePoints(canvas, 4)
  }
}

export function showVerticalCenterHelpLine (canvas, model, alignModels) {
  if (alignModels.length > 0) {
    let mp = getShapesPosition(model, ...alignModels)
    setHelpLinePoints(canvas, 5, [mp.x + mp.width / 2, mp.y - 50, mp.x + mp.width / 2, mp.y + mp.height + 50])
  } else {
    setHelpLinePoints(canvas, 5)
  }
}

/**
 * 更新辅助线
 * @param {*} canvas 画布
 */
export function updateHelpLines (canvas, model, mouseEvent, align = true) {
  // 取默认的拖拽图形
  model = model || canvas.getDragModel()
  // 移除扩大属性对对齐的影响
  let modelPosition = getModelPosition(model)
  // 计算模型拖拽后的位置, 自动计算边界
  let absPos = getDragOffset(canvas, modelPosition, mouseEvent)
  // 未开启主线提示，则不再计算辅助线提示定位
  if (!RDSetting.GLOBAL_HELP_LINE_ENABLE || !align) {
    // 更新辅助线提示
    setHelpLineHint(canvas, absPos, modelPosition)
    return absPos
  }
  if (align) {
    // 计算图形拖拽后将要到达的坐标, 自动对齐坐标
    autoAlign(absPos, canvas.help_line_weight, modelPosition)
  }
  // 更新辅助线提示
  setHelpLineHint(canvas, absPos, modelPosition)
  // 计算对齐辅助线
  if (RDSetting.GLOBAL_HELP_LINE_ALIGN_ENABLE) {
    // 获取对齐的模型
    const { leftAlignModels, rightAlignModels, topAlignModels, bottomAlignModels, horizontalCenterAlignModels, verticalCenterAlignModels } = getAlignActivites(canvas, model, modelPosition)
    // 显示左侧对齐线
    showLeftHelpLine(canvas, modelPosition, leftAlignModels)
    // 显示右侧对齐线
    showRightHelpLine(canvas, modelPosition, rightAlignModels)
    // 显示顶部对齐线
    showTopHelpLine(canvas, modelPosition, topAlignModels)
    // 显示底部对齐线
    showBottomHelpLine(canvas, modelPosition, bottomAlignModels)
    // 显示水平居中对齐的线
    showHorizontalCenterHelpLine(canvas, modelPosition, horizontalCenterAlignModels)
    // 显示垂直居中对齐的线
    showVerticalCenterHelpLine(canvas, modelPosition, verticalCenterAlignModels)
  }
  return absPos
}
