/* eslint-disable */
import imageMap from './imageMap.js'
const cloneDeep = require('clone')
export default {
  // 规则设计器的扩展类，定义了一些可以自行调整的函数变量等

  // 全局变量，通过改变全局变量的值实现颜色替换
  // 是否允许删除
  DEFAULT_ACTIVITY_CANDEL: true,

  // 边框
  // DEFAULT_ACTIVITY_BORDER: '{"default":{"left":{"width":"0","color":"transparent","dash":""},"right":{"width":"0","color":"transparent","dash":""},"top":{"width":"0","color":"transparent","dash":""},"bottom":{"width":"0","color":"transparent","dash":""}},"selected":{"left":{"width":"1","color":"black","dash":""},"right":{"width":"1","color":"black","dash":""},"top":{"width":"1","color":"black","dash":""},"bottom":{"width":"1","color":"black","dash":""}}}',

  DEFAULT_ACTIVITY_BORDER: '{"default":{"left":{"width":"0","color":"#3b3a3a","dash":""},"right":{"width":"0","color":"#3b3a3a","dash":""},"top":{"width":"0","color":"#3b3a3a","dash":""},"bottom":{"width":"0","color":"#3b3a3a","dash":""}},"selected":{"left":{"width":"1","color":"#5a9aef","dash":""},"right":{"width":"1","color":"#5a9aef","dash":""},"top":{"width":"1","color":"#5a9aef","dash":""},"bottom":{"width":"1","color":"#5a9aef","dash":""}}}',

  // 字体
  DEFAULT_ACTIVITY_FONT: '{"default":{"family":"STSong-Light","color":"#000000","size":"16"},"selected":{"family":"STSong-Light","color":"#000000","size":"16"}}',

  // 填充
  DEFAULT_ACTIVITY_FILL: '{"default":{"color":"#FFFFFF"},"selected":{"color":"#01FBF2"}}',

  //图片路径
  DEFAULT_IMAGE_SRC: '/default-image.png',

  //用于保存或打开时的临时样式，用来作数据压缩
  SAVE_TEMP_STYLE: {},

  //用于保存或打开时的临时样式的ID
  SAVE_TEMP_INDEX: 1,

  //用于记录不同字体空格所占大小
  SPACE_WIDTH_MAP: {},

  // 开启辅助图形,开启后才有多选效果
  SHOW_AUX_RECT: true,

  // 开启辅助图形,改变控件大小效果
  AUX_RECT_CHANGESIZE: false,

  //当同时选中的图形达到某个数字时，才显示辅助控件
  AUX_RECT_SELCTED_CONTROL: 2,


  // 全局属性，删除或调用删除API后的钩子函数，这里只填写函数名，调用时会eval，自动传入必要的信息
  GLOBAL_REMOVE_BEFORE_LISTENER: '',
  GLOBAL_REMOVE_AFTER_LISTENER: '',

  // 全局属性，创建或调用API之前的钩子函数，调用前可以通过此函数进行校验，返回true则允许创建，返回false则不允许，调用时会eval，自动传入必要的信息
  GLOBAL_CREATE_BEFORE_VALIDATOR: 'createControlValidator',
  // 全局属性，建立或修改线段连接关系之前的钩子函数，调用前可以通过此函数进行校验，返回true则允许创建，返回false则不允许，调用时会eval，自动传入必要的信息
  GLOBAL_LINE_CHANGE_BEFORE_VALIDATOR: 'changeLineBeforeValidator',

  // 全局属性，排序控件的方法
  GLOBAL_SORT_LISTENER: '',

  //全局属性，在画布上隐藏按钮所需要的循环数量
  GLOBAL_HIDDEN_BTN_NUMBER: 30,
  // 全局属性，是否显示删除按钮图标，缺省true
  GLOBAL_REMOVE_BTN: true,
  // 全局属性，是否显示快捷创建按钮图标，缺省true
  GLOBAL_QUICK_CREATE_BTN: true,

  // 是否打开辅助线功能
  GLOBAL_HELP_LINE_ENABLE: true,
  // 是否打开辅助对齐线
  GLOBAL_HELP_LINE_ALIGN_ENABLE: true,
  // 缺省辅助线颜色
  GLOBAL_HELP_LINE_COLOR: 'grey',
  // 缺省辅助对齐线颜色
  GLOBAL_HELP_LINE_ALIGN_COLOR: 'red',
  // 缺省辅助线宽度
  GLOBAL_HELP_LINE_WEIGHT: 10,

  // 键盘对齐,开启后允许通过上下左右来改变控件位置,每次改变位置的大小为GLOBAL_HELP_LINE_WEIGHT
  GLOBAL_KEYBOARD_ALIGN_ENABLE: true,

  tempMouseEventObj: null,

  ICOS: imageMap,


  /**
   * 从压缩后的JSON恢复
   * @param modelJSON 
   */
  restoreFromMininJSON: function (data) {

    let modelJSON = null
    if (typeof (data) == 'string') {
      modelJSON = JSON.parse(data)
    } else {
      modelJSON = data
    }
    let tempStyleJSON = modelJSON["SAVE_TEMP_STYLE"]
    let ats = ["font", "border", "fill"]
    //遍历modelJSON，从tempStyleJSON恢复
    for (let i in modelJSON.rootModels) {
      let md = modelJSON.rootModels[i]
      for (let a = 0; a < ats.length; a++) {
        let an = ats[a]
        if (typeof (md[an]) == 'string') {
          let refId = md[an].split(":")[1]
          let data = tempStyleJSON[refId]
          if (data) {
            md[an] = data
          }
        }
      }
      for (let a = 0; a < ats.length; a++) {
        let an = ats[a]
        if (typeof (md.attrs[an]) == 'string') {
          let refId = md.attrs[an].split(":")[1]
          let data = tempStyleJSON[refId]
          if (data) {
            md.attrs[an] = data
          }
        }
      }
    }
    // modelJSON["SAVE_TEMP_STYLE"] = "";
    return modelJSON
  },

  /**
   * 将模型转换为JSON对象，会对JSON进行压缩
   * @param  model  模型
   */
  toMininJSON: function (model) {
    //根据Model的类别，对其进行分别处理
    let modelJSON = JSON.stringify(model.toJSON())

    let cloneModel = null
    eval("cloneModel = " + modelJSON + ";")
    //画布对象，会处理整个画布下的全部属性
    let newJSON = null
    if (cloneModel.modelType == 'RuleCanvas') {
      newJSON = this.mininCanvasJSON(cloneModel, true)
    }
    //普通基于活动的对象，会处理自身
    else if (cloneModel.baseModelType == 'Activity' || cloneModel.baseModelType == 'Line') {
      newJSON = this.mininActivityJSON(cloneModel, true)
    }

    return newJSON

  },
  //压缩整个画布的属性并返回
  mininCanvasJSON: function (modelJSON, isRoot) {
    //如果为顶级元素调用，则清空临时变量
    if (isRoot) {
      this.SAVE_TEMP_STYLE = {}
      this.SAVE_TEMP_INDEX = 1
    }
    let newRootModels = {}

    for (let i in modelJSON.rootModels) {
      let md = modelJSON.rootModels[i]
      //普通基于活动的对象，会处理自身
      if (md.baseModelType == 'Activity') {
        newRootModels[i] = this.mininActivityJSON(md, false)
      } else if (md.baseModelType == 'Line') {
        newRootModels[i] = this.mininActivityJSON(md, false)
      }
    }
    modelJSON.rootModels = newRootModels
    //如果为顶级元素调用，设置临时变量到顶级元素的属性中然后，清空临时变量
    if (isRoot) {
      modelJSON["SAVE_TEMP_STYLE"] = this.SAVE_TEMP_STYLE
      this.SAVE_TEMP_STYLE = {}
      this.SAVE_TEMP_INDEX = 1
    }
    return modelJSON
  },

  //压缩普通活动的属性并返回
  mininActivityJSON: function (modelJSON, isRoot) {

    //如果为顶级元素调用，则清空临时变量
    if (isRoot) {
      this.SAVE_TEMP_STYLE = {}
      this.SAVE_TEMP_INDEX = 1
    }
    let attrFont = modelJSON.attrs["font"]
    let font = modelJSON["font"]
    //处理字体属性
    if (attrFont) {
      //判断是否已存在字体定义，如果不存在，则新增，如果存在则引用
      let find = false
      let findedDataIdfy = null
      for (let i in this.SAVE_TEMP_STYLE) {
        if (attrFont == this.SAVE_TEMP_STYLE[i]) {
          findedDataIdfy = i
          find = true
          break
        }
      }
      //如果没找到新增
      if (!find) {
        let newIdfy = this.SAVE_TEMP_INDEX
        this.SAVE_TEMP_INDEX++
        this.SAVE_TEMP_STYLE[newIdfy] = attrFont
        modelJSON.attrs["font"] = "ref:" + newIdfy
      }
      //找到了，修改本属性为引用
      else {
        modelJSON.attrs["font"] = "ref:" + findedDataIdfy
      }
    }
    if (font) {
      //判断是否已存在字体定义，如果不存在，则新增，如果存在则引用
      let find = false
      let findedDataIdfy = null
      for (let i in this.SAVE_TEMP_STYLE) {
        if (font == this.SAVE_TEMP_STYLE[i]) {
          findedDataIdfy = i
          find = true
          break
        }
      }
      //如果没找到新增
      if (!find) {
        let newIdfy = this.SAVE_TEMP_INDEX
        this.SAVE_TEMP_INDEX++
        this.SAVE_TEMP_STYLE[newIdfy] = font
        modelJSON["font"] = "ref:" + newIdfy
      }
      //找到了，修改本属性为引用
      else {
        modelJSON["font"] = "ref:" + findedDataIdfy
      }
    }


    //处理边框属性
    let attrBorder = modelJSON.attrs["border"]
    let border = modelJSON["border"]
    //处理边框属性
    if (attrBorder) {
      //判断是否已存在定义，如果不存在，则新增，如果存在则引用
      let find = false
      let findedDataIdfy = null
      for (let i in this.SAVE_TEMP_STYLE) {
        if (attrBorder == this.SAVE_TEMP_STYLE[i]) {
          findedDataIdfy = i
          find = true
          break
        }
      }
      //如果没找到新增
      if (!find) {
        let newIdfy = this.SAVE_TEMP_INDEX
        this.SAVE_TEMP_INDEX++
        this.SAVE_TEMP_STYLE[newIdfy] = attrBorder
        modelJSON.attrs["border"] = "ref:" + newIdfy
      }
      //找到了，修改本属性为引用
      else {
        modelJSON.attrs["border"] = "ref:" + findedDataIdfy
      }
    }
    if (border) {
      //判断是否已存在字体定义，如果不存在，则新增，如果存在则引用
      let find = false
      let findedDataIdfy = null
      for (let i in this.SAVE_TEMP_STYLE) {
        if (border == this.SAVE_TEMP_STYLE[i]) {
          findedDataIdfy = i
          find = true
          break
        }
      }
      //如果没找到新增
      if (!find) {
        let newIdfy = this.SAVE_TEMP_INDEX
        this.SAVE_TEMP_INDEX++
        this.SAVE_TEMP_STYLE[newIdfy] = border
        modelJSON["border"] = "ref:" + newIdfy
      }
      //找到了，修改本属性为引用
      else {
        modelJSON["border"] = "ref:" + findedDataIdfy
      }
    }
    //处理填充属性
    let attrFill = modelJSON.attrs["fill"]
    let fill = modelJSON["fill"]
    if (attrFill) {
      //判断是否已存在定义，如果不存在，则新增，如果存在则引用
      let find = false
      let findedDataIdfy = null
      for (let i in this.SAVE_TEMP_STYLE) {
        if (attrFill == this.SAVE_TEMP_STYLE[i]) {
          findedDataIdfy = i
          find = true
          break
        }
      }
      //如果没找到新增
      if (!find) {
        let newIdfy = this.SAVE_TEMP_INDEX
        this.SAVE_TEMP_INDEX++
        this.SAVE_TEMP_STYLE[newIdfy] = attrFill
        modelJSON.attrs["fill"] = "ref:" + newIdfy
      }
      //找到了，修改本属性为引用
      else {
        modelJSON.attrs["fill"] = "ref:" + findedDataIdfy
      }
    }
    if (fill) {
      //判断是否已存在字体定义，如果不存在，则新增，如果存在则引用
      let find = false
      let findedDataIdfy = null
      for (let i in this.SAVE_TEMP_STYLE) {
        if (fill == this.SAVE_TEMP_STYLE[i]) {
          findedDataIdfy = i
          find = true
          break
        }
      }
      //如果没找到新增
      if (!find) {
        let newIdfy = this.SAVE_TEMP_INDEX
        this.SAVE_TEMP_INDEX++
        this.SAVE_TEMP_STYLE[newIdfy] = fill
        modelJSON["fill"] = "ref:" + newIdfy
      }
      //找到了，修改本属性为引用
      else {
        modelJSON["fill"] = "ref:" + findedDataIdfy
      }
    }

    //如果为顶级元素调用，设置临时变量到顶级元素的属性中然后，清空临时变量
    if (isRoot) {
      modelJSON["SAVE_TEMP_STYLE"] = this.SAVE_TEMP_STYLE
      this.SAVE_TEMP_STYLE = {}
      this.SAVE_TEMP_INDEX = 1
    }

    return modelJSON
  },


  /**
     * 对数组按照长度进行拆分
     */
  subArrayGroup: function (arr, len) {
    return arr.reduce((newArr, cur, index) => {
      var currentArr = newArr[newArr.length - 1]
      if (index % len === 0) {
        newArr.push([cur])
      } else {
        currentArr.push(cur)
        newArr[newArr.length - 1] = currentArr
      }
      return newArr
    }, [])
  }
}
