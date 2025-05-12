/* ---------------------------------------------------------------------------------------------
 *  专用于规则引擎的sql语言，异步加载
 *-------------------------------------------------------------------------------------------- */
'use strict'
import { registerLanguage } from 'monaco-editor/esm/vs/basic-languages/_.contribution.js'

registerLanguage({
  id: 'ruleDesignSql',
  extensions: ['.sql'],
  aliases: ['Rule Design SQL'],
  loader: function () {
    return import('./sql.js')
  }
})
