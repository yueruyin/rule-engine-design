// ========================================================
// 设计器滚动相关的方法
// @author wangyb
// @createTime 2023-04-27 16:19:44
// ========================================================
import { getShapeSide, getShapesPosition } from './shape'
import { getCanvasView } from './canvas'

import { FIELD_SCROLL } from './fields'
import { defineUnenumerableProperty } from './common'

const DEFAULT_SCROLL_STEP = 10

export function getCanvasScrollType (canvas) {
  return canvas[FIELD_SCROLL] && canvas[FIELD_SCROLL].type
}

export function setCanvasScrollType (canvas, type) {
  if (!canvas[FIELD_SCROLL]) {
    defineUnenumerableProperty(canvas, FIELD_SCROLL, {})
  }
  canvas[FIELD_SCROLL].type = type
}

export function createScrollInterval (canvas, mousePosition, e) {
  let canvasView = getCanvasView(canvas)
  let side = getShapeSide(mousePosition, canvasView, 15, true)
  // 滚动位置未发生变化时，跳过
  if (side.type === getCanvasScrollType(canvas)) {
    return
  }
  // 出现变化
  let methods
  switch (side.type) {
    case 'top':
      methods = [containerTopScroll]
      break
    case 'top-right':
      methods = [containerTopScroll, containerRightScroll]
      break
    case 'right':
      methods = [containerRightScroll]
      break
    case 'right-bottom':
      methods = [containerRightScroll, containerBottomScroll]
      break
    case 'bottom':
      methods = [containerBottomScroll]
      break
    case 'bottom-left':
      methods = [containerBottomScroll, containerLeftScroll]
      break
    case 'left':
      methods = [containerLeftScroll]
      break
    case 'top-left':
      methods = [containerLeftScroll, containerTopScroll]
      break
  }
  // 清空滚动
  clearScrollInterval(canvas)
  // 创建滚动
  setCanvasScrollTimer(canvas, buildScrollFunc(canvas, canvas.getDragModel(), methods, e, mousePosition), side.type)
}

export function setCanvasScrollTimer (canvas, scrollFunc, type, time) {
  // 先执行一次然后看是否有滚动，如果有则设置定时滚动，否则清空设置
  let isScrolled = scrollFunc()
  if (isScrolled) {
    setCanvasScrollType(canvas, type)
    canvas[FIELD_SCROLL].timer = setInterval(scrollFunc, time || 1000 / 60)
  }
}

export const autoIncrease = function (canvas) {
  // 自动扩展
  let models = canvas.getModels().filter(item => item.isDraggable && item.isDraggable() && item.isShow())
  let outRect = getShapesPosition(...models)
  // 如果触及画布边界，则自动扩展
  let scrollLeft = +canvas.container.scrollLeft
  let scrollTop = +canvas.container.scrollTop
  let outRectX = outRect.x
  let outRectY = outRect.y
  let restWidth = canvas.width - outRect.x - outRect.width
  let restHeight = canvas.height - outRect.y - outRect.height
  let widthIncrement = 0
  let heightIncrement = 0
  let xIncrement = 0
  let yIncrement = 0
  if (outRectX < 20) {
    // 强制画布向右扩展
    widthIncrement += 500
    xIncrement += 500
  } else if (restWidth < 20) {
    widthIncrement += 500
  }
  if (outRectY < 20) {
    heightIncrement += 500
    yIncrement += 500
  } else if (restHeight < 20) {
    heightIncrement += 500
  }

  if (widthIncrement) {
    // 强制画布向右扩展
    canvas.width += widthIncrement
    canvas.canvasWidth = canvas.width
    canvas.updateShape()
  }

  if (heightIncrement) {
    // 强制画布向右扩展
    canvas.height += heightIncrement
    canvas.canvasHeight = canvas.height
    canvas.updateShape()
  }

  if (xIncrement !== 0 || yIncrement !== 0) {
    canvas.moveModels(models, {
      x: outRectX + xIncrement,
      y: outRectY + yIncrement
    })
    canvas.container.scrollLeft = scrollLeft + xIncrement
    canvas.container.scrollTop = scrollTop + yIncrement
  }
}

export const autoDecrease = function (canvas) {
  // 如果触及画布边界，则自动扩展
  let scrollLeft = +canvas.container.scrollLeft
  let scrollTop = +canvas.container.scrollTop
  // 计算所有模型的坐标范围
  let models = canvas.getModels().filter(item => item.isDraggable && item.isDraggable() && item.isShow())
  let outRect = getShapesPosition(...models)
  // 增加填充
  let padding = 100
  if (models.length) {
    outRect.x -= padding
    outRect.y -= padding
    outRect.width += 2 * padding
    outRect.height += 2 * padding
  }
  // 计算视窗与所有图形矩形的位置
  let viewOutRect = getShapesPosition({
    x: scrollLeft,
    y: scrollTop,
    width: canvas.container.offsetWidth,
    height: canvas.container.offsetHeight
  }, outRect)
  let viewOutRectX = viewOutRect.x
  let viewOutRectY = viewOutRect.y
  let restWidth = canvas.width - viewOutRect.x - viewOutRect.width
  let restHeight = canvas.height - viewOutRect.y - viewOutRect.height
  // 计算画布宽高的增量
  let widthIncrement = -viewOutRectX - restWidth
  let heightIncrement = -viewOutRectY - restHeight
  // 保持是10的倍数, 增加时，往大了算，减少时，往小了算，避免画布没有填满视窗的问题
  if (widthIncrement > 0) {
    widthIncrement = Math.ceil(widthIncrement / 10) * 10
  } else {
    widthIncrement = Math.floor(widthIncrement / 10) * 10
  }
  if (heightIncrement > 0) {
    heightIncrement = Math.ceil(heightIncrement / 10) * 10
  } else {
    heightIncrement = Math.floor(heightIncrement / 10) * 10
  }
  // 计算图形平移的量
  let xIncrement = -Math.floor(viewOutRectX)
  let yIncrement = -Math.floor(viewOutRectY)

  xIncrement = Math.floor(xIncrement)
  yIncrement = Math.floor(yIncrement)
  widthIncrement = Math.floor(widthIncrement)
  heightIncrement = Math.floor(heightIncrement)

  if (widthIncrement !== 0 || heightIncrement !== 0) {
    canvas.width += widthIncrement
    canvas.canvasWidth = canvas.width
    canvas.height += heightIncrement
    canvas.canvasHeight = canvas.height
    canvas.updateShape()
  }

  if (xIncrement !== 0 || yIncrement !== 0) {
    canvas.moveModels(models, {
      x: outRect.x + xIncrement + padding,
      y: outRect.y + yIncrement + padding
    })
    canvas.container.scrollLeft = scrollLeft + xIncrement
    canvas.container.scrollTop = scrollTop + yIncrement
    // 通知框选组件重绘
    canvas.auxRect && canvas.auxRect.updateSizeByModels()
  }
}

export function buildScrollFunc (canvas, model, scrollMethods = [], e, mousePosition) {
  return function () {
    let renderFlag = false

    if (scrollMethods.length && model.isDraggingAutoIncrease && model.isDraggingAutoIncrease()) {
      autoIncrease(canvas)
    }

    // 调整位置
    scrollMethods.forEach(item => {
      if (item({ canvas, mousePosition, model })) {
        renderFlag = true
      }
    })
    // 调整辅助线位置
    canvas.updateHelpLinesMesh()
    // 有位置变化才重绘
    if (renderFlag) {
      // 通知元素处理拖拽逻辑
      model.handleDragMove && model.handleDragMove(e)
    } else {
      // 没有变化则停止滚动
      clearScrollInterval(canvas)
    }
    return renderFlag
  }
}

export function clearScrollInterval (canvas) {
  if (!canvas[FIELD_SCROLL] || !canvas[FIELD_SCROLL].timer) {
    return
  }
  clearInterval(canvas[FIELD_SCROLL].timer)
  canvas[FIELD_SCROLL].type = null
  canvas[FIELD_SCROLL].timer = null
}

export function isScrolling (canvas) {
  return canvas[FIELD_SCROLL] && canvas[FIELD_SCROLL].timer
}

export function containerLeftScroll ({ canvas, model, mousePosition, step = DEFAULT_SCROLL_STEP }) {
  let scrollLeft = +canvas.container.scrollLeft
  step = Math.min(scrollLeft, step)
  if (step > 0) {
    // 重新计算鼠标位置
    mousePosition.x -= step
    canvas.container.scrollLeft = scrollLeft - step
    return true
  }
  return false
}

export function containerRightScroll ({ canvas, mousePosition, step = DEFAULT_SCROLL_STEP }) {
  let scrollLeft = +canvas.container.scrollLeft
  // 计算最大允许滚动距离
  step = Math.floor(Math.min(canvas.width - canvas.container.clientWidth - scrollLeft, step))
  if (step > 0) {
    // 重新计算鼠标位置
    mousePosition.x += step
    canvas.container.scrollLeft = scrollLeft + step
    return true
  }
  return false
}

export function containerTopScroll ({ canvas, mousePosition, step = DEFAULT_SCROLL_STEP }) {
  let scrollTop = +canvas.container.scrollTop
  step = Math.min(scrollTop, step)
  if (step > 0) {
    // 重新计算鼠标位置
    mousePosition.y -= step
    canvas.container.scrollTop = scrollTop - step
    return true
  }
  return false
}

export function containerBottomScroll ({ canvas, mousePosition, step = DEFAULT_SCROLL_STEP }) {
  let scrollTop = +canvas.container.scrollTop
  step = Math.floor(Math.min(canvas.height - canvas.container.clientHeight - scrollTop, step))
  if (step > 0) {
    // 重新计算鼠标位置
    mousePosition.y += step
    canvas.container.scrollTop = scrollTop + step
    return true
  }
  return false
}

// 不应该超过视窗
export function modelMoveLeft ({ model, step = DEFAULT_SCROLL_STEP }) {
  if (!model) {
    return false
  }
  let x = model.x
  step = Math.min(x, step)
  if (step > 0) {
    model.setPosition({ x: model.x - step, y: model.y }, true)
    return true
  }
  return false
}

export function modelMoveRight ({ canvas, model, step = DEFAULT_SCROLL_STEP }) {
  if (!model) {
    return false
  }
  // 最大位置
  let x = canvas.width - model.width
  // 计算最大允许滚动距离
  step = Math.floor(Math.min(x - model.x, step))
  if (step > 0) {
    model.setPosition({ x: model.x + step, y: model.y }, true)
    return true
  }
  return false
}

export function modelMoveTop ({ model, step = DEFAULT_SCROLL_STEP }) {
  if (!model) {
    return false
  }
  let y = model.y
  step = Math.min(y, step)
  if (step) {
    model.setPosition({ x: model.x, y: model.y - step }, true)
    return true
  }
  return false
}

export function modelMoveBottom ({ canvas, model, step = DEFAULT_SCROLL_STEP }) {
  if (!model) {
    return false
  }
  let y = canvas.height - model.height
  step = Math.min(y - model.y, step)
  if (step > 0) {
    model.setPosition({ x: model.x, y: model.y + step }, true)
    return true
  }
  return false
}
