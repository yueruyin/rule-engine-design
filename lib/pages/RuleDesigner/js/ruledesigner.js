/* eslint-disable */
import RDSetting from './ruledesigner_setting.js'

import bus from '../js/bus'

//引入组件
import './components/rulecanvas'
import './components/RuleActivity'
import './components/ruleline'
import './components/rulebegin'
import './components/ruleaction'
import './components/rulesql'
import './components/rulecompute'
import './components/rulecondition'
import './components/ruleconditionItem'
import './components/rulehttp'
import './components/RuleCall'
import './components/rulejson'

// 给原生数组新增一个方法
Array.prototype.remove = function (val) {
  var index = this.indexOf(val)
  if (index > -1) {
    this.splice(index, 1)
  }
}

;(function () {
  // 记录父类
  var _supper = this
  // 全局变量，用来辅助初始化或反向初始化
  window.tempSeriDatas = {}
  window.tempExecEval = []

  // 创建SVG元素
  this.createSVGElement = function (eleName, model, json) {
    var ele = document.createElementNS('http://www.w3.org/2000/svg', eleName)
    for (var i in json) {
      var name = i
      var namespace = null
      if (name == 'fontColor') {
        name = 'font-color'
      } else if (name == 'fontSize') {
        name = 'font-size'
      } else if (name == 'fontFamily') {
        name = 'font-family'
      } else if (name == 'strokeWidth') {
        name = 'stroke-width'
      } else if (name == 'shadowColor') {
        name = 'shadow-color'
      } else if (name == 'shadowBlur') {
        name = 'shadow-blur'
      } else if (name == 'shadowOffset') {
        name = 'shadow-offset'
      } else if (name == 'shadowOpacity') {
        name = 'shadow-opacity'
      } else if (name == 'xlink:href') {
        name = 'href'
        namespace = 'http://www.w3.org/1999/xlink'
      } else if (name == 'data') {
        name = 'd'
      } else if (name == 'text' && eleName == 'text') {
        ele.innerHTML = json[i]
        continue
      } else if (name == 'cornerRadius') {
        if (json[i] && json[i] != '') {
          ele.setAttributeNS(null, 'rx', json[i])
          ele.setAttributeNS(null, 'ry', json[i])
        }
        continue
      }

      ele.setAttributeNS(namespace, name, json[i])
    }

    ele.eventListeners = {}
    ele.model = model
    // 添加一些适配事件

    ele.setPoints = function (ps) {
      if (ps) {
        ele.setAttributeNS(null, 'x1', ps[0])
        ele.setAttributeNS(null, 'y1', ps[1])
        ele.setAttributeNS(null, 'x2', ps[2])
        ele.setAttributeNS(null, 'y2', ps[3])
        ele.show()
      } else {
        ele.hide()
      }
    }
    ele.stroke = function (color) {
      ele.setAttributeNS(null, 'stroke', color)
    }
    ele.fill = function (color) {
      var c = color
      if (!c || c == '') {
        c = 'none'
      }
      ele.setAttributeNS(null, 'fill', c)
    }
    ele.shadowOpacity = function (value) {
      ele.setAttributeNS(null, 'shadow-opacity', value)
    }
    ele.image = function (value) {
      ele.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value)
    }
    ele.getLayer = function () {
      var e = ele
      for (var i = 0; i < 10; i++) {
        var parentElement = e.parentElement
        if (!parentElement) {
          return null
        }
        if (parentElement.tagName == 'g') {
          return parentElement
        } else if (parentElement.tagName == 'div') {
          return e
        }
        e = parentElement
      }
      return ele.parentElement
    }
    ele.moveToTop = function () {
      // 取得Layer
      var parentEle = ele.parentElement
      if (parentEle) {
        parentEle.appendChild(ele)
      }
    }
    ele.moveToBottom = function () {
      // 取得Layer

      var parentEle = ele.parentElement
      parentEle.appendChild(ele)
      var firstEle = null
      if (parentEle.children.length > 0) {
        firstEle = parentEle.children[0]
      }
      parentEle.insertBefore(ele, firstEle)
    }
    ele.visible = function () {
      if (ele.style.display == '') {
        return true
      } else {
        return false
      }
    }

    ele.show = function () {
      ele.style.display = ''
    }
    ele.hide = function () {
      ele.style.display = 'none'
    }
    ele.setSize = function (json) {
      if (json) {
        ele.setAttributeNS(null, 'width', json.width)
        ele.setAttributeNS(null, 'height', json.height)
      } else {
        ele.setAttributeNS(null, 'width', 0)
        ele.setAttributeNS(null, 'height', 0)
      }
    }
    ele.setFontSize = function (fontSize) {
      ele.setAttributeNS(null, 'font-size', fontSize)
    }
    ele.setFontFamily = function (fontFamily) {
      ele.setAttributeNS(null, 'font-family', fontFamily)
    }

    ele.setPosition = function (json) {
      if (json) {
        ele.setAttributeNS(null, 'x', json.x)
        ele.setAttributeNS(null, 'y', json.y)
      }
    }
    ele.setCornerRadius = function (value) {
      if (value) {
        ele.setAttributeNS(null, 'rx', value)
        ele.setAttributeNS(null, 'ry', value)
      } else {
        ele.setAttributeNS(null, 'rx', 0)
        ele.setAttributeNS(null, 'ry', 0)
      }
    }
    ele.dash = function (value) {
      ele.setAttributeNS(null, 'stroke-dasharray', value)
    }
    ele.opacity = function (value) {
      ele.setAttributeNS(null, 'opacity', value)
    }
    ele.setText = function (value) {
      ele.innerHTML = value
    }
    ele.data = function (data) {
      // 取得Layer
      ele.setAttributeNS(null, 'd', data)
    }

    return ele
  }

  this.initRD = function (el, json, width = 0, height = 0) {
    // 计算画布初始化的大小
    let { clientWidth, clientHeight } = el
    width = Math.max(width, clientWidth)
    height = Math.max(height, clientHeight)
    // 对图片进行预加载
    for (var i in RDSetting.ICOS) {
      try {
        var img = new Image()
        img.src = RDSetting.ICOS[i]
      } catch (e) {}
    }
    //如果json不为空，则为重新加载
    if (typeof json != 'undefined' && json != null) {
      // 设置json
      json.width = json.canvasWidth = width
      json.height = json.canvasHeight = height
      json.container = el
      var rdCanvas = RuleCanvas.initByJson(json)

      setTimeout(function () {
        var e = document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        rdCanvas.stage.dispatchEvent(e)
        //如果初始化时没有控件则移动设计器滚动条到中间位置
        if (JSON.stringify(rdCanvas.rootModels) == '{}') {
          rdCanvas.container.scrollLeft =
            (rdCanvas.width - rdCanvas.container.offsetWidth) / 2
          rdCanvas.container.scrollTop =
            (rdCanvas.height - rdCanvas.container.offsetHeight) / 2
        }
        //如果已经存在控件，则移动到开始节点居中上的位置
        else {
          //取得开始节点位置
          let beginModel = null
          for (let m in rdCanvas.rootModels) {
            if (rdCanvas.rootModels[m].modelType == 'RuleBegin') {
              beginModel = rdCanvas.rootModels[m]
              break
            }
          }
          if (beginModel) {
            let middleXDelta =
              rdCanvas.width / 2 - (beginModel.x + beginModel.width / 2)
            let middleYDelta =
              rdCanvas.height / 4 - (beginModel.y + beginModel.height / 2)
            rdCanvas.container.scrollLeft =
              (rdCanvas.width - rdCanvas.container.offsetWidth) / 2 -
              middleXDelta
            rdCanvas.container.scrollTop =
              (rdCanvas.height - rdCanvas.container.offsetHeight) / 2 -
              middleYDelta
          } else {
            rdCanvas.container.scrollLeft =
              (rdCanvas.width - rdCanvas.container.offsetWidth) / 2
            rdCanvas.container.scrollTop =
              (rdCanvas.height - rdCanvas.container.offsetHeight) / 2
          }
        }
      }, 300)
      return rdCanvas
    }
    //如果json为空，则为新建
    else {
      var rdCanvas = new RuleCanvas({
        id: 'ruledesigner',
        container: el,
        width,
        height,
        controlType: '999'
      })
      var rootModels = {}
      rdCanvas.init(rootModels)
      rdCanvas.createQuickMenu()
      return rdCanvas
    }
  }

  this.initNode = function (data, rdCanvas) {
    var timestamp = rdCanvas.curIndex
    rdCanvas.curIndex++
    var activity = null
    var absPos = {
      x: data.X,
      y: data.Y
    }
    if (RDSetting.GLOBAL_HELP_LINE_ENABLE) {
      var mod = absPos.x % rdCanvas.help_line_weight
      if (mod > rdCanvas.help_line_weight / 2) {
        absPos.x = absPos.x + (rdCanvas.help_line_weight - mod)
      } else {
        absPos.x = absPos.x - mod
      }
      mod = absPos.y % rdCanvas.help_line_weight
      if (mod > rdCanvas.help_line_weight / 2) {
        absPos.y = absPos.y + (rdCanvas.help_line_weight - mod)
      } else {
        absPos.y = absPos.y - mod
      }
    }

    // 规则
    if (data.CONTROL_TYPE == '22') {
      activity = new RDStart(rdCanvas, {
        id: 'rds_22_' + timestamp,
        attrs: {
          code: 'rds_' + timestamp,
          name: data.CONTROL_NAME
        },
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '23') {
      activity = new RuleBegin(rdCanvas, {
        id: 'begin_23_' + timestamp,
        // code: 'begin_' + timestamp,
        attrs: {
          code: 'start',
          name: data.CONTROL_NAME
        },
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '24') {
      activity = new RuleBegin(rdCanvas, {
        id: 'end_24_' + timestamp,
        attrs: {
          code: 'end_' + timestamp,
          name: data.CONTROL_NAME
        },
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '25') {
      activity = new RuleAction(rdCanvas, {
        id: 'action_25_' + timestamp,
        attrs: {
          code: 'action_' + timestamp,
          name: data.CONTROL_NAME
        },
        text: data.CONTROL_DESC,
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '26') {
      activity = new RuleCondition(rdCanvas, {
        id: 'condition_26_' + timestamp,
        attrs: {
          code: 'condition_' + timestamp,
          name: data.CONTROL_NAME
        },
        text: data.CONTROL_DESC,
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '27') {
      activity = new RuleConditionItem(rdCanvas, {
        id: 'conditionItem_27_' + timestamp,
        attrs: {
          code: 'conditionItem_' + timestamp,
          name: data.CONTROL_NAME
        },
        text: data.CONTROL_DESC,
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '28') {
      activity = new RuleCompute(rdCanvas, {
        id: 'compute_28_' + timestamp,
        attrs: {
          code: 'compute_' + timestamp,
          name: data.CONTROL_NAME
        },
        text: data.CONTROL_DESC,
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '29') {
      activity = new RuleSql(rdCanvas, {
        id: 'action_sql_29_' + timestamp,
        attrs: {
          code: 'action_sql_' + timestamp,
          name: data.CONTROL_NAME
        },
        text: data.CONTROL_DESC,
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '30') {
      activity = new RuleHttp(rdCanvas, {
        id: 'action_http_30_' + timestamp,
        attrs: {
          code: 'action_http_' + timestamp,
          name: data.CONTROL_NAME
        },
        text: data.CONTROL_DESC,
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '31') {
      activity = new RuleCall(rdCanvas, {
        id: 'action_call_31_' + timestamp,
        attrs: {
          code: 'action_call_' + timestamp,
          name: data.CONTROL_NAME
        },
        text: data.CONTROL_DESC,
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    } else if (data.CONTROL_TYPE == '32') {
      activity = new RuleJson(rdCanvas, {
        id: 'action_json_32_' + timestamp,
        attrs: {
          code: 'action_json_' + timestamp,
          name: data.CONTROL_NAME
        },
        text: data.CONTROL_DESC,
        x: absPos.x,
        y: absPos.y,
        width: data.WIDTH,
        height: data.HEIGHT,
        controlType: data.CONTROL_ID,
        permission: data.permission
      })
    }

    rdCanvas.rootModels[activity.id] = activity
    rdCanvas.addModel(activity, true)
    if (typeof rdCanvas.clickTab == 'function') {
      // 清空当前被选中的图形
      rdCanvas.clearSelection()
      // 如果上一次有选中图形，则清空上一次选中图形
      if (rdCanvas.tempTransformerShape != null) {
        rdCanvas.tempTransformerShape.model.updateByStyle()
      }

      rdCanvas.clickTab(activity)
    }
    return activity
  }
}).call(window)
