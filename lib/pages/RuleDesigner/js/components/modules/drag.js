/**
 * 提供图形拖拽使用的方法
 *
 * @author wangyb
 * @createTime 2023-04-25 15:40:02
 */
import { getMousePosition } from './dom'
import { FIELD_DRAG } from './fields'

export function updateDragObjOffset (canvas, mouseEvent) {
  let dragObj = canvas[FIELD_DRAG]
  if (!dragObj) {
    return
  }
  let mousePosition = getMousePosition(canvas.container, mouseEvent)
  dragObj.offsetX = mousePosition.x - dragObj.mouseX
  dragObj.offsetY = mousePosition.y - dragObj.mouseY
}

export function getDragOffset (canvas, model, mouseEvent) {
  let position = {
    x: mouseEvent.layerX + canvas[FIELD_DRAG].x + canvas.container.scrollLeft,
    y: mouseEvent.layerY + canvas[FIELD_DRAG].y + canvas.container.scrollTop
  }
  // 设置定位的边界
  // position.x = Math.ceil(Math.min(Math.max(position.x, 0), canvas.width - model.width))
  // position.y = Math.ceil(Math.min(Math.max(position.y, 0), canvas.height - model.height))
  return position
}
