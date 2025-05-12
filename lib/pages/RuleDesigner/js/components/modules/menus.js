// ========================================================
// 提供右键菜单的能力
// @author wangyb
// @createTime 2023-06-05 22:54:48
// ========================================================

import { getEventModel } from './canvas'
import { destroyDebuggerConditionDialog } from './debugger'

let __menu = null
let __menuPosition = null
let __menuModels = []
let __containerModel = null

const initMenu = function () {
  __menu = document.createElement('div')
  __menu.className = 'rule-design-contextmenu rule-design-contextmenu--dark'
  window.document.body.appendChild(__menu)
}

const destroyMenu = function () {
  if (!__menu) {
    return
  }
  __menu.remove()
  __menu = null
  __menuPosition = null
  window.document.body.removeEventListener('click', onMenuOuterClick)
}

const openMenu = function (p) {
  if (!__menu) {
    initMenu()
  }
  __menuPosition = p
  __menu.style.left = p.x + 'px'
  __menu.style.top = p.y + 'px'
  window.document.body.addEventListener('click', onMenuOuterClick)
}

const setMenuItems = function (items = []) {
  if (!__menu) {
    initMenu()
  }
  __menu.innerHTML = ''
  items.forEach((item) => {
    let menuItem = window.document.createElement('div')
    menuItem.className = 'rule-design-contextmenu-item'
    menuItem.innerHTML = item.label
    menuItem.dataset.command = item.command
    menuItem.dataset.target = item.target
    menuItem.addEventListener('click', onMenuItemClick)
    __menu.appendChild(menuItem)
  })
}

const onMenuOuterClick = function (e) {
  let target = e.target
  if (!__menu.contains(target)) {
    destroyMenu()
  }
}

const onMenuItemClick = function (e) {
  let command = e.target.dataset.command
  let target = e.target.dataset.target
  let func
  switch (target) {
    case 'container':
      func = __containerModel[command]
      func && func.call(__containerModel, ...__menuModels)
      break
    default:
      __menuModels.forEach((model) => {
        func = model[command]
        func && func.call(model, { event: e, menuPosition: __menuPosition })
      })
  }
  destroyMenu()
}

export function onContextMenu (e, model, container) {
  // 关闭子菜单，暂时如此，有好的思路再改
  destroyDebuggerConditionDialog()

  model = model || getEventModel(e)
  // 获取model的容器
  let containerModel = container || model.getCanvas()
  // 根据model配置的菜单项来打开
  __containerModel = containerModel
  //
  __menuModels = [model]
  // 获取model的菜单
  let menus = model.menus || (model.$options && model.$options.menus) || []
  // 过来menu
  menus = menus.filter(item => {
    if (!item.vif) {
      return true
    }
    return item.vif(model, containerModel)
  })
  if (menus.length) {
    // 设置菜单
    setMenuItems(menus)
    // 打开menu
    openMenu({ x: e.clientX, y: e.clientY })
  } else {
    destroyMenu()
  }
  e.preventDefault()
  return false
}
