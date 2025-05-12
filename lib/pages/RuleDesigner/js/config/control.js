// ========================================================
// 扫描controls下面的组件配置
// @author wangyb
// @createTime 2023-05-17 14:01:51
// ========================================================
const ctx = require.context('./controls/', true, /\.js$/)
const controls = []
for (const key of ctx.keys()) {
  controls.push(ctx(key).default)
}
// 排序
controls.sort((a, b) => {
  return a.orderno - b.orderno
})
export default controls
