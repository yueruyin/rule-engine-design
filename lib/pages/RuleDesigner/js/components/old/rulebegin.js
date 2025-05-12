/* eslint-disable */
/**
 * 标签，继承自Activity一个自然的文本标签，用来在界面上展示静态的内容或动态的内容，标签包含了对其，字体大小，格式化，换行等等属性，用来支持不同的情况
 */
import RDSetting from '../ruledesigner_setting.js'
(function () {
  this.RuleBegin = function (rd, props) {
    Activity.call(this, rd, props)
    //绑定字段，用来动态替换值，如果为空时，则为普通标签，否则为绑定的表达式，缺省空字符串
    this.bindField = props.bindField ? props.bindField : ""
    //标签文字横向对齐，left right center,默认left
    this.align = props.align ? props.align : "left"
    //标签文字纵向对齐，top middle bottom,默认middle
    this.valign = props.valign ? props.valign : "middle"
    //换行，1不换行，2换行，缺省1
    this.feed = props.feed ? props.feed : 1
    //缩小字体填充,1不开启，2开启，缺省1
    this.autoScaleFill = props.autoScaleFill ? props.autoScaleFill : 1
    this.modelType = 'RuleBegin'
    this.baseModelType = 'Activity'
    this.code = props.code
    this.type = props.type
    this.desc = props.desc
    this.together = props.together

    /**
     * 设置绑定edittext
     */
    this.bindEditText = function (shape) {

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


      //处理填充
      this.updateFillRect()


      //处理文字以及文字的信息等等
      if (this.text != null) {
        //根据样式的设置，更新文本的样式
        this.updateTextStyle()
      }

      this.rd.drawOrPush(shape)
    }


    //根据样式的设置，更新文本的样式
    this.updateTextStyle = function () {
      let fontInfo = null
      eval("fontInfo = " + this.font + ";")
      let fInfo = fontInfo.default
      if (fontInfo.selected && this.selected) {
        fInfo = fontInfo.selected
      }


      //处理文字以及文字的信息等等
      if (this.text != this.oldText || JSON.stringify(fInfo) != this.oldFontInfo || this.width != this.oldWidth
        || this.height != this.oldHeight || this.selected != this.oldSelected || this.align != this.oldAlign || this.valign != this.oldValign
        || this.feed != this.oldFeed || this.autoScaleFill != this.oldAutoScaleFill || this.forceModify) {

        this.oldText = this.text
        this.oldFontInfo = JSON.stringify(fInfo)
        this.oldWidth = this.width
        this.oldHeight = this.height
        this.oldSelected = this.selected
        this.oldFeed = this.feed
        this.oldAlign = this.align
        this.oldValign = this.valign
        this.oldAutoScaleFill = this.autoScaleFill
        this.forceModify = false

        //清空文本区域的HTML
        this.shapes[1].innerHTML = ""

        //循环进行分段输出
        let textContainer = createSVGElement("svg", this, {})
        this.shapes[1].appendChild(textContainer)

        //是否全部输出完毕标志
        let loop = true
        let fontSize = fInfo.size
        //如果有金额大小写转换选项，则执行大小写转换

        let cText = this.text
        let contentWidth = this.width - 4
        while (loop) {
          /*循环拆分结果，分别对空格，非空格按照是否换行，缩小等进行处理*/
          let spaceWidth = this.rd.getSpaceWidth(fInfo.family, fontSize, "normal")
          //记录使用过的宽度和高度
          let usedWidth = 0
          let usedHeight = 0

          //行容器
          let textRowContainer = createSVGElement("svg", this, { x: 0, y: 0 })
          textContainer.appendChild(textRowContainer)
          //插入占位控件
          textRowContainer.appendChild(createSVGElement('text', this, {
            x: 0,
            y: 0,
            text: '.',
            fontSize: 0.01,
            fontFamily: fInfo.family,
            fill: fInfo.color,
            align: 'center'
          }))

          //是否超出输出长度标志
          let isOutSize = false
          if (fontSize > this.height) {
            if (this.autoScaleFill == 2) {
              textContainer.innerHTML = ""
              fontSize = fontSize - 0.5
              continue
            }
          }
          for (let ti = 0; ti < cText.length; ti++) {
            let te = cText[ti]
            //如果是空白分组
            if (te.charAt(0) == ' ') {
              usedWidth += spaceWidth
              if (ti == cText.length - 1) {
                //插入占位控件
                textRowContainer.appendChild(createSVGElement('text', this, {
                  x: usedWidth,
                  y: 0,
                  text: '.',
                  fontSize: 0.01,
                  fontFamily: fInfo.family,
                  fill: fInfo.color,
                  align: 'center'
                }))
              }
            }
            //如果是非空白分组
            else {
              //创建新的文本元素
              let tShape = createSVGElement('text', this, {
                x: usedWidth,
                y: 0,
                text: te,
                fontSize: fontSize,
                fontFamily: fInfo.family,
                fill: fInfo.color,
                align: 'center',
                mid: this.id
              })
              tShape.style.dominantBaseline = "hanging"
              tShape.style.userSelect = "none"
              tShape.style.pointerEvents = "none"
              textRowContainer.appendChild(tShape)
              let fontShapeRect = tShape.getBoundingClientRect()
              let fontWidth = fontShapeRect.width
              let fontHeight = parseFloat(fontSize)
              //如果不自动换行也不缩小字体，则超过的话，就省略显示
              if (this.feed == 1) {
                //如果具备缩小字体填充，并且usedWidth超出了单行大小,则跳出循环，重新生成
                if (this.autoScaleFill == 2 && usedWidth + fontWidth > contentWidth) {
                  isOutSize = true
                  break
                }
                usedWidth += fontWidth
              }
              //处理换行
              else if (this.feed == 2) {
                //如果插入本字符后的大小，大于了容器的大小，则需要换行
                if (usedWidth + fontWidth > contentWidth) {
                  usedWidth = 0
                  tShape.setAttributeNS(null, "x", usedWidth)
                  usedHeight += fontHeight
                  textRowContainer.removeChild(tShape)
                  //换行的情况下，如果行高度超出，则不输出
                  if (usedHeight + fontHeight > this.height) {
                    //如果具备缩小字体填充，则重新生成
                    if (this.autoScaleFill == 2) {
                      isOutSize = true
                    }
                    //插入占位控件
                    textRowContainer.appendChild(createSVGElement('text', this, {
                      x: usedWidth,
                      y: 0,
                      text: '.',
                      fontSize: 0.01,
                      fontFamily: fInfo.family,
                      fill: fInfo.color,
                      align: 'center'
                    }))
                    break
                  }
                  textRowContainer = createSVGElement("svg", this, { x: 0, y: usedHeight })
                  textContainer.appendChild(textRowContainer)
                  textRowContainer.appendChild(tShape)
                }
                usedWidth += fontWidth
              }

            }
          }
          //如果没有超出，则输出完毕
          if (!isOutSize) {
            loop = false
          }
          //如果超出，清空生成的字段，缩小字体重新输出
          else {
            textContainer.innerHTML = ""
            fontSize = fontSize - 0.5
          }
        }
        // 计算文字位置
        let containerRect = textContainer.getBoundingClientRect()
        let containerWidth = containerRect.width
        let containerHeight = containerRect.height - 4
        //如果不换行，则直接对整理进行坐标对齐
        let x, y
        if (this.align == "left") {
          x = 2
        } else if (this.align == "center") {
          x = this.width / 2 - containerWidth / 2 + 1
        } else if (this.align == "right") {
          x = this.width - containerWidth - 2
        }
        if (this.valign == "top") {
          y = 2
        } else if (this.valign == "middle") {
          y = (this.height - containerHeight) / 2 + 1
        } else if (this.valign == "bottom") {
          y = this.height - containerHeight - 2
        }
        textContainer.setAttributeNS(null, 'x', x)
        textContainer.setAttributeNS(null, 'y', y)
        textContainer.setAttributeNS(null, 'width', containerWidth + this.width)
        //如果换行，则对每一子行进行对齐
        if (this.feed == 2) {
          //对内部容器进行排列对齐
          for (let tci = 0; tci < textContainer.children.length; tci++) {
            let rowContainer = textContainer.children[tci]
            let rRect = rowContainer.getBoundingClientRect()
            if (this.align == "left") {
            } else if (this.align == "center") {
              rowContainer.setAttributeNS(null, "x", (containerWidth - rRect.width) / 2)
            } else if (this.align == "right") {
              rowContainer.setAttributeNS(null, "x", containerWidth - rRect.width)
            }
          }
        }
      }
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
        'code': this.code,
        'type': this.type,
        'desc': this.desc,
        'x': this.x,
        'y': this.y,
        'width': this.width,
        'height': this.height,
        'text': this.text,
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
    this.RuleBegin.prototype[i] = this.Activity.prototype[i]
  }

  //通过JSON初始化
  this.RuleBegin.initByJson = function (json) {
    return Activity.initByJson(json)
  }
}.call(window))