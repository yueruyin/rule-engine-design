/* eslint-disable */
/**
 * 活动，是所有矩形类控件的基础，封装了大量的基础操作代码，其他的控件在大体操作逻辑上都和它保持一致，只是图形展示略微不同
 */
import bus from '../bus'
import RDSetting from '../ruledesigner_setting.js'
import { renderModel } from './canvas/canvas'
import { getDragModel } from './canvas/drag'
import { addEventListener } from './canvas/event'

(function () {
  // 基础活动的类，封装了一些基本方法
  this.Activity = function (rd, props) {
    this.id = props.id

    this.x = props.x ? props.x : 0
    this.y = props.y ? props.y : 0
    this.width = props.width ? props.width : 0
    this.height = props.height ? props.height : 0

    //边框，包含了选中/未选中，4个边框的大小，颜色，样式等配置
    this.border = props.border ? props.border : RDSetting.DEFAULT_ACTIVITY_BORDER
    //字体，包含了选中/未选中，字体的名称，大小，颜色等配置
    this.font = props.font ? props.font : RDSetting.DEFAULT_ACTIVITY_FONT
    //填充，包含了选中/未选中，填充的颜色等配置
    this.fill = props.fill ? props.fill : RDSetting.DEFAULT_ACTIVITY_FILL



    // 是否选中为false
    this.selected = false

    this.text = props.text ? props.text : ""

    this.modelType = 'Activity'
    this.baseModelType = 'Activity'
    this.rd = rd
    //自身对象
    const me = this

    this.code = props.code
    this.attrs = props.attrs ? props.attrs : null
    if (!this.attrs) {
      this.attrs = props
    }
    this.controlType = props.controlType
    // 当前的动画效果
    this.currentPlayAnim = null
    // 是否允许删除
    this.canDel = props.canDel ? props.canDel : RDSetting.DEFAULT_ACTIVITY_CANDEL

    /**
    * 编辑text取消事件
    */
    this.editTextCancel = function (input) {
      input.style.display = 'none'
      window.editing = false
      window.tempEditingModel = null
    }
    /**
     * 编辑text编辑成功事件
     */
    this.editTextOK = function (input) {
      window.tempEditingModel.rd.setAttr({
        'code': 'text',
        'value': input.value
      })
      window.tempEditingModel.updateByStyle()

      input.style.display = 'none'
      window.editing = false

      window.tempEditingModel.rd.clickTab(window.tempEditingModel, true)
      window.tempEditingModel = null
    }

    // 弹出绑定框
    this.showEditTextEvt = function (e, model) {
      // 当前正在被编辑的模型
      if (model) {
        window.tempEditingModel = model
      } else {
        window.tempEditingModel = this.model
      }

      if (!tempEditingModel.rd.readonly && tempEditingModel.rd.canModattr) {
        var input = document.getElementById('pdcanvas_edit_input')
        if (input == null) {
          input = document.createElement('textarea')
          input.setAttribute('id', 'pdcanvas_edit_input')

          input.style.zIndex = 9999
          input.style.borderWidth = 0
          input.style.position = 'absolute'
          input.onblur = function () {
            if (window.tempEditingModel) {
              window.tempEditingModel.editTextOK(input)
            }
          }
          input.onkeypress = function (e) {
            // 回车
            if (e.keyCode == 13) {
              if (window.tempEditingModel) {
                window.tempEditingModel.editTextOK(input)
              }
            }
          }
          input.onkeydown = function (e) {
            //esc退出
            if (e.keyCode == 27) {
              if (window.tempEditingModel) {
                window.tempEditingModel.editTextCancel(input)
              }
            }
          }
          document.body.appendChild(input)
        };

        var containerEle = document.getElementById(window.tempEditingModel.rd.containerid)

        input.style.display = ''
        var editEle = window.tempEditingModel.bindEditTextShape
        input.style.width = ""
        input.style.height = ""
        input.style.width = (parseInt(editEle.getAttribute('width')) - 2) + 'px'
        input.style.height = (parseInt(editEle.getAttribute('height') - 2)) + 'px'
        if (input.style.width == "") {
          input.style.width = editEle.model.width - 2 + 'px'
        }
        if (input.style.height == "") {
          input.style.height = editEle.model.height - 2 + 'px'
        }
        input.style.left = (window.tempEditingModel.rd.getOffsetLeft(containerEle) + tempEditingModel.x + 2 - containerEle.scrollLeft) + 'px'
        input.style.top = (window.tempEditingModel.rd.getOffsetTop(containerEle) + tempEditingModel.y + 2 - containerEle.scrollTop) + 'px'

        input.style.fontSize = editEle.model.fontSize + "px"
        input.value = editEle.model.text
        input.focus()
        input.selectionStart = 0 // 选中开始位置
        input.selectionEnd = input.value.length // 获取输入框里的长度。
        //设置全局编辑属性，使快捷键不生效
        window.editing = true
      }
    }

    /**
     * 创建并绑定edittext
     */
    this.bindEditText = function (shape) {
      this.bindEditTextShape = shape
    }

    /**
     * 为图形添加事件监听
     */
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
          if (model.currentPlayAnim != null) {
            for (var i = 0; i < model.currentPlayAnim.length; i++) {
              model.currentPlayAnim[i].remove()
            }
            model.rd.drawOrPush(model.shapes[1].getLayer())
          }
        }
        this.shapes[0].eventListeners['click'] = [func]
        this.shapes[0].addEventListener('click', func)
      }
      if (!this.shapes[0].eventListeners['mouseover']) {
        var func = function (e) {
          var model = e.target.model
          // 只要model发生了变化，就执行
          if (model != null && RDSetting.tempMouseEventObj == null || RDSetting.tempMouseEventObj != model) {
            if (model.attrs['mouseoverlistener'] != null) {
              eval(model.attrs['mouseoverlistener'] + '(model);')
            }
          }
        }

        this.shapes[0].eventListeners['mouseover'] = [func]
        this.shapes[0].addEventListener('mouseover', func)
      }
      if (!this.shapes[0].eventListeners['mouseout']) {
        var func = function (e) {
          var model = e.target.model
          if (model != null && model.attrs['mouseoutlistener'] != null) {
            eval(model.attrs['mouseoutlistener'] + '(model);')
          }
        }
        this.shapes[0].eventListeners['mouseout'] = [func]
        this.shapes[0].addEventListener('mouseout', func)
      }

      //添加自定义事件，控件位置改变
      if (!this.shapes[0].eventListeners['changeposition']) {
        var func = function (e) {

        }
        this.shapes[0].eventListeners['changeposition'] = [func]
      }

      addEventListener(this, 'dragstart', function (e) {
        var model = getDragModel(me.__canvas__)
        model.rd.destoryHelpLines()
        bus.$emit('dragstart', model)
      })

      addEventListener(this, 'dragmove', function (e) {
        const canvas = me.__canvas__
        const model = getDragModel(canvas)
        // 同步修改图形的模型坐标
        // 更新辅助线以及图标
        let absPos = canvas.updateHelpLines(model, e)
        model.x = absPos.x
        model.y = absPos.y

        // 重绘图形
        renderModel(canvas, model, e)

        bus.$emit('dragmove', model)
      })

      addEventListener(this, 'dragend', function (e) {
        me.__canvas__.destoryHelpLines()
        bus.$emit('dragend', getDragModel(me.__canvas__))
      })
    }

    // 删除控件，移除图形
    this.destoryModelAndShapes = function () {
      // 移除图形
      for (var i = 0; i < this.shapes.length; i++) {
        this.shapes[i].remove()
      }

    }

    //更新连接的线段
    this.updateLinkLines = function () {
      //更新当前控件四个方向的关联数据以及线段
      let dirTypes = ['left', "top", 'bottom', 'right']

      for (let dirType = 0; dirType < dirTypes.length; dirType++) {
        let linkGroupKey = this.id + "_" + dirTypes[dirType]
        let linkGroup = this.rd.linkGroups[linkGroupKey]
        if (linkGroup && linkGroup["lines"]) {
          for (let li = 0; li < linkGroup["lines"].length; li++) {
            linkGroup["lines"][li].updateByStyle()
          }
        }
      }
    }

    /**
     * 把基本属性转换为JSON
     */
    this.getBaseJSON = function () {
      var json = {
        'id': this.id,
        'x': this.x,
        'y': this.y,
        'width': this.width,
        'height': this.height,
        'rotation': this.rotation,
        'scaleX': this.scaleX,
        'scaleY': this.scaleY,
        'text': this.text,
        'icon': this.icon,
        'modelType': this.modelType,
        'baseModelType': this.baseModelType,
        'attrs': this.attrs,
        'controlType': this.controlType
      }
      return json
    }

    /**
     * 转换为JSON的序列化方法
     */
    this.toJSON = function () {
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

    /**
     * 清空选中状态
     */
    this.clearSelection = function () {
      this.selected = false
    }

    this.makeSelection = function () {
      // 选中状态为true
      this.selected = true

      // this.rd.tempTransformerShape = this.shapes[0]
    }

    // 仅有文字的
    this.buildOnlyTextShape = function () {
      this.shapes = []
      //取得字体，边框，填充的配置信息
      let fontInfo = null
      let borderInfo = null
      let fillInfo = null
      eval("fontInfo = " + this.font + ";")
      eval("borderInfo = " + this.border + ";")
      eval("fillInfo = " + this.fill + ";")
      this.shapes[0] = createSVGElement('svg', this, {
        x: this.x,
        y: this.y,
        mid: this.id,
        id: 'shape_' + this.id
      })
      // 计算文字位置（居中）
      let fontWidth = fontInfo.default.size * this.text.length
      let fontHeight = fontInfo.default.size
      let y = this.height / 2 + fontHeight / 2
      let x = this.width / 2 - fontWidth / 2
      this.shapes[1] = createSVGElement('svg', this, {

      })



      //创建上方的线条
      this.shapes[2] = createSVGElement('line', this, {
        x1: 0,
        y1: 0,
        x2: this.width,
        y2: 0,
        stroke: borderInfo.default.top.color,
        'stroke-width': borderInfo.default.top.width,
        'stroke-dasharray': borderInfo.default.top.dash
      })
      //创建右方的线条
      this.shapes[3] = createSVGElement('line', this, {
        x1: this.width,
        y1: 0,
        x2: this.width,
        y2: this.height,
        stroke: borderInfo.default.right.color,
        'stroke-width': borderInfo.default.right.width,
        'stroke-dasharray': borderInfo.default.right.dash
      })
      //创建下方的线条
      this.shapes[4] = createSVGElement('line', this, {
        x1: 0,
        y1: this.height,
        x2: this.width,
        y2: this.height,
        stroke: borderInfo.default.bottom.color,
        'stroke-width': borderInfo.default.bottom.width,
        'stroke-dasharray': borderInfo.default.bottom.dash
      })
      //创建下方的线条
      this.shapes[5] = createSVGElement('line', this, {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: this.height,
        stroke: borderInfo.default.left.color,
        'stroke-width': borderInfo.default.left.width,
        'stroke-dasharray': borderInfo.default.left.dash
      })
      //创建填充矩形
      this.shapes[6] = createSVGElement('rect', this, {
        x: 0,
        y: 0,
        rx: 5,
        ry: 5,
        width: this.width,
        height: this.height,
        fill: fillInfo.default.color
      })

      this.shapes[0].appendChild(this.shapes[6])
      this.shapes[0].appendChild(this.shapes[2])
      this.shapes[0].appendChild(this.shapes[3])
      this.shapes[0].appendChild(this.shapes[4])
      this.shapes[0].appendChild(this.shapes[5])
      this.shapes[0].appendChild(this.shapes[1])

      // 添加到图形图层
      this.rd.shapeLayer.appendChild(this.shapes[0])

      this.bindEditText(this.shapes[1])
    }

    /**
     * 更新填充矩形
     */
    this.updateFillRect = function () {
      let fillInfo = null
      eval("fillInfo = " + this.fill + ";")
      this.shapes[6].setSize(this)
      if (fillInfo.selected && fillInfo.selected.color && this.selected) {
        this.shapes[6].setAttributeNS(null, 'fill', fillInfo.selected.color)
      } else if (fillInfo.default && fillInfo.default.color) {
        this.shapes[6].setAttributeNS(null, 'fill', fillInfo.default.color)
      }
    }

    /**
     * 更新边框
     */
    this.updateBorders = function () {
      //取得字体，边框，填充的配置信息
      let borderInfo = null
      eval("borderInfo = " + this.border + ";")

      //更新上方的边框
      this.shapes[2].setAttributeNS(null, 'x2', this.width)
      if (borderInfo.selected && borderInfo.selected.top
        && borderInfo.selected.top.width && this.selected) {
        this.shapes[2].setAttributeNS(null, 'stroke-width', borderInfo.selected.top.width)
      } else if (borderInfo.default && borderInfo.default.top && borderInfo.default.top.width) {
        this.shapes[2].setAttributeNS(null, 'stroke-width', borderInfo.default.top.width)
      }
      if (borderInfo.selected && borderInfo.selected.top
        && borderInfo.selected.top.color && this.selected) {
        this.shapes[2].setAttributeNS(null, 'stroke', borderInfo.selected.top.color)
      } else if (borderInfo.default && borderInfo.default.top && borderInfo.default.top.color) {
        this.shapes[2].setAttributeNS(null, 'stroke', borderInfo.default.top.color)
      }
      if (borderInfo.selected && borderInfo.selected.top
        && borderInfo.selected.top.dash && this.selected) {
        this.shapes[2].setAttributeNS(null, 'stroke-dasharray', borderInfo.selected.top.dash)
      } else if (borderInfo.default && borderInfo.default.top && borderInfo.default.top.dash) {
        this.shapes[2].setAttributeNS(null, 'stroke-dasharray', borderInfo.default.top.dash)
      }

      //更新右方的边框
      this.shapes[3].setAttributeNS(null, 'x1', this.width)
      this.shapes[3].setAttributeNS(null, 'x2', this.width)
      this.shapes[3].setAttributeNS(null, 'y2', this.height)
      if (borderInfo.selected && borderInfo.selected.right
        && borderInfo.selected.right.width && this.selected) {
        this.shapes[3].setAttributeNS(null, 'stroke-width', borderInfo.selected.right.width)
      } else if (borderInfo.default && borderInfo.default.right && borderInfo.default.right.width) {
        this.shapes[3].setAttributeNS(null, 'stroke-width', borderInfo.default.right.width)
      }
      if (borderInfo.selected && borderInfo.selected.right
        && borderInfo.selected.right.color && this.selected) {
        this.shapes[3].setAttributeNS(null, 'stroke', borderInfo.selected.right.color)
      } else if (borderInfo.default && borderInfo.default.right && borderInfo.default.right.color) {
        this.shapes[3].setAttributeNS(null, 'stroke', borderInfo.default.right.color)
      }
      if (borderInfo.selected && borderInfo.selected.right
        && borderInfo.selected.right.dash && this.selected) {
        this.shapes[3].setAttributeNS(null, 'stroke-dasharray', borderInfo.selected.right.dash)
      } else if (borderInfo.default && borderInfo.default.right && borderInfo.default.right.dash) {
        this.shapes[3].setAttributeNS(null, 'stroke-dasharray', borderInfo.default.right.dash)
      }

      //更新下方的边框
      this.shapes[4].setAttributeNS(null, 'y1', this.height)
      this.shapes[4].setAttributeNS(null, 'y2', this.height)
      this.shapes[4].setAttributeNS(null, 'x2', this.width)
      if (borderInfo.selected && borderInfo.selected.bottom
        && borderInfo.selected.bottom.width && this.selected) {
        this.shapes[4].setAttributeNS(null, 'stroke-width', borderInfo.selected.bottom.width)
      } else if (borderInfo.default && borderInfo.default.bottom && borderInfo.default.bottom.width) {
        this.shapes[4].setAttributeNS(null, 'stroke-width', borderInfo.default.bottom.width)
      }
      if (borderInfo.selected && borderInfo.selected.bottom
        && borderInfo.selected.bottom.color && this.selected) {
        this.shapes[4].setAttributeNS(null, 'stroke', borderInfo.selected.bottom.color)
      } else if (borderInfo.default && borderInfo.default.bottom && borderInfo.default.bottom.color) {
        this.shapes[4].setAttributeNS(null, 'stroke', borderInfo.default.bottom.color)
      }
      if (borderInfo.selected && borderInfo.selected.bottom
        && borderInfo.selected.bottom.dash && this.selected) {
        this.shapes[4].setAttributeNS(null, 'stroke-dasharray', borderInfo.selected.bottom.dash)
      } else if (borderInfo.default && borderInfo.default.bottom && borderInfo.default.bottom.dash) {
        this.shapes[4].setAttributeNS(null, 'stroke-dasharray', borderInfo.default.bottom.dash)
      }

      //更新左方的边框
      this.shapes[5].setAttributeNS(null, 'y2', this.height)
      if (borderInfo.selected && borderInfo.selected.left
        && borderInfo.selected.left.width && this.selected) {
        this.shapes[5].setAttributeNS(null, 'stroke-width', borderInfo.selected.left.width)
      } else if (borderInfo.default && borderInfo.default.left && borderInfo.default.left.width) {
        this.shapes[5].setAttributeNS(null, 'stroke-width', borderInfo.default.left.width)
      }
      if (borderInfo.selected && borderInfo.selected.left
        && borderInfo.selected.left.color && this.selected) {
        this.shapes[5].setAttributeNS(null, 'stroke', borderInfo.selected.left.color)
      } else if (borderInfo.default && borderInfo.default.left && borderInfo.default.left.color) {
        this.shapes[5].setAttributeNS(null, 'stroke', borderInfo.default.left.color)
      }
      if (borderInfo.selected && borderInfo.selected.left
        && borderInfo.selected.left.dash && this.selected) {
        this.shapes[5].setAttributeNS(null, 'stroke-dasharray', borderInfo.selected.left.dash)
      } else if (borderInfo.default && borderInfo.default.left && borderInfo.default.left.dash) {
        this.shapes[5].setAttributeNS(null, 'stroke-dasharray', borderInfo.default.left.dash)
      }
    }

    /**
     * 根据属性更新基本样式
     */
    this.updateByStyle = function () {
      var shape = this.shapes[0]

      shape.setAttributeNS(null, 'x', this.x)
      shape.setAttributeNS(null, 'y', this.y)
      shape.setAttributeNS(null, 'width', this.width)
      shape.setAttributeNS(null, 'height', this.height)

      let fontInfo = null
      eval("fontInfo = " + this.font + ";")

      //处理边框
      this.updateBorders()

      //处理填充矩形
      this.updateFillRect()


      // 处理文字
      if (this.text != null) {
        if (fontInfo.selected && fontInfo.selected.color && this.selected) {
          this.shapes[1].setAttributeNS(null, 'fill', fontInfo.selected.color)
        } else if (fontInfo.default && fontInfo.default.color) {
          this.shapes[1].setAttributeNS(null, 'fill', fontInfo.default.color)
        }

        if (fontInfo.selected && fontInfo.selected.size && this.selected) {
          this.shapes[1].setAttributeNS(null, 'font-size', fontInfo.selected.size)
        } else if (fontInfo.default && fontInfo.default.size) {
          this.shapes[1].setAttributeNS(null, 'font-size', fontInfo.default.size)
        }

        if (fontInfo.selected && fontInfo.selected.family && this.selected) {
          this.shapes[1].setAttributeNS(null, 'font-family', fontInfo.selected.family)
        } else if (fontInfo.default && fontInfo.default.family) {
          this.shapes[1].setAttributeNS(null, 'font-family', fontInfo.default.family)
        }

        if (this.text) {
          this.shapes[1].innerHTML = this.text
        }

        if (fillInfo.selected && fillInfo.selected.color && this.selected) {
          this.shapes[2].setAttributeNS(null, 'fill', fillInfo.selected.color)
        } else if (fillInfo.default && fillInfo.default.color) {
          this.shapes[2].setAttributeNS(null, 'fill', fillInfo.default.color)
        }
      }

      this.rd.drawOrPush(shape)
    }



    // 更新图形
    this.updateShape = function () {
      this.updateByStyle()
    }

    // 普通节点的创建图形方法
    this.buildShape = function () {
      this.buildOnlyTextShape()

      this.updateByStyle()

      this.bindShapeEventListener()
    }


    this.rebuildAnchors = function (useModel) {
      // 为节点追加事件
      this.bindShapeEventListener()
    }

  }

  // 通过JSON初始化
  this.Activity.initByJson = function (json) {
    var rd = tempSeriDatas['currentRuleCanvas']
    var obj = {}
    eval('obj = new ' + json.modelType + '(rd, json);')
    tempSeriDatas[obj.id] = obj
    return obj
  }
}.call(window))