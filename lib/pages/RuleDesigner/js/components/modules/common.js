/**
 * 定义一些通用的方法
 * @author wangyb
 * @createTime 2023-04-24 17:09:16
 */
import { ColorEnum } from '../constants/common.js'
import './dom.js'
import { uniq, difference, isObject, isArray, get as getByPath, set as setByPath, isString } from 'lodash'

export const isEmpty = function (obj) {
  if (obj === undefined || obj === null || obj === '') {
    return true
  }
  if (isObject(obj) && !Object.keys(obj).length) {
    return true
  }
  if (isArray(obj) && !obj.length) {
    return true
  }
  return false
}

export const safeJsonParse = function (str) {
  if (!str) {
    return {}
  }
  try {
    return JSON.parse(str)
  } catch (e) {
    return {}
  }
}

export const defineUnenumerableProperty = function (obj, key, value, props) {
  if (!obj) {
    return
  }
  let config = Object.assign({
    configurable: true,
    enumerable: false,
    writable: true
  }, props)
  if (value !== undefined) {
    config.value = value
  }
  Object.defineProperty(obj, key, config)
}

export const defineReadonlyProperty = function (obj, key, value, props) {
  if (!obj) {
    return
  }
  Object.defineProperty(obj, key, Object.assign({
    configurable: true,
    enumerable: false,
    writable: false,
    value: value
  }, props))
}

export const defineUnoperatableProperty = function (obj, key, value, props) {
  if (!obj) {
    return
  }
  Object.defineProperty(obj, key, Object.assign({
    configurable: false,
    enumerable: false,
    writable: false,
    value: value
  }, props))
}

export function addClass (dom, ...classNames) {
  if (!dom) return
  let classNameStr = dom.className || ''
  classNames = classNameStr.split(/\s+/).concat(classNames)
  dom.className = uniq(classNames).join(' ')
}

export function removeClass (dom, ...classNames) {
  if (!dom) return
  let classNameStr = dom.className || ''
  classNames = difference(classNameStr.split(/\s+/), classNames)
  dom.className = uniq(classNames).join(' ')
}

function objectCopy (obj) {
  function Fun () { };
  Fun.prototype = obj
  return new Fun()
}

export function extendsClass (child, parent) {
  let prototype = objectCopy(parent.prototype)
  prototype.constructor = child
  child.prototype = prototype
}

export function mix (...Mixins) {
  class Mix {
    constructor() {
      for (let Mixin of Mixins) {
        copyProperties(this, new Mixin()) // 拷贝实例属性
      }
    }
  }

  for (let Mixin of Mixins) {
    copyProperties(Mix, Mixin) // 拷贝静态属性
    copyProperties(Mix.prototype, Mixin.prototype) // 拷贝原型属性
  }

  return Mix
}

/**
 * 继承类的能力，但不加入原型链
 * @param  {...any} classes 需要继承的类
 */
export function extendsClasses (srcClass, ...classes) {
  for (let clazz of classes) {
    copyProperties(srcClass, clazz) // 拷贝静态属性
    copyProperties(srcClass.prototype, clazz.prototype) // 拷贝原型属性
  }
}

export function copyProperties (target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== 'constructor' &&
      key !== 'prototype' &&
      key !== 'name'
    ) {
      let desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}

export function defineSvgObserveFields (model, svgEl, ...fields) {
  fields.forEach(field => {
    if (field in model) {
      delete model[field]
    }
    Object.defineProperty(model, field, {
      get () {
        // 实际图形的值可能与设置给model的属性值有偏差，以属性值为准
        // return svgEl.getBBox()[field]
        return svgEl.getAttribute(field)
      },
      set (newVal) {
        return svgEl.setAttributeNS(null, field, newVal)
      }
    })
  })
}

export function defineOptionObserveFields (model, ...fields) {
  fields.forEach(field => {
    let path = field
    let defaultValue = null
    if (isObject(field)) {
      path = field.path || field.field
      defaultValue = field.defaultValue
      field = field.field
    }
    if (field in model) {
      delete model[field]
    }
    Object.defineProperty(model, field, {
      get () {
        let value = model.getOption(path, true)
        return (value === undefined || value === null) ? defaultValue : value
      },
      set (newVal) {
        model.setOption(path, newVal, false)
      }
    })
  })
}

/**
 * 创建一个对象
 * @param {*} Con 被创建的类
 * @param  {...any} args 构造参数
 * @returns 对象
 */
export function create (Con, ...args) {
  // 创建一个空的对象
  let obj = Object.create(null)
  // 将空对象指向构造函数的原型链
  Object.setPrototypeOf(obj, Con.prototype)
  // obj绑定到构造函数上，便可以访问构造函数中的属性，即obj.Con(args)
  let result = Con.apply(obj, args)
  // 如果返回的result是一个对象则返回
  // new方法失效，否则返回obj
  return result instanceof Con ? result : obj
}

/**
 * 首字母大写
 * @param {*} str 字符串
 * @returns 首字母大写字符串
 */
export function firstChartToUpperCase (str) {
  return changeFirstChart(str, String.prototype.toUpperCase)
}

/**
 * 首字母小写
 * @param {*} str 字符串
 * @returns 首字母小写字符串
 */
export function firstChartToLowerCase (str) {
  return changeFirstChart(str, String.prototype.toLowerCase)
}

const changeFirstChart = function (str, func) {
  if (!str || !isString(str)) {
    return str
  }
  return func.call(str.substring(0, 1)) + str.substring(1, str.length)
}

export function splitBorder (border) {
  let arr = border.split(/\s+/)
  if (arr.length < 2) {
    return null
  }
  arr[2] = arr[2] || ColorEnum.Black
  return arr
}

export function toBorderOptions (border) {
  if (!border) {
    return null
  }
  let arr = splitBorder(border)
  return (
    arr && {
      width: arr[0],
      type: arr[1],
      color: arr[2]
    }
  )
}

window.create = create
