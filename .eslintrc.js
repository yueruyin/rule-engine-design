module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/strongly-recommended', '@vue/standard'],
  rules: {
    'no-console': 'off',
    'generator-star-spacing': 'off',
    'no-mixed-operators': 0,
    'vue/max-attributes-per-line': [
      0,
      {
        singleline: 10,
        multiline: {
          max: 1,
          allowFirstLine: false
        }
      }
    ],
    'no-new-wrappers': 0,
    'no-template-curly-in-string': 0,
    'prefer-regex-literals': 0,
    'no-new': 0,
    'no-eval': 0,
    'no-useless-escape': 0,
    'vue/multi-word-component-names': 0,
    'vue/first-attribute-linebreak': 0,
    'vue/require-prop-type-constructor': 0,
    'vue/attribute-hyphenation': 0,
    'vue/html-self-closing': 0,
    'vue/component-name-in-template-casing': 0,
    'vue/html-closing-bracket-spacing': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/no-unused-components': 0,
    'vue/multiline-html-element-content-newline': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/no-parsing-error': 0,
    'no-tabs': 0,
    'array-callback-return': 0,
    'space-before-function-paren': 0,
    'no-prototype-builtins': 0,
    'no-self-assign': 0,
    'one-var': 0,
    'no-unused-vars': 0,
    'no-useless-return': 0,
    'no-debugger': 0,
    'vue/no-unused-vars': 0,
    camelcase: 0,
    'eol-last': 0,
    'no-array-constructor': 0,
    'no-sequences': 0,
    eqeqeq: 'off',
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    semi: [
      2,
      'never',
      {
        beforeStatementContinuationChars: 'never'
      }
    ],
    'no-delete-var': 2,
    'prefer-const': [
      0,
      {
        ignoreReadBeforeAssign: false
      }
    ],
    'template-curly-spacing': 'off',
    indent: 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
