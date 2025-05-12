/* eslint-disable */
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
const cloneDeep = require('clone');

(function () {
  // 规则设计器画布总对象
  this.RuleCanvas = function (props) {
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

    //用于创建控件的下标，缺省或新建时从1开始
    this.curIndex = props.curIndex ? props.curIndex : 1

    // 当前画布上所有关联控件的关系
    this.linkGroups = {}


    // 过滤了线和添加按钮的组件
    this.activityFilterList = []

    const me = this


    //设置画布缩放
    this.setScale = function (scale) {
      //比例的增量
      let delta = scale - this.scale
      this.scale = scale
      this.help_line_weight += this.help_line_weight * delta
      //缩放画布大小
      this.attrs['canvasWidth'] += this.attrs['canvasWidth'] * delta
      this.attrs['canvasHeight'] += this.attrs['canvasHeight'] * delta
      this.setStageSize(this.attrs['canvasWidth'], this.attrs['canvasHeight'])
      //设置所有控件的X，Y，WIDTH，HEIGHT等属性
      for (let i in this.rootModels) {
        if (this.rootModels[i].baseModelType == "Activity") {
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
    this.setStageSize = function (canvasWidth, canvasHeight) {

      if (this.stage.getAttribute("width") != canvasWidth) {
        this.stage.setAttributeNS(null, 'width', canvasWidth)
      }
      if (this.stage.getAttribute("height") != canvasHeight) {
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

    // 执行绘图操作，或者将本对象推送入队列
    this.drawOrPush = function (obj) {
      return
    }

    /**
     * 设置当前画布是否允许移动控件
     */
    this.setCanMove = function (canMove) {
      this.canMove = canMove
      this.changeShapeCanMove(this.stage, this.canMove)
    }
    /**
     * 设置当前画布是否允许删除控件
     */
    this.setCanDel = function (canDel) {
      this.canDel = canDel
    }
    /**
     * 设置当前画布是否允许修改控件属性
     */
    this.setCanModAttr = function (canModattr) {
      this.canModattr = canModattr
    }

    /**
     * 设置当前画布是否只读，每次调用都会切换画布的状态
     */
    this.setReadOnly = function (readonly) {
      this.readonly = readonly
      // 遍历所有控件，找到allowDraggable:true的，控件设置其draggable属性为false或者true
      if (this.readonly) {
        this.changeShapeCanMove(this.stage, false)
      } else {
        this.changeShapeCanMove(this.stage, this.canMove)
      }
    }

    // 递归修改所有控件的
    this.changeShapeCanMove = function (shape, canMove) {
      shape.canMove = canMove
      var children = shape.children
      for (var i = 0; i < children.length; i++) {
        this.changeShapeCanMove(children[i], canMove)
      }
    }

    // 新增控件
    this.addControl = function (models) {
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
    this.removeControl = function (model, subremove) {
      if (!subremove && RDSetting.GLOBAL_REMOVE_BEFORE_LISTENER && RDSetting.GLOBAL_REMOVE_BEFORE_LISTENER != '') {
        try {
          window.tempfunc = RDSetting
          eval('window.isremove = ' + RDSetting.GLOBAL_REMOVE_BEFORE_LISTENER + '(model);')
          if (!isremove) {
            window.isremove = false
            return
          }
          window.isremove = false
        } catch (e) {
          console.error('删除控件的前置方法调用失败', e)
        }
      }
      var removedControls = []
      delete this.rootModels[model.id]
      removedControls[removedControls.length] = model

      if (model.baseModelType == "Line") {
        let updateLinkGroups = [model.startLinkGroup, model.endLinkGroup]
        model.destoryLinkGroup()
        //更新线段两边所在分组的所有线段样式
        for (let gi = 0; gi < updateLinkGroups.length; gi++) {
          let updateLines = updateLinkGroups[gi]["lines"]
          for (let li = 0; li < updateLines.length; li++) {
            updateLines[li].updateByStyle()
          }
        }
      } else if (model.baseModelType == "Activity") {
        //找到四个方向相关联的线并更新
        let dirTypes = ['left', "top", 'bottom', 'right']
        let mdc = model
        let delLines = []
        for (let dirType = 0; dirType < dirTypes.length; dirType++) {
          let linkGroupKey = mdc.id + "_" + dirTypes[dirType]
          let linkGroup = me.linkGroups[linkGroupKey]
          if (linkGroup && linkGroup["lines"]) {

            for (let li = 0; li < linkGroup["lines"].length; li++) {
              //移除本线段
              let rmLine = linkGroup["lines"][li]
              if (delLines.indexOf(rmLine) == -1) {
                delLines[delLines.length] = rmLine
              }
            }
          }
          delete me.linkGroups[linkGroupKey]
          // me.linkGroups[linkGroupKey] = null;
        }
        for (let li = 0; li < delLines.length; li++) {
          this.removeControl(delLines[li])

        }
      }
      model.destoryModelAndShapes()

      // 重绘
      this.drawOrPush(this.backgroundLayer)
      this.drawOrPush(this.shapeLayer)
      this.drawOrPush(this.anchorLayer)
      this.drawOrPush(this.lineLayer)
      this.drawOrPush(this.descLayer)
      try {
        if (!subremove && RDSetting.GLOBAL_REMOVE_AFTER_LISTENER != null && RDSetting.GLOBAL_REMOVE_AFTER_LISTENER != '') {
          eval(RDSetting.GLOBAL_REMOVE_AFTER_LISTENER + '(removedControls);')
        }
      } catch (e) {
        console.error('调用删除后的回调函数失败，', e)
      }

    }

    // 删除单个控件
    this.removeSigleControl = function (model, subremove) {
      if (!subremove && RDSetting.GLOBAL_REMOVE_BEFORE_LISTENER && RDSetting.GLOBAL_REMOVE_BEFORE_LISTENER != '') {
        try {
          window.isremove = false
        } catch (e) {
          console.error('删除控件的前置方法调用失败', e)
        }
      }
      var removedControls = []
      delete this.rootModels[model.id]
      removedControls[removedControls.length] = model




      if (model.baseModelType == "Line") {
        let updateLinkGroups = [model.startLinkGroup, model.endLinkGroup]
        model.destoryLinkGroup()
        //更新线段两边所在分组的所有线段样式
        for (let gi = 0; gi < updateLinkGroups.length; gi++) {
          let updateLines = updateLinkGroups[gi]["lines"]
          for (let li = 0; li < updateLines.length; li++) {
            updateLines[li].updateByStyle()
          }
        }
      } else if (model.baseModelType == "Activity") {
        //找到四个方向相关联的线并更新
        let dirTypes = ['left', "top", 'bottom', 'right']
        let mdc = model
        let delLines = []
        for (let dirType = 0; dirType < dirTypes.length; dirType++) {
          let linkGroupKey = mdc.id + "_" + dirTypes[dirType]
          let linkGroup = me.linkGroups[linkGroupKey]
          if (linkGroup && linkGroup["lines"]) {

            for (let li = 0; li < linkGroup["lines"].length; li++) {
              //移除本线段
              let rmLine = linkGroup["lines"][li]
              if (delLines.indexOf(rmLine) == -1) {
                delLines[delLines.length] = rmLine
              }
            }
          }
          me.linkGroups[linkGroupKey] = null
        }
        for (let li = 0; li < delLines.length; li++) {
          this.removeControl(delLines[li])

        }
      }
      model.destoryModelAndShapes()
      // 重绘
      this.drawOrPush(this.backgroundLayer)
      this.drawOrPush(this.shapeLayer)
      this.drawOrPush(this.anchorLayer)
      this.drawOrPush(this.lineLayer)
      this.drawOrPush(this.descLayer)
      try {
        if (!subremove && RDSetting.GLOBAL_REMOVE_AFTER_LISTENER != null && RDSetting.GLOBAL_REMOVE_AFTER_LISTENER != '') {
          eval(RDSetting.GLOBAL_REMOVE_AFTER_LISTENER + '(removedControls);')
        }
      } catch (e) {
        console.error('调用删除后的回调函数失败，', e)
      }
    }
    // 删除控件
    this.removeControlById = function (id) {
      var model = this.rootModels[id]
      this.removeSigleControl(model)
    }

    // 删除选中的控件
    this.removeSelectedControl = function () {
      let selectedShapes = this.getSelectedShapes()
      this.tempTransformerShape = null
      for (let i = 0; i < selectedShapes.length; i++) {
        let model = selectedShapes[i]
        if (model.canDel) {
          this.clearSelection()
          this.removeControl(model)
        }
      }
      this.hideButtons()
      this.drawOrPush(this.anchorLayer)
      this.clickTab(this)


    }

    //将图片转换为base64编码
    this.image2Base64 = function (img) {
      var canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      var ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0, img.width, img.height)
      var dataURL = canvas.toDataURL("image/png")
      return dataURL
    }

    /**
     * 从右边调整控件的大小
     * 该方法在拖拽过程中调用，支持多个控件同时改变大小
     */
    this.changeSizeToRight = function (e) {
      let rect = this.auxRect.getBBox()
      let changeWidth = e.clientX - this.getOffsetLeft(this.container) + this.container.scrollLeft - rect.x - rect.width
      var mod = changeWidth % this.help_line_weight
      if (mod > this.help_line_weight / 2) {
        changeWidth = changeWidth + (this.help_line_weight - mod)
      } else {
        changeWidth = changeWidth - mod
      }
      if (changeWidth != 0) {
        let controls = this.getSelectedShapes()
        //执行校验，如果拖拽后小于了5，则不允许
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
          me.auxRect.setSize({
            width: outRect.x1 - outRect.x + 4,
            height: outRect.y1 - outRect.y + 4
          })
          me.auxRect.setPosition({
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
    this.changeSizeToLeft = function (e) {
      let rect = this.auxRect.getBBox()
      let changeWidth = e.clientX - this.getOffsetLeft(this.container) + this.container.scrollLeft - rect.x
      var mod = changeWidth % this.help_line_weight
      if (mod > this.help_line_weight / 2) {
        changeWidth = changeWidth + (this.help_line_weight - mod)
      } else {
        changeWidth = changeWidth - mod
      }
      if (changeWidth != 0) {
        let controls = this.getSelectedShapes()
        //执行校验，如果拖拽后小于了5，则不允许
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
          me.auxRect.setSize({
            width: outRect.x1 - outRect.x + 4,
            height: outRect.y1 - outRect.y + 4
          })
          me.auxRect.setPosition({
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
    this.changeSizeToBottom = function (e) {
      let rect = this.auxRect.getBBox()
      let changeHeight = e.clientY - this.getOffsetTop(this.container) + this.container.scrollTop - rect.y - rect.height
      var mod = changeHeight % this.help_line_weight
      if (mod > this.help_line_weight / 2) {
        changeHeight = changeHeight + (this.help_line_weight - mod)
      } else {
        changeHeight = changeHeight - mod
      }
      if (changeHeight != 0) {
        let controls = this.getSelectedShapes()
        //执行校验，如果拖拽后小于了5，则不允许
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
          me.auxRect.setSize({
            width: outRect.x1 - outRect.x + 4,
            height: outRect.y1 - outRect.y + 4
          })
          me.auxRect.setPosition({
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
    this.changeSizeToTop = function (e) {
      let rect = this.auxRect.getBBox()
      let changeHeight = e.clientY - this.getOffsetTop(this.container) + this.container.scrollTop - rect.y
      var mod = changeHeight % this.help_line_weight
      if (mod > this.help_line_weight / 2) {
        changeHeight = changeHeight + (this.help_line_weight - mod)
      } else {
        changeHeight = changeHeight - mod
      }
      if (changeHeight != 0) {
        let controls = this.getSelectedShapes()
        //执行校验，如果拖拽后小于了5，则不允许
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
          me.auxRect.setSize({
            width: outRect.x1 - outRect.x + 4,
            height: outRect.y1 - outRect.y + 4
          })
          me.auxRect.setPosition({
            x: outRect.x - 2,
            y: outRect.y - 2
          })

        }
      }
    }

    /**
     * 创建快捷菜单
     */
    this.createQuickMenu = function () {
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
              var contentWidth = col * width + ((col + 1) * splitWeight)
              var contentHeight = row * height + ((row + 1) * splitWeight)
              // 创建面板
              this.quickMenuShape = createSVGElement('svg', this, {})
              this.stage.appendChild(this.quickMenuShape)

              var rectShape = createSVGElement('rect', this, {
                fill: '#FFFFFF',
                cornerRadius: 5,
                width: contentWidth,
                height: contentHeight
              })
              var smallShape = createSVGElement('rect', this, {
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
                var menuGroup = createSVGElement('svg', mc, {
                  x: groupX,
                  y: groupY
                })
                // 加上id
                if (mc.id) {
                  menuGroup.id = mc.id
                  // 粘贴菜单默认隐藏
                  if (mc.id == staticJs.pasteMenuId) {
                    menuGroup.hide()
                  }
                }
                menuGroup.rd = this
                var ellShape = createSVGElement('circle', mc, {
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

                var imgShape = createSVGElement('image', mc, {
                  x: quickConfig.weight / 2 - 15,
                  y: quickConfig.weight / 2 - 30,
                  'xlink:href': RDSetting.ICOS[mc.icon],
                  width: 30,
                  height: 30,
                  icon: RDSetting.ICOS[mc.icon],
                  selectedIcon: RDSetting.ICOS[mc.selectedIcon]
                })
                menuGroup.appendChild(imgShape)

                var textShape = createSVGElement('text', mc, {
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
                  RDSetting.createProcessActivity(this.rd.tempQuickMenuModel, this.mc)
                  e.target.parentElement.parentElement.hide()
                  this.rd.drawOrPush(this.getLayer())
                })

                // 添加鼠标移入事件
                menuGroup.addEventListener('mouseover', function (e) {
                  this.children[0].fill(this.model.selectedFillColor)

                  this.children[0].shadowOpacity(0.5)

                  document.body.style.cursor = 'pointer'
                  this.children[1].image(this.children[1].getAttribute('selectedIcon'))

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
    this.createAndShowQuickMenu = function (model) {
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

    this.toJSON = function () {
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
        for (let j = 0; j < lg["lines"].length; j++) {
          lineIds[lineIds.length] = lg["lines"][j].id
        }
        json.linkGroups[i].lineIds = lineIds
      }
      return json
    }

    // 舞台对象
    this.stage = null
    // 背景层图形图层，线图层，锚点图层
    this.backgroundLayer = null
    this.shapeLayer = null
    this.lineLayer = null
    this.descLayer = null
    this.anchorLayer = null

    // 生成一张高清图片
    this.toImage = function () {
      var dataURL = this.stage.toDataURL({
        pixelRatio: RDSetting.GLOBAL_EXPORT_IMAGE_PR
      })
      return dataURL
    }



    this.getOffsetTop = function (el) {
      if (el == this.container) {
        //查看缓存中是否存在值
        if (this.curContainerOffssetTop) {
          return this.curContainerOffssetTop
        }
      }
      let value = el.offsetParent
        ? el.offsetTop + this.getOffsetTop(el.offsetParent)
        : el.offsetTop
      if (el == this.container) {
        this.curContainerOffssetTop = value
      }
      return value
    }

    this.getOffsetLeft = function (el) {
      if (el == this.container) {
        //查看缓存中是否存在值
        if (this.curContainerOffssetLeft) {
          return this.curContainerOffssetLeft
        }
      }
      let value = el.offsetParent
        ? el.offsetLeft + this.getOffsetLeft(el.offsetParent)
        : el.offsetLeft
      if (el == this.container) {
        this.curContainerOffssetLeft = value
      }
      return value
    }

    // 初始化图形以及舞台对象
    this.init = function (rootModel) {

      var containerEle = document.getElementById(this.containerid)
      containerEle.innerHTML = ''
      this.stage = createSVGElement('svg', this, {
        version: '1.1',
        width: this.width,
        height: this.height
      })
      this.container = containerEle

      containerEle.appendChild(this.stage)

      // 初始化图形图层
      this.shapeLayer = createSVGElement('g', this, {
        id: this.containerid + '_shapeLayer'
      })
      // 初始化连线图层
      this.lineLayer = createSVGElement('g', this, {
        id: this.containerid + '_lineLayer'
      })
      // 初始化锚点图层
      this.anchorLayer = createSVGElement('g', this, {
        id: this.containerid + '_anchorLayer'
      })
      // 初始化描述图层
      this.descLayer = createSVGElement('g', this, {
        id: this.containerid + '_descLayer'
      })
      // 初始化背景图层
      this.backgroundLayer = createSVGElement('g', this, {
        id: this.containerid + '_backgroundLayer'
      })

      // 将图层加入到画布中,顺序为线，图形，锚点，这样锚点的优先级最高，图形在中间，线在最下面，不遮挡任何图形
      this.stage.appendChild(this.backgroundLayer)
      this.stage.appendChild(this.descLayer)
      this.stage.appendChild(this.lineLayer)
      this.stage.appendChild(this.shapeLayer)
      this.stage.appendChild(this.anchorLayer)

      // 初始化删除按钮
      if (RDSetting.GLOBAL_REMOVE_BTN && !me.readonly) {
        // 初始化删除按钮
        this.removeBtnShape = createSVGElement('image', this, {
          x: 0,
          y: 0,
          'xlink:href': RDSetting.ICOS['icon-delete'],
          width: 14,
          height: 14,
          id: 'shape_remove_btn'
        })
        this.removeBtnShape.hide()

        this.removeBtnShape.addEventListener('click', function (e) {
          if (me.tempRemoveControl && !me.readonly && me.canDel) {
            me.removeControl(me.tempRemoveControl)
            me.hideButtons()
            me.drawOrPush(me.anchorLayer)

            me.clickTab(me)

            return false
          }

        })

        this.stage.appendChild(this.removeBtnShape)

      }






      this.stage.model = this

      // 拖拽事件的实现，由mousedown，mousemove和mouseup组成，用来自己实现drag事件
      // 当鼠标按下的时候，用mousedown来触发，将当前要拖拽的模型以及坐标信息注册到dragObj，dragX和dargY
      if (!this.stage.eventListeners['mousedown']) {
        var func = function (e) {
          if (!window.dragObj) {
            e.stopPropagation()
            if (e.button == 0) {
              // 如果当前点击的是auxRect,将事件交给auxRect的事件进行处理
              if (e.target == this.model.auxRect) {
                if (this.model.auxRect.eventListeners['dragstart']) {
                  var moveMethods = this.model.auxRect.eventListeners['dragstart']
                  for (var i = 0; i < moveMethods.length; i++) {
                    moveMethods[i].call(null, e)
                  }
                }
              } else if (e.target && e.target.getAttribute("mtype") == "startLineBar") {
                if (this.model.startLineBar.eventListeners['dragstart']) {
                  var moveMethods = this.model.startLineBar.eventListeners['dragstart']
                  for (var i = 0; i < moveMethods.length; i++) {
                    moveMethods[i].call(null, e)
                  }
                }
              }

              //如果当前控件不为画布，纸张以及套图，则判断当前控件是否可以拖拽移动，如果可以则开启拖拽
              else if (e.target.model && e.target.model.modelType != 'RuleCanvas' && this.model.isCanMove(e.target.model)) {
                window.dragX = e.target.model.x - (e.layerX + this.model.container.scrollLeft)
                window.dragY = e.target.model.y - (e.layerY + this.model.container.scrollTop)
                window.dragObj = e.target.model
                if (window.dragObj.shapes[0].eventListeners['dragstart']) {
                  var moveMethods = window.dragObj.shapes[0].eventListeners['dragstart']
                  for (var i = 0; i < moveMethods.length; i++) {
                    moveMethods[i].call(null, e)
                  }
                }
              }
            }

          }
        }
        this.stage.eventListeners['mousedown'] = [func]
        this.stage.addEventListener('mousedown', func)
      }
      // 当鼠标按下后（进入拖拽状态），并且移动时，改变控件的坐标
      if (!this.stage.eventListeners['mousemove']) {

        var func = function (e) {
          if (!window.upMouseMoveTime) {
            window.upMouseMoveTime = new Date().getTime()
          } else {
            let newTime = new Date().getTime()
            if (newTime - window.upMouseMoveTime > 30) {
              window.upMouseMoveTime = newTime
            } else {
              return
            }
          }
          //记录鼠标位置
          window.gMouseOffetX = me.container.scrollLeft + e.layerX
          window.gMouseOffetY = me.container.scrollTop + e.layerY
          let layerX = e.clientX - me.getOffsetLeft(me.container) + me.container.scrollLeft
          let layerY = e.clientY - me.getOffsetTop(me.container) + me.container.scrollTop
          if (!me.tempMoveNumber) {
            me.tempMoveNumber = 0
          }

          if (e.target && e.target.getAttribute("mtype") == "endLineBar") {
            if (this.model.endLineBar.eventListeners['dragmove']) {
              var moveMethods = this.model.endLineBar.eventListeners['dragmove']
              for (var i = 0; i < moveMethods.length; i++) {
                moveMethods[i].call(null, e)
              }
            }
            return
          }
          let control = me.findControlByPosition({ x: layerX, y: layerY })
          if (control && control.length > 0) {
            me.tempMoveNumber = 0
            let md = control[0]
            //已经切换了控件
            if (me.tempRemoveControl != md) {

              me.hideButtons()
              me.tempRemoveControl = md
            }
            //显示删除按钮
            if (RDSetting.GLOBAL_REMOVE_BTN && !me.readonly) {
              // 移动删除小图标的位置
              me.removeBtnShape.setPosition({
                x: md.x + parseInt(md.width) - 18,
                y: md.y + 4
              })
              me.removeBtnShape.show()
            }

            if (md.baseModelType == "Activity" && !me.readonly) {
              //既没有创建，也没有改变线
              if (!window.dragObj && !me.lineCreating && !me.lineChanging) {

                //判断是否移动到四个，边线上，如果是则变化鼠标
                let areawidth = 5
                let layerX = e.clientX - me.getOffsetLeft(me.container) + me.container.scrollLeft - md.x
                layerY = e.clientY - me.getOffsetTop(me.container) + me.container.scrollTop - md.y
                let startRate = 0.1
                let endRate = 0.9
                //左边线,中间部分,三分之二处
                if (Math.abs(layerX) <= areawidth && Math.abs(layerY) >= md.height * startRate && Math.abs(layerY) <= md.height * endRate) {
                  me.showStartLineBar(md, "left")
                }
                //右边线,中间部分,三分之二处
                else if (Math.abs(md.width - layerX) <= areawidth && Math.abs(layerY) >= md.height * startRate && Math.abs(layerY) <= md.height * endRate) {
                  me.showStartLineBar(md, "right")
                }
                //上边线,中间部分,三分之二处
                else if (Math.abs(layerY) <= areawidth && Math.abs(layerX) >= md.width * startRate && Math.abs(layerX) <= md.width * endRate) {
                  me.showStartLineBar(md, "top")
                }
                //下边线,中间部分,三分之二处
                else if (Math.abs(md.height - layerY) <= areawidth && Math.abs(layerX) >= md.width * startRate && Math.abs(layerX) <= md.width * endRate) {
                  me.showStartLineBar(md, "bottom")
                } else {
                  document.body.style.cursor = 'default'
                  me.hideStartLineBar()
                }
              }
              //正在改变线的开始节点或结束节点的情况
              else if (me.lineChanging) {
                //取得要改变线段的另一段的位置以及关系
                let nonChangeLinkGroup = null
                if (me.underLinePoint == "start") {
                  nonChangeLinkGroup = me.underLine.endLinkGroup
                } else {
                  nonChangeLinkGroup = me.underLine.startLinkGroup
                }
                //判断是否移动到四个，边线上，如果是则变化鼠标
                let areawidth = 5
                let layerX = e.clientX - me.getOffsetLeft(me.container) + me.container.scrollLeft - md.x
                let layerY = e.clientY - me.getOffsetTop(me.container) + me.container.scrollTop - md.y
                let changeEndBar = false
                let startRate = 0.1
                let endRate = 0.9
                //移动线段时的校验
                if (RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR) {

                  if (me.underLinePoint == "start") {
                    eval('window.allowLineChange = ' + RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR + '(md,me.underLine.endLinkGroup.model,me.underLine,me,e);')
                  } else if (me.underLinePoint == "end") {
                    eval('window.allowLineChange = ' + RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR + '(me.underLine.startLinkGroup.model,md,me.underLine,me,e);')
                  }

                }
                //左边线,中间部分,三分之二处
                if (allowLineChange && Math.abs(layerX) <= areawidth && Math.abs(layerY) >= md.height * startRate && Math.abs(layerY) <= md.height * endRate) {
                  if (!(nonChangeLinkGroup.model.id == md.id && nonChangeLinkGroup.type == "left")) {
                    document.body.style.cursor = 'grab'
                    me.showEndLineBar(md, "left")
                  }
                }
                //右边线,中间部分,三分之二处
                else if (allowLineChange && Math.abs(md.width - layerX) <= areawidth && Math.abs(layerY) >= md.height * startRate && Math.abs(layerY) <= md.height * endRate) {
                  if (!(nonChangeLinkGroup.model.id == md.id && nonChangeLinkGroup.type == "right")) {
                    document.body.style.cursor = 'grab'
                    me.showEndLineBar(md, "right")
                  }
                }
                //上边线,中间部分,三分之二处
                else if (allowLineChange && Math.abs(layerY) <= areawidth && Math.abs(layerX) >= md.width * startRate && Math.abs(layerX) <= md.width * endRate) {
                  if (!(nonChangeLinkGroup.model.id == md.id && nonChangeLinkGroup.type == "top")) {
                    document.body.style.cursor = 'grab'
                    me.showEndLineBar(md, "top")
                  }
                }
                //下边线,中间部分,三分之二处
                else if (allowLineChange && Math.abs(md.height - layerY) <= areawidth && Math.abs(layerX) >= md.width * startRate && Math.abs(layerX) <= md.width * endRate) {
                  if (!(nonChangeLinkGroup.model.id == md.id && nonChangeLinkGroup.type == "bottom")) {
                    document.body.style.cursor = 'grab'
                    me.showEndLineBar(md, "bottom")
                  }
                } else {
                  document.body.style.cursor = 'grabbing'
                  if (me.tempCreateLine) {
                    //暂时移除当前线段与关系
                    me.removeControl(me.tempCreateLine)
                    if (me.underLinePoint == "start") {
                      me.tempCreateLine.destoryStartLinkGroup()
                      me.tempCreateLine.startLinkGroup = null
                    } else {
                      me.tempCreateLine.destoryEndLinkGroup()
                      me.tempCreateLine.endLinkGroup = null
                    }
                    me.tempCreateLine = null
                  }
                  me.hideEndLineBar()
                }

                if (me.endLineBar && !me.tempCreateLine) {

                  me.tempCreateLine = me.underLine
                  //建立新的关系
                  let targetModel = me.rootModels[me.endLineBar.getAttribute("mid")]
                  let targetDirectType = me.endLineBar.getAttribute("directtype")
                  let linkGroupKey = targetModel.id + "_" + targetDirectType
                  if (!me.linkGroups[linkGroupKey]) {
                    me.linkGroups[linkGroupKey] = { "model": targetModel, "type": targetDirectType, "lines": [], "collect": 0 }
                  }

                  if (targetDirectType == "left" || targetDirectType == "right") {
                    if (layerY >= targetModel.height * 0.5) {
                      me.linkGroups[linkGroupKey]["lines"].push(me.tempCreateLine)
                    } else {
                      me.linkGroups[linkGroupKey]["lines"].unshift(me.tempCreateLine)
                    }
                  } else if (targetDirectType == "top" || targetDirectType == "bottom") {
                    if (layerX >= targetModel.width * 0.5) {
                      me.linkGroups[linkGroupKey]["lines"].push(me.tempCreateLine)
                    } else {
                      me.linkGroups[linkGroupKey]["lines"].unshift(me.tempCreateLine)
                    }
                  }


                  if (me.underLinePoint == "start") {
                    me.tempCreateLine.startLinkGroup = me.linkGroups[linkGroupKey]
                  } else {
                    me.tempCreateLine.endLinkGroup = me.linkGroups[linkGroupKey]
                  }
                  //记录当前linkgroup的状态，以便恢复
                  if (me.linkGroups[linkGroupKey]) {
                    me.tempEndCollectState = me.linkGroups[linkGroupKey].collect
                    //强制设置为不收折
                    me.linkGroups[linkGroupKey].collect = 0
                  } else {
                    //默认不收折
                    me.tempEndCollectState = 0
                  }
                  //将线段重新添加到模型
                  me.rootModels[me.tempCreateLine.id] = me.tempCreateLine
                  me.addControl([me.tempCreateLine])
                  me.clickTab(me.tempCreateLine)
                  me.tempCreateLine.lineOpacity = 0.5
                  me.tempCreateLine.attrs["lineOpacity"] = 0.5
                  //更新所有关联分组的控件
                  let lines = me.linkGroups[linkGroupKey]["lines"]
                  for (let i = 0; i < lines.length; i++) {
                    lines[i].updateByStyle()
                  }
                }
                window.allowLineChange = null
              }
              //正在创建新线段
              else if (me.startLineBar && me.lineCreating) {
                if (RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR) {
                  eval('window.allowLineChange = ' + RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR + '(me.rootModels[me.startLineBar.getAttribute("mid")],md,null,me,e);')
                }
                //判断是否移动到四个，边线上，如果是则变化鼠标
                let areawidth = 5
                let layerX = e.clientX - me.getOffsetLeft(me.container) + me.container.scrollLeft - md.x
                let layerY = e.clientY - me.getOffsetTop(me.container) + me.container.scrollTop - md.y
                let changeEndBar = false
                let startRate = 0.1
                let endRate = 0.9
                //左边线,中间部分,三分之二处
                if (allowLineChange && Math.abs(layerX) <= areawidth && Math.abs(layerY) >= md.height * startRate && Math.abs(layerY) <= md.height * endRate) {
                  if (!(me.startLineBar.getAttribute("mid") == md.id && me.startLineBar.getAttribute("directtype") == "left")) {
                    document.body.style.cursor = 'grab'
                    me.showEndLineBar(md, "left")
                  }
                }
                //右边线,中间部分,三分之二处
                else if (allowLineChange && Math.abs(md.width - layerX) <= areawidth && Math.abs(layerY) >= md.height * startRate && Math.abs(layerY) <= md.height * endRate) {
                  if (!(me.startLineBar.getAttribute("mid") == md.id && me.startLineBar.getAttribute("directtype") == "right")) {
                    document.body.style.cursor = 'grab'
                    me.showEndLineBar(md, "right")
                  }
                }
                //上边线,中间部分,三分之二处
                else if (allowLineChange && Math.abs(layerY) <= areawidth && Math.abs(layerX) >= md.width * startRate && Math.abs(layerX) <= md.width * endRate) {
                  if (!(me.startLineBar.getAttribute("mid") == md.id && me.startLineBar.getAttribute("directtype") == "top")) {
                    document.body.style.cursor = 'grab'
                    me.showEndLineBar(md, "top")
                  }
                }
                //下边线,中间部分,三分之二处
                else if (allowLineChange && Math.abs(md.height - layerY) <= areawidth && Math.abs(layerX) >= md.width * startRate && Math.abs(layerX) <= md.width * endRate) {
                  if (!(me.startLineBar.getAttribute("mid") == md.id && me.startLineBar.getAttribute("directtype") == "bottom")) {
                    document.body.style.cursor = 'grab'
                    me.showEndLineBar(md, "bottom")
                  }
                } else {
                  document.body.style.cursor = 'grabbing'
                  if (me.tempCreateLine) {
                    me.removeControl(me.tempCreateLine)
                    me.tempCreateLine = null
                  }

                  me.hideEndLineBar()
                }
                if (me.endLineBar && !me.tempCreateLine) {
                  //创建临时关联线段
                  var timestamp = me.curIndex
                  me.curIndex++
                  me.tempCreateLine = new RDLine(me, {
                    id: 'rd_line_' + timestamp,
                    code: 'rd_line_' + timestamp,
                    lineType: "2",
                    start: { x: 0, y: 0, width: 4, height: 4 },
                    end: { x: 0, y: 0, width: 4, height: 4 },
                    controlType: "4000001"
                  })
                  //建立开始Activity与Line的关联关系
                  let startModel = me.rootModels[me.startLineBar.getAttribute("mid")]
                  let startLineType = me.startLineBar.getAttribute("directtype")

                  let startLinkGroupKey = startModel.id + "_" + startLineType
                  if (!me.linkGroups[startLinkGroupKey]) {
                    me.linkGroups[startLinkGroupKey] = { "model": startModel, "type": startLineType, "lines": [], "collect": 0 }
                  }
                  if (me.lineCreatingPoint == "first") {
                    me.linkGroups[startLinkGroupKey]["lines"].unshift(me.tempCreateLine)
                  } else {
                    me.linkGroups[startLinkGroupKey]["lines"].push(me.tempCreateLine)
                  }

                  me.tempCreateLine.startLinkGroup = me.linkGroups[startLinkGroupKey]
                  //建立结束Activity与Line的关联关系
                  let endModel = me.rootModels[me.endLineBar.getAttribute("mid")]
                  let endLineType = me.endLineBar.getAttribute("directtype")
                  let endLinkGroupKey = endModel.id + "_" + endLineType
                  if (!me.linkGroups[endLinkGroupKey]) {
                    me.linkGroups[endLinkGroupKey] = { "model": endModel, "type": endLineType, "lines": [], "collect": 0 }
                  }
                  //记录当前linkgroup的状态，以便恢复
                  if (me.linkGroups[endLinkGroupKey]) {
                    me.tempEndCollectState = me.linkGroups[endLinkGroupKey].collect
                    //强制设置为不收折
                    me.linkGroups[endLinkGroupKey].collect = 0
                  }


                  if (endLineType == "left" || endLineType == "right") {
                    if (layerY >= endModel.height * 0.5) {
                      me.linkGroups[endLinkGroupKey]["lines"].push(me.tempCreateLine)
                    } else {
                      me.linkGroups[endLinkGroupKey]["lines"].unshift(me.tempCreateLine)
                    }
                  } else if (endLineType == "top" || endLineType == "bottom") {
                    if (layerX >= endModel.width * 0.5) {
                      me.linkGroups[endLinkGroupKey]["lines"].push(me.tempCreateLine)
                    } else {
                      me.linkGroups[endLinkGroupKey]["lines"].unshift(me.tempCreateLine)
                    }
                  }

                  me.tempCreateLine.endLinkGroup = me.linkGroups[endLinkGroupKey]

                  me.rootModels[me.tempCreateLine.id] = me.tempCreateLine
                  me.addControl([me.tempCreateLine])
                  me.clickTab(me.tempCreateLine)
                  me.tempCreateLine.lineOpacity = 0.5
                  me.tempCreateLine.attrs["lineOpacity"] = 0.5
                  //更新所有关联分组的控件
                  let lines = me.linkGroups[startLinkGroupKey]["lines"]
                  for (let i = 0; i < lines.length; i++) {
                    lines[i].updateByStyle()
                  }
                  lines = me.linkGroups[endLinkGroupKey]["lines"]
                  for (let i = 0; i < lines.length; i++) {
                    lines[i].updateByStyle()
                  }

                }
                window.allowLineChange = null
              }
            }

          } else {
            //如果正在修改线段中，但没有在控件上，则删除临时线段
            if (me.lineChanging && me.tempCreateLine) {

              document.body.style.cursor = 'grabbing'
              if (me.tempCreateLine) {
                //暂时移除当前线段与关系
                me.removeControl(me.tempCreateLine)
                if (me.underLinePoint == "start") {
                  me.tempCreateLine.destoryStartLinkGroup()
                  me.tempCreateLine.startLinkGroup = null
                } else {
                  me.tempCreateLine.destoryEndLinkGroup()
                  me.tempCreateLine.endLinkGroup = null
                }
                me.tempCreateLine = null
              }
              me.hideEndLineBar()
            }
            //如果没有在控件上，并且没有创建线段，但开始活结束节点有数据，则删除开始和结束节点,恢复鼠标样式
            else if (!me.lineChanging && !me.lineCreating && (me.startLineBar || me.endLineBar)) {
              me.hideStartLineBar()
              me.hideEndLineBar()
              document.body.style.cursor = 'default'
            }
            //如果处于创建线段中，但没有在控件上，则删除临时线段
            else if (me.lineCreating && me.startLineBar && me.tempCreateLine) {
              document.body.style.cursor = 'grabbing'
              me.removeControl(me.tempCreateLine)
              me.tempCreateLine = null
              me.hideEndLineBar()
              return
            }
            //如果处于创建线段中，但是没有结束线
            else if (me.lineCreating && me.startLineBar) {
              document.body.style.cursor = 'grabbing'
              return
            }
            //如果不在回显图形上
            let rect = { x: 0, y: 0, width: 0, height: 0 }
            if (me.auxRect) {
              rect = me.auxRect.getBBox()
            }

            if (layerX >= rect.x && layerX <= rect.x + rect.width && layerY >= rect.y && layerY <= rect.y + rect.height) {
            } else {
              document.body.style.cursor = 'default'
              me.tempMoveNumber++
              //如果在空白处移动，超出了最大循环次数，则隐藏功能按钮
              if (RDSetting.GLOBAL_HIDDEN_BTN_NUMBER <= me.tempMoveNumber) {
                me.hideButtons()
              }
            }

          }
          if (!window.dragObj) {
            return
          }

          window.stopClick = true
          var model = window.dragObj
          var shape = null
          if (model == model.rd.auxRect) {
            shape = model
          } else {
            shape = model.shapes[0]
          }

          if (shape.eventListeners['dragmove']) {
            var moveMethods = shape.eventListeners['dragmove']
            for (var i = 0; i < moveMethods.length; i++) {
              moveMethods[i].call(null, e)
            }
          }


        }
        this.stage.eventListeners['mousemove'] = [func]
        this.stage.addEventListener('mousemove', func)
      }

      // 当鼠标弹起后，结束拖拽状态，清空dragObj，drawX和dragY
      if (!this.stage.eventListeners['mouseup']) {
        var func = function (e) {
          window.upMouseMoveTime = null
          //如果处于创建节点，就完成创建,或者丢弃创建
          if (me.lineCreating) {
            me.lineCreating = false
            me.lineCreatingPoint = null
            document.body.style.cursor = 'default'


            if (me.tempCreateLine) {
              me.tempCreateLine.lineOpacity = 1
              me.tempCreateLine.attrs["lineOpacity"] = 1
              me.tempCreateLine.updateByStyle()
              me.tempCreateLine = null
            }
            me.hideStartLineBar()
            me.hideEndLineBar()
            return
          } else if (me.lineChanging) {
            me.lineChanging = false
            document.body.style.cursor = 'default'
            //如果临时线段存在，则生效
            if (me.tempCreateLine) {
              //恢复另一端点的关系
              me.otherLinkGroup["lines"].splice(me.otherLinkGroupLineIndex, 0, me.tempCreateLine)
              me.tempCreateLine.lineOpacity = 1
              me.tempCreateLine.attrs["lineOpacity"] = 1
              me.tempCreateLine.updateByStyle()
              me.underLine = me.tempCreateLine
              me.tempCreateLine = null

            }
            //如果临时线段不存在则恢复
            else {
              me.underLinelinkGroup["lines"].splice(me.underLineIndex, 0, me.underLine)
              //恢复另一端点的关系
              me.otherLinkGroup["lines"].splice(me.otherLinkGroupLineIndex, 0, me.underLine)
              if (me.underLinePoint == "start") {
                me.underLine.startLinkGroup = me.underLinelinkGroup
              } else {
                me.underLine.endLinkGroup = me.underLinelinkGroup
              }
              me.addControl([me.underLine])
              me.underLine.lineOpacity = 1
              me.underLine.attrs["lineOpacity"] = 1
              me.underLine.updateByStyle()
            }
            //更新两个linkgroups
            for (let li = 0; li < me.underLine.startLinkGroup["lines"].length; li++) {
              me.underLine.startLinkGroup["lines"][li].updateByStyle()
            }
            for (let li = 0; li < me.underLine.endLinkGroup["lines"].length; li++) {
              me.underLine.endLinkGroup["lines"][li].updateByStyle()
            }


            me.underLine = null
            me.underLinePoint = null
            me.underLinelinkGroup = null
            me.underLineIndex = null
            me.otherLinkGroup = null
            me.otherLinkGroupLineIndex = null
            me.hideStartLineBar()
            me.hideEndLineBar()
            return
          }
          if (!window.dragObj) {
            return
          } else {
            var model = window.dragObj
            var shape = null
            if (model == model.rd.auxRect) {
              shape = model
            } else {
              shape = model.shapes[0]
            }
            if (shape.eventListeners['dragend']) {
              var moveMethods = shape.eventListeners['dragend']
              for (var i = 0; i < moveMethods.length; i++) {
                moveMethods[i].call(null, e)
              }
            }
            window.createHelpLines = false
            window.dragX = -1
            window.dragY = -1
            window.dragObj = null
          }
        }

        this.stage.eventListeners['mouseup'] = [func]

        this.stage.addEventListener('mouseup', func)
      }

      // 全局点击事件，由画布触发，触发后会调用控件的click事件
      this.stage.addEventListener('click', function (e) {
        if (window.stopClick) {
          window.stopClick = false
          return
        }
        this.model.makeSelection(null, e)

      })

      for (var i in rootModel) {
        var model = rootModel[i]
        // 销毁原有图形
        if (model.shapes != null) {
          for (let x = 0; x < model.shapes.length; x++) {
            model.shapes[x].remove()
          }
        }
        // 调用创建图形
        model.buildShape()
      }
      this.rootModels = rootModel

      this.drawOrPush(this.backgroundLayer)
      this.drawOrPush(this.shapeLayer)
    }

    // 取得鼠标落点的所有控件
    this.findControlByPosition = function (position) {
      var returnModel = []
      if (position) {
        for (var i in this.rootModels) {
          var model = this.rootModels[i]
          if (model.x <= position.x && model.y <= position.y && model.x + parseInt(model.width) >= position.x && model.y + parseInt(model.height) >= position.y) {
            returnModel[returnModel.length] = model
          }
        }
      }
      return returnModel
    }

    // 更新辅助线
    this.updateHelpLines = function (shape, e) {

      // e.clientX-me.rd.getOffsetLeft(me.rd.container)
      let absPos = {
        x: e.layerX + this.container.scrollLeft + window.dragX,
        y: e.layerY + this.container.scrollTop + window.dragY
      }
      // 计算图形拖拽后将要到达的坐标
      if (RDSetting.GLOBAL_HELP_LINE_ENABLE) {
        var mod = absPos.x % this.help_line_weight
        if (mod > this.help_line_weight / 2) {
          absPos.x = absPos.x + (this.help_line_weight - mod)
        } else {
          absPos.x = absPos.x - mod
        }
        mod = absPos.y % this.help_line_weight
        if (mod > this.help_line_weight / 2) {
          absPos.y = absPos.y + (this.help_line_weight - mod)
        } else {
          absPos.y = absPos.y - mod
        }
        if (shape == null) {
          shape = window.dragObj.shapes[0]
        }

        if (shape.model != null) {
          shape.model.x = absPos.x
          shape.model.y = absPos.y
        } else {
          shape.setAttributeN(null, 'x', absPos.x)
          shape.setAttributeN(null, 'y', absPos.y)
        }

        // 修改提示文本
        if (this.helpBackLinies[this.helpBackLinies.length - 1]) {
          this.helpBackLinies[this.helpBackLinies.length - 1].innerHTML = absPos.x + ',' + absPos.y
          this.helpBackLinies[this.helpBackLinies.length - 1].setAttributeNS(null, 'x', absPos.x - 20)
          this.helpBackLinies[this.helpBackLinies.length - 1].setAttributeNS(null, 'y', absPos.y - 5)
        }

        if (RDSetting.GLOBAL_HELP_LINE_ALIGN_ENABLE) {
          // 判断是否出现左边的辅助线
          var leftHelpModels = null
          var rightHelpModels = null
          var topHelpModels = null
          var bottomHelpModels = null
          var dataX = 0, dataY = 0, dataW = 0, dataH = 0
          if (shape.model != null) {

            leftHelpModels = [shape.model]
            rightHelpModels = [shape.model]
            topHelpModels = [shape.model]
            bottomHelpModels = [shape.model]
            dataX = absPos.x
            dataY = absPos.y
            dataW = shape.model.width
            dataH = shape.model.height
          } else {

            var mo = {
              x: shape.x() + this.help_line_weight,
              y: shape.y() + this.help_line_weight,
              width: shape.width() - 2 * this.help_line_weight,
              height: shape.height() - 2 * this.help_line_weight
            }
            leftHelpModels = [mo]
            rightHelpModels = [mo]
            topHelpModels = [mo]
            bottomHelpModels = [mo]
            dataX = mo.x
            dataY = mo.y
            dataW = mo.width
            dataH = mo.height
          }
          // 寻找同一x上有几个活动，按照y的坐标进行降序排列
          var selectedShapes = []// this.getSelectedShapes();
          if (selectedShapes.length == 0) {
            selectedShapes = [shape.model]
          }
          for (var i in this.rootModels) {
            if (this.rootModels[i].baseModelType == 'Activity') {
              var md = this.rootModels[i]

              if (selectedShapes.indexOf(md) != -1 || shape.model == md) {
                continue
              }
              // 左辅助线
              if (md.x == dataX) {
                if (leftHelpModels.length == 0) {
                  leftHelpModels[0] = md
                } else {
                  if (leftHelpModels[0].y > md.y) {
                    leftHelpModels.splice(0, 0, md)
                  } else if (leftHelpModels.length > 1 && leftHelpModels[leftHelpModels.length - 1].y > md.y) {
                    leftHelpModels.splice(leftHelpModels.length - 1, 0, md)
                  } else {
                    leftHelpModels[leftHelpModels.length] = md
                  }
                }
              }
              // 右辅助线
              if (md.x + md.width == dataX + dataW) {
                if (rightHelpModels.length == 0) {
                  rightHelpModels[0] = md
                } else {
                  if (rightHelpModels[0].y > md.y) {
                    rightHelpModels.splice(0, 0, md)
                  } else if (rightHelpModels.length > 1 && rightHelpModels[rightHelpModels.length - 1].y > md.y) {
                    rightHelpModels.splice(rightHelpModels.length - 1, 0, md)
                  } else {
                    rightHelpModels[rightHelpModels.length] = md
                  }
                }
              }
              // 上辅助线
              if (md.y == dataY) {
                if (topHelpModels.length == 0) {
                  topHelpModels[0] = md
                } else {
                  if (topHelpModels[0].x > md.x) {
                    topHelpModels.splice(0, 0, md)
                  } else if (topHelpModels.length > 1 && topHelpModels[topHelpModels.length - 1].x > md.x) {
                    topHelpModels.splice(topHelpModels.length - 1, 0, md)
                  } else {
                    topHelpModels[topHelpModels.length] = md
                  }
                }
              }
              // 下辅助线
              if (md.y + md.height == dataY + dataH) {
                if (bottomHelpModels.length == 0) {
                  bottomHelpModels[0] = md
                } else {
                  if (bottomHelpModels[0].x > md.x) {
                    bottomHelpModels.splice(0, 0, md)
                  } else if (bottomHelpModels.length > 1 && bottomHelpModels[bottomHelpModels.length - 1].x > md.x) {
                    bottomHelpModels.splice(bottomHelpModels.length - 1, 0, md)
                  } else {
                    bottomHelpModels[bottomHelpModels.length] = md
                  }
                }
              }
            }
          }

          if (leftHelpModels != null && leftHelpModels.length > 1) {
            this.helpBackLinies[0].setPoints([leftHelpModels[0].x, leftHelpModels[0].y - 50, leftHelpModels[leftHelpModels.length - 1].x, leftHelpModels[leftHelpModels.length - 1].y + parseInt(leftHelpModels[leftHelpModels.length - 1].height) + 50])
          } else {
            this.helpBackLinies[0].setPoints(null)
          }
          if (rightHelpModels != null && rightHelpModels.length > 1) {
            this.helpBackLinies[1].setPoints([rightHelpModels[0].x + parseInt(rightHelpModels[0].width), rightHelpModels[0].y - 50, rightHelpModels[rightHelpModels.length - 1].x + parseInt(rightHelpModels[rightHelpModels.length - 1].width), rightHelpModels[rightHelpModels.length - 1].y + parseInt(rightHelpModels[rightHelpModels.length - 1].height) + 50])
          } else {
            this.helpBackLinies[1].setPoints(null)
          }
          if (topHelpModels != null && topHelpModels.length > 1) {
            this.helpBackLinies[2].setPoints([topHelpModels[0].x - 50, topHelpModels[0].y, topHelpModels[topHelpModels.length - 1].x + parseInt(topHelpModels[topHelpModels.length - 1].width) + 50, topHelpModels[topHelpModels.length - 1].y])
          } else {
            this.helpBackLinies[2].setPoints(null)
          }
          if (bottomHelpModels != null && bottomHelpModels.length > 1) {
            this.helpBackLinies[3].setPoints([bottomHelpModels[0].x - 50, bottomHelpModels[0].y + parseInt(bottomHelpModels[0].height), bottomHelpModels[bottomHelpModels.length - 1].x + parseInt(bottomHelpModels[bottomHelpModels.length - 1].width) + 50, bottomHelpModels[bottomHelpModels.length - 1].y + parseInt(bottomHelpModels[bottomHelpModels.length - 1].height)])
          } else {
            this.helpBackLinies[3].setPoints(null)
          }
        }
      }

      if (absPos.x < 0) {
        absPos.x = 0
      }
      if (absPos.y < 0) {
        absPos.y = 0
      }
      return absPos
    }

    // 销毁对齐辅助线
    this.destoryHelpLines = function () {
      if (RDSetting.GLOBAL_HELP_LINE_ENABLE) {
        // 销毁辅助线
        while (this.helpBackLinies.length > 0) {
          this.helpBackLinies[0].remove()
          this.helpBackLinies.splice(0, 1)
        }
        this.drawOrPush(this.backgroundLayer)
        this.drawOrPush(this.anchorLayer)
      }
    }


    // 获取不同字体大小的空格所占空间
    this.getSpaceWidth = function (fontFamily, fontSize, fontStyle) {
      let key = fontFamily + "_" + fontSize + "_" + fontStyle
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
        if ("Arial Unicode" == fontFamily) {
          let spaceWidth = fontSize * 0.21 / 0.75
          RDSetting.SPACE_WIDTH_MAP[key] = spaceWidth
        } else if ("STSong-Light" == fontFamily) {
          let spaceWidth = fontSize * 0.21
          RDSetting.SPACE_WIDTH_MAP[key] = spaceWidth
        }

      }
      return RDSetting.SPACE_WIDTH_MAP[key]
    }

    /**
     * 隐藏功能按钮
     */
    this.hideButtons = function () {
      if (RDSetting.GLOBAL_REMOVE_BTN && !me.readonly) {
        this.removeBtnShape.hide()
      }

      this.tempRemoveControl = null
      this.tempMoveNumber = 0
    }

    // 创建对齐辅助线
    this.createHelpLines = function () {
      // 创建辅助线
      if (RDSetting.GLOBAL_HELP_LINE_ENABLE) {
        var width = this.attrs.canvasWidth ? this.attrs.canvasWidth : window.innerWidth
        var height = this.attrs.canvasHeight ? this.attrs.canvasHeight : window.innerHeight
        if (RDSetting.GLOBAL_HELP_LINE_ALIGN_ENABLE) {
          var helpLine = createSVGElement('line', this, {
            stroke: RDSetting.GLOBAL_HELP_LINE_ALIGN_COLOR,
            'stroke-width': 0.6,
            'stroke-dasharray': [0, 1, 1]
          })
          this.helpBackLinies[this.helpBackLinies.length] = helpLine
          var helpLine1 = createSVGElement('line', this, {

            stroke: RDSetting.GLOBAL_HELP_LINE_ALIGN_COLOR,
            'stroke-width': 0.6,
            'stroke-dasharray': [0, 1, 1]
          })
          this.helpBackLinies[this.helpBackLinies.length] = helpLine1
          var helpLine2 = createSVGElement('line', this, {

            stroke: RDSetting.GLOBAL_HELP_LINE_ALIGN_COLOR,
            'stroke-width': 0.6,
            'stroke-dasharray': [0, 1, 1]
          })
          this.helpBackLinies[this.helpBackLinies.length] = helpLine2
          var helpLine3 = createSVGElement('line', this, {

            stroke: RDSetting.GLOBAL_HELP_LINE_ALIGN_COLOR,
            'stroke-width': 0.6,
            'stroke-dasharray': [0, 1, 1]
          })
          this.helpBackLinies[this.helpBackLinies.length] = helpLine3
        }
        for (var i = 0; i < width; i = i + this.help_line_weight) {
          var sp = createSVGElement('line', this, {
            x1: i,
            y1: 0,
            x2: i,
            y2: height,
            stroke: RDSetting.GLOBAL_HELP_LINE_COLOR,
            opacity: 0.3,
            'stroke-width': 0.5
          })
          this.helpBackLinies[this.helpBackLinies.length] = sp
          this.anchorLayer.appendChild(sp)
        }
        for (var i = 0; i < height; i = i + this.help_line_weight) {
          var sp = createSVGElement('line', this, {
            x1: 0,
            y1: i,
            x2: width,
            y2: i,
            stroke: RDSetting.GLOBAL_HELP_LINE_COLOR,
            'stroke-width': 0.5,
            opacity: 0.3
          })

          this.helpBackLinies[this.helpBackLinies.length] = sp
          this.anchorLayer.appendChild(sp)
        }
        var spText = createSVGElement('text', this, {
          'font-family': '宋体',
          'font-size': 14,
          align: 'center',
          fill: 'red',
          'font-style': 'bold'
        })
        spText.style.userSelect = "none"
        this.helpBackLinies[this.helpBackLinies.length] = spText
        if (RDSetting.GLOBAL_HELP_LINE_ALIGN_ENABLE) {
          this.anchorLayer.appendChild(helpLine)
          this.anchorLayer.appendChild(helpLine1)
          this.anchorLayer.appendChild(helpLine2)
          this.anchorLayer.appendChild(helpLine3)
        }
        this.anchorLayer.appendChild(spText)
        this.drawOrPush(this.backgroundLayer)
        this.drawOrPush(this.anchorLayer)
      }
    }

    // 创建辅助矩形
    this.createAuxRect = function () {
      // 构建一个外接矩形
      this.auxRect = createSVGElement('rect', this, {
        id: 'aue_rect_' + this.id,
        width: 0,
        height: 0,
        cornerRadius: 5,
        stroke: '#22ee11',
        strokeWidth: 2,
        fill: this.attrs.canvasBgColor,
        'fill-opacity': 0.0,
        'stroke-dasharray': [5, 5]
      })
      this.auxRect.rd = this
      // 绑定双击事件，将事件下发
      this.auxRect.addEventListener('dblclick', function (e) {
        // 当只有一个的时候才下发事件
        var selectedControls = this.rd.getSelectedShapes()
        if (selectedControls != null && selectedControls.length == 1) {
          if (selectedControls[0].bindEditTextShape != null) {
            selectedControls[0].showEditTextEvt(e, selectedControls[0])
          }
        }
      })

      this.auxRect.addEventListener("mouseout", function (e) {
        document.body.style.cursor = 'default'
      })

      this.auxRect.addEventListener("mousemove", function (e) {
        //移动时，根据鼠标落点，变更相应的图标

        if (!me.readonly && RDSetting.AUX_RECT_CHANGESIZE) {
          if (me.auxRect.dragChanging) {
            return
          }

          //判断是否移动到四个，边线上，如果是则变化鼠标
          let areawidth = 3
          let model = me.auxRect.getBBox()
          let layerX = e.clientX - me.getOffsetLeft(me.container) + me.container.scrollLeft - model.x
          let layerY = e.clientY - me.getOffsetTop(me.container) + me.container.scrollTop - model.y
          //左边线
          if (Math.abs(layerX) <= areawidth && Math.abs(layerY) >= areawidth * 2 && Math.abs(layerY) <= model.height - areawidth * 2) {
            document.body.style.cursor = 'ew-resize'
            me.auxRect.tempDragType = "activity-size-left"
          }
          //右边
          else if (Math.abs(model.width - layerX) <= areawidth && Math.abs(layerY) >= areawidth * 2 && Math.abs(layerY) <= model.height - areawidth * 2) {

            document.body.style.cursor = 'ew-resize'
            me.auxRect.tempDragType = "activity-size-right"
          }
          //上边线
          else if (Math.abs(layerY) <= areawidth && Math.abs(layerX) >= areawidth * 2 && Math.abs(layerX) <= model.width - areawidth * 2) {
            document.body.style.cursor = 'ns-resize'
            me.auxRect.tempDragType = "activity-size-top"
          }
          //下边线
          else if (Math.abs(model.height - layerY) <= areawidth && Math.abs(layerX) >= areawidth * 2 && Math.abs(layerX) <= model.width - areawidth * 2) {
            document.body.style.cursor = 'ns-resize'
            me.auxRect.tempDragType = "activity-size-bottom"
          }
          //左上角
          else if (Math.abs(layerX) <= areawidth * 2 && Math.abs(layerY) <= areawidth * 2) {
            document.body.style.cursor = 'nwse-resize'
            me.auxRect.tempDragType = "activity-size-left-top"
          }
          //右下角
          else if (Math.abs(model.width - layerX) <= areawidth * 2 && Math.abs(model.height - layerY) <= areawidth * 2) {
            document.body.style.cursor = 'nwse-resize'
            me.auxRect.tempDragType = "activity-size-right-bottom"
          }
          //左下角
          else if (Math.abs(layerX) <= areawidth * 2 && Math.abs(model.height - layerY) <= areawidth * 2) {
            document.body.style.cursor = 'nesw-resize'
            me.auxRect.tempDragType = "activity-size-left-bottom"
          }
          //右上角
          else if (Math.abs(model.width - layerX) <= areawidth * 2 && Math.abs(layerY) <= areawidth * 2) {
            document.body.style.cursor = 'nesw-resize'
            me.auxRect.tempDragType = "activity-size-right-top"
          }
          //其他地方
          else {
            document.body.style.cursor = 'pointer'
            me.auxRect.tempDragType = null
          }
        }
      })

      // 绑定拖拽事件
      this.auxRect.eventListeners['dragstart'] = [function (e) {



        //如果存在临时拖拽类型，则将临时拖拽转换为正式拖拽
        if (me.auxRect.tempDragType) {
          me.auxRect.dragChanging = true
          me.auxRect.dragType = me.auxRect.tempDragType
          me.auxRect.tempDragType = null
        } else {
          me.auxRect.dragChanging = false
          me.auxRect.dragCell = null
          me.auxRect.dragType = null
        }


        // 记录坐标
        window.dragObj = e.target
        window.dragX = window.dragObj.getBBox().x - e.layerX - window.dragObj.model.container.scrollLeft
        window.dragY = window.dragObj.getBBox().y - e.layerY - window.dragObj.model.container.scrollTop
        dragObj.upDragX = window.dragObj.getBBox().x
        dragObj.upDragY = window.dragObj.getBBox().y
        me.hideButtons()

        me.createHelpLines()
      }]
      // 绑定拖拽事件
      this.auxRect.eventListeners['dragmove'] = [function (e) {

        if (me.auxRect.dragChanging) {

          //从最右边拖拽控件大小
          if (me.auxRect.dragType == "activity-size-right") {
            me.changeSizeToRight(e)

          }
          //从最左边拖拽控件大小
          else if (me.auxRect.dragType == "activity-size-left") {
            me.changeSizeToLeft(e)
          }
          //从最下边拖拽控件大小
          else if (me.auxRect.dragType == "activity-size-bottom") {
            me.changeSizeToBottom(e)
          }
          //从最上边拖拽控件大小
          else if (me.auxRect.dragType == "activity-size-top") {
            me.changeSizeToTop(e)
          }
          //从左上角拖动大小
          else if (me.auxRect.dragType == "activity-size-left-top") {
            me.changeSizeToLeft(e)
            me.changeSizeToTop(e)
          }
          //从左下角拖动大小
          else if (me.auxRect.dragType == "activity-size-left-bottom") {
            me.changeSizeToLeft(e)
            me.changeSizeToBottom(e)
          }//从右上角拖动大小
          else if (me.auxRect.dragType == "activity-size-right-top") {
            me.changeSizeToRight(e)
            me.changeSizeToTop(e)
          }
          //从右下角拖动大小
          else if (me.auxRect.dragType == "activity-size-right-bottom") {
            me.changeSizeToRight(e)
            me.changeSizeToBottom(e)
          }
          return
        }
        // 计算当前坐标与之前坐标的差值，更新选中控件坐标
        // 加入辅助线，辅助对齐后，更新偏移量
        var auxShape = window.dragObj
        var absPos = auxShape.rd.updateHelpLines(auxShape, e)
        absPos = { x: absPos.x - 2, y: absPos.y - 2 }
        auxShape.setPosition(absPos)
        var curX = absPos.x
        var curY = absPos.y
        var moveX = curX - auxShape.upDragX
        var moveY = curY - auxShape.upDragY

        //如果控件超出画布大小，则自动扩展画布大小
        if (curX + parseInt(auxShape.getAttribute("width")) > auxShape.rd.width) {
          auxShape.rd.setStageSize(auxShape.rd.width + 300, auxShape.rd.height)
        }
        if (curY + parseInt(auxShape.getAttribute("height")) > auxShape.rd.height) {
          auxShape.rd.setStageSize(auxShape.rd.width, auxShape.rd.height + 300)
        }
        // 更新选中控件坐标
        auxShape.rd.updateSelectedShapesPosition({
          x: moveX,
          y: moveY
        })

        auxShape.upDragX = curX
        auxShape.upDragY = curY

      }]
      // 绑定拖拽事件
      this.auxRect.eventListeners['dragend'] = [function (e) {
        var auxShape = window.dragObj
        // 清空坐标
        auxShape.upDragX = null
        auxShape.upDragY = null
        auxShape.rd.destoryHelpLines()
        window.dragX = -1
        window.dragY = -1
        window.dragObj = null
        auxShape.dragChanging = false
        auxShape.tempDragCell = null
        auxShape.tempDragType = null
        auxShape.dragType = null
      }]

      this.anchorLayer.appendChild(this.auxRect)
    }
    //隐藏开始线段工具栏
    this.hideStartLineBar = function () {

      if (this.startLineBar) {
        //恢复开始和结束linkGroups的收折状态
        if (this.tempStartCollectState) {
          let startLinkGroupKey = this.startLineBar.getAttribute("mid") + "_" + this.startLineBar.getAttribute("directtype")
          if (this.linkGroups[startLinkGroupKey]) {
            this.linkGroups[startLinkGroupKey].collect = this.tempStartCollectState
            //更新线段
            let lines = this.linkGroups[startLinkGroupKey]["lines"]
            for (let i = 0; i < lines.length; i++) {
              lines[i].updateByStyle()
            }
          }
          this.tempStartCollectState = null
        }
        this.startLineBar.setAttributeNS(null, "mid", "")
        this.startLineBar.setAttributeNS(null, "directtype", "")
        this.startLineBar.children[0].setAttributeNS(null, "mid", "")
        this.startLineBar.children[0].setAttributeNS(null, "directtype", "")
        this.startLineBar.remove()
        this.startLineBar = null
      }
    }

    //隐藏结束线段工具栏
    this.hideEndLineBar = function () {
      if (this.endLineBar) {
        //恢复收折状态
        if (this.tempEndCollectState) {
          let endModel = this.rootModels[this.endLineBar.getAttribute("mid")]
          let endLineType = this.endLineBar.getAttribute("directtype")
          let endLinkGroupKey = endModel.id + "_" + endLineType
          if (this.linkGroups[endLinkGroupKey]) {
            this.linkGroups[endLinkGroupKey].collect = this.tempEndCollectState
            //更新线段
            let lines = this.linkGroups[endLinkGroupKey]["lines"]
            for (let i = 0; i < lines.length; i++) {
              lines[i].updateByStyle()
            }
          }
          this.tempEndCollectState = null


        }

        this.endLineBar.setAttributeNS(null, "mid", "")
        this.endLineBar.setAttributeNS(null, "directtype", "")
        this.endLineBar.children[0].setAttributeNS(null, "mid", "")
        this.endLineBar.children[0].setAttributeNS(null, "directtype", "")
        this.endLineBar.remove()
        this.endLineBar = null
      }
    }


    //显示开始线段工具栏，传入当前模型以及方向
    this.showStartLineBar = function (model, type) {
      if (!model) {
        return
      }
      if (!this.startLineBar) {
        this.createStartLineBar()
      }
      this.startLineBar.setAttributeNS(null, "mid", model.id)
      this.startLineBar.setAttributeNS(null, "directtype", type)
      this.startLineBar.children[0].setAttributeNS(null, "directtype", type)
      if (type == "left") {
        this.startLineBar.setPosition({
          x: model.x - 3,
          y: model.y
        })
        this.startLineBar.setSize({
          width: 6,
          height: model.height
        })
        this.startLineBar.children[0].children[0].setSize({
          width: 6,
          height: model.height
        })

      } else if (type == "right") {
        this.startLineBar.setPosition({
          x: model.x + model.width - 5,
          y: model.y
        })
        this.startLineBar.setSize({
          width: 6,
          height: model.height
        })
        this.startLineBar.children[0].children[0].setSize({
          width: 6,
          height: model.height
        })
      } else if (type == "top") {
        this.startLineBar.setPosition({
          x: model.x,
          y: model.y - 3
        })
        this.startLineBar.setSize({
          width: model.width,
          height: 6
        })
        this.startLineBar.children[0].children[0].setSize({
          width: model.width,
          height: 6
        })
      } else if (type == "bottom") {
        this.startLineBar.setPosition({
          x: model.x,
          y: model.y + model.height - 5
        })
        this.startLineBar.setSize({
          width: model.width,
          height: 6
        })
        this.startLineBar.children[0].children[0].setSize({
          width: model.width,
          height: 6
        })
      }

      //设置收折图标的文本
      this.startLineBar.show()
      //移除原有的点
      for (let ri = this.startLineBar.children.length; ri > 1; ri--) {
        this.startLineBar.children[this.startLineBar.children.length - 1].remove()
      }
      this.showBarPoints(this.startLineBar)
    }

    //显示结束线段工具栏，传入当前模型以及方向
    this.showEndLineBar = function (model, type) {
      if (!model) {
        return
      }
      if (!this.endLineBar) {
        this.createEndLineBar()
      }
      this.endLineBar.setAttributeNS(null, "mid", model.id)
      this.endLineBar.setAttributeNS(null, "directtype", type)
      this.endLineBar.children[0].setAttributeNS(null, "mid", model.id)
      this.endLineBar.children[0].setAttributeNS(null, "directtype", type)
      if (type == "left") {
        this.endLineBar.setPosition({
          x: model.x - 3,
          y: model.y
        })
        this.endLineBar.setSize({
          width: 6,
          height: model.height
        })
        this.endLineBar.children[0].children[0].setSize({
          width: 6,
          height: model.height
        })
      } else if (type == "right") {
        this.endLineBar.setPosition({
          x: model.x + model.width - 5,
          y: model.y
        })
        this.endLineBar.setSize({
          width: 6,
          height: model.height
        })
        this.endLineBar.children[0].children[0].setSize({
          width: 6,
          height: model.height
        })
      } else if (type == "top") {
        this.endLineBar.setPosition({
          x: model.x,
          y: model.y - 3
        })
        this.endLineBar.setSize({
          width: model.width,
          height: 6
        })
        this.endLineBar.children[0].children[0].setSize({
          width: model.width,
          height: 6
        })
      } else if (type == "bottom") {
        this.endLineBar.setPosition({
          x: model.x,
          y: model.y + model.height - 5
        })
        this.endLineBar.setSize({
          width: model.width,
          height: 6
        })
        this.endLineBar.children[0].children[0].setSize({
          width: model.width,
          height: 6
        })
      }
      this.endLineBar.show()
      //移除原有的点
      for (let ri = this.endLineBar.children.length; ri > 1; ri--) {
        this.endLineBar.children[this.endLineBar.children.length - 1].remove()
      }
      this.showBarPoints(this.endLineBar)
    }

    // 创建线段工具栏窗口
    this.createStartLineBar = function () {
      // 构建一个外接矩形
      if (!this.startLineBar) {
        this.startLineBar = createSVGElement('svg', this, {
          id: 'line_bar_start_' + this.id,
        })
        this.startLineBar.setAttributeNS(null, "mtype", "startLineBar")

        let rectSVG = createSVGElement('g', this, {
        })

        let rect = createSVGElement('rect', this, {
          x: 0,
          y: 0,
          fill: "rgba(255, 0, 0, 0.4)",
        })

        rect.setAttributeNS(null, "mtype", "startLineBar")



        this.startLineBar.rd = this

        let collectTextBtn = createSVGElement('text', this, {
          x: 1,
          y: 5,
          width: 3,
          height: 3,
          fontFamily: RDSetting.DEFAULT_ACTIVITY_FONT_FAMILY,
          fill: '#000000',
          fontSize: 8,
          align: 'center',
          anchor: 'middle'
        })
        collectTextBtn.style.userSelect = "none"
        rectSVG.appendChild(rect)
        rectSVG.appendChild(collectTextBtn)

        rectSVG.addEventListener('click', function (e) {
          e.stopPropagation()
          //改变收折打开状态
          let bar = me.startLineBar
          let linkGroupKey = bar.getAttribute("mid") + "_" + bar.getAttribute("directtype")
          let linkGroup = me.linkGroups[linkGroupKey]
          if (linkGroup) {
            //收起状态,变为打开
            if (linkGroup["collect"] == 1 || linkGroup["collect"] == "1") {
              linkGroup["collect"] = 0
            }
            //打开状态，变为收起
            else {
              linkGroup["collect"] = 1
            }
            me.showBarPoints(bar)
          }
          return false
        })

        this.startLineBar.appendChild(rectSVG)

        this.startLineBar.addEventListener('mousemove', function (e) {
          me.showBarPoints(me.startLineBar)

          return true
        })

        // 绑定拖拽事件
        this.startLineBar.eventListeners['dragstart'] = [function (e) {
          if (!me.lineCreating) {
            if (RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR) {
              eval('window.allowLineChange = ' + RDSetting.GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR + '(me.rootModels[me.startLineBar.getAttribute("mid")],null,null,me,e);')
              if (!window.allowLineChange) {
                document.body.style.cursor = 'not-allowed'
                return false
              }
            }
            e.stopPropagation()
            document.body.style.cursor = 'grabbing'
            me.lineCreating = true
            //判断当前坐标在bar的哪个哪个区域，决定创建线段时在头部还是在尾部
            let layerX = e.clientX - me.getOffsetLeft(me.container) + me.container.scrollLeft
            let layerY = e.clientY - me.getOffsetTop(me.container) + me.container.scrollTop
            let dirType = me.startLineBar.getAttribute("directtype")
            let curModel = me.rootModels[me.startLineBar.getAttribute("mid")]
            if (dirType == "left" || dirType == "right") {
              if (layerY >= curModel.y + curModel.height * 0.5) {
                me.lineCreatingPoint = "last"
              } else {
                me.lineCreatingPoint = "first"
              }
            } else if (dirType == "top" || dirType == "bottom") {
              if (layerX >= curModel.x + curModel.width * 0.5) {
                me.lineCreatingPoint = "last"
              } else {
                me.lineCreatingPoint = "first"
              }
            }
            //记录当前linkgroup的状态，以便恢复
            let linkGroupKey = curModel.id + "_" + dirType
            if (me.linkGroups[linkGroupKey]) {
              me.tempStartCollectState = me.linkGroups[linkGroupKey].collect
              //强制设置为不收折
              me.linkGroups[linkGroupKey].collect = 0
            } else {
              //默认不收折
              me.tempStartCollectState = 0
            }

          }
        }]

        this.startLineBar.addEventListener('mousemove', function (e) {
          e.stopPropagation()
        })

        this.anchorLayer.appendChild(this.startLineBar)

      }

    }

    // 创建线段工具栏窗口
    this.createEndLineBar = function () {
      if (!this.endLineBar) {
        // 构建一个外接矩形
        this.endLineBar = createSVGElement('svg', this, {
          id: 'line_bar_end_' + this.id,
        })
        this.endLineBar.setAttributeNS(null, "mtype", "endLineBar")

        let rectSVG = createSVGElement('g', this, {
        })

        let rect = createSVGElement('rect', this, {
          x: 0,
          y: 0,
          fill: "rgba(0, 255, 0, 0.4)",
        })
        rect.setAttributeNS(null, "mtype", "endLineBar")
        this.endLineBar.rd = this

        let collectTextBtn = createSVGElement('text', this, {
          x: 1,
          y: 5,
          width: 3,
          height: 3,
          fontFamily: RDSetting.DEFAULT_ACTIVITY_FONT_FAMILY,
          fill: '#000000',
          fontSize: 8,
          align: 'center',
          anchor: 'middle'
        })
        collectTextBtn.style.userSelect = "none"
        rectSVG.addEventListener('click', function (e) {
          e.stopPropagation()
          //改变收折打开状态
          let bar = me.endLineBar
          let linkGroupKey = bar.getAttribute("mid") + "_" + bar.getAttribute("directtype")
          let linkGroup = me.linkGroups[linkGroupKey]
          if (linkGroup) {
            //收起状态,变为打开
            if (linkGroup["collect"] == 1 || linkGroup["collect"] == "1") {
              linkGroup["collect"] = 0
            }
            //打开状态，变为收起
            else {
              linkGroup["collect"] = 1
            }
            me.showBarPoints(bar)
          }
          return false
        })
        rectSVG.appendChild(rect)
        rectSVG.appendChild(collectTextBtn)

        this.endLineBar.appendChild(rectSVG)

        this.endLineBar.addEventListener('mousemove', function (e) {
          me.showBarPoints(me.endLineBar)

          return true
        })
        this.anchorLayer.appendChild(this.endLineBar)
      }

    }

    //显示bar上的端点
    this.showBarPoints = function (bar) {
      //只有没有时才显示并创建
      // if (bar.children.length == 1) {
      //取得当前依附的model，依附的方向，取得关联关系
      let linkGroupKey = bar.getAttribute("mid") + "_" + bar.getAttribute("directtype")
      let linkGroup = me.linkGroups[linkGroupKey]
      let underLinePoint = ""
      let underLine = null

      if (linkGroup) {

        let collect = false
        if (linkGroup["collect"] == 1 || linkGroup["collect"] == "1") {
          collect = true
        }
        //判断当前鼠标落点是否在lines的其中一条的端点上面
        let linkLines = linkGroup["lines"]
        if (linkLines) {
          if (linkLines.length > 0) {
            //收起状态
            if (collect) {
              bar.children[0].children[1].innerHTML = "+"
            }
            //打开状态
            else {
              bar.children[0].children[1].innerHTML = "-"
            }
          } else {
            bar.children[0].children[1].innerHTML = ""
          }
          let activityModel = linkGroup.model
          let groupLength = linkLines.length
          let underLinePoint = null
          let otherLinkGroup = null
          let otherLinkGroupLineIndex = -1
          for (let lineIndex = 0; lineIndex < groupLength; lineIndex++) {
            let line = linkLines[lineIndex]
            let cx = 0, cy = 0
            let width = 4, height = 4
            if (line.startLinkGroup == linkGroup || line.endLinkGroup == linkGroup) {
              let paddingWidth = 2
              let linePointWidth = 4
              if (linkGroup.type == "top" || linkGroup.type == "bottom") {
                var linePointAreaWidth = (groupLength - 1) * paddingWidth + groupLength * linePointWidth
                var sx = (activityModel.width - linePointAreaWidth) * 0.5
                cx = sx + lineIndex * paddingWidth + lineIndex * linePointWidth
                height = 6
              } else if (linkGroup.type == "left" || linkGroup.type == "right") {
                var linePointAreaHeight = (groupLength - 1) * paddingWidth + groupLength * linePointWidth
                var sy = (activityModel.height - linePointAreaHeight) * 0.5
                cy = sy + lineIndex * paddingWidth + lineIndex * linePointWidth
                width = 6
              }
              if (line.startLinkGroup == linkGroup) {
                underLinePoint = "start"
                otherLinkGroup = line.endLinkGroup
                otherLinkGroupLineIndex = line.endLinkGroup["lines"].indexOf(line)
              } else if (line.endLinkGroup == linkGroup) {
                underLinePoint = "end"
                otherLinkGroup = line.startLinkGroup
                otherLinkGroupLineIndex = line.startLinkGroup["lines"].indexOf(line)
              }
            } else if (line.endLinkGroup == linkGroup) {
              cx = line.end.x
              cy = line.end.y
              underLinePoint = "end"
            }

            //创建操作小按钮
            let cEle = null
            //检查当前点对应的小按钮是否存在，不存在则创建，存在则只更新关系和颜色等
            if (bar.children.length <= lineIndex + 1) {
              cEle = createSVGElement('rect', me, {
                width: 4,
                height: 4,

                fill: "blue",
              })
              cEle.addEventListener('mouseout', function (e) {
                this.fill("blue")
              })
              cEle.addEventListener('mouseover', function (e) {
                if (!me.lineChanging && !me.lineCreating) {
                  this.fill("black")
                }
                //创建或移动线时
                else if (me.lineChanging || (me.lineCreating && me.startLineBar && me.tempCreateLine)) {
                  if (me.tempCreateLine.id != this.getAttribute("lineId")) {
                    //执行点和线的位置交换
                    let curPointIndex = parseInt(this.getAttribute("lineIndex"))
                    //执行点和线的位置交换
                    let curGroup = null
                    if (me.underLinePoint == "start") {
                      curGroup = me.tempCreateLine.startLinkGroup
                    } else {
                      curGroup = me.tempCreateLine.endLinkGroup
                    }
                    //取得正在创建的点，在结束端点的index
                    let operLineIndex = curGroup["lines"].indexOf(me.tempCreateLine)
                    curGroup["lines"][operLineIndex] = curGroup["lines"][curPointIndex]
                    curGroup["lines"][curPointIndex] = me.tempCreateLine
                    let updateLines = curGroup["lines"]
                    for (let li = 0; li < updateLines.length; li++) {
                      updateLines[li].updateByStyle()
                    }
                    if (me.underLinePoint == "start") {
                      me.showBarPoints(me.startLineBar)
                    } else {
                      me.showBarPoints(me.endLineBar)
                    }

                  }
                }
              })
              cEle.addEventListener('mousedown', function (e) {
                e.stopPropagation()
                //判断移动线段，当鼠标落点位于线的开始位置或者结束位置时，为移动线段，否则为创建线段
                //取得当前依附的model，依附的方向，取得关联关系
                let linkGroupKey = bar.getAttribute("mid") + "_" + bar.getAttribute("directtype")
                let linkGroup = me.linkGroups[linkGroupKey]
                let underLinePoint = this.getAttribute("linePoint")
                let underLine = me.rootModels[this.getAttribute("lineId")]
                let lineIndex = this.getAttribute("lineIndex")
                let otherLinkGroupKey = this.getAttribute("otherLinkGroupKey")
                let olg = me.linkGroups[otherLinkGroupKey]
                let otherLinkGroupLineIndex = this.getAttribute("otherLinkGroupLineIndex")

                //如果正处于线的端点上,则是移动线
                if (underLinePoint != "" && underLine) {
                  //打上标识，表示正在移动线段
                  e.stopPropagation()
                  document.body.style.cursor = 'grabbing'
                  me.lineChanging = true
                  me.underLine = underLine
                  me.underLinePoint = underLinePoint
                  me.underLinelinkGroup = linkGroup
                  me.underLineIndex = parseInt(lineIndex)
                  me.otherLinkGroup = olg
                  me.otherLinkGroupLineIndex = parseInt(otherLinkGroupLineIndex)
                  //暂时移除当前线段与关系
                  me.removeControl(underLine)
                  if (underLinePoint == "start") {
                    underLine.startLinkGroup = null

                    me.showStartLineBar(underLine.endLinkGroup.model, underLine.endLinkGroup.type)
                  } else {
                    underLine.endLinkGroup = null

                    me.showStartLineBar(underLine.startLinkGroup.model, underLine.startLinkGroup.type)
                  }
                  //记录当前linkgroup的状态，以便恢复
                  if (me.linkGroups[linkGroupKey]) {
                    me.tempStartCollectState = me.linkGroups[linkGroupKey].collect
                    //强制设置为不收折
                    me.linkGroups[linkGroupKey].collect = 0
                  } else {
                    //默认不收折
                    me.tempStartCollectState = 0
                  }
                }
              })
              bar.appendChild(cEle)
            } else {
              cEle = bar.children[lineIndex + 1]
            }
            cEle.setAttributeNS(null, "lineId", line.id)
            cEle.setAttributeNS(null, "lineIndex", lineIndex)
            cEle.setAttributeNS(null, "linePoint", underLinePoint)
            cEle.setAttributeNS(null, "otherLinkGroupKey", otherLinkGroup.model.id + "_" + otherLinkGroup.type)
            cEle.setAttributeNS(null, "otherLinkGroupLineIndex", otherLinkGroupLineIndex)
            cEle.setPosition({ x: cx, y: cy })

            if (!collect) {
              cEle.setSize({ width: width, height: height })
            } else {
              cEle.setSize({ width: 0, height: 0 })
            }
            line.updateByStyle()
          }
        }
      }

      // }
    }

    //隐藏bar上的端点
    this.hideBarPoints = function (bar) {

    }


    // 取得所有选中控件
    this.getSelectedShapes = function (position) {
      var returnDatas = []
      for (let i in this.rootModels) {
        let currentShape = this.rootModels[i]

        if (currentShape.selected) {
          returnDatas[returnDatas.length] = currentShape
        }
      }
      return returnDatas
    }

    // 更新所有控件
    this.updateShape = function () {
      for (let i in this.rootModels) {
        let currentShape = this.rootModels[i]
        currentShape.updateShape()
      }
    }

    /**
     * 最外层的控件选择事件，调用后，控件就处于选中状态，并根据需要单选多选，清空其他控件选中状态，显示回显图形等等
     * @param {*} model 当前控件
     * @param {*} e 事件，用来获取坐标，是否按下shiftctrl等快捷键
     */
    this.makeSelection = function (model, e) {

      // 增加对多选的支持
      // 如果外接矩形不存在，则生成一个，用于拖拽
      if (RDSetting.SHOW_AUX_RECT == true) {
        if (me.auxRect == null) {
          me.createAuxRect()
        }
      }

      // 判断当前落点，取得当前的控件模型
      // 有滚动条时不用加上model.rd.container.scrollTop
      //判断当前点击对象是否是stage还是表格（div）
      var pointShapes = []
      if (!pointShapes || pointShapes.length == 0) {
        pointShapes = me.findControlByPosition({
          x: e.offsetX,
          y: e.offsetY
        })
      }
      //如果同一个位置有两个控件，则看target是否触发在其中一个控件上,解决控件重叠的事件问题
      if (pointShapes.length > 1) {
        if (e.target.model && e.target.model.modelType != 'RuleCanvas') {
          let mo = null
          for (let o = 0; o < pointShapes.length; o++) {
            if (pointShapes[o] == e.target.model) {
              mo = pointShapes[o]
              break
            }
          }
          if (mo != null) {
            pointShapes = [mo]
          }
        }
      }

      var currentModelType = ''
      var currentModel = null
      for (let o = 0; o < pointShapes.length; o++) {
        // 只要是活动
        if (pointShapes[o].baseModelType == 'Activity') {
          currentModel = pointShapes[o]
          currentModelType = currentModel.baseModelType
          break
        }
      }
      if (currentModel != null) {
        var oneControl = false
        // 按下ctrl就是多选，不按下就是单选
        if (e.ctrlKey || e.metaKey) {

          // 多选时，如果按下的控件不在已选择的控件中，则选中
          var selectedControls = me.getSelectedShapes()
          if (selectedControls.indexOf(currentModel) == -1) {
            currentModel.makeSelection()
            currentModel.updateShape()
          }
          // 否则就是取消选中
          else {
            currentModel.selected = false
            currentModel.updateShape()
          }
          // 判断处理选中后，当前控件的数量
          selectedControls = me.getSelectedShapes()
          if (selectedControls.length == 1) {
            oneControl = true
            currentModel = selectedControls[0]
          } else {
            oneControl = false
          }
        } else {
          oneControl = true
        }
        // 不论是否按下ctrl键，只要选中了一个控件，则按照一个控件的方式来处理
        if (oneControl) {
          // 单选时，清空所有已选择的控件，选中当前控件
          me.clearSelection()
          // 如果上一次有选中图形，则清空上一次选中图形
          if (me.tempTransformerShape != null) {
            me.tempTransformerShape.model.updateByStyle()
          }
          //点击的是画布
          if (e.target === this) {
            me.tempTransformerShape = null
            if (RDSetting.GLOBAL_QUICK_CREATE_BTN) {
              if (me.quickMenuShape) {
                me.quickMenuShape.hide()
                me.drawOrPush(me.anchorLayer)
              }
            }
          }

          //点击的是方形矩形区域
          else if (currentModelType == 'Activity') {
            me.tempTransformerShape = currentModel.shapes[0]
            me.tempTransformerShape.model.makeSelection()
          } else {
            return
          }
          currentModel.updateShape()
        }
        //显示外接矩形
        if (!me.readonly && me.canMove && RDSetting.SHOW_AUX_RECT == true) {
          //打开外接矩形的事件
          me.auxRect.style.pointerEvents = ""
          // 计算所有选中图形的坐标，求出外接矩形

          var outRect = me.getSelectedShapesOutRect()

          if (outRect) {
            var weight = this.help_line_weight

            me.auxRect.setSize({
              width: outRect.x1 - outRect.x + 4,
              height: outRect.y1 - outRect.y + 4
            })
            me.auxRect.setPosition({
              x: outRect.x - 2,
              y: outRect.y - 2
            })
            if (this.getSelectedShapes().length >= RDSetting.AUX_RECT_SELCTED_CONTROL) {
              this.auxRect.setAttributeNS(null, "stroke-width", 2)
            } else {
              this.auxRect.setAttributeNS(null, "stroke-width", 0)
            }


          }
        }
        // 点击事件，用于刷新出属性框
        if (typeof me.clickTab == 'function') {
          if (e.target === me || !oneControl) {
            me.clickTab(me)
          } else {
            // 只刷新Activity类型节点的属性框
            me.clickTab(me.tempTransformerShape.model)
            return

          }
        }

      } else {
        // 清空选中回显
        me.clearSelection()
        // 如果上一次有选中图形，则清空上一次选中图形
        if (me.tempTransformerShape != null) {
          me.tempTransformerShape.model.updateByStyle()
        }
        // 清空回显图形，清空selected标记
        // this.model.stage.find('Transformer').destroy();
        me.tempTransformerShape = null
        if (RDSetting.GLOBAL_QUICK_CREATE_BTN) {
          if (me.quickMenuShape) {
            me.quickMenuShape.style.display = 'none'
            // this.model.anchorLayer.draw();
            me.drawOrPush(me.anchorLayer)
          }
        }
      }
      if (e.target.model && e.target.model.rd) {
        e.target.model.rd.currentBGImage = null
      }

      //如果点击在画布上，并且未点击到外接辅助矩阵上，都视为点击到画布上，触发画布事件
      if ((e.target.model == null || e.target.model.modelType == 'RuleCanvas') && e.target.id != 'aue_rect_pd') {
        e.target.model.clickTab(e.target.model)
      }
      //如果点击在纸张、套图上，也触发画布事件
      else if ((e.target.model == null || e.target.model.modelType == 'Paper' || e.target.model.modelType == 'BGImage') && e.target.id != 'aue_rect_pd') {

        if (e.target.model.modelType == 'BGImage') {
          e.target.model.rd.currentBGImage = e.target.model
        }
        e.target.model.rd.clickTab(e.target.model)
      }
      // 加入重绘队列
      me.drawOrPush(me.backgroundLayer)
      me.drawOrPush(me.shapeLayer)
      me.drawOrPush(me.anchorLayer)
      me.drawOrPush(me.lineLayer)
      me.drawOrPush(me.descLayer)
    }

    // 更新所有选中控件坐标
    this.updateSelectedShapesPosition = function (position) {
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
    this.getShapesOutRect = function (shapes) {

      let x, y, x1, y1
      for (let i = 0; i < shapes.length; i++) {

        let currentShape = shapes[i]

        if (!x || !y || !x1 || !y1) {
          x = currentShape.x

          y = currentShape.y

          x1 = currentShape.x + parseInt(currentShape.width)

          y1 = currentShape.y + parseInt(currentShape.height)
        } else {
          if (currentShape.x <= x) {
            x = currentShape.x
          }
          if (currentShape.y <= y) {
            y = currentShape.y
          }
          if (currentShape.x + parseInt(currentShape.width) >= x1) {
            x1 = currentShape.x + parseInt(currentShape.width)
          }
          if (currentShape.y + parseInt(currentShape.height) >= y1) {
            y1 = currentShape.y + parseInt(currentShape.height)
          }
        }

      }
      if (x == undefined || y == undefined || x1 == undefined || y1 == undefined) {
        return null
      }
      return { x: x, y: y, x1: x1, y1: y1 }
    }

    // 计算所有当前选中图形的外接矩形
    this.getSelectedShapesOutRect = function () {

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
    this.clearSelection = function () {
      if (this.tempTransformerShape != null) {
        // 清空选中状态
        this.tempTransformerShape.model.clearSelection()
      }
      var selectedShapes = this.getSelectedShapes()
      for (let i = 0; i < selectedShapes.length; i++) {
        selectedShapes[i].selected = false
        selectedShapes[i].updateByStyle()
      }
      if (this.auxRect != null) {
        this.auxRect.setAttributeNS(null, 'width', 0)
        this.auxRect.setAttributeNS(null, 'height', 0)
      }
    }



    // 修改属性方法,修改属性后，会调用这个方法来更新图形等动作
    this.setAttributes = function (attrs, md) {
      // 当修改的属性为图形属性或在allowToChangeAttrs列表中时，修改属性会联动修改图形
      this.setAttributesNoDraw(attrs, md)
      var model = null

      if (md != null && md != undefined) {
        model = md
      } else {
        model = this.tempTransformerShape ? this.tempTransformerShape.model : this
      }

      // var shape = this.tempTransformerShape;

      // if (shape) {
      if (model != null && model != undefined && model.modelType != undefined && model.modelType != 'RuleCanvas') {
        model.rd.drawOrPush(model.rd.backgroundLayer)
        model.rd.drawOrPush(model.rd.shapeLayer)
        model.rd.drawOrPush(model.rd.lineLayer)
        model.rd.drawOrPush(model.rd.anchorLayer)
        model.rd.drawOrPush(model.rd.descLayer)
      }
    }

    // 修改属性方法,修改属性后，会调用这个方法来更新图形等动作
    this.setAttributesNoDraw = function (attrs, md) {

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
          } catch (e) { }
        }

        var model = null
        if (md != null && md != undefined) {
          model = md
        } else {
          model = this.tempTransformerShape ? this.tempTransformerShape.model : this
        }

        // 取得当前选中的图形
        if (model != null) {
          model.attrs[code] = value
          // 如果为图形属性，或者allowToChangeAttrs列表中声明的会影响图形显示的属性，就更新
          if (allowToChangeAttrs.indexOf(code) > -1 || attr.groupname == '图形属性') {
            // 如果存在datasource，执行代码翻译
            var curValue = value
            if (code == 'descText' &&
              attr.datasource != null && attr.datasource.length > 0) {
              for (let o = 0; o < attr.datasource.length; o++) {
                if (attr.datasource[o].value == curValue || '' + attr.datasource[o].value == '' + curValue) {
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
          if (document.getElementById(this.containerid).style.backgroundColor != value) {
            document.getElementById(this.containerid).style.backgroundColor = value
          }
          this.attrs['canvasBgColor'] = value
          continue
        } else if (code == 'canvasWidth') {
          var v = null
          try {
            v = parseInt(value)
          } catch (e) { }
          if (v == null || v == 0 || isNaN(v)) {
            v = document.getElementById(this.containerid).clientWidth
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
          var v = null
          try {
            v = parseInt(value)
          } catch (e) { }
          if (v == null || v == 0 || isNaN(v)) {
            v = document.getElementById(this.containerid).clientHeight
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

      var model = null

      if (md != null && md != undefined) {
        model = md
      } else {
        model = this.tempTransformerShape ? this.tempTransformerShape.model : this
      }
      if (model != null && model != undefined && model.modelType != undefined && model.modelType != 'RuleCanvas' && model.modelType != 'Paper' && model.modelType != 'BGImage') {
        model.rebuildAnchors()
        model.updateShape()
      }
    }

    /**
     * 取得一个控件是否可以移动，如果控件上没有该属性，则用控件的model，如果都为空则用画布
     * @param {*} shape 
     */
    this.isCanMove = function (shape) {
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
    this.setAttr = function (attr) {
      // 当修改的属性为图形属性或在allowToChangeAttrs列表中时，修改属性会联动修改图形
      var allowToChangeAttrs = ['text', 'icon', 'descText', 'lineType']
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
          } else if (attr.datatype == 'float') {
            value = parseFloat(value)
          } else if (attr.datatype == 'integer') {
            value = parseInt(value)
          }
        } catch (e) { }
      }
      // 对画布的修改

      if (code == 'canvasBgColor') {
        if (document.getElementById(this.containerid).style.backgroundColor != value) {
          document.getElementById(this.containerid).style.backgroundColor = value
        }
        this.attrs['canvasBgColor'] = value
        return
      } else if (code == 'canvasWidth') {
        var v = null
        try {
          var v = parseInt(value)
        } catch (e) { }
        if (v == null || v == 0 || isNaN(v)) {
          v = document.getElementById(this.containerid).clientWidth
        }

        this.attrs['canvasWidth'] = v
        this.setStageSize(this.attrs['canvasWidth'], this.attrs['canvasHeight'])
        return
      } else if (code == 'canvasHeight') {
        var v = null
        try {
          var v = parseInt(value)
        } catch (e) { }
        if (v == null || v == 0 || isNaN(v)) {
          v = document.getElementById(this.containerid).clientHeight
        }

        this.attrs['canvasHeight'] = v
        this.setStageSize(this.attrs['canvasWidth'], this.attrs['canvasHeight'])
        return
      }
      //否则就是控件的属性
      else {
        // 取得当前选中的图形
        var shape = this.tempTransformerShape
        if (shape) {
          shape.model.attrs[code] = value
          // 如果为图形属性、规则属性，或者allowToChangeAttrs列表中声明的会影响图形显示的属性，就更新
          if (allowToChangeAttrs.indexOf(code) > -1 || attr.groupname == '图形属性' || attr.groupname == '规则属性') {
            // 如果存在datasource，执行代码翻译
            var curValue = value
            if (code == 'descText' &&
              attr.datasource != null && attr.datasource.length > 0) {
              for (let o = 0; o < attr.datasource.length; o++) {
                if (attr.datasource[o].value == curValue || '' + attr.datasource[o].value == '' + curValue) {
                  curValue = attr.datasource[o].text
                  break
                }
              }
            }
            shape.model[code] = curValue
          }
          shape.model.updateShape()
        } else {
          this.attrs[code] = value
        }
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



    //覆盖默认剪切方法
    document.oncut = function (e) {
      if (me) {
        if (!me.container || me.container.offsetParent === null) {
          return
        }
        if (me.tempTransformerShape && me.tempTransformerShape.model && me.tempTransformerShape.model.baseModelType == 'Activity') {
          e.returnValue = false
          //取得当前选中的图形
          var selectedControls = me.getSelectedShapes()
          if (selectedControls != null && selectedControls.length > 0) {
            //清空全局复制板
            window.globalCopyData = null
            //进入全局剪切板
            window.globalCutData = selectedControls
          }
        }
      }
    }

    //覆盖默认复制方法
    document.oncopy = function (e) {
      if (window.editing == true) {
        return
      }
      if (me) {
        if (!me.container || me.container.offsetParent === null) {
          return
        }
        if (me.tempTransformerShape && me.tempTransformerShape.model && me.tempTransformerShape.model.baseModelType == 'Activity') {
          e.returnValue = false
          //取得当前选中的图形
          var selectedControls = me.getSelectedShapes()
          if (selectedControls != null && selectedControls.length > 0) {
            //清空全局剪切板
            window.globalCutData = null
            //进入全局复制板
            window.globalCopyData = selectedControls
          }
        }
      }
    }
    //增加浏览器剪切板事件，用于处理外部内容copy到里面
    document.onpaste = function (e) {
      if (window.editing == true) {
        return
      }
      if (me) {
        if (!me.container || me.container.offsetParent === null) {
          return
        }
        //如果是复制板有值，则执行复制逻辑
        if (window.globalCopyData && window.globalCopyData.length > 0) {
          //取得鼠标位置,创建文件
          if (window.gMouseOffetX && window.gMouseOffetY) {
            tempSeriDatas['currentRuleCanvas'] = me
            //批量创建新控件，并选中新控件
            let newControlJSONs = []
            //计算原始图形模型的外接矩形
            let outRect = me.getShapesOutRect(window.globalCopyData)
            //从原始对象中复制对象出来，复制模型后，需要改变坐标，id等属性
            //清空原有控件的选中状态
            for (let i in me.rootModels) {
              me.rootModels[i].selected = false
              me.rootModels[i].updateShape()
            }
            //多个图形时需要确保坐标和以前的相对位置一致
            for (let nx = 0; nx < window.globalCopyData.length; nx++) {
              let originObj = window.globalCopyData[nx]
              let newControlJSON = cloneDeep(originObj.toJSON())
              if (newControlJSON.modelType != null && newControlJSON.modelType != '') {
                //重新生成ID
                let newId = "pd_lbl_" + me.curIndex
                me.curIndex++
                newControlJSON.id = newId
                newControlJSON.code = newId
                newControlJSON.attrs.id = newId
                newControlJSON.attrs.code = newId
                //取得原始图像和外接矩形的坐标差
                let deltaX = newControlJSON.x - outRect.x
                let deltaY = newControlJSON.y - outRect.y
                newControlJSON.x = window.gMouseOffetX + deltaX
                newControlJSON.y = window.gMouseOffetY + deltaY
                var obj = {}
                eval('obj = ' + newControlJSON.modelType + '.initByJson(newControlJSON);')
                me.rootModels[obj.id] = obj
                // 创建图形
                obj.buildShape()
                obj.rebuildAnchors()
                //选中新复制的控件
                obj.makeSelection()
                obj.updateByStyle()
              }
            }
            //设置外接矩形
            outRect = me.getSelectedShapesOutRect()
            if (outRect) {
              me.auxRect.setSize({
                width: outRect.x1 - outRect.x + 4,
                height: outRect.y1 - outRect.y + 4
              })
              me.auxRect.setPosition({
                x: outRect.x - 2,
                y: outRect.y - 2
              })

            }

            tempSeriDatas['currentRuleCanvas'] = null
          }

        }
        //如果是剪切板有值，则执行剪切逻辑
        else if (window.globalCutData && window.globalCutData.length > 0) {
          if (window.gMouseOffetX && window.gMouseOffetY) {
            tempSeriDatas['currentRuleCanvas'] = me
            //批量创建新控件，并选中新控件
            let newControlJSONs = []
            //计算原始图形模型的外接矩形
            let outRect = me.getShapesOutRect(window.globalCutData)
            //从原始对象中复制对象出来，复制模型后，需要改变坐标，id等属性
            //多个图形时需要确保坐标和以前的相对位置一致
            for (let nx = 0; nx < window.globalCutData.length; nx++) {
              let originObj = window.globalCutData[nx]
              //取得原始图像和外接矩形的坐标差
              let deltaX = originObj.x - outRect.x
              let deltaY = originObj.y - outRect.y
              originObj.x = window.gMouseOffetX + deltaX
              originObj.y = window.gMouseOffetY + deltaY
              //选中新复制的控件
              originObj.makeSelection()
              // 更新图形
              originObj.updateByStyle()
            }
            tempSeriDatas['currentRuleCanvas'] = null
            //设置外接矩形
            outRect = me.getSelectedShapesOutRect()
            if (outRect) {
              me.auxRect.setSize({
                width: outRect.x1 - outRect.x + 4,
                height: outRect.y1 - outRect.y + 4
              })
              me.auxRect.setPosition({
                x: outRect.x - 2,
                y: outRect.y - 2
              })

            }
          }
        }

      }

    }

    //增加全局键盘事件
    document.onkeydown = function (e) {

      if (window.editing == true) {
        return
      }
      if (me) {
        if (!me.container || me.container.offsetParent === null) {
          return
        }
        var key = e.keyCode
        //处理普通控件的快捷键
        //快捷键删除
        if (key == '46' || key == '8') {
          if (!me.readonly && me.canDel) {
            // 删除
            me.removeSelectedControl()
          }
          return false
        }
        //快捷键上下左右
        else if (key == '38' || key == '40' || key == '37' || key == '39') {
          //如果是按下的上下左右操作键，则按照辅助线的宽度进行移动，按下ctrl按照1像素进行精准移动
          if (!me.readonly && me.canMove && RDSetting.GLOBAL_KEYBOARD_ALIGN_ENABLE) {
            //支持批量以及外接距形的更新
            var models = me.getSelectedShapes()
            if (models != null && models.length > 0) {
              let moveWeight = me.help_line_weight
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
              //更新auxRect的坐标
              if (RDSetting.SHOW_AUX_RECT) {
                var outRect = me.getSelectedShapesOutRect()

                if (outRect) {
                  var weight = me.help_line_weight

                  me.auxRect.setSize({
                    width: outRect.x1 - outRect.x + 4,
                    height: outRect.y1 - outRect.y + 4
                  })
                  me.auxRect.setPosition({
                    x: outRect.x - 2,
                    y: outRect.y - 2
                  })
                }
              }
              me.hideButtons()
              // 重绘
              me.drawOrPush(me.backgroundLayer)
              me.drawOrPush(me.shapeLayer)
              me.drawOrPush(me.anchorLayer)
              me.drawOrPush(me.lineLayer)
              me.drawOrPush(me.descLayer)
              return false
            }
          }
        }
        //快捷键F2，进行编辑
        else if (key == '113') {
          if (!me.readonly && me.tempTransformerShape != null) {
            var selectedControls = me.getSelectedShapes()
            if (selectedControls != null && selectedControls.length == 1) {
              if (selectedControls[0].bindEditTextShape != null) {
                selectedControls[0].showEditTextEvt(e, selectedControls[0])
              }
            }
          }
        }
        //按下Ctrl+A时，全选所有控件（除了线） 
        else if (e.keyCode == '65' && (e.ctrlKey || e.metaKey)) {
          if (!me.readonly && me.canDel && RDSetting.SHOW_AUX_RECT) {
            for (let i in me.rootModels) {
              if (me.rootModels[i].baseModelType == 'Activity') {
                me.rootModels[i].selected = true
              }
            }
            //打开外接矩形的事件
            me.auxRect.style.pointerEvents = ""
            // 计算所有选中图形的坐标，求出外接矩形

            var outRect = me.getSelectedShapesOutRect()

            if (outRect) {
              var weight = this.help_line_weight

              me.auxRect.setSize({
                width: outRect.x1 - outRect.x + 4,
                height: outRect.y1 - outRect.y + 4
              })
              me.auxRect.setPosition({
                x: outRect.x - 2,
                y: outRect.y - 2
              })
              if (me.getSelectedShapes().length >= RDSetting.AUX_RECT_SELCTED_CONTROL) {
                me.auxRect.setAttributeNS(null, "stroke-width", 2)
              } else {
                me.auxRect.setAttributeNS(null, "stroke-width", 0)
              }
            }
            return false
          }
        }
        //按下ESC时，取消所有选中
        else if (e.keyCode == '27') {
          if (!me.readonly && me.canDel) {

            me.clickTab(me)
            me.makeSelection(null, e)
            return false
          }
        }
        else {

        }
      }
    }
  }
  // 通过JSON初始化
  this.RuleCanvas.initByJson = function (json) {
    // 初始化本身
    var canvObj = new RuleCanvas(json)
    tempSeriDatas[canvObj.id] = canvObj
    tempSeriDatas['currentRuleCanvas'] = canvObj

    // 循环，递归初始化rootModels
    let rootModelsObj = null
    if (json.rootModels != null) {
      // 临时变量rootModels
      let rms = {}
      for (var i in json.rootModels) {
        var modelObjJSON = json.rootModels[i]
        if (modelObjJSON.modelType != null && modelObjJSON.modelType != '') {

          var obj = {}
          eval('obj = ' + modelObjJSON.modelType + '.initByJson(modelObjJSON);')
          // 给控件定义画布对象，不会序列化
          Object.defineProperty(obj, '__canvas__', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: canvObj
          })
          rms[obj.id] = obj
        }
      }

      if (tempExecEval.length > 0) {
        for (var i = 0; i < tempExecEval.length; i++) {
          eval(tempExecEval[i])
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
      if (rootModelsObj[i].baseModelType == "Line") {
        var sid = json.rootModels[rootModelsObj[i].id].startLinkGroupId
        var eid = json.rootModels[rootModelsObj[i].id].endLinkGroupId
        rootModelsObj[i].startLinkGroup = canvObj.linkGroups[sid]
        rootModelsObj[i].endLinkGroup = canvObj.linkGroups[eid]
        rootModelsObj[i].updateByStyle()
      }
    }
    tempSeriDatas = {}
    tempExecEval = []

    return canvObj
  }
}.call(window))