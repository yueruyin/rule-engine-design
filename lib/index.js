// ========================================================
// 把设计器的安装的依赖整合起来，统一加载依赖和样式
// @author wangyb
// @createTime 2023-05-24 13:59:48
// ========================================================

// 加载样式
import './assets/css/index.less'

const install = function (Vue) {
  if (install.installed) {
    return
  }
}

export default {
  install
}
