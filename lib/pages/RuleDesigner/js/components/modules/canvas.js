// ========================================================
// 画布相关的功能
// @author wangyb
// @createTime 2023-04-27 16:23:28
// ========================================================

import RuleActivity from '../RuleActivity'

/**
 * 获取画布在容器内的视窗
 * @param {*} canvas 画布
 * @returns 视窗的坐标和宽高
 */
export function getCanvasView (canvas) {
  let container = canvas.container
  return {
    x: container.scrollLeft,
    y: container.scrollTop,
    width: container.clientWidth,
    height: container.clientHeight
  }
}

/**
 * 获取画布中所有的活动对象
 * @param {*} canvas 画布
 */
export function getActivities (canvas) {
  let models = []
  for (let id in canvas.rootModels) {
    if (canvas.rootModels[id] instanceof RuleActivity) {
      models.push(canvas.rootModels[id])
    }
  }
  return models
}

export function getEventModel (event) {
  return getSvgElModel(event.target)
}

export function getSvgElModel (target) {
  let model = null
  let p = target
  while (p instanceof SVGElement) {
    model = p.model
    if (model) {
      break
    }
    p = p.parentElement
  }
  return model
}

export const svgToImage = function (svg) {
  // 这里一定要给svg设置这两个命名空间，包含了image 则也需要加上xmlns:xlink 否则浏览器会报错不能下载图片
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  // 这里用来解决当svg中图超出边界时，需要全部完整保存下来的功能
  const toExport = svg.cloneNode(true)
  const bb = svg.getBBox()
  let padding = 100
  toExport.setAttribute(
    'viewBox',
    bb.x -
    padding +
    ' ' +
    (bb.y - padding) +
    ' ' +
    (bb.width + padding * 2) +
    ' ' +
    (bb.height + padding * 2)
  )
  toExport.setAttribute('width', bb.width + '')
  toExport.setAttribute('height', bb.height + '')
  // 转为base64 一定要加上unescape(encodeURIComponent，否则浏览器会报错
  return (
    'data:image/svg+xml;base64,' +
    window.btoa(unescape(encodeURIComponent(toExport.outerHTML)))
  )
}