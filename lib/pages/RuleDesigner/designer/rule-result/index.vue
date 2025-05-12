<template>
  <a-button type="info"
            icon="plus"
            @click="openModel">
    <!-- {{ !!value && value!=='{}' ? '编辑' : '新增' }}返回值配置 -->
    编辑返回值
  </a-button>
</template>

<script>
import RuleResultEditorModel from './model'

export default {
  name: 'RuleResultEditor',
  components: {
    RuleResultEditorModel
  },
  props: {
    value: { type: [String, Object], default: null },
    theme: { type: String, default: 'dark' },
    title: { type: String, default: '执行结果配置' },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {}
  },
  methods: {
    openModel() {
      this.$emit('focus', this)
      this.dialog({
        title: this.title,
        body: (
          <RuleResultEditorModel
            ref="model"
            value={this.value}
            theme={this.theme}
            disabled={this.disabled}
            extend-props={this.$attrs}
          />
        ),
        theme: 'dark',
        beforeClose: (type, close) => {
          if (type === 'confirm') {
            const result = this.$refs.model.submit()
            this.$emit('input', result)
            this.$emit('change', result)
          }
          close()
        },
        onClose: () => {
          this.$emit('blur', this)
        }
      })
    }
  }
}
</script>
