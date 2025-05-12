// ========================================================
// 提供通用的debugger能力
// @author wangyb
// @createTime 2023-06-28 09:12:53
// ========================================================

import monaco from '../../../designer/code-editor/editor'
import { getPreNodeVariables, getRuleArguments } from '../../..//designer/variable-tree/common'
import { uniqWith, isEqual } from 'lodash'

let __model
let __dialog
let __editor

const suggestionsProvider = function () {
  if (!__model) {
    return []
  }
  // 查询所有变量
  let variables = getPreNodeVariables(__model)
  variables = variables.concat(getRuleArguments(__model.getCanvas()))
  variables = uniqWith(variables, isEqual)

  // 转为提示信息
  let suggestions = []
  this.findNodesWith(this.treeData, item => !!item.isLeaf)
    .forEach(item => {
      suggestions.push({
        label: item.value || item.label,
        insertText: item.value || item.label
      })
      if (item.hit) {
        suggestions.push({
          label: item.hit,
          insertText: item.hit
        })
      }
    })
  // 获取所有节点
  return suggestions
}

const onConditionChange = function () {
  let value = this.getModel()?.getValue()
  __model?.setOption('debuggerCondition', value)
}

const initDialog = function () {
  __dialog = document.createElement('div')
  __dialog.className = 'rule-design-contextmenu rule-design-contextmenu--dark'
  __dialog.style.padding = '0'
  __dialog.style.width = '300px'
  let headerEl = document.createElement('div')
  headerEl.className = 'rule-design-contextmenu-header p-10'
  headerEl.innerHTML = '编辑断点条件'
  __dialog.appendChild(headerEl)
  let contentEl = document.createElement('div')
  contentEl.className = 'p-10'
  __dialog.appendChild(contentEl)
  let editorEl = document.createElement('div')
  editorEl.style.height = '100px'
  editorEl.style.border = '1px solid #afafaf'
  contentEl.appendChild(editorEl)
  window.document.body.appendChild(__dialog)

  // 初始化对象
  let editor = monaco.editor.create(editorEl, {
    // 高优先级的设置
    value: __model.getOption('debuggerCondition') || '',
    language: 'ruleDesignExpression',
    // 同一个窗口，不同皮肤会互相影响，所以只能用一种皮肤
    theme: 'dark',
    minimap: { enabled: false },
    suggestionsProviders: [suggestionsProvider],
    lineNumbers: 'off',
    lineDecorationsWidth: 5
  })
  editor.onDidChangeModelContent(onConditionChange.bind(editor))
  __editor = editor
}

const destroyDialog = function () {
  if (!__dialog) {
    return
  }
  if (__editor) {
    __editor.dispose()
    __editor = null
  }
  __dialog.remove()
  __dialog = null
  window.document.body.removeEventListener('click', onDialogOuterClick)
  window.editing = false
}

const openDialog = function (p) {
  if (!__dialog) {
    initDialog()
  }
  __dialog.style.left = p.x + 'px'
  __dialog.style.top = p.y + 'px'
  window.document.body.addEventListener('click', onDialogOuterClick)
  // 进入全局编辑状态，避免与设计器快捷键冲突
  window.editing = true
}

const onDialogOuterClick = function (e) {
  let target = e.target
  if (!__dialog.contains(target)) {
    destroyDialog()
  }
}

export const destroyDebuggerConditionDialog = destroyDialog

export function openDebuggerConditionDialog (model, position) {
  // 记录当前模块
  __model = model
  if (!__model) {
    destroyDialog()
    return
  }
  openDialog(position)
}