// ========================================================
// 对monaco-editor进行封装
// @author wangyb
// @createTime 2023-06-28 15:47:31
// ========================================================
import * as monaco from 'monaco-editor'

import { isFunction } from 'lodash'

import { format as sqlFormat } from 'sql-formatter'
import { bindSuggestionsMiddleware, registerModelSuggestionsProvider, removeModelSuggestionsProvider } from './common/suggestion'

// 导入需要的语法
import './languages'
import { DEFAULT_OPTIONS, THEME_MAPPING } from './common/index'

// 绑定提示中间件
bindSuggestionsMiddleware(monaco, ['ruleDesignExpression', 'ruleDesignJSON', 'ruleDesignSql'])

const isSqlLanguage = function (lang) {
  return lang === 'sql' || lang === 'ruleDesignSql'
}

// 重写editor的create方法，增加一些默认的功能
const _createEidtor = monaco.editor.create

monaco.editor.create = function (el, { suggestionsProviders = [], events = {}, theme, ...options } = {}, overrideOptions) {
  let ins = _createEidtor(el, {
    ...DEFAULT_OPTIONS,
    ...options,
    theme: THEME_MAPPING[theme] || theme
  }, overrideOptions)
  // 给ins绑定一些方法
  if (isSqlLanguage(options.language)) {
    // 绑定格式化方法
    ins.addAction({
      // 原本sql不支持这个命令
      id: 'editor.action.formatDocument',
      label: 'Format Sql',
      precondition: null,
      contextMenuGroupId: 'navigation', // 右键展示位置
      keybindings: [
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KEY_F
      ],
      run: function () {
        let model = this.getModel()
        if (!model) {
          return
        }
        let value = model?.getValue()
        value = sqlFormat(this.getValue(), { language: 'mysql' })
        model.setValue(value)
      }.bind(ins)
    })
  }
  // 绑定事件
  for (let eventName in events) {
    if (isFunction(ins[eventName])) {
      ins[eventName](events[eventName])
    }
  }
  // 绑定提示功能
  suggestionsProviders.forEach(provider => {
    registerModelSuggestionsProvider(ins.getModel(), provider)
  })
  // 增加提示处理器
  ins.addSuggestionsProvider = function (provider) {
    registerModelSuggestionsProvider(ins.getModel(), provider)
  }
  // 删除提示处理器
  ins.removeSuggestionsProvider = function (provider) {
    removeModelSuggestionsProvider(ins.getModel(), provider)
  }
  // 调整dispose方法
  ins.dispose = (function (ins) {
    let _dispose = ins.dispose
    return function () {
      // 移除提示处理器
      ins.removeSuggestionsProvider()
      // 调用原来的销毁方法
      _dispose.call(ins)
    }
  })(ins)
  return ins
}

export default monaco