/* ---------------------------------------------------------------------------------------------
 *  专用于规则引擎的计算表达式语言，异步加载
 *-------------------------------------------------------------------------------------------- */
'use strict'
import { functionNames } from '../../../../../../assets/config/apiFunctions'

export var conf = {
  comments: {
    lineComment: '--',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '\'', close: '\'' }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '\'', close: '\'' }
  ]
}
export var language = {
  defaultToken: '',
  tokenPostfix: '.sql',
  ignoreCase: true,
  brackets: [
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' }
  ],
  keywords: [
    // 关键字
    'IF',
    '...'
  ],
  operators: [
    // Logical
    'ALL', 'AND', 'ANY', 'BETWEEN', 'EXISTS', 'IN', 'LIKE', 'NOT', 'OR', 'SOME',
    // Set
    'EXCEPT', 'INTERSECT', 'UNION',
    // Predicates
    'CONTAINS', 'FREETEXT', 'IS', 'NULL'
  ],
  builtinFunctions: functionNames,
  builtinVariables: [
    // Configuration
    '@@DATEFIRST'
  ],
  tokenizer: {
    root: [
      { include: '@comments' },
      { include: '@whitespace' },
      // 参数省略符号
      [/[$][a-zA-Z0-9_\u4E00-\u9FBB]+/, 'predefined'],
      { include: '@numbers' },
      { include: '@strings' },
      { include: '@scopes' },
      [/[.]{3,}/, 'operator'],
      [/[;,.]/, 'delimiter'],
      [/[()]/, '@brackets'],
      [/[\w@#$]+/, {
        cases: {
          '@keywords': 'keyword',
          '@operators': 'operator',
          '@builtinVariables': 'predefined',
          '@builtinFunctions': 'keyword',
          '@default': 'identifier'
        }
      }],
      [/[<>=!%&+\-*/|~^]/, 'operator']
    ],
    whitespace: [
      [/\s+/, 'white']
    ],
    comments: [
      [/--+.*/, 'comment'],
      [/\/\*/, { token: 'comment.quote', next: '@comment' }]
    ],
    comment: [
      [/[^*/]+/, 'comment'],
      // Not supporting nested comments, as nested comments seem to not be standard?
      // i.e. http://stackoverflow.com/questions/728172/are-there-multiline-comment-delimiters-in-sql-that-are-vendor-agnostic
      // [/\/\*/, { token: 'comment.quote', next: '@push' }],    // nested comment not allowed :-(
      [/\*\//, { token: 'comment.quote', next: '@pop' }],
      [/./, 'comment']
    ],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'number'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number']
    ],
    strings: [
      [/N'/, { token: 'string', next: '@string' }],
      [/'/, { token: 'string', next: '@string' }]
    ],
    string: [
      [/[^']+/, 'string'],
      [/''/, 'string'],
      [/'/, { token: 'string', next: '@pop' }]
    ],
    quotedIdentifier: [
      [/[^"]+/, 'identifier'],
      [/""/, 'identifier'],
      [/"/, { token: 'identifier.quote', next: '@pop' }]
    ],
    scopes: [
      [/BEGIN\s+(DISTRIBUTED\s+)?TRAN(SACTION)?\b/i, 'keyword'],
      [/BEGIN\s+TRY\b/i, { token: 'keyword.try' }],
      [/END\s+TRY\b/i, { token: 'keyword.try' }],
      [/BEGIN\s+CATCH\b/i, { token: 'keyword.catch' }],
      [/END\s+CATCH\b/i, { token: 'keyword.catch' }],
      [/(BEGIN|CASE)\b/i, { token: 'keyword.block' }],
      [/END\b/i, { token: 'keyword.block' }],
      [/WHEN\b/i, { token: 'keyword.choice' }],
      [/THEN\b/i, { token: 'keyword.choice' }]
    ]
  }
}
