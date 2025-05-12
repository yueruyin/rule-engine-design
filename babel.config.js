const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

const plugins = ['@babel/plugin-proposal-optional-chaining']
if (IS_PROD) {
  plugins.push(['transform-remove-console', {
    exclude: ['error', 'warn']
  }])
}

plugins.push(['import', {
  'libraryName': 'ant-design-vue',
  'libraryDirectory': 'es',
  'style': true
}])

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset', ['@babel/preset-env', {
    'useBuiltIns': 'entry',
    'corejs': 3
  }]],
  plugins
}
