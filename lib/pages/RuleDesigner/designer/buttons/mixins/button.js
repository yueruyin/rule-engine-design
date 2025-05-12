// ========================================================
// 设计器功能按钮公共功能
// @author wangyb
// @createTime 2023-05-26 09:30:35
// ========================================================

export default {
  inject: {
    designer: {}
  },
  props: {
    size: { type: String },
    theme: { type: String, default: 'dark' },
    command: { type: String },
    label: { type: String },
    title: { type: String, default: undefined },
    color: { type: [String, Object] },
    baseClassName: { type: String, default: 'rule-design-btn' },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    canvas () {
      return this.designer && this.designer.$refs.draw && this.designer.$refs.draw.rdInfo
    },
    classNames () {
      const { baseClassName, size, theme, disabled } = this
      let names = [baseClassName]
      if (size) {
        names.push(baseClassName + '--' + size)
      }
      if (theme) {
        names.push(baseClassName + '--' + theme)
      }
      if (disabled) {
        names.push(baseClassName + '--disabled')
      }
      return names
    }
  },
  methods: {
    onClick () {
      this.$emit('command', this.command)
    }
  }
}