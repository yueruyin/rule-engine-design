// ========================================================
// 附加在其他Model上的Model，比如LineBar对于RuleActivity，LineBarPoint对于LineBar
// 用来把两个Model关联起来
// @author wangyb
// @createTime 2023-05-08 16:14:21
// ========================================================

import { defineUnenumerableProperty, extendsClass } from '../modules/common'
import SvgModel from './SvgModel'

const AttachModel = function (mainModel) {
  // 继承父类的实例属性
  SvgModel.call(this)

  this.bindMainModel(mainModel)
}

extendsClass(AttachModel, SvgModel)

AttachModel.prototype.bindMainModel = function (model) {
  // 解绑原model
  this.unbindMainModel()

  if (model) {
    // 绑定当前model
    defineUnenumerableProperty(this, '__main_model__', model)
  }
}

AttachModel.prototype.unbindMainModel = function () {
  if (!this.__main_model__) {
    return
  }
  delete this.__main_model__
}

AttachModel.prototype.getMainModel = function () {
  return this.__main_model__
}

AttachModel.findAttachModel = function () {

}

export default AttachModel
