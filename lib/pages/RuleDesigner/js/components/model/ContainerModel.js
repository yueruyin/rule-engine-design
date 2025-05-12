// ========================================================
// 容器模型，包裹其他模型
// @author wangyb
// @createTime 2023-05-06 15:36:29
// ========================================================

import SvgModel from './SvgModel'
import { defineUnenumerableProperty, extendsClass } from '../modules/common'
import { clearSelectionText, getMousePosition } from '../modules/dom'
import { FIELD_CANVAS, FIELD_CLICK_MODEL, FIELD_MODEL } from '../modules/fields'
import RDSetting from '../../ruledesigner_setting'
import { isArray } from 'lodash'
import { getShapesPosition } from '../modules/shape'
import { triggerModelEvent } from '../modules/event'
import { getEventModel } from '../modules/canvas'
import { RULE_PERMISSION_ENUM } from '../../../config/permission'

const global = window

const ContainerModel = function () {
  // 继承父类的实例属性
  SvgModel.call(this, ...arguments)
  // 定义需要哪些图层
  defineUnenumerableProperty(this, 'layers', [])
  defineUnenumerableProperty(this, 'models', [])
  defineUnenumerableProperty(this, 'currentModel', null)

  this._handleContainerDblclick = this.handleContainerDblclick.bind(this)
  this._dispatchContextMenu = dispatchContextMenu.bind(this)
}

extendsClass(ContainerModel, SvgModel)

const dispatchContextMenu = function (e) {
  let canvas = this
  // 被点击的模型
  let clickModel = this.findClickModel(e)
  let model = clickModel.model || canvas
  triggerModelEvent(model, 'contextmenu', e, model, canvas)
}

ContainerModel.prototype.bindContainerClickEvents = function () {
  // 双击
  const mainShape = this.getMainShape()
  mainShape.addEventListener('dblclick', this._handleContainerDblclick)
  mainShape.addEventListener('contextmenu', this._dispatchContextMenu)
}

ContainerModel.prototype.bindEvents = function () {
  SvgModel.prototype.bindEvents.call(this)
  this.bindContainerClickEvents()
}

ContainerModel.prototype.handleContainerDblclick = function (e) {
  clearSelectionText()
  let clickInfo = this.findClickModel(e)
  triggerModelEvent(clickInfo.model, 'dblclick', e)
}

/**
 * 获取被点击的模型和位置上所有模型的集合
 * @param {*} e 事件
 */
ContainerModel.prototype.findClickModel = function (e) {
  let mousePosition = getMousePosition(this.container, e)
  // 合并下点击的Model，有的模型没有加入到canvas上，会导致问题，后续优化
  // 现在容器中保存模型的思路有点乱，AttachModel不一定在模型上，导致有时候判断不准确
  let eventModel = getEventModel(e)
  let selectableModels = this.getModels().filter(
    (item) => item.isSelectable && item.isSelectable()
  )
  let models = selectableModels.filter(
    (item) => item.isInSelectArea && item.isInSelectArea(mousePosition)
  )
  let model = eventModel
  // 触发事件的模型不是当前容器且不再可选择Model中，或者不允许使用原生事件选中时，从当前位置模型中选择第一个作为被点击的模型
  if (
    (model !== this && selectableModels.indexOf(model) == -1) ||
    (model === this && selectableModels[0] !== this) ||
    (model.isEventSelectable && !model.isEventSelectable())
  ) {
    model = models[0] || this
  }
  return {
    eventModel,
    model,
    models,
    mouseX: mousePosition.x,
    mouseY: mousePosition.y
  }
}

/**
 * 记录被点击的元素
 * @param {*} e 点击事件
 */
ContainerModel.prototype.bindClickInfo = function (e) {
  defineUnenumerableProperty(this, FIELD_CLICK_MODEL, this.findClickModel(e))
}

ContainerModel.prototype.clearClickInfo = function () {
  delete this[FIELD_CLICK_MODEL]
}

ContainerModel.prototype.getClickInfo = function () {
  return this[FIELD_CLICK_MODEL]
}

ContainerModel.prototype.hasClickModel = function () {
  return !!(this[FIELD_CLICK_MODEL] && this[FIELD_CLICK_MODEL].model)
}

ContainerModel.prototype.getClickModel = function () {
  return this[FIELD_CLICK_MODEL] && this[FIELD_CLICK_MODEL].model
}

ContainerModel.prototype.buildShape = function () {
  let containerEle = this.container
  containerEle.innerHTML = ''
  this.stage = global.createSVGElement('svg', this, {
    version: '1.1',
    width: this.width,
    height: this.height,
    tabindex: 1
  })
  this.container = containerEle

  containerEle.appendChild(this.stage)

  this.shapes = [this.stage]

  this.layers.forEach((layer) => {
    this[layer] = global.createSVGElement('g', this, {
      id: this.containerid + '_' + layer
    })
    this.stage.appendChild(this[layer])
  })

  // 将图层加入到画布中,顺序为线，图形，锚点，这样锚点的优先级最高，图形在中间，线在最下面，不遮挡任何图形
  this.stage.appendChild(this.backgroundLayer)
  this.stage.appendChild(this.descLayer)
  this.stage.appendChild(this.lineLayer)
  this.stage.appendChild(this.shapeLayer)
  this.stage.appendChild(this.anchorLayer)

  this.stage.model = this
  this.$el = this.stage
  // 绑定事件
  this.bindEvents()
}

ContainerModel.prototype.addModel = function (models, autoSelect = false) {
  if (!isArray(models)) {
    models = [models]
  }
  models.sort((a, b) => a.layerIndex - b.layerIndex)
  models.forEach((model) => {
    // 给子模型绑定容器对象
    defineUnenumerableProperty(model, FIELD_CANVAS, this)
    // 绑定模型的getter方法
    model.getCanvas = function () {
      return this[FIELD_CANVAS]
    }
    model.setCanvas = function (newVal) {
      this[FIELD_CANVAS] = newVal
    }
    let mainShap = model.getMainShape()
    if (!mainShap) {
      // 创建图形
      model.buildShape(this)
      model.rebuildAnchors()
      mainShap = model.getMainShape()
    }
    // 加入后选中
    if (autoSelect) {
      // 选中新复制的控件
      // model.makeSelection()
      this.makeSelection(model)
    }
    // 绑定数据, 应该移除，在最后序列化时生成
    // todo 这儿是不对的，容器不应该知道具体实现类
    if (
      model instanceof global.RuleActivity ||
      model instanceof global.RDLine
    ) {
      this.rootModels[model.id] = model
    }
    this.models.push(model)
    // 根据不同类型推入到不同的图层，应该要允许模型配置
    this.appendChild(model, model.layer)
    // 更新样式
    model.render()
  })
}

ContainerModel.prototype.getModels = function () {
  return this.models
}

ContainerModel.prototype.moveModels = function (
  models,
  position,
  autoSelect = false
) {
  if (!position) {
    return
  }
  if (!isArray(models)) {
    models = [models]
  }
  let outRectPosition = getShapesPosition(...models)
  // 给每个图形都移动位置
  models.forEach((model) => {
    // 取得原始图像和外接矩形的坐标差
    let deltaX = model.x - outRectPosition.x
    let deltaY = model.y - outRectPosition.y
    model.x = position.x + deltaX
    model.y = position.y + deltaY
    // 选中新复制的控件
    // model.makeSelection(autoSelect)
    // 更新图形
    model.updateByStyle()
    // 更新连线
    model.updateLinkLines && model.updateLinkLines()
  })
  if (autoSelect) {
    this.auxRect.setModels(models)
    this.auxRect.show(models.length > 1)
  }
}

ContainerModel.prototype.cloneModels = function (
  models,
  position,
  beforeClone,
  autoSelect = true
) {
  if (!isArray(models)) {
    models = [models]
  }
  let outRectPosition = getShapesPosition(...models)
  if (!position) {
    position = {
      x: outRectPosition.x + 100,
      y: outRectPosition.y + 100
    }
  }
  let newModels = models.map((model) => {
    if (beforeClone && !beforeClone(model)) {
      return
    }
    // 重新生成ID
    let newId = 'pd_lbl_' + this.curIndex
    // 取得原始图像和外接矩形的坐标差
    let deltaX = model.x - outRectPosition.x
    let deltaY = model.y - outRectPosition.y
    this.curIndex++
    let newModel = model.clone({
      id: newId,
      code: newId,
      attrs: {
        id: newId,
        code: newId
      },
      x: position.x + deltaX,
      y: position.y + deltaY
    })
    this.addModel(newModel, autoSelect)
    return newModel
  })
  if (autoSelect) {
    this.auxRect.setModels(newModels)
    this.auxRect.show(newModels.length > 1)
  }
  return newModels
}

// 聚焦model
ContainerModel.prototype.focusModel = function (model) {
  if (this === model || !model) {
    return
  }
  let viewPosition = {
    x: +this.container.scrollLeft || 0,
    y: +this.container.scrollTop || 0,
    width: this.container.offsetWidth,
    height: this.container.offsetHeight
  }
  let modelPosition = {
    x: model.x,
    y: model.y,
    width: model.width,
    height: model.height
  }
  this.container.scrollLeft =
    this.container.scrollLeft -
    viewPosition.x -
    viewPosition.width / 2 +
    modelPosition.x +
    modelPosition.width / 2
  this.container.scrollTop =
    this.container.scrollTop -
    viewPosition.y -
    viewPosition.height / 2 +
    modelPosition.y +
    modelPosition.height / 2
}

// 取得所有选中控件
ContainerModel.prototype.selectModels = function (models) {
  if (!isArray(models)) {
    models = [models]
  }
  models.forEach((model) => model.makeSelection())
  // 设置框选
  if (!this.auxRect) {
    this.createAuxRect()
  }
  this.auxRect.setModels(models)
  this.auxRect.show(models.length > 1)
}

// 取得所有选中控件
ContainerModel.prototype.getSelectedModels = function () {
  let models = []
  let temp
  for (let i in this.rootModels) {
    temp = this.rootModels[i]
    if (temp.selected) {
      models.push(temp)
    }
  }
  return models
}

ContainerModel.prototype.getModel = function (modelId) {
  return this.models.find((item) => item.id === modelId)
}

ContainerModel.prototype.removeModelById = function (modelId) {
  this.removeModel(this.getModel(modelId))
}

ContainerModel.prototype.removeModel = function (models, silent = false) {
  if (!isArray(models)) {
    models = [models]
  }
  models = models.filter((item) => !!item)
  // 统一的删除
  models.forEach((model) => {
    if (model instanceof ContainerModel) {
      this.removeModel(model.getModels(), true)
    }
    model.remove(silent)
    delete this.rootModels[model.id]
    this.models.remove(model)
  })

  if (!silent) {
    let removedHook = global[RDSetting.GLOBAL_REMOVE_AFTER_LISTENER]
    removedHook && removedHook(models)
  }
}

ContainerModel.prototype.includeModel = function (model) {
  return this.models && this.models.includes(model)
}

ContainerModel.prototype.createDeleteButton = function () {
  if (!RDSetting.GLOBAL_REMOVE_BTN && !this.readonly) {
    return
  }
  if (this.__delete_btn__) {
    this.deleteDeleteButton()
  }
  // 初始化删除按钮
  this.__delete_btn__ = global.createSVGElement('image', this, {
    x: 0,
    y: 0,
    'xlink:href': RDSetting.ICOS['icon-delete'],
    width: 14,
    height: 14,
    id: 'shape_remove_btn'
  })
  this.__delete_btn__.hide()
  const me = this
  // 阻止容器的点击效果
  this.__delete_btn__.addEventListener('mousedown', function (e) {
    e.stopPropagation()
  })
  this.__delete_btn__.addEventListener('click', function (e) {
    e.stopPropagation()
    const model = this[FIELD_MODEL]
    if (model && !me.readonly && me.canDel) {
      me.removeModel(model)
      me.clearClickInfo()
      me.hideButtons()
      me.clickTab(me)
    }
  })

  this.stage.appendChild(this.__delete_btn__)
}

ContainerModel.prototype.deleteDeleteButton = function (model) {
  if (!this.__delete_btn__) {
    return
  }
  this.__delete_btn__.remove()
  delete this.__delete_btn__
}

ContainerModel.prototype.showDeleteButton = function (model) {
  // 判断节点是否允许删除, 删除
  if (!model.checkPermission(RULE_PERMISSION_ENUM.DELETE)) {
    return
  }
  if (!this.__delete_btn__) {
    this.createDeleteButton()
  }
  // 更新位置
  // 移动删除小图标的位置
  this.__delete_btn__.setPosition({
    x: model.x + parseInt(model.width) - 18,
    y: model.y + 4
  })
  this.__delete_btn__.show()
  defineUnenumerableProperty(this.__delete_btn__, FIELD_MODEL, model)
}

ContainerModel.prototype.hideDeleteButton = function () {
  this.__delete_btn__ && this.__delete_btn__.hide()
}

ContainerModel.prototype.setMousePosition = function (p) {
  this.__mouse_position__ = p || { x: 0, y: 0 }
  global.gMouseOffsetX = this.__mouse_position__.x
  global.gMouseOffsetY = this.__mouse_position__.y
}

ContainerModel.prototype.getMousePosition = function (p) {
  return this.__mouse_position__ || { x: 0, y: 0 }
}

ContainerModel.prototype.render = function () {
  SvgModel.prototype.render.call(this)
  this.models.forEach((item) => {
    item.render()
  })
}

ContainerModel.prototype.renderDelay = function (renderChildren = true) {
  SvgModel.prototype.render.call(this)
  if (renderChildren) {
    this.models.forEach((item) => {
      item.renderDelay()
    })
  }
}

ContainerModel.prototype.bringToFront = function (...models) {
  // 重新插入到当前容器的最后
  models.forEach((model) => {
    this.appendChild(model, model.layer)
  })
}

ContainerModel.prototype.bringToBehind = function (...models) {
  // 插入到最前面的位置
  models.forEach((model) => {
    this.insertChild(model, 0, model.layer)
  })
}

export default ContainerModel
