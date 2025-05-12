window.BASE_URL = '/'

// # 规则引擎接口
window.VUE_APP_API = 'http://127.0.0.1:8080'

// 规则引擎全局设置
window.$rule = {
  // 禁止修改规则编码
  forbidEditRuleCode: false
}
// 版本已经应用名称
window.APP_VERSION = '2.1.2'
window.APP_NAME = '中天规则引擎'

document.title = window.APP_NAME + ' - V' + window.APP_VERSION
