// ========================================================
// 功能panel公共的方法
// @author wangyb
// @createTime 2023-05-25 09:21:37
// ========================================================

export default {
  inject: {
    designer: {},
    panelContainer: {}
  },
  props: {
    theme: { type: String, default: 'dark' }
  },
  computed: {
    canvas () {
      return this.designer && this.designer.$refs.draw && this.designer.$refs.draw.rdInfo
    }
  }
}
