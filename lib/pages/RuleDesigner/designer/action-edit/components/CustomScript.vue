<template>
  <div class="custom-script">
    <div class="dialog-content-left">
      <VariableTree ref="variableTree"
                    :rule-node="data"
                    visible-groups="function"
                    @pick="handleVariablePick"></VariableTree>
    </div>
    <div class="custom-script-editor-wrapper dialog-content-right">
      <CodeEditor ref="editor"
                  v-model="customScript"
                  language="ruleDesignExpression"
                  height="430px"
                  theme="dark"
                  :read-only="disabled"
                  :suggestions-provider="$refs.variableTree?.variableSuggestionsProvider"
                  @change="change"></CodeEditor>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import CodeEditor from '../../code-editor'
import VariableTree from '../../variable-tree'

export default {
  name: 'CustomScript',
  components: {
    CodeEditor,
    VariableTree
  },
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    execute: {
      type: Object,
      default: () => ({})
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      customScript: ''
    }
  },
  created() {},
  mounted() {
    this.setDefaultData()
  },
  methods: {
    // 设置默认值
    setDefaultData() {
      if (this.execute.executeCustom) {
        this.customScript = this.execute.executeCustom
      }
    },
    handleVariablePick(text) {
      const { editor } = this.$refs
      editor && editor.insertText(text)
    },
    // 文本框改变
    change() {
      this.$emit('change', { type: '1', value: this.customScript })
    }
  }
}
</script>

<style lang='less' scoped>
.custom-script {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  margin-top: -16px;
  margin-bottom: -32px;
}

.custom-script-editor-wrapper {
  width: calc(100% - 200px);
  padding: 10px;
}
</style>