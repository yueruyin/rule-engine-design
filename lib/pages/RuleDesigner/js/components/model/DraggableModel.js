// ========================================================
// 拖拽模型抽象类，提供基础的拖拽能力
// @author wangyb
// @createTime 2023-05-06 15:16:04
// ========================================================

import { defineUnenumerableProperty } from '../modules/common'
import { clearSelectionText } from '../modules/dom'
import { addEventListener } from '../modules/event'

import bus from '../../bus'

/**
 * 需要混入基础模型类中使用
 * 会用到一些模型的基础能力
 */
const DraggableModel = function (dragContainer, props) {
  // 设置拖拽控制标签
  defineUnenumerableProperty(this, '__draggable__', true)
  defineUnenumerableProperty(this, '__dragging_help_line__', true)
  defineUnenumerableProperty(this, '__dragging_move__', true)
  defineUnenumerableProperty(this, '__dragging_scroll__', true)
  defineUnenumerableProperty(this, '__dragging_auto_increase__', true)
  defineUnenumerableProperty(this, '__dragContainer__', dragContainer)

  this._handleDragStart = this.handleDragStart.bind(this)
  this._handleDragMove = this.handleDragMove.bind(this)
  this._handleDragEnd = this.handleDragEnd.bind(this)
  // 绑定事件
  this.bindDragEvents()
}

DraggableModel.prototype.getDragContainer = function () {
  return this.__dragContainer__
}

/**
 * 给模型绑定拖拽事件
 */
DraggableModel.prototype.bindDragEvents = function () {
  addEventListener(this, 'dragstart', this._handleDragStart)
  addEventListener(this, 'dragmove', this._handleDragMove)
  addEventListener(this, 'dragend', this._handleDragEnd)
}

DraggableModel.prototype.handleDragStart = function (e) {
  // 正常什么都不需要干
}

DraggableModel.prototype.handleDragMove = function (e) {
  clearSelectionText()
  const canvas = this.getDragContainer()
  const model = this
  // 按照鼠标移动位置移动的位置进行修改
  let dragOffset = canvas.updateHelpLines(model, e, true)
  model.setPosition(dragOffset)
  model.renderDelay()
}

DraggableModel.prototype.handleDragEnd = function (e) {
  this.getDragContainer().makeSelection(this, e)
  // 触发vue全局事件
  bus.$emit('modelDragend', this)
}

DraggableModel.prototype.isDraggable = function () {
  return this.__draggable__
}

/**
 * 拖拽时是否移动位置
 * @returns true/false
 */
DraggableModel.prototype.isDraggingMove = function () {
  return this.__dragging_move__
}

DraggableModel.prototype.setDraggingMove = function (move) {
  this.__dragging_move__ = !!move
}

DraggableModel.prototype.isDraggingScroll = function () {
  return this.__dragging_scroll__
}

DraggableModel.prototype.setDraggingScroll = function (scroll) {
  this.__dragging_scroll__ = !!scroll
}

DraggableModel.prototype.isDraggingAutoIncrease = function () {
  return this.__dragging_auto_increase__
}

DraggableModel.prototype.setDraggingAutoIncrease = function (autoIncrease) {
  this.__dragging_auto_increase__ = !!autoIncrease
}

DraggableModel.prototype.isShowDraggingHelpLine = function () {
  return this.__dragging_help_line__
}

DraggableModel.prototype.setShowDraggingHelpLine = function (show) {
  this.__dragging_help_line__ = !!show
}

export default DraggableModel
