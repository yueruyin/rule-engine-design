/**
 * 活动，是所有矩形类控件的基础，封装了大量的基础操作代码，其他的控件在大体操作逻辑上都和它保持一致，只是图形展示略微不同
 */
import RDSetting from '../ruledesigner_setting'
import { create, defineUnenumerableProperty, defineOptionObserveFields, extendsClass, extendsClasses, isEmpty, toBorderOptions } from './modules/common'
import { buildDiamondShape, buildRectShape, buildTextRectShape, updateDiamondShapeByStyle, updateRectShapeByStyle, updateTextRectShapeByStyle } from './modules/shape'
import DraggableModel from './model/DraggableModel'
import LinkableModel from './model/LinkableModel'
import SvgModel from './model/SvgModel'
import SelectableModel from './model/SelectableModel'

import bus from '../bus'
import { ModelStatusEnum, ModelStatusPostfixMap, ModelStatusPrefixMap } from './constants/status'

import { cloneDeep, upperFirst } from 'lodash'
import { DiamondShapeConfig, RectShapeConfig, RectSideLineSeq } from './constants/shape'
import { BorderTypeDashArrayMap } from './constants/border'
import { openDebuggerConditionDialog } from './modules/debugger'
import { onContextMenu } from './modules/menus'

const global = window

// 基础活动的类，封装了一些基本方法
const RuleActivity = function (rd, props, mode) {
  // 继承父类的实例参数
  SvgModel.call(this, props)
  DraggableModel.call(this, rd)
  SelectableModel.call(this)
  LinkableModel.call(this)

  // 设置序列化的属性
  this.setSerializableFields(['id', 'code', 'type', 'text', 'desc', 'x', 'y', 'width', 'height', 'rotation', 'scaleX', 'scaleY', 'modelType', 'baseModelType', 'attrs', 'controlType', 'bindField', 'feed', 'autoScaleFill', 'align', 'valign', 'together', 'layer', 'layerIndex', 'debugger'])

  // 图形模式，支持Text, Node, Diamond, 默认Node
  defineUnenumerableProperty(this, 'mode', mode || props.mode || 'Node')

  let defaultConfig = RectShapeConfig
  if (this.mode === 'Diamond') {
    defaultConfig = DiamondShapeConfig
  }
  // 设置默认属性
  this.$defaultOptions = defaultConfig

  // 设置border属性
  this.setBorderOptions(props)
  this.setBorderOptions(props, ModelStatusEnum.Selected)

  // this.id = props.id

  // this.x = props.x ? props.x : 0
  // this.y = props.y ? props.y : 0
  // this.width = props.width ? props.width : 0
  // this.height = props.height ? props.height : 0

  // 是否允许debugger
  this.debuggable = props.debuggable !== undefined ? !!props.debuggable : true

  // 设置菜单
  this.menus = [
    {
      vif: function (model) { return !!model.debuggable && !model.debugger },
      command: 'addDebuggerPoint',
      label: '添加断点',
      icon: ''
    },
    {
      vif: function (model) { return !!model.debuggable && !!model.debugger },
      command: 'delDebuggerPoint',
      label: '删除断点',
      icon: ''
    },
    {
      vif: function (model) { return !!model.debuggable && !!model.debugger },
      command: 'setDebuggerCondition',
      label: '设置断点条件',
      icon: ''
    },
    {
      vif: function (model) { return !!model.debuggable && !!model.getOption('debuggerCondition') },
      command: 'delDebuggerCondition',
      label: '删除断点条件',
      icon: ''
    },
    {
      command: 'bringToFront',
      target: 'container',
      label: '置于顶层',
      icon: ''
    },
    {
      command: 'bringToBehind',
      target: 'container',
      label: '置于底层',
      icon: ''
    }
  ]
  // 所属图层和在图层中的索引
  this.layer = 'shapeLayer'

  // 是否选中为false
  this.selected = false

  this.modelType = 'Activity'
  this.baseModelType = 'Activity'

  defineUnenumerableProperty(this, 'rd', rd)

  // 当前的动画效果
  this.currentPlayAnim = null
  // 是否允许删除
  defineOptionObserveFields(this, 'debugger', 'layerIndex', { field: 'canDel', defaultValue: RDSetting.DEFAULT_ACTIVITY_CANDEL })
}

extendsClass(RuleActivity, SvgModel)
extendsClasses(RuleActivity, DraggableModel, SelectableModel, LinkableModel)

// ============================ 类方法 Start ============================

/**
  * 编辑text取消事件
  */
RuleActivity.prototype.editTextCancel = function (input) {
  input.style.display = 'none'
  global.editing = false
  global.tempEditingModel = null
}

/**
 * 编辑text编辑成功事件
 */
RuleActivity.prototype.editTextOK = function (input) {
  global.tempEditingModel.rd.setAttr({
    'code': 'text',
    'value': input.value
  })
  global.tempEditingModel.updateByStyle()

  input.style.display = 'none'
  global.editing = false

  global.tempEditingModel.rd.clickTab(global.tempEditingModel, true)
  global.tempEditingModel = null
}

// 弹出绑定框
RuleActivity.prototype.showEditTextEvt = function (e, model) {
  // 当前正在被编辑的模型
  if (model) {
    global.tempEditingModel = model
  } else {
    global.tempEditingModel = this.model
  }

  if (!global.tempEditingModel.rd.readonly && global.tempEditingModel.rd.canModattr) {
    var input = document.getElementById('pdcanvas_edit_input')
    if (input == null) {
      input = document.createElement('textarea')
      input.setAttribute('id', 'pdcanvas_edit_input')

      input.style.zIndex = 9999
      input.style.borderWidth = 0
      input.style.position = 'absolute'
      input.onblur = function () {
        if (global.tempEditingModel) {
          global.tempEditingModel.editTextOK(input)
        }
      }
      input.onkeypress = function (e) {
        // 回车
        if (e.keyCode == 13) {
          if (global.tempEditingModel) {
            global.tempEditingModel.editTextOK(input)
          }
        }
      }
      input.onkeydown = function (e) {
        // esc退出
        if (e.keyCode == 27) {
          if (global.tempEditingModel) {
            global.tempEditingModel.editTextCancel(input)
          }
        }
      }
      document.body.appendChild(input)
    };

    var containerEle = document.getElementById(global.tempEditingModel.rd.containerid)

    input.style.display = ''
    var editEle = global.tempEditingModel.bindEditTextShape
    input.style.width = ''
    input.style.height = ''
    input.style.width = (parseInt(editEle.getAttribute('width')) - 2) + 'px'
    input.style.height = (parseInt(editEle.getAttribute('height') - 2)) + 'px'
    if (input.style.width == '') {
      input.style.width = editEle.model.width - 2 + 'px'
    }
    if (input.style.height == '') {
      input.style.height = editEle.model.height - 2 + 'px'
    }
    input.style.left = (global.tempEditingModel.rd.getOffsetLeft(containerEle) + global.tempEditingModel.x + 2 - containerEle.scrollLeft) + 'px'
    input.style.top = (global.tempEditingModel.rd.getOffsetTop(containerEle) + global.tempEditingModel.y + 2 - containerEle.scrollTop) + 'px'

    input.style.fontSize = editEle.model.fontSize + 'px'
    input.value = editEle.model.text
    input.focus()
    input.selectionStart = 0 // 选中开始位置
    input.selectionEnd = input.value.length // 获取输入框里的长度。
    // 设置全局编辑属性，使快捷键不生效
    global.editing = true
  }
}

/**
 * 创建并绑定edittext
 */
RuleActivity.prototype.bindEditText = function (shape) {
  this.bindEditTextShape = shape
}

/**
 * 为图形添加事件监听
 */
RuleActivity.prototype.bindShapeEventListener = function () {
}

// 删除控件，移除图形
RuleActivity.prototype.destoryModelAndShapes = function () {
  // 移除图形
  this.shapes.forEach(item => item.remove())
}

/**
 * 选中节点
 */
RuleActivity.prototype.makeSelection = function () {
  // 选中状态为true
  this.selected = true
  this.addStatus(ModelStatusEnum.Selected)
}

/**
 * 清空选中状态
 */
RuleActivity.prototype.clearSelection = function () {
  this.selected = false
  this.removeStatus(ModelStatusEnum.Selected)
}

/**
   * 更新填充矩形
   */
RuleActivity.prototype.updateFillRect = function () {
  let bgEl = this.$refs.bg
  bgEl.setSize(this.getOptions())
  bgEl.setAttribute('fill', this.getStatusOption('fill'))
  if (this.$refs.header) {
    this.$refs.header.setAttribute('fill', this.getStatusOption('headerFill'))
  }
}

/**
 * 更新边框
 */
RuleActivity.prototype.updateBorders = function () {
  // 取得字体，边框，填充的配置信息
  let borderConfig = this.getBorderStatusOption(RectSideLineSeq[0])
  let borders = [this.$refs.borderTop, this.$refs.borderRight, this.$refs.borderBottom, this.$refs.borderLeft]
  borders.forEach(border => {
    border.setAttribute('stroke-width', borderConfig.width)
    border.setAttribute('stroke', borderConfig.color)
    border.setAttribute('stroke-dasharray', borderConfig.dash)
  })
}

/**
 * 根据属性更新基本样式
 */
RuleActivity.prototype.updateByStyle = function () {
  const { mode, shapes } = this
  switch (mode) {
    case 'Node':
      updateRectShapeByStyle(this, shapes)
      break
    case 'Diamond':
      updateDiamondShapeByStyle(this, shapes)
      break
    default:
      updateTextRectShapeByStyle(this, shapes)
      break
  }
}

// 普通节点的创建图形方法
RuleActivity.prototype.buildShape = function () {
  // 配置和实例应该分开，现在是一样的
  const { mode } = this
  switch (mode) {
    case 'Node':
      this.shapes = buildRectShape(this, this.$options)
      break
    case 'Diamond':
      this.shapes = buildDiamondShape(this, this.$options)
      break
    default:
      this.shapes = buildTextRectShape(this, this.$options)
      break
  }
  // 绑定事件
  this.bindShapeEventListener()
  // 更新样式
  this.updateShape()
}

// 更新图形
RuleActivity.prototype.updateShape = function () {
  this.updateByStyle()
}

RuleActivity.prototype.rebuildAnchors = function (useModel) {
  // 为节点追加事件
  this.bindShapeEventListener()
}

RuleActivity.prototype.getCanvas = function () {
  return this.__canvas__
}

RuleActivity.prototype.setPosition = function (x, y) {
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }
  this.x = x
  this.y = y
}

RuleActivity.prototype.handleDragStart = function (e) {
  // 隐藏连线
  const canvas = this.getCanvas()
  canvas.hideStartLineBar()
  canvas.hideEndLineBar()
}

RuleActivity.prototype.remove = function (e) {
  LinkableModel.prototype.remove.call(this)
  // 触发vue全局事件
  bus.$emit('modelRemove', this)
}

/**
 * 转换为JSON的序列化方法
 */
RuleActivity.prototype.toJSON = function () {
  var json = this.getBaseJSON()
  if (this.border != RDSetting.DEFAULT_ACTIVITY_BORDER) {
    json.border = this.border
  }
  if (this.font != RDSetting.DEFAULT_ACTIVITY_FONT) {
    json.font = this.font
  }
  if (this.fill != RDSetting.DEFAULT_ACTIVITY_FILL) {
    json.fill = this.fill
  }
  return json
}

RuleActivity.prototype.addDebuggerPoint = function () {
  this.setOption('debugger', true)
  this.renderDelay()
  // bus.$emit('modelChange', this)
}

RuleActivity.prototype.delDebuggerPoint = function () {
  this.setOption('debugger', false)
  this.removeOption('debuggerCondition')
  this.renderDelay()
  // bus.$emit('modelChange', this)
}

RuleActivity.prototype.setDebuggerCondition = function ({ event, menuPosition }) {
  let position = menuPosition || { x: event?.clientX, y: event?.clientY }
  // 异步打开，避免当前的点击事件触发弹框关闭
  setTimeout(() => {
    openDebuggerConditionDialog(this, position)
  })
}

RuleActivity.prototype.delDebuggerCondition = function () {
  this.removeOption('debuggerCondition')
  this.renderDelay()
}

RuleActivity.prototype.setBorderOptions = function (options = {}, status) {
  // 设置边
  let prefix = ModelStatusPrefixMap[status] || ''
  let postfix = ModelStatusPostfixMap[status] || ''
  let border = options[prefix + 'border' + postfix]
  let borderWidth = options[prefix + 'borderWidth' + postfix]
  let borderType = options[prefix + 'borderType' + postfix]
  let borderColor = options[prefix + 'borderColor' + postfix]
  let config = toBorderOptions(border)
  if (config) {
    this.$options.border = config
    this.setBorderWidth(config.width, prefix + 'borderWidth' + postfix)
    this.setBorderType(config.type, prefix + 'borderType' + postfix)
    this.setBorderColor(config.color, prefix + 'borderColor' + postfix)
  }
  // 设置边宽
  this.setBorderWidth(borderWidth, prefix + 'borderWidth' + postfix)
  // 设置边类型
  this.setBorderType(borderType, prefix + 'borderType' + postfix)
  // 设置边颜色
  this.setBorderColor(borderColor, prefix + 'borderColor' + postfix)
}

RuleActivity.prototype.setBorderOption = function ({ width, type, color }) {
  this.setBorderWidth(width)
  this.setBorderType(type)
  this.setBorderColor(color)
  this.renderDelay()
}

RuleActivity.prototype.setBorderWidth = function (borderWidth, field = 'borderWidth') {
  if (borderWidth === undefined) {
    return
  }
  this.$options[field] = borderWidth
  this.renderDelay()
}

RuleActivity.prototype.setBorderType = function (borderType, field = 'borderType') {
  // 无效设置
  if (borderType === undefined) {
    return
  }
  this.$options[field] = borderType
  this.renderDelay()
}

RuleActivity.prototype.setBorderColor = function (borderColor, field = 'borderColor') {
  // 无效设置
  if (borderColor === undefined) {
    return
  }
  this.$options[field] = borderColor
  this.renderDelay()
}

RuleActivity.prototype.getBorderOption = function (side) {
  side = side ? upperFirst(side) : ''
  let width = this.getOption(`border${side}Width`)
  if (isEmpty(width)) {
    width = this.getOption(`borderWidth`)
  }
  let type = this.getOption(`border${side}Type`)
  if (isEmpty(type)) {
    type = this.getOption(`borderType`)
  }
  let color = this.getOption(`border${side}Color`)
  if (isEmpty(color)) {
    color = this.getOption(`borderColor`)
  }
  return {
    width,
    type,
    dash: BorderTypeDashArrayMap[type],
    color
  }
}

RuleActivity.prototype.getBorderStatusOption = function (side, status) {
  side = side ? upperFirst(side) : ''
  let width = this.getStatusOption(`border${side}Width`, status)
  if (isEmpty(width)) {
    width = this.getStatusOption(`borderWidth`, status)
  }
  let type = this.getStatusOption(`border${side}Type`, status)
  if (isEmpty(type)) {
    type = this.getStatusOption(`borderType`, status)
  }
  let color = this.getStatusOption(`border${side}Color`, status)
  if (isEmpty(color)) {
    color = this.getStatusOption(`borderColor`, status)
  }
  return {
    width,
    type,
    dash: BorderTypeDashArrayMap[type],
    color
  }
}

RuleActivity.prototype.getTitle = function () {
  let options = this.options
  let attrs = options.attrs || {}
  return attrs.name || options.title || ''
}

RuleActivity.prototype.getText = function () {
  return this.options.text || ''
}
// ============================ 类方法 Start ============================

// ============================ 静态方法 Start ============================
// 通过JSON初始化
RuleActivity.initByJson = function (json) {
  let rd = global.tempSeriDatas['currentRuleCanvas']
  let obj = create(global[json.modelType], rd, json)
  global.tempSeriDatas[obj.id] = obj
  return obj
}

// ============================ 静态方法 Start ============================

global.Activity = RuleActivity
global.RuleActivity = RuleActivity

export default RuleActivity
