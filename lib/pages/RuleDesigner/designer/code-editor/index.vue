<template>
  <div
    class="code-editor"
    :class="[theme && 'code-editor--' + theme]"
    :style="{ width, height }"
  >
    <div ref="container" class="code-editor-container full"></div>
  </div>
</template>

<script>
import monaco from './editor'

export default {
  name: 'CodeEditor',
  props: {
    value: { type: String, default: null },
    mode: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    // 样式属性
    width: { type: String, default: '100%' },
    height: { type: String, default: '200px' },
    border: { type: String, default: null },

    // 编辑器属性
    language: { type: String, default: 'text' },
    readOnly: { type: Boolean, default: false },
    autoFormat: { type: Boolean, default: true },
    theme: { type: String, default: null },
    editorOptions: {
      type: Object,
      default() {
        return {}
      }
    },

    suggestionsProvider: { type: Function, default: null }
  },
  data() {
    return {
      initCount: 0,
      initRemedyCount: 5,
      content: null
    }
  },
  computed: {},
  watch: {
    value(newVal) {
      this.setValue(newVal)
    },
    suggestionsProvider(newProvider, oldProvider) {
      this.ins?.removeSuggestionsProvider(oldProvider)
      this.ins?.addSuggestionsProvider(newProvider)
    }
  },
  methods: {
    init() {
      this.dispose()
      this.initCount++
      const el = this.$refs.container
      if (!el) {
        if (this.initCount < this.initRemedyCount) {
          // 容器没有找到时，尝试补救
          setTimeout(this.init, 100)
        }
        return
      }
      // monaco-editor 创建编辑器
      this.ins = monaco.editor.create(el, {
        ...this.editorOptions,
        // 高优先级的设置
        value: this.value,
        language: this.language,
        theme: this.theme,
        readOnly: this.readOnly,
        suggestionsProviders: [this.suggestionsProvider],
        events: {
          onDidChangeModelContent: this.onChange
        }
      })
      // 绑定内容模型
      this.insModel = this.ins.getModel()
      // 触发初始化完成事件，完成自动格式化
      setTimeout(() => {
        this.$emit('inited', this)
        if (this.autoFormat) {
          this.formatValue()
        }
      }, 200)
    },
    onChange() {
      let value = this.getValue()
      this.content = value
      this.$emit('input', value)
      this.$emit('change', value)
    },
    dispose() {
      if (this.ins) {
        this.ins.dispose()
        this.ins = null
        this.insModel = null
      }
    },

    // api
    getValue() {
      return this.insModel && this.insModel.getValue()
    },
    setValue(newVal) {
      if (newVal !== this.content) {
        this.content = newVal
        if (this.insModel) {
          this.insModel.setValue(newVal)
        }
      }
    },
    insertText(newVal, position) {
      if (!newVal) {
        return
      }
      var selection = this.ins.getSelection()
      var id = { major: 1, minor: 1 }
      var op = {
        identifier: id,
        range: selection,
        text: newVal,
        forceMoveMarkers: true
      }
      this.ins.executeEdits('insertText', [op])
      this.ins.focus()
    },
    formatValue() {
      if (!this.ins) {
        return
      }
      // 强制格式化json
      this.ins.trigger('', 'editor.action.formatDocument')
    }
  },
  mounted() {
    setTimeout(() => {
      // 等待页面固定后初始化
      this.init()
    }, 10)
    this._onChange = () => {
      // 设置timer，停止输入后100ms触发修改事件
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.onChange()
        this.timer = null
      }, 1000)
    }
  },
  destroyed() {
    this.dispose()
  }
}
</script>

<style lang="less">
.code-editor {
  padding-bottom: 1px;
}
.code-editor-container {
  box-sizing: border-box;
  border: 1px solid #dcdcdb;
}
.code-editor--dark {
  .code-editor-container {
    border-color: #595959;
  }
}
</style>
