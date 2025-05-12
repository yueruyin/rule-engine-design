/**
 * 拆分canvas功能，减少代码量
 * 改为对象，提供全局注册
 * @author wangyb
 * @createTime 2023-04-25 14:57:17
 */

import RDSetting from '../../ruledesigner_setting'

import { defineUnenumerableProperty } from './common'

// 定义全局对象
const global = window

// 构造方法
const RuleCanvas = function (props) {
  // 自定义构造函数
  this.id = props.id
  this.containerid = props.containerid
  this.width = props.width
  this.height = props.height

  // 定义全局变量
  this.modelType = 'RuleCanvas'
  // 根模型
  this.rootModels = {}
  // 辅助选中矩形框
  this.auxRect = null
  // 当前正在被拖拽的图形
  this.tempTransformerShape = null
  // 图形选中事件
  this.clickTab = null
  // 是否只读
  this.readonly = props.readonly ? props.readonly : false
  // 是否允许移动组件
  this.canMove = true
  // 是否允许删除组件
  this.canDel = true
  // 是否允许修改属性
  this.canModattr = true
  // 缩放默认1.0
  this.scale = 1.0
  this.help_line_weight = RDSetting.GLOBAL_HELP_LINE_WEIGHT
  // 配置属性
  this.attrs = props.attrs ? props.attrs : {}
  this.controlType = props.controlType

  // 辅助线图形
  this.helpBackLinies = []

  // 当前正在被拖拽的图形
  this.tempQuickMenuModel = null

  // 用于创建控件的下标，缺省或新建时从1开始
  this.curIndex = props.curIndex ? props.curIndex : 1

  // 当前画布上所有关联控件的关系
  this.linkGroups = {}

  // 过滤了线和添加按钮的组件
  this.activityFilterList = []
}

/** ==================== 设置对象方法-开始 ==================== */
// 设置画布缩放
RuleCanvas.prototype.setScale = function (scale) {
  // 比例的增量
  let delta = scale - this.scale
  this.scale = scale
  this.help_line_weight += this.help_line_weight * delta
  // 缩放画布大小
  this.attrs['canvasWidth'] += this.attrs['canvasWidth'] * delta
  this.attrs['canvasHeight'] += this.attrs['canvasHeight'] * delta
  this.setStageSize(this.attrs['canvasWidth'], this.attrs['canvasHeight'])
  // 设置所有控件的X，Y，WIDTH，HEIGHT等属性
  for (let i in this.rootModels) {
    if (this.rootModels[i].baseModelType == 'Activity') {
      this.rootModels[i].x += this.rootModels[i].x * delta
      this.rootModels[i].y += this.rootModels[i].y * delta
      this.rootModels[i].width += this.rootModels[i].width * delta
      this.rootModels[i].height += this.rootModels[i].height * delta
      this.rootModels[i].attrs.width = this.rootModels[i].width
      this.rootModels[i].attrs.height = this.rootModels[i].height
      this.rootModels[i].updateByStyle()
      this.rootModels[i].updateLinkLines()
    }
  }
}

// 设置画布图像的大小
RuleCanvas.prototype.setStageSize = function (canvasWidth, canvasHeight) {
  if (this.stage.getAttribute('width') != canvasWidth) {
    this.stage.setAttributeNS(null, 'width', canvasWidth)
  }
  if (this.stage.getAttribute('height') != canvasHeight) {
    this.stage.setAttributeNS(null, 'height', canvasHeight)
  }
  this.width = canvasWidth
  this.height = canvasHeight
  this.canvasWidth = canvasWidth
  this.canvasHeight = canvasHeight
  this.attrs['width'] = this.width
  this.attrs['height'] = this.height
  this.attrs['canvasWidth'] = this.canvasWidth
  this.attrs['canvasHeight'] = this.canvasHeight
}

/**
 * 转JSON对象，序列化
 * @returns JSON字符串
 */
RuleCanvas.prototype.toJSON = function () {
  var json = {
    'id': this.id,
    'containerid': this.containerid,
    'width': this.canvasWidth,
    'height': this.canvasHeight,
    'canvasWidth': this.canvasWidth,
    'canvasHeight': this.canvasHeight,
    'attrs': this.attrs,
    'controlType': this.controlType,
    'modelType': this.modelType,
    'curIndex': this.curIndex,
    'scale': this.scale,
    'help_line_weight': this.help_line_weight
  }
  json.rootModels = {}
  for (let i in this.rootModels) {
    json.rootModels[i] = this.rootModels[i].toJSON()
  }

  json.linkGroups = {}

  for (let i in this.linkGroups) {
    let lg = this.linkGroups[i]
    if (lg == null) {
      continue
    }
    let lineIds = []
    json.linkGroups[i] = { modelId: lg.model.id, type: lg.type, lineIds: [] }
    if (lg.collect) {
      json.linkGroups[i].collect = lg.collect
    }
    for (let j = 0; j < lg['lines'].length; j++) {
      lineIds[lineIds.length] = lg['lines'][j].id
    }
    json.linkGroups[i].lineIds = lineIds
  }
  return json
}
/** ==================== 设置对象方法-结束 ==================== */

/** ==================== 设置静态方法-开始 ==================== */
RuleCanvas.initByJson = function (json) {
  // 初始化本身
  var canvObj = new RuleCanvas(json)
  global.tempSeriDatas[canvObj.id] = canvObj
  global.tempSeriDatas['currentRuleCanvas'] = canvObj

  // 循环，递归初始化rootModels
  let rootModelsObj = null
  if (json.rootModels != null) {
    // 临时变量rootModels
    let rms = {}
    let modelObjJSON, obj
    for (let i in json.rootModels) {
      modelObjJSON = json.rootModels[i]
      if (modelObjJSON.modelType != null && modelObjJSON.modelType != '') {
        // 通过全局绑定的规则图形对象进行初始化
        obj = global[modelObjJSON.modelType].initByJson(modelObjJSON)
        // 给控件定义画布对象，不会序列化
        defineUnenumerableProperty(obj, '__canvas__', canvObj)
        // 绑定画布上的图形
        rms[obj.id] = obj
      }
    }

    if (global.tempExecEval.length > 0) {
      for (let i = 0; i < global.tempExecEval.length; i++) {
        eval(global.tempExecEval[i])
      }
    }
    rootModelsObj = rms
  }

  let linkGroups = {}
  for (let i in json.linkGroups) {
    linkGroups[i] = { model: rootModelsObj[json.linkGroups[i].modelId], type: json.linkGroups[i].type, lines: [] }
    if (json.linkGroups[i].collect) {
      linkGroups[i].collect = json.linkGroups[i].collect
    }
    let lines = []
    for (let j = 0; j < json.linkGroups[i].lineIds.length; j++) {
      lines[lines.length] = rootModelsObj[json.linkGroups[i].lineIds[j]]
    }
    linkGroups[i].lines = lines
  }
  canvObj.linkGroups = linkGroups

  canvObj.init(rootModelsObj)
  for (let i in rootModelsObj) {
    if (rootModelsObj[i].baseModelType == 'Line') {
      var sid = json.rootModels[rootModelsObj[i].id].startLinkGroupId
      var eid = json.rootModels[rootModelsObj[i].id].endLinkGroupId
      rootModelsObj[i].startLinkGroup = canvObj.linkGroups[sid]
      rootModelsObj[i].endLinkGroup = canvObj.linkGroups[eid]
      rootModelsObj[i].updateByStyle()
    }
  }
  global.tempSeriDatas = {}
  global.tempExecEval = []

  return canvObj
}
/** ==================== 设置静态方法-结束 ==================== */

// 全局注册对象
global.RuleCanvas = RuleCanvas
// 允许单独引用对象
export default RuleCanvas
