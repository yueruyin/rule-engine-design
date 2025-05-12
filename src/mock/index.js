function isIE () {
  const bw = window.navigator.userAgent
  const compare = (s) => bw.indexOf(s) >= 0
  const ie11 = (() => 'ActiveXObject' in window)()
  return compare('MSIE') || ie11
}

function convert (item) {
  const list = item[0].split('#')
  list.length < 3 && list.splice(0, 0, true)
  if (list[0] !== 'false') {
    return {
      method: list[1],
      url: list[2],
      fn: item[1]
    }
  }
}

if (process.env.VUE_APP_ENABLE_MOCK === 'true') {
  if (isIE()) {
    console.error('MockJS不支持IE')
  }
  // 使用同步加载依赖
  const Mock = require('mockjs2')

  Mock.setup({
    timeout: '200-800'
  })

  const files = require.context('./modules', true, /\.js$/)
  files.keys().forEach((key) => {
    Object.entries(files(key).default).forEach((item) => {
      const args = convert(item)
      args && Mock.mock(new RegExp(args.url), args.method, args.fn)
    })
  })
  console.info('[antd-pro] MockJS加载成功')
}
