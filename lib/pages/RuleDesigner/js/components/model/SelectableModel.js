// ========================================================
// 是否允许选中的Model
// @author wangyb
// @createTime 2023-05-12 10:35:19
// ========================================================

import { ModelStatusEnum } from '../constants/status'
import { defineUnenumerableProperty } from '../modules/common'
import { addEventListener } from '../modules/event'
import { onContextMenu } from '../modules/menus'

const SelectableModel = function () {
  defineUnenumerableProperty(this, '__selectable__', true)
  defineUnenumerableProperty(this, '__muiltiple_selectable__', true)
  defineUnenumerableProperty(this, '__event_selectable__', true)
  this._handleModelClick = this.handleModelClick.bind(this)
  this._handleModelDblclick = this.handleModelDblclick.bind(this)
  this.bindModelClickEvents()
}

SelectableModel.prototype.isSelected = function () {
  return this.selected
}

SelectableModel.prototype.isSelectable = function () {
  return this.__selectable__
}

SelectableModel.prototype.setSelectable = function (selectable) {
  this.__selectable__ = selectable
}

SelectableModel.prototype.isEventSelectable = function () {
  return this.__event_selectable__
}

SelectableModel.prototype.setEventSelectable = function (selectable) {
  this.__event_selectable__ = selectable
}

SelectableModel.prototype.isMuiltipleSelectable = function () {
  return this.__selectable__ && this.__muiltiple_selectable__
}

SelectableModel.prototype.setMuiltipleSelectable = function (selectable) {
  this.__muiltiple_selectable__ = selectable
}

SelectableModel.prototype.bindModelClickEvents = function () {
  addEventListener(this, 'click', this._handleModelClick)
  addEventListener(this, 'dblclick', this._handleModelDblclick)
  addEventListener(this, 'contextmenu', onContextMenu)
}

SelectableModel.prototype.handleModelClick = function ({ model }, e) {
  this.getCanvas().makeSelection(model, e)
}

SelectableModel.prototype.handleModelDblclick = function () {}

SelectableModel.prototype.select = function (selected = true) {
  this.selected = selected
  if (selected) {
    this.addStatus(ModelStatusEnum.Selected)
  } else {
    this.removeStatus(ModelStatusEnum.Selected)
  }
}

// 默认以矩形来判断
SelectableModel.prototype.isInSelectArea = function ({
  x,
  y,
  width = 0,
  height = 0
}) {
  if (x === undefined || y === undefined) {
    return false
  }
  // 对角判断
  let modelX = this.x
  let modelX1 = this.x + this.width
  let modelY = this.y
  let modelY1 = this.y + this.height
  if (!width || !height) {
    return modelX <= x && modelY <= y && modelX1 >= x && modelY1 >= y
  }
  let x1 = x + width
  let y1 = x + height
  return modelX <= x && modelY <= y && modelX1 <= x1 && modelY1 <= y1
}

export default SelectableModel
