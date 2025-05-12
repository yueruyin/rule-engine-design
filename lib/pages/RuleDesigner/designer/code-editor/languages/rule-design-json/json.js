/* ---------------------------------------------------------------------------------------------
 *  专用于规则引擎的JSON表达式语言，异步加载
 *-------------------------------------------------------------------------------------------- */
'use strict'
export var conf = {
  brackets: [
    ['{', '}'],
    ['[', ']']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"' }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"' }
  ]
}
export var language = {
  defaultToken: '',
  tokenPostfix: '',
  ignoreCase: true,
  brackets: [
    { open: '[', close: ']', token: 'delimiter.array.json' },
    { open: '{', close: '}', token: 'delimiter.bracket.json' }
  ],
  keywords: ['null', 'true', 'false'],
  tokenizer: {
    root: [
      { include: '@whitespace' },
      // 参数省略符号
      [/"?[$][a-zA-Z0-9_\u4E00-\u9FBB]+"?/, 'predefined.sql'],
      [/"[^"]*"(?=\s*:)/, { token: 'string.key.json', log: 'find key [$0]' }],
      { include: '@strings' },
      { include: '@numbers' },
      [/[:,]/, 'delimiter'],
      [/[\w@#$]+/, {
        cases: {
          '@keywords': 'keyword.json',
          '@default': 'identifier.json'
        }
      }]
    ],
    whitespace: [
      [/\s+/, 'white']
    ],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'number.json'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number.json']
    ],
    strings: [
      [/"/, { token: 'string', next: '@string' }]
    ],
    string: [
      [/[^"]+/, 'string'],
      [/""/, 'string'],
      [/"/, { token: 'string', next: '@pop' }]
    ]
  }
}