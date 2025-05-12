<script>
export default {
  name: 'RuleDesignTabs',
  provide() {
    return {
      panelContainer: this
    }
  },
  props: {
    value: { type: [String, Number], default: undefined },
    type: { type: String, default: 'card' },
    size: { type: String, default: 'small' },
    height: { type: [String, Number], default: null },
    tabDirection: { type: String, default: 'horizontal' },
    defaultActiveKey: { type: String, default: null }
  },
  data() {
    return {
      activeTab: this.defaultActiveKey
    }
  },
  computed: {
    currentTab: {
      get() {
        return this.value === undefined ? this.activeTab : this.value
      },
      set(newVal) {
        if (newVal === this.activeTab || newVal === this.value) {
          newVal = null
        }
        this.activeTab = newVal
        this.$emit('input', newVal)
        this.$emit('change', newVal)
      }
    }
  },
  render(h) {
    // 生成panel
    let panels = this.$slots.default || []
    panels = panels.map((vnode) => {
      let { id, title, icon } = this.getPanelOptions(vnode)
      if (!id) {
        return null
      }
      let iconHtml = null
      if (icon) {
        let iconStyle = { color: icon.color }
        iconHtml = (
          <a-icon
            class="rule-design-panel-tab-icon"
            type={icon.type}
            style={iconStyle}
          />
        )
      }
      return (
        <a-tab-pane key={id}>
          <span slot="tab">
            {iconHtml}
            {title}
          </span>
          {vnode}
        </a-tab-pane>
      )
    })
    return h(
      'a-tabs',
      {
        style: {
          height: isFinite(+this.height) ? this.height + 'px' : this.height
        },
        props: {
          ...this.$attrs,
          activeKey: this.currentTab,
          size: this.size,
          type: this.type
        },
        on: {
          tabClick: this.onTabClick
        },
        class: [
          'rule-design-panel-tabs',
          this.tabDirection
            ? 'rule-design-panel-tabs--' + this.tabDirection
            : ''
        ]
      },
      panels
    )
  },
  methods: {
    getPanelOptions(panel) {
      let options = panel.componentOptions.Ctor.extendOptions.panel
      return options || {}
    },
    onTabClick(newVal) {
      this.currentTab = newVal
      this.$emit('tabClick', newVal)
    }
  }
}
</script>