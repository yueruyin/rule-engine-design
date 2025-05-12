// ========================================================
// 设计通用的方法
// @author wangyb
// @createTime 2023-04-27 16:26:44
// ========================================================

import { defineUnenumerableProperty } from './common'
import { FIELD_EVENT_LISTENERS } from './fields'
/**
 * 触发模型的事件
 * @param {*} model 模型
 * @param {*} eventName 事件名称
 * @param {*} params 事件参数
 */
export function triggerModelEvent (model, eventName, ...params) {
  if (!model || !model.eventListeners || !eventName) {
    return
  }
  const events = model.eventListeners[eventName] || []
  events.forEach(eventMethod => eventMethod(...params))
}

/**
 * 绑定事件
 * @param {*} model 模型
 * @param {*} eventName 事件名
 * @param {*} func 处理逻辑
 */
export function addEventListener (model, eventName, func) {
  if (!model[FIELD_EVENT_LISTENERS]) {
    defineUnenumerableProperty(model, FIELD_EVENT_LISTENERS, {})
  }
  const eventListeners = model[FIELD_EVENT_LISTENERS]
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = []
  }
  // const methods = eventListeners[eventName]
  // 移除老的事件后增加新的事件
  // let index = methods.indexOf(func)
  // if (index !== -1) {
  //   methods.splice(index, 1)
  // }
  // methods.push(func)
  // 重新绑定事件，现在的机制会导致重复绑定事件
  eventListeners[eventName] = [func]
}

/**
 * 删除事件
 * @param {*} model 模型
 * @param {*} eventName 事件名
 * @param {*} func 事件处理方法
 */
export function removeEventListener (model, eventName, func) {
  if (!model[FIELD_EVENT_LISTENERS]) {
    return
  }
  const eventListeners = model[FIELD_EVENT_LISTENERS]
  if (!eventListeners[eventName]) {
    return
  }
  if (func) {
    eventListeners[eventName].remove(func)
  } else {
    eventListeners[eventName] = []
  }
}

/**
 * 清空事件监听
 * @param {*} model 模型
 */
export function clearEventListeners (model) {
  delete model[FIELD_EVENT_LISTENERS]
  defineUnenumerableProperty(model, FIELD_EVENT_LISTENERS, {})
}