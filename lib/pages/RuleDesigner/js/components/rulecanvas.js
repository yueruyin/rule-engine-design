/**
 * 规则画布，提供了整个规则设计器以及引擎的画布功能，所有的拖拉拽布局都在这个画布上执行
 * 画布封装了大量通用方法，包括保存等
 * 画布提供了5个子图层，从下往上顺序分别为，最上层优先级最高
 *      backgroundLayer：背景图层，画布的底层图层，用来绘制画布和设置纸张
 *      descLayer：描述图层，所有的套打背景图放在这个图层
 *      lineLayer：线图层
 *      shapeLayer：图形图层，所有的标签，字段等放在这个图层
 *      anchorLayer：锚点图层，在规则设计器中用来存放辅助的外接矩阵矩形，水印
 */
import RDSetting from '../ruledesigner_setting'
import {
  defineUnenumerableProperty,
  extendsClass,
  extendsClasses
} from './modules/common'
import { getOffsetTop, getOffsetLeft, clearSelectionText } from './modules/dom'
import { getShapesPosition } from './modules/shape'
import RuleLineBar from './ruleLineBar'
import DragContainerModel from './model/DragContainerModel'
import DraggableModel from './model/DraggableModel'
import SelectableModel from './model/SelectableModel'
import { FIELD_CANVAS } from './modules/fields'
import ContainerModel from './model/ContainerModel'
import { isArray, sortBy } from 'lodash'
import { autoDecrease, autoIncrease } from './modules/scroll'
import RuleBegin from './rulebegin'

import bus from '../bus'
import { ModelStatusEnum } from './constants/status'
import RDLine from './ruleline'
import RuleActivity from './RuleActivity'
import { svgToImage } from './modules/canvas'

import { RULE_PERMISSION_ENUM } from '../../config/permission'

const global = window

// 规则设计器画布总对象
const RuleCanvas = function (props) {
  // 调用父类构造方法
  DragContainerModel.call(this, props)
  // 继承实例数据
  DraggableModel.call(this, this)
  SelectableModel.call(this)

  // 定义图层
  this.layers = [
    'backgroundLayer',
    'descLayer',
    'lineLayer',
    'shapeLayer',
    'anchorLayer'
  ]

  // 拖拽时不移动位置
  this.setDraggingMove(false)
  // 拖拽时不需要辅助线
  this.setShowDraggingHelpLine(false)
  // 禁止拖拽时滚动
  this.setDraggingScroll(true)
  // 禁止拖拽时自动扩展
  this.setDraggingAutoIncrease(false)

  global.canvas = this

  this.id = props.id
  this.container = props.container
  this.canvasWidth = props.canvasWidth || 800
  this.canvasHeight = props.canvasHeight || 600
  this.width = props.width || this.canvasWidth
  this.height = props.height || this.canvasHeight

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
  this.scale = 1
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

  // 舞台对象
  this.stage = null
  // 背景层图形图层，线图层，锚点图层
  this.backgroundLayer = null
  this.shapeLayer = null
  this.lineLayer = null
  this.descLayer = null
  this.anchorLayer = null

  // 画布指向自己，与其他元素保持一致，方便操作
  defineUnenumerableProperty(this, FIELD_CANVAS, this)

  // 绑定快捷键
  this.bindShortcuts()

  // 增加渲染队列，将图形的重绘交给画布调度，采用异步方式进行访问
  // 队列中不会重复添加模型
  // 运行添加图层，取出图层时，将展开为图层包含的模型
  // 线段将会统一处理，并且会放在所有模型后重绘
  defineUnenumerableProperty(this, 'renderQueue', [])
  // 避免重复启动
  defineUnenumerableProperty(this, 'renderQueueStarted', false)
  // 循环终止标志
  defineUnenumerableProperty(this, 'renderQueueStoped', false)
  // 启动绘制队列
  this.beginRenderLoop()

  // 是否开启权限, 默认开启
  defineUnenumerableProperty(this, '__permission_enable__', false)
}
// 继承
extendsClass(RuleCanvas, DragContainerModel)
// 混入抽象类，实现类似于多继承的能力
extendsClasses(RuleCanvas, DraggableModel, SelectableModel)

// ============================ 类方法 Start ============================

RuleCanvas.prototype.setPermissionEnable = function (enable = true) {
  this.__permission_enable__ = enable
}

RuleCanvas.prototype.isPermissionEnable = function () {
  return this.__permission_enable__
}

RuleCanvas.prototype.getCanvas = function () {
  return this
}

RuleCanvas.prototype.focus = function () {
  this.$el?.focus()
}

RuleCanvas.prototype.beginRenderLoop = function () {
  if (this.renderQueueStarted) {
    return
  }
  let _loop = this.renderLoop.bind(this)
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(_loop)
  } else {
    setTimeout(_loop, 1000 / 60)
  }
  this.renderQueueStarted = true
}

// 绘制循环，需要想办法把每次绘制的时长控制在30ms以内，即30贞以上
RuleCanvas.prototype.renderLoop = function () {
  // 本次循环已结束
  this.renderQueueStarted = false
  // 对当前队列进行排序, 把线放到后面去，本队列的内容就是本次需要重绘的图形
  let queue = sortBy(this.renderQueue, (a, b) => {
    let aIsLine = a instanceof RDLine
    let bIsLine = a instanceof RDLine
    if (aIsLine && bIsLine) {
      return 0
    }
    if (aIsLine) {
      return 1
    }
    if (bIsLine) {
      return -1
    }
    return 0
  })
  // 清空队列，让下一帧的内容进入
  this.renderQueue = []
  // 绘制本帧的图形
  while (queue.length) {
    // 从队列中取出模型
    let model = queue.shift()
    // 模型重绘
    model && model.render()
  }
  // 进行下次重绘
  this.beginRenderLoop()
}

RuleCanvas.prototype.addRenderQueue = function (model) {
  if (!model) {
    return
  }
  // 如果是图层则处理为模型数组后加入队列
  // 避免重复加入队列
  if (this.renderQueue.indexOf(model) === -1) {
    this.renderQueue.push(model)
  }
}

// 设置画布缩放
RuleCanvas.prototype.setScale = function (scale) {
  scale = Math.max(+scale, 0)
  this.scale = +scale || 1
  // 最小0.1，最大2
  this.scale = Math.min(this.scale, 0.1)
  this.scale = Math.max(this.scale, 2)
  this.renderDelay(false)
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

// todo 动态更新画布大小，先取框选所有节点的大小加一个padding，与外部容器比大小，取最大值
RuleCanvas.prototype.autoSize = function () {
  // 判断是否需要自减
  autoDecrease(this)
}

// 执行绘图操作，或者将本对象推送入队列
RuleCanvas.prototype.drawOrPush = function (obj) {
  return
}

/**
 * 设置当前画布是否允许移动控件
 */
RuleCanvas.prototype.setCanMove = function (canMove) {
  this.canMove = canMove
  this.changeShapeCanMove(this.stage, this.canMove)
}
/**
 * 设置当前画布是否允许删除控件
 */
RuleCanvas.prototype.setCanDel = function (canDel) {
  this.canDel = canDel
}
/**
 * 设置当前画布是否允许修改控件属性
 */
RuleCanvas.prototype.setCanModAttr = function (canModattr) {
  this.canModattr = canModattr
}

/**
 * 设置当前画布是否只读，每次调用都会切换画布的状态
 */
RuleCanvas.prototype.setReadOnly = function (readonly) {
  this.readonly = readonly
}

// 递归修改所有控件的
RuleCanvas.prototype.changeShapeCanMove = function (shape, canMove) {
  shape.canMove = canMove
  var children = shape.children
  for (var i = 0; i < children.length; i++) {
    this.changeShapeCanMove(children[i], canMove)
  }
}

// 新增控件
RuleCanvas.prototype.addControl = function (models) {
  for (var i = 0; i < models.length; i++) {
    var model = models[i]
    this.rootModels[model.id] = model
    model.buildShape()
  }
  // 重绘
  this.drawOrPush(this.backgroundLayer)
  this.drawOrPush(this.shapeLayer)
  this.drawOrPush(this.anchorLayer)
  this.drawOrPush(this.lineLayer)
  this.drawOrPush(this.descLayer)
}

// 删除控件
RuleCanvas.prototype.removeControl = function (model, subremove) {
  this.removeModel(model, subremove)
}

RuleCanvas.prototype.removeModel = function (models, slient) {
  if (!isArray(models)) {
    models = [models]
  }
  ContainerModel.prototype.removeModel.call(this, models, slient)
  // 如果是特殊组件, 在models外有单独绑定的模型，手动清理关联
  let hasSelectedModel = false
  models.forEach((model) => {
    if (model === this.auxRect) {
      this.auxRect = null
    } else if (model === this.startLineBar) {
      this.startLineBar = null
    } else if (model === this.endLineBar) {
      this.endLineBar = null
    } else if (model.isSelected && model.isSelected()) {
      hasSelectedModel = true
    }
  })
  if (hasSelectedModel && this.auxRect) {
    let selectedModels = this.getSelectedModels()
    this.auxRect.setModels(selectedModels)
    this.auxRect.show(selectedModels.length > 1)
  }
}

// 删除选中的控件
RuleCanvas.prototype.removeSelectedControl = function () {
  let models = this.getSelectedModels()
  models.forEach((model) => {
    // 删除线时，判断被连接的节点是否有编辑权限，没有则不能删除
    // if (model instanceof RDLine) {
    //   if (
    //     !model
    //       .getStartLinkModel()
    //       ?.checkPermission(RULE_PERMISSION_ENUM.MODIFY) ||
    //     !model.getEndLinkModel()?.checkPermission(RULE_PERMISSION_ENUM.MODIFY)
    //   ) {
    //     console.log(`节点[${model.id}]不允许删除`)
    //     model.select(false)
    //     model.renderDelay()
    //     return
    //   }
    // }
    // 判断节点是否允许删除
    if (!model.checkPermission(RULE_PERMISSION_ENUM.DELETE)) {
      console.log(`节点[${model.attrs?.code}]不允许删除`)
      model.select(false)
      model.renderDelay()
      return
    }
    this.removeControl(model)
  })
  this.hideButtons()
  // 隐藏框选
  this.auxRect.hide()
  this.clickTab(this)
  // 清空复制
  this.tempTransformerShape = null
}

// 将图片转换为base64编码
RuleCanvas.prototype.image2Base64 = function (img) {
  var canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  var ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width, img.height)
  var dataURL = canvas.toDataURL('image/png')
  return dataURL
}

/**
 * 从右边调整控件的大小
 * 该方法在拖拽过程中调用，支持多个控件同时改变大小
 */
RuleCanvas.prototype.changeSizeToRight = function (e) {
  let rect = this.auxRect.getBBox()
  let changeWidth =
    e.clientX -
    this.getOffsetLeft(this.container) +
    this.container.scrollLeft -
    rect.x -
    rect.width
  var mod = changeWidth % this.help_line_weight
  if (mod > this.help_line_weight / 2) {
    changeWidth = changeWidth + (this.help_line_weight - mod)
  } else {
    changeWidth = changeWidth - mod
  }
  if (changeWidth != 0) {
    let controls = this.getSelectedModels()
    // 执行校验，如果拖拽后小于了5，则不允许
    for (let i = 0; i < controls.length; i++) {
      if (controls[i].width + changeWidth < 5) {
        return
      }
    }

    for (let i = 0; i < controls.length; i++) {
      controls[i].width = controls[i].width + changeWidth
      controls[i].attrs.width = controls[i].attrs.width + changeWidth
      controls[i].updateShape()
    }
    let outRect = this.getSelectedShapesOutRect()
    if (outRect) {
      this.auxRect.getMainShape().setSize({
        width: outRect.x1 - outRect.x + 4,
        height: outRect.y1 - outRect.y + 4
      })
      this.auxRect.getMainShape().setPosition({
        x: outRect.x - 2,
        y: outRect.y - 2
      })
    }
  }
}

/**
 * 从左边调整控件的大小
 * 该方法在拖拽过程中调用，支持多个控件同时改变大小
 */
RuleCanvas.prototype.changeSizeToLeft = function (e) {
  let rect = this.auxRect.getBBox()
  let changeWidth =
    e.clientX -
    this.getOffsetLeft(this.container) +
    this.container.scrollLeft -
    rect.x
  var mod = changeWidth % this.help_line_weight
  if (mod > this.help_line_weight / 2) {
    changeWidth = changeWidth + (this.help_line_weight - mod)
  } else {
    changeWidth = changeWidth - mod
  }
  if (changeWidth != 0) {
    let controls = this.getSelectedModels()
    // 执行校验，如果拖拽后小于了5，则不允许
    for (let i = 0; i < controls.length; i++) {
      if (controls[i].width - changeWidth < 5) {
        return
      }
    }

    for (let i = 0; i < controls.length; i++) {
      controls[i].width = controls[i].width - changeWidth
      controls[i].attrs.width = controls[i].attrs.width - changeWidth
      controls[i].x = controls[i].x + changeWidth
      controls[i].attrs.x = controls[i].attrs.x + changeWidth
      controls[i].updateShape()
    }
    let outRect = this.getSelectedShapesOutRect()
    if (outRect) {
      this.auxRect.getMainShape().setSize({
        width: outRect.x1 - outRect.x + 4,
        height: outRect.y1 - outRect.y + 4
      })
      this.auxRect.getMainShape().setPosition({
        x: outRect.x - 2,
        y: outRect.y - 2
      })
    }
  }
}

/**
 * 从下边调整控件的大小
 * 该方法在拖拽过程中调用，支持多个控件同时改变大小
 */
RuleCanvas.prototype.changeSizeToBottom = function (e) {
  let rect = this.auxRect.getBBox()
  let changeHeight =
    e.clientY -
    this.getOffsetTop(this.container) +
    this.container.scrollTop -
    rect.y -
    rect.height
  var mod = changeHeight % this.help_line_weight
  if (mod > this.help_line_weight / 2) {
    changeHeight = changeHeight + (this.help_line_weight - mod)
  } else {
    changeHeight = changeHeight - mod
  }
  if (changeHeight != 0) {
    let controls = this.getSelectedModels()
    // 执行校验，如果拖拽后小于了5，则不允许
    for (let i = 0; i < controls.length; i++) {
      if (controls[i].height + changeHeight < 5) {
        return
      }
    }
    for (let i = 0; i < controls.length; i++) {
      controls[i].height = controls[i].height + changeHeight
      controls[i].attrs.height = controls[i].attrs.height + changeHeight
      controls[i].updateShape()
    }
    let outRect = this.getSelectedShapesOutRect()
    if (outRect) {
      this.auxRect.getMainShape().setSize({
        width: outRect.x1 - outRect.x + 4,
        height: outRect.y1 - outRect.y + 4
      })
      this.auxRect.getMainShape().setPosition({
        x: outRect.x - 2,
        y: outRect.y - 2
      })
    }
  }
}

/**
 * 从上边调整控件的大小
 * 该方法在拖拽过程中调用，支持多个控件同时改变大小
 */
RuleCanvas.prototype.changeSizeToTop = function (e) {
  let rect = this.auxRect.getBBox()
  let changeHeight =
    e.clientY -
    this.getOffsetTop(this.container) +
    this.container.scrollTop -
    rect.y
  var mod = changeHeight % this.help_line_weight
  if (mod > this.help_line_weight / 2) {
    changeHeight = changeHeight + (this.help_line_weight - mod)
  } else {
    changeHeight = changeHeight - mod
  }
  if (changeHeight != 0) {
    let controls = this.getSelectedModels()
    // 执行校验，如果拖拽后小于了5，则不允许
    for (let i = 0; i < controls.length; i++) {
      if (controls[i].height - changeHeight < 5) {
        return
      }
    }
    for (let i = 0; i < controls.length; i++) {
      controls[i].height = controls[i].height - changeHeight
      controls[i].attrs.height = controls[i].attrs.height - changeHeight
      controls[i].y = controls[i].y + changeHeight
      controls[i].attrs.y = controls[i].attrs.y + changeHeight
      controls[i].updateShape()
    }
    let outRect = this.getSelectedShapesOutRect()
    if (outRect) {
      this.auxRect.getMainShape().setSize({
        width: outRect.x1 - outRect.x + 4,
        height: outRect.y1 - outRect.y + 4
      })
      this.auxRect.getMainShape().setPosition({
        x: outRect.x - 2,
        y: outRect.y - 2
      })
    }
  }
}

/**
 * 创建快捷菜单
 */
RuleCanvas.prototype.createQuickMenu = function () {
  // 如果没有快捷菜单，就初始化
  try {
    if (!this.quickMenuShape) {
      if (this.attrs.quickmenuconfig) {
        var quickConfig = JSON.parse(this.attrs.quickmenuconfig)
        var menuConfigs = quickConfig.menus
        var qcol = quickConfig.col
        var row = 0
        var col = 0
        // 间距宽度
        var splitWeight = 15
        var height = quickConfig.weight
        var width = quickConfig.weight
        if (menuConfigs.length > 0) {
          // 首先计算占几行几列
          if (menuConfigs.length < qcol) {
            col = menuConfigs.length
            row = 1
          } else if (menuConfigs.length % qcol != 0) {
            col = qcol
            row = parseInt(menuConfigs.length / qcol) + 1
          } else {
            col = qcol
            row = menuConfigs.length / qcol
          }
          // 计算主体区域宽度和高度
          var contentWidth = col * width + (col + 1) * splitWeight
          var contentHeight = row * height + (row + 1) * splitWeight
          // 创建面板
          this.quickMenuShape = global.createSVGElement('svg', this, {})
          this.stage.appendChild(this.quickMenuShape)

          var rectShape = global.createSVGElement('rect', this, {
            fill: '#FFFFFF',
            cornerRadius: 5,
            width: contentWidth,
            height: contentHeight
          })
          var smallShape = global.createSVGElement('rect', this, {
            fill: '#FFFFFF',
            x: 0,
            y: 20,
            width: 15,
            height: 15,
            rotation: 45
          })
          this.quickMenuShape.appendChild(smallShape)
          this.quickMenuShape.appendChild(rectShape)
          // 绘制菜单
          var currentCol = 1
          var currentRow = 1
          for (var i = 0; i < menuConfigs.length; i++) {
            var mc = menuConfigs[i]

            var curX = (currentCol - 1) * width + currentCol * splitWeight
            var curY = (currentRow - 1) * height + currentRow * splitWeight
            // 实际group的位置
            var groupX = curX
            var groupY = curY
            var menuGroup = global.createSVGElement('svg', mc, {
              x: groupX,
              y: groupY
            })
            // 加上id
            if (mc.id) {
              menuGroup.id = mc.id
              // 粘贴菜单默认隐藏
              if (mc.id == global.staticJs.pasteMenuId) {
                menuGroup.hide()
              }
            }
            menuGroup.rd = this
            var ellShape = global.createSVGElement('circle', mc, {
              cx: quickConfig.weight / 2,
              cy: quickConfig.weight / 3,
              r: quickConfig.weight / 3,
              fill: mc.fillColor,
              stroke: '#F3F3F3',
              strokeWidth: 0.8,
              shadowColor: mc.selectedFillColor,
              shadowBlur: 10,
              shadowOffset: {
                x: 0,
                y: 10
              },
              shadowOpacity: 0
            })
            menuGroup.appendChild(ellShape)

            var imgShape = global.createSVGElement('image', mc, {
              x: quickConfig.weight / 2 - 15,
              y: quickConfig.weight / 2 - 30,
              'xlink:href': RDSetting.ICOS[mc.icon],
              width: 30,
              height: 30,
              icon: RDSetting.ICOS[mc.icon],
              selectedIcon: RDSetting.ICOS[mc.selectedIcon]
            })
            menuGroup.appendChild(imgShape)

            var textShape = global.createSVGElement('text', mc, {
              x: 24, // quickConfig.weight / 2,
              y: quickConfig.weight - 5,
              width: quickConfig.weight,
              height: 30,
              fontFamily: RDSetting.DEFAULT_ACTIVITY_FONT_FAMILY,
              fill: '#000000',
              fontSize: 14,
              align: 'center',
              anchor: 'middle'
            })
            textShape.innerHTML = mc.name

            menuGroup.appendChild(textShape)

            this.quickMenuShape.appendChild(menuGroup)
            // textShape.setAttributeNS(null, "x", (quickConfig.weight - textShape.getBBox().width) / 2);

            // 添加action的事件
            // menuGroup.clickAction = mc.action
            menuGroup.mc = mc
            menuGroup.addEventListener('click', function (e) {
              window.tempfunc = RDSetting
              // eval('tempfunc.' + this.clickAction + '(this.rd.tempQuickMenuModel);')
              RDSetting.createProcessActivity(
                this.rd.tempQuickMenuModel,
                this.mc
              )
              e.target.parentElement.parentElement.hide()
              this.rd.drawOrPush(this.getLayer())
            })

            // 添加鼠标移入事件
            menuGroup.addEventListener('mouseover', function (e) {
              this.children[0].fill(this.model.selectedFillColor)

              this.children[0].shadowOpacity(0.5)

              document.body.style.cursor = 'pointer'
              this.children[1].image(
                this.children[1].getAttribute('selectedIcon')
              )

              this.rd.drawOrPush(this.getLayer())
            })
            // 添加鼠标移出事件
            menuGroup.addEventListener('mouseout', function (e) {
              this.children[0].fill(this.model.fillColor)
              document.body.style.cursor = 'default'
              this.children[0].shadowOpacity(0)
              this.children[1].image(this.children[1].getAttribute('icon'))
              this.rd.drawOrPush(this.getLayer())
            })

            if (currentCol % qcol == 0) {
              currentCol = 1
              currentRow++
            } else {
              currentCol++
            }
          }

          this.quickMenuShape.hide()
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * 创建并显示快捷菜单
 */
RuleCanvas.prototype.createAndShowQuickMenu = function (model) {
  this.createQuickMenu()
  // 弹出快捷菜单，并重置状态，设置位置
  if (!model.rd.readonly && model.rd.quickMenuShape) {
    model.rd.tempQuickMenuModel = model
    model.rd.quickMenuShape.setPosition({
      x: model.x + model.width + 15,
      y: model.y + model.height / 2 - 30
    })
    model.rd.quickMenuShape.show()
    // model.rd.anchorLayer.draw();
    model.rd.drawOrPush(model.rd.anchorLayer)
  }
}

RuleCanvas.prototype.toJSON = function () {
  var json = {
    id: this.id,
    width: this.canvasWidth,
    height: this.canvasHeight,
    canvasWidth: this.canvasWidth,
    canvasHeight: this.canvasHeight,
    attrs: this.attrs,
    controlType: this.controlType,
    modelType: this.modelType,
    curIndex: this.curIndex,
    scale: this.scale
  }
  // 更新子模型在图层中的顺序
  this.refreshLayerIndex()
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

// 生成一张高清图片
RuleCanvas.prototype.toImage = function () {
  // var dataURL = this.stage.toDataURL({
  //   pixelRatio: RDSetting.GLOBAL_EXPORT_IMAGE_PR
  // })
  // return dataURL
  return svgToImage(this.$el)
}

RuleCanvas.prototype.openMap = function () {
  // 判断容器的宽高，与当前画布的比例，然后生成
  const canvas = this
  const { width, height, container } = this
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const { scrollLeft, scrollTop } = container
  // 是否显示小地图
  let showMap = width > containerWidth + 400 || height > containerHeight + 400
  if (!showMap) {
    return
  }
  let mapEl = this.mapEl
  if (!mapEl) {
    mapEl = document.createElement('div')
    mapEl.style.position = 'absolute'
    mapEl.style.right = '20px'
    mapEl.style.bottom = '20px'
    mapEl.style.background = 'rgba(0,0,0,0.2)'
    container.appendChild(mapEl)
    // 绑定点击事件
    mapEl.addEventListener('click', function (e) {
      e.stopPropagation()
      let { offsetX, offsetY } = e
      let currentEl = e.target
      while (currentEl !== mapEl) {
        offsetX += currentEl.offsetLeft || 0
        offsetY += currentEl.offsetTop || 0
        currentEl = currentEl.parentElement
      }
      // 使用offsetX, offsetY, 换算滚动
      let viewEl = mapEl.children[1]
      let viewWidth = viewEl.clientWidth
      let viewHeight = viewEl.clientHeight
      container.scrollLeft = Math.floor(
        ((offsetX - viewWidth / 2) * container.clientWidth) / viewWidth
      )
      container.scrollTop = Math.floor(
        ((offsetY - viewHeight / 2) * container.clientHeight) / viewHeight
      )
      canvas.renderMap()
    })

    mapEl.addEventListener('mouseenter', function (e) {
      if (canvas.isDragging()) {
        // 修改位置
        if (mapEl.style.right) {
          mapEl.style.left = '20px'
          mapEl.style.right = ''
        } else {
          mapEl.style.left = ''
          mapEl.style.right = '20px'
        }
      }
    })
  }
  let mapWidth = 200
  let mapHeight = Math.floor((containerHeight / containerWidth) * mapWidth)
  if (mapHeight > 200) {
    mapHeight = 200
    mapWidth = Math.floor((containerWidth / containerHeight) * mapHeight)
  }
  mapEl.style.width = mapWidth + 'px'
  mapEl.style.height = mapHeight + 'px'
  // 绑定mapEl
  this.mapEl = mapEl
  // 背景图
  let imageEl = mapEl.children[0]
  if (!imageEl) {
    imageEl = document.createElement('img')
    imageEl.style.width = '100%'
    imageEl.style.height = '100%'
    mapEl.appendChild(imageEl)
  }
  imageEl.src = this.toImage()
  // 视窗El
  let viewEl = mapEl.children[1]
  if (!viewEl) {
    viewEl = document.createElement('div')
    viewEl.style.border = '1px solid #efefef'
    viewEl.style.position = 'absolute'
    mapEl.appendChild(viewEl)
  }
  let viewWidth = Math.floor((containerWidth / width) * mapWidth)
  let viewHeight = Math.floor((containerHeight / height) * mapHeight)
  viewEl.style.width = viewWidth + 'px'
  viewEl.style.height = viewHeight + 'px'
  viewEl.style.left =
    Math.floor((scrollLeft * viewWidth) / containerWidth) + 'px'
  viewEl.style.top =
    Math.floor((scrollTop * viewHeight) / containerHeight) + 'px'
}

RuleCanvas.prototype.renderMap = function () {
  let mapEl = this.mapEl
  if (!mapEl) {
    this.openMap()
    return
  }
  const { width, height, container } = this
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const { scrollLeft, scrollTop } = container
  let showMap = width > containerWidth + 400 || height > containerHeight + 400
  mapEl.style.display = showMap ? 'block' : 'none'
  let mapWidth = 200
  let mapHeight = Math.floor((containerHeight / containerWidth) * mapWidth)
  if (mapHeight > 200) {
    mapHeight = 200
    mapWidth = Math.floor((containerWidth / containerHeight) * mapHeight)
  }
  mapEl.style.width = mapWidth + 'px'
  mapEl.style.height = mapHeight + 'px'
  let imageEl = mapEl.children[0]
  imageEl.src = this.toImage()
  // 视窗El
  let viewEl = mapEl.children[1]
  let viewWidth = Math.floor((containerWidth / width) * mapWidth)
  let viewHeight = Math.floor((containerHeight / height) * mapHeight)
  viewEl.style.width = viewWidth + 'px'
  viewEl.style.height = viewHeight + 'px'
  viewEl.style.left =
    Math.floor((scrollLeft * viewWidth) / containerWidth) + 'px'
  viewEl.style.top =
    Math.floor((scrollTop * viewHeight) / containerHeight) + 'px'
}

RuleCanvas.prototype.resetMap = function () {
  let mapEl = this.mapEl
  if (!mapEl) {
    return
  }
  mapEl.style.left = undefined
  mapEl.style.right = '20px'
}

RuleCanvas.prototype.getOffsetTop = getOffsetTop

RuleCanvas.prototype.getOffsetLeft = getOffsetLeft

// 初始化图形以及舞台对象
RuleCanvas.prototype.init = function () {
  this.buildShape()
}

// 取得鼠标落点的所有控件
RuleCanvas.prototype.findControlByPosition = function (p) {
  return this.getModels().filter(
    (item) =>
      item instanceof RuleActivity &&
      item.isShow() &&
      item.isInSelectArea &&
      item.isInSelectArea(p)
  )
}

// 获取不同字体大小的空格所占空间
RuleCanvas.prototype.getSpaceWidth = function (
  fontFamily,
  fontSize,
  fontStyle
) {
  let key = fontFamily + '_' + fontSize + '_' + fontStyle
  if (!RDSetting.SPACE_WIDTH_MAP[key]) {
    // //计算空格基准大小
    // let tempShape = createSVGElement('text', this, {
    //   x: 0,
    //   y: 0,
    //   text: "合",
    //   fontSize: fontSize,
    //   fontFamily: fontFamily,
    //   align: 'center'
    // });
    // this.backgroundLayer.appendChild(tempShape);
    // let tempShapeRect = tempShape.getBoundingClientRect();
    // console.log(tempShapeRect.width*0.75)
    // let spaceWidth = tempShapeRect.width /4;
    // this.backgroundLayer.remove(tempShape);
    // if(spaceWidth != 0){
    //   RDSetting.SPACE_WIDTH_MAP[key] = spaceWidth;
    // }
    if (fontFamily == 'Arial Unicode') {
      let spaceWidth = (fontSize * 0.21) / 0.75
      RDSetting.SPACE_WIDTH_MAP[key] = spaceWidth
    } else if (fontFamily == 'STSong-Light') {
      let spaceWidth = fontSize * 0.21
      RDSetting.SPACE_WIDTH_MAP[key] = spaceWidth
    }
  }
  return RDSetting.SPACE_WIDTH_MAP[key]
}

/**
 * 隐藏功能按钮
 */
RuleCanvas.prototype.hideButtons = function () {
  if (RDSetting.GLOBAL_REMOVE_BTN && !this.readonly) {
    this.hideDeleteButton()
  }

  this.tempRemoveControl = null
  this.tempMoveNumber = 0
}

RuleCanvas.prototype.removeTempLine = function () {
  let canvas = this
  if (!canvas.__link__ || !canvas.__link__.tempLine) {
    return
  }
  canvas.getCanvas().removeControl(canvas.__link__.tempLine, true)
  canvas.__link__.tempLine = null
  // 更新开始bar的points
  canvas.showBarPoints(canvas.startLineBar)
  canvas.showBarPoints(canvas.endLineBar)
}

// 隐藏开始线段工具栏
RuleCanvas.prototype.hideStartLineBar = function () {
  if (this.startLineBar) {
    // 恢复开始和结束linkGroups的收折状态
    if (this.tempStartCollectState) {
      let startLinkGroupKey =
        this.startLineBar.getAttribute('mid') +
        '_' +
        this.startLineBar.getAttribute('directtype')
      if (this.linkGroups[startLinkGroupKey]) {
        this.linkGroups[startLinkGroupKey].collect = this.tempStartCollectState
        // 更新线段
        let lines = this.linkGroups[startLinkGroupKey]['lines']
        for (let i = 0; i < lines.length; i++) {
          lines[i].updateByStyle()
        }
      }
      this.tempStartCollectState = null
    }
    this.startLineBar.setAttributeNS(null, 'mid', '')
    this.startLineBar.setAttributeNS(null, 'directtype', '')
    this.startLineBar.shapes[0].setAttributeNS(null, 'mid', '')
    this.startLineBar.shapes[0].setAttributeNS(null, 'directtype', '')
    this.startLineBar.remove()
    this.startLineBar.unbindMainModel()
    this.startLineBar = null
  }
}

// 隐藏结束线段工具栏
RuleCanvas.prototype.hideEndLineBar = function () {
  if (this.endLineBar) {
    // 恢复收折状态
    if (this.tempEndCollectState) {
      let endModel = this.rootModels[this.endLineBar.getAttribute('mid')]
      let endLineType = this.endLineBar.getAttribute('directtype')
      let endLinkGroupKey = endModel.id + '_' + endLineType
      if (this.linkGroups[endLinkGroupKey]) {
        this.linkGroups[endLinkGroupKey].collect = this.tempEndCollectState
        // 更新线段
        let lines = this.linkGroups[endLinkGroupKey]['lines']
        for (let i = 0; i < lines.length; i++) {
          lines[i].updateByStyle()
        }
      }
      this.tempEndCollectState = null
    }
    this.endLineBar.setAttributeNS(null, 'mid', '')
    this.endLineBar.setAttributeNS(null, 'directtype', '')
    this.endLineBar.shapes[0].setAttributeNS(null, 'mid', '')
    this.endLineBar.shapes[0].setAttributeNS(null, 'directtype', '')
    this.endLineBar.remove()
    this.endLineBar.unbindMainModel()
    this.endLineBar = null
  }
}

// 显示开始线段工具栏，传入当前模型以及方向
RuleCanvas.prototype.showStartLineBar = function (model, type) {
  if (!model) {
    return
  }
  if (!this.startLineBar) {
    this.createStartLineBar(model, {
      model: model,
      directtype: type
    })
  }
  this.startLineBar.setModel(model, type)
  this.startLineBar.show()
}

// 显示结束线段工具栏，传入当前模型以及方向
RuleCanvas.prototype.showEndLineBar = function (model, type) {
  if (!model) {
    return
  }
  if (!this.endLineBar) {
    this.createEndLineBar(model, {
      model: model,
      directtype: type
    })
  }
  this.endLineBar.setModel(model, type)
  this.endLineBar.show()
}

// 创建线段工具栏窗口
RuleCanvas.prototype.createStartLineBar = function (model, props) {
  if (this.startLineBar) {
    return
  }
  // 创建开始连线的bar并添加到图层中
  this.startLineBar = new RuleLineBar(
    this,
    model,
    Object.assign({}, props, { id: this.id, type: 'start' })
  )
  this.anchorLayer.appendChild(this.startLineBar.shapes[0])
}

// 创建线段工具栏窗口
RuleCanvas.prototype.createEndLineBar = function (model, props) {
  if (this.endLineBar) {
    return
  }
  this.endLineBar = new RuleLineBar(
    this,
    model,
    Object.assign({}, props, { id: this.id, type: 'end' })
  )
  this.anchorLayer.appendChild(this.endLineBar.shapes[0])
}

// 显示bar上的端点
RuleCanvas.prototype.showBarPoints = function (bar) {
  bar && bar.showPoints()
}

// 隐藏bar上的端点
RuleCanvas.prototype.hideBarPoints = function (bar) {
  bar && bar.hidePoints()
}

// 取得所有选中控件
RuleCanvas.prototype.getSelectedShapes = function () {
  return this.getSelectedModels()
}

// 更新所有控件
RuleCanvas.prototype.updateShape = function () {
  // 更新画布属性
  const { width, height, scale = 1 } = this
  const mainShape = this.getMainShape()
  mainShape.setAttributeNS(null, 'width', width)
  mainShape.setAttributeNS(null, 'height', height)
  // 设置缩放
  // 设置viewWidth,viewHeight
  let viewWidth = Math.ceil(width / scale)
  let viewHeight = Math.ceil(height / scale)
  mainShape.setAttribute('viewBox', `0,0,${viewWidth},${viewHeight}`)
}

/**
 * 最外层的控件选择事件，调用后，控件就处于选中状态，并根据需要单选多选，清空其他控件选中状态，显示回显图形等等
 * @param {*} model 当前控件
 * @param {*} e 事件，用来获取坐标，是否按下shiftctrl等快捷键
 */
RuleCanvas.prototype.makeSelection = function (model, e) {
  // 聚焦画布
  this.focus()
  // 没有传入model则认为是点击画布
  model = model || this
  // 模型不能被选中或者已经选中时
  if (!model.isSelectable || !model.isSelectable()) {
    return
  }
  if (!this.auxRect) {
    this.createAuxRect()
  }
  if (model === this) {
    this.clearSelection()
    this.selected = true
    this.addStatus(ModelStatusEnum.Selected)
    this.auxRect.setModels([])
    this.auxRect.hide()
    this.currentModel = this
    this.clickTab(this)
    return
  }
  let currentModel = model
  let selectedControls = this.getSelectedModels()
  let hasCtrl = e && (e.ctrlKey || e.metaKey)
  // 没有多选状态时清空所有选中
  if (
    !hasCtrl ||
    (currentModel.isMuiltipleSelectable &&
      !currentModel.isMuiltipleSelectable())
  ) {
    selectedControls = []
    this.clearSelection()
  }
  if (hasCtrl && currentModel && currentModel.selected) {
    // 处理多选取消
    currentModel.clearSelection()
    currentModel.updateByStyle()
    selectedControls.remove(currentModel)
    currentModel = selectedControls[0]
  } else if (currentModel) {
    // 设置选中状态
    currentModel.makeSelection()
    currentModel.updateByStyle()
    selectedControls.push(currentModel)
  }
  // 设置被选中的模型
  this.auxRect.setModels(selectedControls)
  // 是否显示选择框 非只读 且 允许移动 且 允许显示外部框选 且 非单个选中
  this.auxRect.show(
    !this.readonly &&
      this.canMove &&
      RDSetting.SHOW_AUX_RECT &&
      selectedControls.length > 1
  )
  // 设置当前model
  this.currentModel = currentModel || this
  // 清空画布选中状态
  if (this.selected) {
    this.selected = false
    this.removeStatus(ModelStatusEnum.Selected)
  }
  // 选中组件或者画布
  this.clickTab(this.currentModel)
}

// 更新所有选中控件坐标
RuleCanvas.prototype.updateSelectedShapesPosition = function (position) {
  for (let i in this.rootModels) {
    let currentShape = this.rootModels[i]

    if (currentShape.selected) {
      currentShape.x = currentShape.x + position.x
      currentShape.y = currentShape.y + position.y
      currentShape.rebuildAnchors()
      currentShape.updateShape()
      currentShape.updateLinkLines()
    }
  }
}

// 获取传入图形的外接矩形
RuleCanvas.prototype.getShapesOutRect = function (shapes) {
  return getShapesPosition(...shapes)
}

// 计算所有当前选中图形的外接矩形
RuleCanvas.prototype.getSelectedShapesOutRect = function () {
  let selectedShapes = []
  for (let i in this.rootModels) {
    let currentShape = this.rootModels[i]

    if (currentShape.selected) {
      selectedShapes[selectedShapes.length] = currentShape
    }
  }
  return this.getShapesOutRect(selectedShapes)
}

// 消除之前的selection内容
RuleCanvas.prototype.clearSelection = function () {
  let selectedShapes = this.getSelectedModels()
  for (let i = 0; i < selectedShapes.length; i++) {
    selectedShapes[i].clearSelection()
    selectedShapes[i].updateShape()
  }
  this.auxRect && this.auxRect.hide()
}

// 修改属性方法,修改属性后，会调用这个方法来更新图形等动作
RuleCanvas.prototype.setAttributesNoDraw = function (attrs, md) {
  // 当修改的属性为图形属性或在allowToChangeAttrs列表中时，修改属性会联动修改图形
  var allowToChangeAttrs = ['text', 'icon', 'descText', 'lineType']
  for (var j = 0; j < attrs.length; j++) {
    var attr = attrs[j]
    var code = attr.code

    var value = attr.value
    // 对特殊的数据类型做转换，这里一般指的是number等类型
    if (value != null) {
      try {
        if (attr.datatype == 'array') {
          if (value != null && value != '') {
            value = value.split(',')
          } else {
            value = []
          }
        } else if (attr.datatype == 'array-integer') {
          if (value != null && value != '') {
            value = value.split(',')
            for (let q = 0; q < value.length; q++) {
              value[q] = parseInt(value[q])
            }
          } else {
            value = []
          }
        } else if (attr.datatype == 'float') {
          value = parseFloat(value)
        } else if (attr.datatype == 'integer') {
          value = parseInt(value)
        }
      } catch (e) {}
    }

    let model = null
    if (md != null && md != undefined) {
      model = md
    } else {
      model = this.currentModel || this
    }

    // 取得当前选中的图形
    if (model != null) {
      model.attrs[code] = value
      // 如果为图形属性，或者allowToChangeAttrs列表中声明的会影响图形显示的属性，就更新
      if (
        allowToChangeAttrs.indexOf(code) > -1 ||
        attr.groupname == '图形属性'
      ) {
        // 如果存在datasource，执行代码翻译
        var curValue = value
        if (
          code == 'descText' &&
          attr.datasource != null &&
          attr.datasource.length > 0
        ) {
          for (let o = 0; o < attr.datasource.length; o++) {
            if (
              attr.datasource[o].value == curValue ||
              '' + attr.datasource[o].value == '' + curValue
            ) {
              curValue = attr.datasource[o].text
              break
            }
          }
        }
        model[code] = curValue
      }
    } else {
      model.attrs[code] = value
    }
    // 对画布的修改

    if (code == 'canvasBgColor') {
      if (this.container.style.backgroundColor != value) {
        this.container.style.backgroundColor = value
      }
      this.attrs['canvasBgColor'] = value
      continue
    } else if (code == 'canvasWidth') {
      var v = null
      try {
        v = parseInt(value)
      } catch (e) {}
      if (v == null || v == 0 || isNaN(v)) {
        v = this.container.clientWidth
      }
      if (v != null) {
        if (this.stage.getAttribute('width') != v) {
          this.stage.setAttributeNS(null, 'width', v)
        }
      }
      this.attrs['canvasWidth'] = v
      this.width = v
      continue
    } else if (code == 'canvasHeight') {
      let v = null
      try {
        v = parseInt(value)
      } catch (e) {}
      if (v == null || v == 0 || isNaN(v)) {
        v = this.container.clientHeight
      }
      if (v != null) {
        if (this.stage.getAttribute('height') != v) {
          this.stage.setAttributeNS(null, 'height', v)
        }
      }
      this.attrs['canvasHeight'] = v
      this.height = v
      continue
    }
  }

  let model = null

  if (md != null && md != undefined) {
    model = md
  } else {
    model = this.currentModel || this
  }
  if (
    model != null &&
    model != undefined &&
    model.modelType != undefined &&
    model.modelType != 'RuleCanvas' &&
    model.modelType != 'Paper' &&
    model.modelType != 'BGImage'
  ) {
    model.rebuildAnchors()
    model.updateShape()
  }
}

/**
 * 取得一个控件是否可以移动，如果控件上没有该属性，则用控件的model，如果都为空则用画布
 * @param {*} shape
 */
RuleCanvas.prototype.isCanMove = function (shape) {
  if (shape) {
    if (shape.canMove == undefined || shape.canMove == 'undefined') {
      if (shape.model != null && shape.model.canMove != undefined) {
        return shape.model.canMove
      }
    } else {
      return shape.canMove
    }
  }
  return this.canMove
}

// 修改属性方法,修改属性后，会调用这个方法来更新图形等动作
RuleCanvas.prototype.setAttributesByList = function (attrs, md) {
  // 当修改的属性为图形属性或在allowToChangeAttrs列表中时，修改属性会联动修改图形
  this.setAttributesNoDraw(attrs, md)

  // // 将值转换为参数
  // let props = {}
  // attrs.forEach(item => {
  //   props[item.code] = item.value
  // })
  // md.setAttributes(props)
}

// 修改属性方法,修改属性后，会调用这个方法来更新图形等动作
RuleCanvas.prototype.setAttr = function (attr) {
  // 当修改的属性为图形属性或在allowToChangeAttrs列表中时，修改属性会联动修改图形
  var allowToChangeAttrs = ['text', 'icon', 'descText', 'lineType']
  var code = attr.code
  var path = attr.path
  var value = attr.value
  // 对特殊的数据类型做转换，这里一般指的是number等类型
  if (value != null) {
    try {
      if (attr.datatype == 'array') {
        if (value != null && value != '') {
          value = value.split(',')
        } else {
          value = []
        }
      } else if (attr.datatype == 'float') {
        value = parseFloat(value)
      } else if (attr.datatype == 'integer') {
        value = parseInt(value)
      }
    } catch (e) {}
  }
  // 对画布的修改

  if (code == 'canvasBgColor') {
    if (this.container.style.backgroundColor != value) {
      this.container.style.backgroundColor = value
    }
    this.attrs['canvasBgColor'] = value
    return
  } else if (code == 'canvasWidth') {
    let v = null
    try {
      v = parseInt(value)
    } catch (e) {}
    if (v == null || v == 0 || isNaN(v)) {
      v = this.container.clientWidth
    }

    this.attrs['canvasWidth'] = v
    this.setStageSize(this.attrs['canvasWidth'], this.attrs['canvasHeight'])
    return
  } else if (code == 'canvasHeight') {
    let v = null
    try {
      v = parseInt(value)
    } catch (e) {}
    if (v == null || v == 0 || isNaN(v)) {
      v = this.container.clientHeight
    }

    this.attrs['canvasHeight'] = v
    this.setStageSize(this.attrs['canvasWidth'], this.attrs['canvasHeight'])
    return
  } else {
    // 否则就是控件的属性
    // 取得当前选中的图形
    let model = this.currentModel || this
    model.setOption((path ? path + '.' : '') + code, value)
  }

  // 读取联动属性
  if (attr.cascade && attr.cascade_group) {
    let cascadeArr = attr.cascade.split(',')
    let cascadeGroupArr = attr.cascade_group.split(',')
    if (cascadeArr.length == cascadeGroupArr.length) {
      for (let bm = 0; bm < cascadeGroupArr.length; bm++) {
        this.setAttr({
          value: attr.value,
          code: cascadeArr[bm],
          groupname: cascadeGroupArr[bm]
        })
      }
    }
  }
}

RuleCanvas.prototype.handleDragStart = function () {
  this.makeSelection(this)
  let dragInfo = this.getDragObj()
  this.auxRect.setModels([])
  this.auxRect.setPosition({
    x: dragInfo.mouseX,
    y: dragInfo.mouseY
  })
  this.auxRect.setSize({
    width: 0,
    height: 0
  })
  this.auxRect.show()
}

const calcAuxPosition = function ({ mouseX, mouseY, offsetX, offsetY }) {
  let p = {
    x: mouseX,
    y: mouseY
  }
  if (offsetX < 0) {
    p.x = p.x + offsetX
  }
  if (offsetY < 0) {
    p.y = p.y + offsetY
  }
  p.width = Math.abs(offsetX)
  p.height = Math.abs(offsetY)
  return p
}

RuleCanvas.prototype.handleDragMove = function () {
  // 自定义拖拽功能，不需要默认的实现，为后续拖拽框选或移动位置做准备
  clearSelectionText()
  let dragInfo = this.getDragObj()
  let auxPosition = calcAuxPosition(dragInfo)
  this.auxRect.setPosition(auxPosition, false)
  this.auxRect.setSize(auxPosition, false)
  this.auxRect.render()
}

RuleCanvas.prototype.handleDragEnd = function (e) {
  // 获取范围内的模型
  let auxPosition = this.auxRect
  let padding = 10
  let area = {
    x1: auxPosition.x - padding,
    y1: auxPosition.y - padding,
    x2: auxPosition.x + auxPosition.width + padding,
    y2: auxPosition.y + auxPosition.height + padding
  }
  let models = this.models.filter((model) => {
    if (!model.isMuiltipleSelectable || !model.isMuiltipleSelectable()) {
      return false
    }
    return (
      model.x >= area.x1 &&
      model.x + model.width <= area.x2 &&
      model.y >= area.y1 &&
      model.y + model.height <= area.y2
    )
  })
  if (models.length === 1) {
    this.makeSelection(models[0])
  } else if (models.length > 1) {
    this.makeSelection(models[0])
    models.forEach((model) => {
      model.select()
      model.renderDelay()
    })
    this.auxRect.setModels(models)
    this.auxRect.show()
  } else {
    this.getDragContainer().makeSelection(this, e)
  }
}

RuleCanvas.prototype.updateLinkLines = function () {
  // 更新所有连线
  for (let linkGroupId in this.linkGroups) {
    let linkGroup = this.linkGroups[linkGroupId] || {}
    let lines = linkGroup['lines'] || []
    lines.forEach((line) => {
      line.updateByStyle()
    })
  }
}

RuleCanvas.prototype.isActive = function () {
  // 增加焦点判断，确定当前用户是在操作画布
  let activeElement = global.document.activeElement
  // 焦点不在body上就认为有单独的操作
  if (activeElement !== this.$el) {
    return false
  }
  if (!this.container || this.container.offsetParent === null) {
    return false
  }
  return true
}

RuleCanvas.prototype.handleModelCut = function (e) {
  // 如果当前对象已经不在页面上，则移除监听
  if (!document.body.contains(this.$el)) {
    // 移除监听
    document.removeEventListener('cut', this._handleModelCut)
  }
  // 未激活状态
  if (!this.isActive()) {
    return
  }

  // 阻止默认行为
  e.returnValue = false
  e.stopPropagation()
  e.preventDefault()
  // 取得当前选中的图形
  let selectedControls = this.getSelectedModels()
  if (selectedControls != null && selectedControls.length > 0) {
    // 清空全局剪切板
    window.globalCopyData = null
    // 进入全局复制板
    window.globalCutData = selectedControls
  }
}

RuleCanvas.prototype.handleModelCopy = function (e) {
  // 如果当前对象已经不在页面上，则移除监听
  if (!document.body.contains(this.$el)) {
    // 移除监听
    document.removeEventListener('copy', this._handleModelCopy)
  }
  // 未激活状态
  if (!this.isActive()) {
    return
  }

  // 阻止默认行为
  e.returnValue = false
  e.stopPropagation()
  e.preventDefault()
  // 取得当前选中的图形
  let selectedControls = this.getSelectedModels()
  if (selectedControls != null && selectedControls.length > 0) {
    // 清空全局剪切板
    window.globalCutData = null
    // 进入全局复制板
    window.globalCopyData = selectedControls
  }
}

RuleCanvas.prototype.handleModelPaste = function (e) {
  // 如果当前对象已经不在页面上，则移除监听
  if (!document.body.contains(this.$el)) {
    // 移除监听
    document.removeEventListener('paste', this._handleModelPaste)
  }
  // 未激活状态
  if (!this.isActive()) {
    return
  }
  // 如果是复制板有值，则执行复制逻辑
  if (window.globalCopyData && window.globalCopyData.length > 0) {
    global.tempSeriDatas['currentRuleCanvas'] = this
    this.cloneModels(
      window.globalCopyData,
      this.getMousePosition(),
      (model) => {
        // 克隆前校验
        if (model instanceof RuleBegin) {
          bus.$emit('canvasError', new Error('不能复制开始节点'))
          return false
        }
        return true
      },
      true
    )
    global.tempSeriDatas['currentRuleCanvas'] = null
    this.autoSize()
  } else if (window.globalCutData && window.globalCutData.length > 0) {
    // 如果是剪切板有值，则执行剪切逻辑
    this.moveModels(window.globalCutData, this.getMousePosition(), true)
    // 剪切一次后清空
    window.globalCutData = null
    this.autoSize()
  }
}

RuleCanvas.prototype.handleKeyDown = function (e) {
  // 如果当前对象已经不在页面上，则移除监听
  if (!document.body.contains(this.$el)) {
    // 移除监听
    document.removeEventListener('keydown', this._handleKeyDown)
  }
  // 未激活状态
  if (!this.isActive()) {
    return
  }
  let key = e.keyCode
  // 处理普通控件的快捷键
  // 快捷键删除
  if (key == '46' || key == '8') {
    if (!this.readonly && this.canDel) {
      // 删除
      this.removeSelectedControl()
    }
    // 阻止默认行为
    e.preventDefault()
    return false
  } else if (key == '38' || key == '40' || key == '37' || key == '39') {
    // 快捷键上下左右
    // 如果是按下的上下左右操作键，则按照辅助线的宽度进行移动，按下ctrl按照1像素进行精准移动
    if (
      !this.readonly &&
      this.canMove &&
      RDSetting.GLOBAL_KEYBOARD_ALIGN_ENABLE
    ) {
      // 支持批量以及外接距形的更新
      let models = this.getSelectedModels()
      if (models != null && models.length > 0) {
        let moveWeight = this.help_line_weight
        if (e.ctrlKey || e.shiftKey || e.metaKey) {
          moveWeight = 1
        }
        for (let i = 0; i < models.length; i++) {
          let model = models[i]
          if (key == '38') {
            // 向上
            model.y = model.y - moveWeight
          } else if (key == '40') {
            // 向下
            model.y = model.y + moveWeight
          } else if (key == '37') {
            // 向左
            model.x = model.x - moveWeight
          } else if (key == '39') {
            // 向右
            model.x = model.x + moveWeight
          }
          model.updateShape()
          model.updateLinkLines()
        }
        // 更新auxRect的坐标
        if (RDSetting.SHOW_AUX_RECT) {
          let outRect = this.getSelectedShapesOutRect()

          if (outRect) {
            // var weight = this.help_line_weight

            this.auxRect.getMainShape().setSize({
              width: outRect.x1 - outRect.x + 4,
              height: outRect.y1 - outRect.y + 4
            })
            this.auxRect.getMainShape().setPosition({
              x: outRect.x - 2,
              y: outRect.y - 2
            })
          }
        }
        this.hideButtons()
        // 重绘
        this.drawOrPush(this.backgroundLayer)
        this.drawOrPush(this.shapeLayer)
        this.drawOrPush(this.anchorLayer)
        this.drawOrPush(this.lineLayer)
        this.drawOrPush(this.descLayer)
        // 阻止默认行为
        e.preventDefault()
        return false
      }
    }
  } else if (key == '113') {
    // 快捷键F2，进行编辑
    if (!this.readonly && this.tempTransformerShape != null) {
      let selectedControls = this.getSelectedModels()
      if (selectedControls != null && selectedControls.length == 1) {
        if (selectedControls[0].bindEditTextShape != null) {
          selectedControls[0].showEditTextEvt(e, selectedControls[0])
        }
      }
      // 阻止默认行为
      e.preventDefault()
    }
  } else if (e.keyCode == '65' && (e.ctrlKey || e.metaKey)) {
    // 按下Ctrl+A时，全选所有控件（除了线）
    if (!this.readonly && this.canDel && RDSetting.SHOW_AUX_RECT) {
      let allModels = this.models.filter(
        (item) => item.isMuiltipleSelectable && item.isMuiltipleSelectable()
      )
      allModels.forEach((item) => {
        item.select()
        item.render()
      })
      this.auxRect.setModels(allModels)
      this.auxRect.show(allModels.length > 1)
      // 阻止默认行为
      e.preventDefault()
      return false
    }
  } else if (e.keyCode == '83' && (e.ctrlKey || e.metaKey)) {
    // 按下Ctrl+A时，全选所有控件（除了线）
    bus.$emit('save', e, this)
  } else if (e.keyCode == '27') {
    // 按下ESC时，取消所有选中
    if (!this.readonly && this.canDel) {
      this.makeSelection(this, e)
      // 阻止默认行为
      e.preventDefault()
      return false
    }
  } else {
  }
}

RuleCanvas.prototype.bindShortcuts = function () {
  this._handleModelCut = this._handleModelCut || this.handleModelCut.bind(this)
  this._handleModelCopy =
    this._handleModelCopy || this.handleModelCopy.bind(this)
  this._handleModelPaste =
    this._handleModelPaste || this.handleModelPaste.bind(this)
  this._handleKeyDown = this._handleKeyDown || this.handleKeyDown.bind(this)
  // 覆盖默认剪切方法
  document.addEventListener('cut', this._handleModelCut)
  // 覆盖默认复制方法
  document.addEventListener('copy', this._handleModelCopy)
  // 增加浏览器剪切板事件，用于处理外部内容copy到里面
  document.addEventListener('paste', this._handleModelPaste)
  // 增加全局键盘事件
  document.addEventListener('keydown', this._handleKeyDown)
}
// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================

// 通过JSON初始化
RuleCanvas.initByJson = function (json) {
  // 初始化本身
  var canvObj = new RuleCanvas(json)
  global.tempSeriDatas[canvObj.id] = canvObj
  global.tempSeriDatas['currentRuleCanvas'] = canvObj

  // 循环，递归初始化rootModels
  let rootModels = {}
  json.rootModels = json.rootModels || {}
  let models = []
  // 临时变量rootModels
  for (let i in json.rootModels) {
    let modelObjJSON = json.rootModels[i]
    let modelClass = global[modelObjJSON.modelType]
    if (modelClass) {
      models.push(modelClass.initByJson(modelObjJSON))
    }
  }

  canvObj.buildShape()
  // 加入图形
  canvObj.addModel(models)

  // 加入线关系
  let linkGroups = {}
  for (let linkGroupId in json.linkGroups) {
    let linkGroup = (linkGroups[linkGroupId] = {
      model: canvObj.rootModels[json.linkGroups[linkGroupId].modelId],
      type: json.linkGroups[linkGroupId].type,
      collect: json.linkGroups[linkGroupId].collect || 0
    })
    let lineIds = json.linkGroups[linkGroupId].lineIds || []
    // 绑定线对象
    linkGroups[linkGroupId].lines = lineIds
      // 将lineId转换为line, 并设置线的linkGroup
      .map((lineId) => {
        let line = canvObj.rootModels[lineId]
        let linePoint =
          json.rootModels[line.id].startLinkGroupId === linkGroupId
            ? 'start'
            : 'end'
        defineUnenumerableProperty(line, linePoint + 'LinkGroup', linkGroup)
        return line
      })
      // 排除没有找到的线
      .filter((item) => !!item)
  }
  canvObj.linkGroups = linkGroups
  // 更新连线
  canvObj.render()
  // 初始化框选
  canvObj.createAuxRect()
  // 选中画布
  canvObj.focus()

  if (global.tempExecEval.length > 0) {
    for (let i = 0; i < global.tempExecEval.length; i++) {
      eval(global.tempExecEval[i])
    }
  }

  global.tempSeriDatas = {}
  global.tempExecEval = []

  return canvObj
}

// ============================ 静态函数 End ============================

global.RuleCanvas = RuleCanvas

export default RuleCanvas
