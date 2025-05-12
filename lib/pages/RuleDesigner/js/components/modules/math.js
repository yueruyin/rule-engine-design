/**
 * 计算图形用到的数学工具
 *
 * @author wangyb
 * @createTime 2023-04-25 17:18:19
 */
import { isArray } from 'lodash'

/**
 * 计算两点之间的距离
 */
export function calcTwoPointDistance (p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

/**
 * 海伦公式
 * 计算三角形面积
 * @param {*} p1 三角形顶点
 * @param {*} p2 三角形顶点
 * @param {*} p3 三角形顶点
 */
export function calcTriangleArea (p1, p2, p3) {
  let a = calcTwoPointDistance(p1, p2)
  let b = calcTwoPointDistance(p1, p3)
  let c = calcTwoPointDistance(p2, p3)
  let p = (a + b + c) / 2
  return Math.sqrt(p * (p - a) * (p - b) * (p - c))
}

/**
 * 计算三角形的高度
 * @param {*} p1 顶点
 * @param {*} p2 底边的点
 * @param {*} p3 底边的点
 */
export function calcTriangleHeight (p1, p2, p3) {
  let area = calcTriangleArea(p1, p2, p3)
  return area / calcTwoPointDistance(p2, p3)
}

/**
 * 计算三角形的顶点偏移类型
 * @param {*} p1 顶点
 * @param {*} p2 左边的点
 * @param {*} p3 右边的点
 */
export function calcTriangleOffsetType (p1, p2, p3) {
  return calcTwoPointDistance(p1, p2) <= calcTwoPointDistance(p1, p3) ? 'left' : 'right'
}

/**
 *
 * @param {*} param0 [x1, y1, x2, y2] 线的两个坐标
 * @param {*} type 1/2/3/4 LT/GT/LE/GE 小于/大于/小于等于/大于等于
 * @returns
 */
const buildSideFunc = function ([x1, y1, x2, y2], type = buildSideFunc.LE) {
  let func = function (actX) {
    return (x1 - x2) / (y1 - y2) * (actX - x2) + y2
  }
  return function (x, y) {
    if (type === buildSideFunc.LE) {
      return y <= func(x)
    } else if (type === buildSideFunc.GE) {
      return y >= func(x)
    } else if (type === buildSideFunc.LT) {
      return y < func(x)
    } else if (type === buildSideFunc.GT) {
      return y > func(x)
    } else {
      return false
    }
  }
}

// 静态变量, 小于1, 大于2, 小于等于3, 大于等于
buildSideFunc.LT = 1
buildSideFunc.GT = 2
buildSideFunc.LE = 3
buildSideFunc.GE = 4

/**
 * 计算坐标是否在多边形的范围内
 * @param {*} sides 边{x1,y1,x2,y2,type:LT/GT/LE/GE}
 * @param {*} x 需要计算的x坐标
 * @param {*} y 需要计算的y坐标
 */
export function inPolygon ({ x, y }, sides) {
  if (!isArray(sides) || !sides || sides.length < 3) {
    return false
  }
  // 计算函数
  let funcs = sides.map(({ x1, y1, x2, y2, compareType }) => buildSideFunc([x1, y1, x2, y2], compareType))
  return funcs.every(func => func(x, y))
}

/**
 * 对数字进行四舍五入
 * @param {*} number 需要转换的数字
 * @param {*} p 精度 precision
 */
export function toFixed (number, p) {
  let n = +number
  if (isNaN(number)) {
    return n
  }
  let base = Math.pow(10, p)
  n = n * base
  n = Math.round(n)
  n = n / base
  n = n.toFixed(p)
  return +n
}

inPolygon.LT = buildSideFunc.LT
inPolygon.GT = buildSideFunc.GT
inPolygon.LE = buildSideFunc.LE
inPolygon.GE = buildSideFunc.GE

window.calcTwoPointDistance = calcTwoPointDistance
window.calcTriangleArea = calcTriangleArea
window.calcTriangleHeight = calcTriangleHeight
window.inPolygon = inPolygon