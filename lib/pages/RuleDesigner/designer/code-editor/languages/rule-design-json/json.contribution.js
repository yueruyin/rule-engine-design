/* ---------------------------------------------------------------------------------------------
 *  专用于规则引擎的json语言，异步加载
 *-------------------------------------------------------------------------------------------- */
'use strict'
import { registerLanguage } from 'monaco-editor/esm/vs/basic-languages/_.contribution.js'

registerLanguage({
  id: 'ruleDesignJSON',
  extensions: [],
  aliases: ['Rule Design JSON'],
  loader: function () {
    return import('./json.js')
  }
})