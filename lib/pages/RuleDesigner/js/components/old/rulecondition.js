/* eslint-disable */
/**
 * 条件标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import { buildDiamondShape, updateDiamondShapeByStyle } from './canvas/shape'

(function () {
  this.RuleCondition = function (rd, props) {
    Activity.call(this, rd, props)
    this.modelType = 'RuleCondition'
    this.baseModelType = 'Activity'
    this.descText = props.descText ? props.descText : "条件分支"
    this.together = props.together

    /**
     * 设置绑定edittext
     */
    this.bindEditText = function (shape) {

    }

    // 普通节点的创建图形方法
    this.buildShape = function () {
      this.shapes = buildDiamondShape(this, this)

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
      updateDiamondShapeByStyle(this, this.shapes)

      this.rd.drawOrPush(this.shapes[0])
    }

    //更新图形
    this.updateShape = function () {
      this.updateByStyle()
    }


    /**
     * 把基本属性转换为JSON,复写后追加了descText
     */
    this.getBaseJSON = function () {
      var json = {
        'id': this.id,
        'x': this.x,
        'y': this.y,
        'width': this.width,
        'height': this.height,
        'text': this.text,
        'descText': this.descText,
        'modelType': this.modelType,
        'baseModelType': this.baseModelType,
        'attrs': this.attrs,
        'controlType': this.controlType,
        'modelType': this.modelType,
        'code': this.code,
        'together': this.together
      }
      return json
    }
  }
  for (var i in this.Activity.prototype) {
    this.RuleCondition.prototype[i] = this.Activity.prototype[i]
  }

  //通过JSON初始化
  this.RuleCondition.initByJson = function (json) {
    return Activity.initByJson(json)
  }
}.call(window))