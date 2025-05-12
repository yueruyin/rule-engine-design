const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  transpileDependencies: ['@zh/common-utils', '@zh/components-ant'],
  publicPath: process.env.BASE_URL,
  devServer: {
    port: 10021
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // 全局边框圆角
          'border-radius-base': '2px'
        },
        javascriptEnabled: true
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@zh/feiliu-ant': `${process.cwd()}`
      }
    },
    plugins: [
      new MonacoEditorWebpackPlugin()
    ]
  }
}
