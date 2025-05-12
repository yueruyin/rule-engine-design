/* eslint-disable */
/**
 * 连接线，用来连接不同的Activity
 * 线由至少两个端点构成，分别是开始和结束，线中间有一个说明文本，可以用来代表条件。
 */
import RDSetting from '../ruledesigner_setting.js'
import jspLine from '../jspLine.js'
(function () {
  // 基础活动的类，封装了一些基本方法
  this.RDLine = function (rd, props) {
    this.id = props.id
    //线的开始端点所在的坐标
    this.start = props.start
    //线开始端点所在的关联控件组,一个关联控件组中包含了一个Activity，一个方向上所有关联的线
    this.startLinkGroup = props.startLinkGroup

    //线的结束端点所在的坐标
    this.end = props.end
    //线结束端点所在的关联控件组,一个关联控件组中包含了一个Activity，一个方向上所有关联的线
    this.endLinkGroup = props.endLinkGroup

    //线的类型， 2折线，1直线 缺省为直线
    this.lineType = props.lineType ? props.lineType : 1

    //线上文本,为空时不显示文本
    this.text = props.text ? props.text : ""
    //线上文本的字体，包含了选中/未选中，字体的名称，大小，颜色等配置
    this.font = props.font ? props.font : RDSetting.DEFAULT_ACTIVITY_FONT
    //线的填充色，包含了选中/未选中，填充的颜色等配置
    this.fill = props.fill ? props.fill : RDSetting.DEFAULT_ACTIVITY_FILL
    //线段样式，实线，虚线
    this.lineDash = props.lineDash
    //线段透明度
    this.lineOpacity = props.lineOpacity
    // 是否选中为false
    this.selected = false
    this.lineWeight = props.lineWeight

    // 是否开始执行动画，要播放动画，将此属性设置为true并重绘就可以播放了
    this.playAnim = false

    this.modelType = 'RDLine'
    this.baseModelType = 'Line'
    this.rd = rd

    this.code = props.code
    this.attrs = props.attrs ? props.attrs : null
    if (!this.attrs) {
      this.attrs = props
    }
    this.controlType = props.controlType

    // 是否允许删除
    this.canDel = props.canDel ? props.canDel : RDSetting.DEFAULT_ACTIVITY_CANDEL

    // 创建图形方法
    this.buildShape = function () {

      this.shapes = []
      this.shapes[0] = createSVGElement('svg', this, {
        mid: this.id,
        id: 'line_' + this.id
      })

      let fillInfo = null
      eval("fillInfo = " + this.fill + ";")
      let lineColor = null
      if (fillInfo.selected && fillInfo.selected.color && this.selected) {
        lineColor = fillInfo.selected.color
      } else if (fillInfo.default && fillInfo.default.color) {
        lineColor = fillInfo.default.color
      }

      // 生成折线线段，目前折线的坐标是通过位置关系自动计算的
      if (this.lineType == 2) {
        var sourceType = ''
        var targetType = ''
        var lineData = ''
        var arrowX = this.end.x + this.end.width / 2
        var arrowY = this.end.y + this.end.height / 2
        //计算两个点之间线段的连接路径
        if (this.start != null && this.startLinkGroup != null) {
          if (this.startLinkGroup.type == "top") {
            sourceType = 'Top'
          } else if (this.startLinkGroup.type == "right") {
            sourceType = 'Right'
          } else if (this.startLinkGroup.type == "bottom") {
            sourceType = 'Bottom'
          } else if (this.startLinkGroup.type == "left") {
            sourceType = 'Left'
          }
          if (this.startLinkGroup != null) {
            if (this.endLinkGroup.type == "top") {
              targetType = 'Top'
              arrowY = arrowY - this.end.height / 2
            } else if (this.endLinkGroup.type == "right") {
              targetType = 'Right'
              arrowX = arrowX - this.end.width
            } else if (this.endLinkGroup.type == "bottom") {
              targetType = 'Bottom'
              arrowY = arrowY - this.end.height
            } else if (this.endLinkGroup.type == "left") {
              targetType = 'Left'
              arrowX = arrowX - this.end.width / 2
            }
          }
          var pathParam = {
            sourcePos: [this.start.x + this.start.width / 2, this.start.y + this.start.height / 2],
            targetDirection: targetType,
            targetPos: [this.end.x + this.end.width / 2, this.end.y + this.end.height / 2],
            sourceDirection: sourceType
          }
          lineData = jspLine.jspLine(pathParam)
        }
        //根据计算好的路径，生成线段
        var shapeLine = createSVGElement('path', this, {
          data: lineData,
          fillEnabled: false,
          strokeWidth: this.lineWeight,
          'stroke-dasharray': 5,
          lineCap: 'round',
          lineJoin: 'round',
          pointIndex: 0,
          mid: this.id
        })
        //将线段加入图形
        this.shapes[this.shapes.length] = shapeLine
        this.shapes[0].appendChild(shapeLine)
        //生成箭头
        var spArrow = createSVGElement('marker', this, {
          id: this.id + '_2_marker',
          markerWidth: '4',
          markerHeight: '4',
          refX: '3',
          refY: '2',
          orient: 'auto',
          markerUnits: 'strokeWidth',
          mid: this.id
        })
        spArrow.innerHTML = '<path d="M 0 0 L 4 2 L 0 4 z" fill="' + lineColor + '"/>'
        this.shapes[0].appendChild(spArrow)
        shapeLine.setAttributeNS(null, 'marker-end', 'url(#' + this.id + '_2_marker)')
        //将线段加入linelayer图层
        this.rd.lineLayer.appendChild(this.shapes[0])
      } else {
        //循环创建线段
        var pointX = this.start.x + this.start.width / 2
        var pointY = this.start.y + this.start.height / 2
        var pointEndX = this.end.x + this.end.width / 2
        var pointEndY = this.end.y + this.end.height / 2
        var shapeLine = createSVGElement('line', this, {
          id: this.id + '_line',
          x1: pointX,
          y1: pointY,
          x2: pointEndX,
          y2: pointEndY,
          stroke: lineColor,
          'stroke-width': this.lineWeight,
          'stroke-dasharray': 5,
          mid: this.id
        })
        this.shapes[this.shapes.length] = shapeLine
        this.shapes[0].appendChild(shapeLine)

        //生成箭头
        var spArrow = createSVGElement('marker', this, {
          id: this.id + '_2_marker',
          markerWidth: '4',
          markerHeight: '4',
          refX: '3',
          refY: '2',
          orient: 'auto',
          markerUnits: 'strokeWidth',
          mid: this.id
        })
        spArrow.innerHTML = '<path d="M 0 0 L 4 2 L 0 4 z" fill="' + lineColor + '"/>'
        this.shapes[0].appendChild(spArrow)
        shapeLine.setAttributeNS(null, 'marker-end', 'url(#' + this.id + '_2_marker)')
        //将线段加入linelayer图层
        this.rd.lineLayer.appendChild(this.shapes[0])
      }
      // 重绘
      this.rd.drawOrPush(this.rd.anchorLayer)
      this.rd.drawOrPush(this.rd.lineLayer)
      this.rd.drawOrPush(this.rd.descLayer)

      this.bindShapeEventListener()
    }

    // 更新图形
    this.updateShape = function () {
      this.updateByStyle()
    }

    // 更新图形
    this.updateByStyle = function () {
      //根据线段在startLinkGroup以及endLinkGroup中的下标关系，修改线段的开始坐标和结束坐标
      if (this.startLinkGroup && this.startLinkGroup["lines"] && this.startLinkGroup["lines"].indexOf(this) != -1) {
        let collect = false
        if (this.startLinkGroup["collect"] == 1 || this.startLinkGroup["collect"] == "1") {
          collect = true
        }
        let activityModel = this.startLinkGroup.model
        let groupLength = this.startLinkGroup["lines"].length
        let lineIndex = this.startLinkGroup["lines"].indexOf(this)
        let paddingWidth = 2
        if (this.startLinkGroup.type == "top") {
          var linePointAreaWidth = (groupLength - 1) * paddingWidth + groupLength * this.start.width
          var sx = activityModel.x + (activityModel.width - linePointAreaWidth) * 0.5
          if (!collect) {
            this.start.x = sx + lineIndex * paddingWidth + lineIndex * this.start.width
          } else {
            this.start.x = activityModel.x + (activityModel.width - this.start.width) * 0.5
          }
          this.start.y = activityModel.y - this.start.height
        } else if (this.startLinkGroup.type == "bottom") {
          var linePointAreaWidth = (groupLength - 1) * paddingWidth + groupLength * this.start.width
          var sx = activityModel.x + (activityModel.width - linePointAreaWidth) * 0.5
          if (!collect) {
            this.start.x = sx + lineIndex * paddingWidth + lineIndex * this.start.width
          } else {
            this.start.x = activityModel.x + (activityModel.width - this.start.width) * 0.5
          }
          this.start.y = activityModel.y + activityModel.height
        } else if (this.startLinkGroup.type == "left") {
          var linePointAreaHeight = (groupLength - 1) * paddingWidth + groupLength * this.start.height
          var sy = activityModel.y + (activityModel.height - linePointAreaHeight) * 0.5
          if (!collect) {
            this.start.y = sy + lineIndex * paddingWidth + lineIndex * this.start.height
          } else {
            this.start.y = activityModel.y + (activityModel.height - this.start.height) * 0.5
          }
          this.start.x = activityModel.x - this.start.width
        } else if (this.startLinkGroup.type == "right") {
          var linePointAreaHeight = (groupLength - 1) * paddingWidth + groupLength * this.start.height
          var sy = activityModel.y + (activityModel.height - linePointAreaHeight) * 0.5
          if (!collect) {
            this.start.y = sy + lineIndex * paddingWidth + lineIndex * this.start.height
          } else {
            this.start.y = activityModel.y + (activityModel.height - this.start.height) * 0.5
          }
          this.start.x = activityModel.x + activityModel.width
        }
      }
      if (this.endLinkGroup && this.endLinkGroup["lines"] && this.endLinkGroup["lines"].indexOf(this) != -1) {
        let collect = false
        if (this.endLinkGroup["collect"] == 1 || this.endLinkGroup["collect"] == "1") {
          collect = true
        }
        let activityModel = this.endLinkGroup.model
        let groupLength = this.endLinkGroup["lines"].length
        let lineIndex = this.endLinkGroup["lines"].indexOf(this)
        let paddingWidth = 2
        if (this.endLinkGroup.type == "top") {
          var linePointAreaWidth = (groupLength - 1) * paddingWidth + groupLength * this.end.width
          var sx = activityModel.x + (activityModel.width - linePointAreaWidth) * 0.5
          if (!collect) {
            this.end.x = sx + lineIndex * paddingWidth + lineIndex * this.end.width
          } else {
            this.end.x = activityModel.x + (activityModel.width - this.end.width) * 0.5
          }
          this.end.y = activityModel.y - this.end.height
        } else if (this.endLinkGroup.type == "bottom") {
          var linePointAreaWidth = (groupLength - 1) * paddingWidth + groupLength * this.end.width
          var sx = activityModel.x + (activityModel.width - linePointAreaWidth) * 0.5
          if (!collect) {
            this.end.x = sx + lineIndex * paddingWidth + lineIndex * this.end.width
          } else {
            this.end.x = activityModel.x + (activityModel.width - this.end.width) * 0.5
          }
          this.end.y = activityModel.y + activityModel.height
        } else if (this.endLinkGroup.type == "left") {
          var linePointAreaHeight = (groupLength - 1) * paddingWidth + groupLength * this.end.height
          var sy = activityModel.y + (activityModel.height - linePointAreaHeight) * 0.5
          if (!collect) {
            this.end.y = sy + lineIndex * paddingWidth + lineIndex * this.end.height
          } else {
            this.end.y = activityModel.y + (activityModel.height - this.end.height) * 0.5
          }
          this.end.x = activityModel.x - this.end.width
        } else if (this.endLinkGroup.type == "right") {
          var linePointAreaHeight = (groupLength - 1) * paddingWidth + groupLength * this.end.height
          var sy = activityModel.y + (activityModel.height - linePointAreaHeight) * 0.5
          if (!collect) {
            this.end.y = sy + lineIndex * paddingWidth + lineIndex * this.end.height
          } else {
            this.end.y = activityModel.y + (activityModel.height - this.end.height) * 0.5
          }
          this.end.x = activityModel.x + activityModel.width
        }
      }
      let fillInfo = null
      eval("fillInfo = " + this.fill + ";")
      let lineColor = null
      if (fillInfo.selected && fillInfo.selected.color != "" && this.selected) {
        lineColor = fillInfo.selected.color
      } else if (fillInfo.default && fillInfo.default.color != "") {
        lineColor = fillInfo.default.color
      }
      //处理折线类型
      if (this.lineType == 2) {
        //计算折线path
        var sourceType = ''
        var targetType = ''
        var arrowX = this.end.x + this.end.width / 2
        var arrowY = this.end.y + this.end.height / 2
        if (this.startLinkGroup != null) {
          if (this.startLinkGroup.type == "top") {
            sourceType = 'Top'
          } else if (this.startLinkGroup.type == "right") {
            sourceType = 'Right'
          } else if (this.startLinkGroup.type == "bottom") {
            sourceType = 'Bottom'
          } else if (this.startLinkGroup.type == "left") {
            sourceType = 'Left'
          }
        }
        if (this.endLinkGroup != null) {
          if (this.endLinkGroup.type == "top") {
            targetType = 'Top'
            arrowY = arrowY - this.end.height / 2
          } else if (this.endLinkGroup.type == "right") {
            targetType = 'Right'
            arrowX = arrowX - this.end.width
          } else if (this.endLinkGroup.type == "bottom") {
            targetType = 'Bottom'
            arrowY = arrowY - this.end.height
          } else if (this.endLinkGroup.type == "left") {
            targetType = 'Left'
            arrowX = arrowX - this.end.width / 2
          }
        }

        if (this.startLinkGroup != null) {
          var pathParam = {
            sourcePos: [this.start.x + this.start.width / 2, this.start.y + this.start.height / 2],
            targetDirection: targetType,
            targetPos: [this.end.x + this.end.width / 2, this.end.y + this.end.height / 2],
            sourceDirection: sourceType
          }
          var lineData = jspLine.jspLine(pathParam)

          var shapeLine = this.shapes[1]
          shapeLine.lineData = lineData
          shapeLine.setAttributeNS(null, 'stroke', lineColor)
          this.shapes[0].children[1].innerHTML = '<path d="M 0 0 L 4 2 L 0 4 z" fill="' + lineColor + '"/>'

          shapeLine.fill("transparent")
          if (this.lineWeight != null) {
            shapeLine.setAttributeNS(null, 'stroke-width', this.lineWeight)
            shapeLine.setAttributeNS(null, 'stroke-dasharray', 5)
          }

          if (this.lineDash != null) {
            shapeLine.dash(this.lineDash)
          } else {
            shapeLine.dash(null)
          }
          if (this.lineOpacity != null && this.lineOpacity != undefined) {
            shapeLine.opacity(this.lineOpacity)
          }
          shapeLine.data(lineData)
        }
        //开启动画
        if (this.playAnim) {
          //创建动画元素
          if (!this.animShape) {
            let circleShape = createSVGElement('circle', this, {
              mid: this.id,
              id: 'line_' + this.id,
              cx: 0,
              cy: 0,
              r: 4,
              strokeWidth: 0,
              fill: "#3662EC"
            })
            circleShape.innerHTML = "<animateMotion path=\"" + lineData + "\" dur=\"3s\" fill=\"freeze\" repeatCount=\"indefinite\" />"
            this.rd.anchorLayer.appendChild(circleShape)
            this.animShape = circleShape
            this.upLineData = lineData
          } else if (this.upLineData != lineData) {
            this.animShape.remove()
            let circleShape = createSVGElement('circle', this, {
              mid: this.id,
              id: 'line_' + this.id,
              cx: 0,
              cy: 0,
              r: 4,
              strokeWidth: 0,
              fill: "#3662EC"
            })
            circleShape.innerHTML = "<animateMotion path=\"" + lineData + "\" dur=\"3s\" fill=\"freeze\" repeatCount=\"indefinite\" />"
            this.rd.anchorLayer.appendChild(circleShape)
            this.animShape = circleShape
            this.upLineData = lineData

          }
        } else {
          //删除动画元素
          if (this.animShape) {
            this.animShape.remove()
            this.animShape = null
          }
        }
      } else {

        // 更新线段
        var pointX = this.start.x + this.start.width / 2
        var pointY = this.start.y + this.start.height / 2
        var pointEndX = this.end.x + this.end.width / 2
        var pointEndY = this.end.y + this.end.height / 2

        var shapeLine = this.shapes[1]
        shapeLine.setAttributeNS(null, 'x1', pointX)
        shapeLine.setAttributeNS(null, 'y1', pointY)
        shapeLine.setAttributeNS(null, 'x2', pointEndX)
        shapeLine.setAttributeNS(null, 'y2', pointEndY)
        shapeLine.setAttributeNS(null, 'stroke', lineColor)
        this.shapes[0].children[1].innerHTML = '<path d="M 0 0 L 4 2 L 0 4 z" fill="' + lineColor + '"/>'
        shapeLine.fill("transparent")
        if (this.lineWeight != null) {
          shapeLine.setAttributeNS(null, 'stroke-width', this.lineWeight)
          shapeLine.setAttributeNS(null, 'stroke-dasharray', 5)
        }
        if (this.lineDash != null && this.lineDash == "1") {
          shapeLine.dash(this.lineDash)
        } else {
          shapeLine.dash(null)
        }
        if (this.lineOpacity != null && this.lineOpacity != undefined) {
          shapeLine.opacity(this.lineOpacity)
        }
        let lineData = "M " + pointX + " " + pointY + " L " + pointEndX + " " + pointEndY
        //开启动画
        if (this.playAnim) {
          //创建动画元素
          if (!this.animShape) {
            let circleShape = createSVGElement('circle', this, {
              mid: this.id,
              id: 'line_' + this.id,
              cx: 0,
              cy: 0,
              r: 4,
              strokeWidth: 0,
              fill: "#3662EC"
            })
            circleShape.innerHTML = "<animateMotion path=\"" + lineData + "\" dur=\"3s\" fill=\"freeze\" repeatCount=\"indefinite\" />"
            this.rd.anchorLayer.appendChild(circleShape)
            this.animShape = circleShape
            this.upLineData = lineData
          } else if (this.upLineData != lineData) {
            this.animShape.remove()
            let circleShape = createSVGElement('circle', this, {
              mid: this.id,
              id: 'line_' + this.id,
              cx: 0,
              cy: 0,
              r: 4,
              strokeWidth: 0,
              fill: "#3662EC"
            })
            circleShape.innerHTML = "<animateMotion path=\"" + lineData + "\" dur=\"3s\" fill=\"freeze\" repeatCount=\"indefinite\" />"
            this.rd.anchorLayer.appendChild(circleShape)
            this.animShape = circleShape
            this.upLineData = lineData

          }
        } else {
          //删除动画元素
          if (this.animShape) {
            this.animShape.remove()
            this.animShape = null
          }
        }
      }




      this.rd.drawOrPush(this.rd.lineLayer)
    }






    //清空选中状态
    this.clearSelection = function () {
      this.selected = false
    }

    //设置选中状态
    this.makeSelection = function () {
      // 选中状态为true
      this.selected = true

      this.rd.tempTransformerShape = this.shapes[0]
    }

    // 为图形添加事件监听
    this.bindShapeEventListener = function () {

      // 添加点击事件，由外部配置而来
      if (!this.shapes[0].eventListeners['click']) {
        // 添加点击事件，弹出快捷框，创建组件
        var func = function (e) {

          var model = e.target.model
          if (model.attrs['onclicklistener'] != null) {
            window.tempfunc = RDSetting
            eval(model.attrs['onclicklistener'] + '(model);')
          }
          if (model.selected == false) {
            e.stopPropagation()
            // 清空选中回显
            model.rd.clearSelection()
            model.makeSelection()
            model.rd.clickTab(model)
          } else {
            model.rd.clickTab(model.rd)
          }


        }
        this.shapes[0].eventListeners['click'] = [func]

        this.shapes[0].addEventListener('click', func)
      }
      if (!this.shapes[0].eventListeners['dblclick']) {
        // 添加点击事件，弹出快捷框，创建组件
        var func = function (e) {
          var model = e.target.model
          if (!model.rd.readonly) {
            //修改线段的类型
            if (model.lineType == 2 || model.lineType == "2") {
              model.lineType = 1
            } else {
              model.lineType = 2
            }
            model.attrs["lineType"] = model.lineType
            model.destoryModelAndShapes()
            model.buildShape()
            model.updateByStyle()
          }

        }
        this.shapes[0].eventListeners['dblclick'] = [func]

        this.shapes[0].addEventListener('dblclick', func)
      }

    }

    // 删除关联关系
    this.destoryLinkGroup = function () {
      this.destoryStartLinkGroup()
      this.destoryEndLinkGroup()

    }

    // 删除关联关系
    this.destoryEndLinkGroup = function () {

      if (this.endLinkGroup && this.endLinkGroup["lines"]) {
        let idx = -1
        for (let i = 0; i < this.endLinkGroup["lines"].length; i++) {
          if (this.endLinkGroup["lines"][i] == this) {
            idx = i
            break
          }
        }
        if (idx > -1) {
          this.endLinkGroup["lines"].splice(idx, 1)
        }
      }
    }

    // 删除关联关系
    this.destoryStartLinkGroup = function () {
      //移除线段的节点关系
      if (this.startLinkGroup && this.startLinkGroup["lines"]) {
        let idx = -1
        for (let i = 0; i < this.startLinkGroup["lines"].length; i++) {
          if (this.startLinkGroup["lines"][i] == this) {
            idx = i
            break
          }
        }
        if (idx > -1) {
          this.startLinkGroup["lines"].splice(idx, 1)
        }
      }
    }

    // 删除控件，移除图形
    this.destoryModelAndShapes = function () {
      // 移除图形
      for (var i = 0; i < this.shapes.length; i++) {
        this.shapes[i].remove()
      }
      this.shapes = null

    }

    // 把基本属性转换为JSON
    this.getBaseJSON = function () {
      var json = {
        'id': this.id,
        'start': this.start,
        'end': this.end,
        'points': this.points,
        'lineType': this.lineType,
        'text': this.text,
        'modelType': this.modelType,
        'baseModelType': this.baseModelType,
        'attrs': this.attrs,
        'controlType': this.controlType,
        'startLinkGroupId': this.startLinkGroup.model.id + "_" + this.startLinkGroup.type,
        'endLinkGroupId': this.endLinkGroup.model.id + "_" + this.endLinkGroup.type,
        'lineDash': this.lineDash,
        'lineOpacity': this.lineOpacity,
        'points': this.points,
        'lineWeight': this.lineWeight
      }
      return json
    }


    // 转换为JSON的序列化方法
    this.toJSON = function () {
      var json = this.getBaseJSON()
      if (this.font != RDSetting.DEFAULT_ACTIVITY_FONT) {
        json.font = this.font
      }
      if (this.fill != RDSetting.DEFAULT_ACTIVITY_FILL) {
        json.fill = this.fill
      }
      return json
    }


    this.rebuildAnchors = function (useModel) {
      // 为节点追加事件
      this.bindShapeEventListener()
    }

  }

  // 通过JSON初始化
  this.RDLine.initByJson = function (json) {
    var rd = tempSeriDatas['currentRuleCanvas']
    var obj = {}
    eval('obj = new ' + json.modelType + '(rd, json);')
    tempSeriDatas[obj.id] = obj
    return obj
  }
}.call(window))