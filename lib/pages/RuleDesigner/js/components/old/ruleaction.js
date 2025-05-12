/* eslint-disable */
/**
 * 执行标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { buildRectShape, updateRectShapeByStyle } from './canvas/shape'

(function () {
  this.RuleAction = function (rd, props) {
    Activity.call(this, rd, props)
    // 绑定字段，用来动态替换值，如果为空时，则为普通标签，否则为绑定的表达式，缺省空字符串
    this.bindField = props.bindField ? props.bindField : ''
    // 标签文字横向对齐，left right center,默认left
    this.align = props.align ? props.align : 'left'
    // 标签文字纵向对齐，top middle bottom,默认middle
    this.valign = props.valign ? props.valign : 'middle'
    // 换行，1不换行，2换行，缺省1
    this.feed = props.feed ? props.feed : 1
    // 缩小字体填充,1不开启，2开启，缺省1
    this.autoScaleFill = props.autoScaleFill ? props.autoScaleFill : 1
    this.descText = props.descText ? props.descText : '默认备注文字'
    this.modelType = 'RuleAction'
    this.baseModelType = 'Activity'
    this.code = props.code
    this.type = props.type
    this.name = props.name
    this.desc = props.desc
    this.together = props.together

    /**
     * 设置绑定edittext
     */
    this.bindEditText = function (shape) {

    }

    // 普通节点的创建图形方法
    this.buildShape = function () {
      // 配置和实例应该分开，现在是一样的
      this.shapes = buildRectShape(this, this)

      // 添加到图形图层
      this.rd.shapeLayer.appendChild(this.shapes[0])

      this.bindEditText(this.shapes[1])

      this.updateByStyle()
      this.bindShapeEventListener()
    }

    /**
     * 根据属性更新基本样式
     */
    this.updateByStyle = function () {
      // 统一的更新思路
      updateRectShapeByStyle(this, this.shapes)

      this.rd.drawOrPush(this.shapes[0])
    }

    // 更新图形
    this.updateShape = function () {
      this.updateByStyle()
    }

    /**
     * 把基本属性转换为JSON,复写后追加了descText
     */
    this.getBaseJSON = function () {
      var json = {
        'id': this.id,
        'code': this.code,
        'type': this.type,
        'name': this.name,
        'desc': this.desc,
        'x': this.x,
        'y': this.y,
        'width': this.width,
        'height': this.height,
        'text': this.text,
        'descText': this.descText,
        'bindField': this.bindField,
        'feed': this.feed,
        'autoScaleFill': this.autoScaleFill,
        'modelType': this.modelType,
        'baseModelType': this.baseModelType,
        'attrs': this.attrs,
        'controlType': this.controlType,
        'align': this.align,
        'valign': this.valign,
        'modelType': this.modelType,
        'together': this.together
      }
      return json
    }
  }
  for (var i in this.Activity.prototype) {
    this.RuleAction.prototype[i] = this.Activity.prototype[i]
  }

  function setAttr () {
    console.log('设置值')
  }

  // 通过JSON初始化
  this.RuleAction.initByJson = function (json) {
    return Activity.initByJson(json)
  }
}.call(window))