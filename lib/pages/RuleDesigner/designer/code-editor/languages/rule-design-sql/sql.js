/* ---------------------------------------------------------------------------------------------
 *  专用于规则引擎的sql语言，异步加载
 *-------------------------------------------------------------------------------------------- */
// 继承一个sql配置
import * as baseSqlConfig from 'monaco-editor/esm/vs/basic-languages/sql/sql'
import { cloneDeep } from 'lodash'

export var conf = cloneDeep(baseSqlConfig.conf)

export var language = cloneDeep(baseSqlConfig.language)

// 增加一个对变量的高亮设置，规则一旦匹配将不会继续往后匹配
language.tokenizer.root = [
  { include: '@comments' },
  { include: '@whitespace' },
  // 与预处理有冲突，替换预处理字段
  [/[$][a-zA-Z0-9_\u4E00-\u9FBB]+/, 'predefined'],
  // 与预处理有冲突
  // { include: '@pseudoColumns' },
  { include: '@numbers' },
  { include: '@strings' },
  { include: '@complexIdentifiers' },
  { include: '@scopes' },
  [/[;,.]/, 'delimiter'],
  [/[()]/, '@brackets'],
  [/[\w@#$]+/, {
    cases: {
      '@keywords': 'keyword',
      '@operators': 'operator',
      '@builtinVariables': 'predefined',
      '@builtinFunctions': 'predefined',
      '@default': 'identifier'
    }
  }],
  [/[<>=!%&+\-*/|~^]/, 'operator']
]
