<template>
  <pre ref="container"
       class="code-editor-preview"
       :class="{ 'code-editor-preview--dark': theme === 'dark' }"
       :style="styleComputed"
       :data-lang="language"><slot></slot></pre>
</template>

<script>
import * as monaco from 'monaco-editor'

import { THEME_MAPPING } from './common'

export default {
  name: 'CodePreview',
  props: {
    value: String,
    mode: { type: String, default: null },
    // 样式属性
    width: { type: String, default: '100%' },
    height: { type: String, default: '200px' },
    border: { type: String, default: null },

    // 编辑器属性
    text: { type: String, default: 'null' },
    language: { type: String, default: 'text' },
    autoFormat: { type: Boolean, default: true },
    theme: { type: String, default: null },
    editorOptions: { type: Object, default () { return {} } }
  },
  data () {
    return {
      initCount: 0,
      initRemedyCount: 5,
      content: null
    }
  },
  computed: {
    styleComputed () {
      let style = {}
      if (this.width !== null && this.width !== undefined) {
        style.width = this.width
      }
      if (this.height !== null && this.height !== undefined) {
        style.height = this.height
      }
      if (this.border !== null && this.border !== undefined) {
        style.border = this.border
      }
      return style
    }
  },
  watch: {
    value (newVal) {
      this.setValue(newVal)
    }
  },
  methods: {
    init () {
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
      this.ins = monaco.editor.colorizeElement(el, {
        language: this.language,
        theme: THEME_MAPPING[this.theme] || this.theme
      })
    },
    dispose () {
      if (this.insModel) {
        this.insModel.dispose()
        this.insModel = null
      }
      if (this.ins) {
        this.ins.dispose()
        this.ins = null
      }
    }
  },
  mounted () {
    this.init()
  },
  destroyed () {
    this.dispose()
  }
}
</script>