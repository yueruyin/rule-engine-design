/**
 * 与dom元素相关的方法
 *
 * @author wangyb
 * @createTime 2023-04-25 15:52:11
 */

/**
 * 查找元素距离顶部的位置
 */
export function getOffsetTop (el, containerEl) {
  // 容器本身距离自己的顶部位置为0
  if (el === containerEl) {
    return 0
  }
  return el.offsetParent
    ? el.offsetTop + getOffsetTop(el.offsetParent)
    : el.offsetTop
}

/**
 * 查找元素距离左侧的位置
 */
export function getOffsetLeft (el, containerEl) {
  // 容器本身距离自己的左侧位置为0
  if (el === containerEl) {
    return 0
  }
  return el.offsetParent
    ? el.offsetLeft + getOffsetLeft(el.offsetParent)
    : el.offsetLeft
}

/**
 * 通过鼠标事件获取，鼠标在容器中的位置
 * @param {*} layer 元素
 * @param {*} event mouseEvent
 */
export function getMousePosition (el, containerEl, event) {
  if (containerEl instanceof Event) {
    event = containerEl
    containerEl = null
  }
  return {
    x: event.clientX - getOffsetLeft(el, containerEl) + el.scrollLeft,
    y: event.clientY - getOffsetTop(el, containerEl) + el.scrollTop
  }
}

/**
 * 清楚选中文本
 */
export function clearSelectionText () {
  window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty()
}

// 缓存字体、字体大小对应的ascii码字符的宽度
const fontFamilyAsciiSizeMap = {}

const getAsciiSizeMap = function (fontSize, fontFamily) {
  fontFamily = fontFamily || 'default'
  fontSize = fontSize || 'default'
  if (!fontFamilyAsciiSizeMap[fontFamily]) {
    fontFamilyAsciiSizeMap[fontFamily] = {}
  }
  if (!fontFamilyAsciiSizeMap[fontFamily][fontSize]) {
    fontFamilyAsciiSizeMap[fontFamily][fontSize] = getAsciiChartWidth(fontSize, fontFamily)
  }
  return fontFamilyAsciiSizeMap[fontFamily][fontSize]
}

export function getEllipsisText (str, width, { fontSize = '12px', fontFamily, ellipsis = '...' }) {
  let total = 0
  let size = textWidth(String.fromCharCode(12934), fontSize, fontFamily)
  let ellipsisWidth = textLength(ellipsis, size, fontSize, fontFamily)
  let length = Math.ceil(ellipsisWidth / size)
  let subStr, subStrWidth
  let text = ''
  for (let i = 0, l = str.length; i < l; i++) {
    subStr = str.charAt(i)
    subStrWidth = charLength(str.charCodeAt(i), size, fontSize, fontFamily)
    if (total + subStrWidth > width) {
      text += ellipsis
      break
    } else if (i + length < l && total + subStrWidth + ellipsisWidth > width) {
      text += ellipsis
      break
    } else {
      total += subStrWidth
      text += subStr
    }
  }
  return text
}

export function charLength (charCode, size, fontSize = '12px', fontFamily) {
  let asciiSizeMap = getAsciiSizeMap(fontSize, fontFamily)
  size = size || textWidth(String.fromCharCode(12934), fontSize, fontFamily)
  return charCode > 128 ? size : asciiSizeMap[charCode]
}

export function textLength (str, size, fontSize = '12px', fontFamily) {
  let asciiSizeMap = getAsciiSizeMap(fontSize, fontFamily)
  let total = 0
  size = size || textWidth(String.fromCharCode(12934), fontSize, fontFamily)
  let code
  for (let i = 0, l = str.length; i < l; i++) {
    code = str.charCodeAt(i)
    total += code > 128 ? size : asciiSizeMap[code]
  }
  return total
}

export function textWidth (text, fontSize = '12px', fontFamily) {
  // 创建临时元素
  const _span = document.createElement('span')
  // 放入文本
  _span.innerText = text
  // 设置文字大小
  _span.style.fontSize = fontSize
  _span.style.fontFamily = fontFamily
  // span元素转块级
  _span.style.position = 'absolute'
  // span放入body中
  document.body.appendChild(_span)
  // 获取span的宽度
  let width = _span.offsetWidth
  // 从body中删除该span
  document.body.removeChild(_span)
  // 返回span宽度, 最小为2
  return width || 2
}

export function getAsciiChartWidth (fontSize = '12px', fontFamily) {
  let arr = []
  for (let i = 0, l = 128; i <= l; i++) {
    arr.push(textWidth(String.fromCharCode(i), fontSize, fontFamily))
  }
  return arr
}

window.getEllipsisText = getEllipsisText
window.textLength = textLength
window.textWidth = textWidth
window.getAsciiChartWidth = getAsciiChartWidth
