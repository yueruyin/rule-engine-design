/* ---------------------------------------------------------------------------------------------
 *  专用于规则引擎的表达式语言，异步加载
 *-------------------------------------------------------------------------------------------- */
'use strict'
import { registerLanguage } from 'monaco-editor/esm/vs/basic-languages/_.contribution.js'

registerLanguage({
  id: 'ruleDesignExpression',
  extensions: [],
  aliases: ['Rule Design Expression'],
  loader: function () {
    return import('./expression.js')
  }
})
