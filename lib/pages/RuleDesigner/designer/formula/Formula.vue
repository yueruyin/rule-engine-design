<template>
  <a-row class="formula"
         :class="{ 'formula-dark': theme === 'dark'}">
    <a-col class="left-container">
      <VariableTree ref="variableTree"
                    :rule-node="ruleNode"
                    visible-groups="function"
                    invisible-groups="apiGroupBasic,apiGroupExecute,apiGroupResult,apiGroupDate,apiGroupDatabase,apiGroupArguments,apiGroupHttp,apiGroupConvert"
                    @pick="handleVariablePick"></VariableTree>
    </a-col>
    <a-col class="right-container">
      <a-row class="function-button">
        <a-button class="button"
                  size="small"
                  v-for="(item,index) in calcFunctionOptions"
                  :key="index"
                  @click="handleButtonClick(item)">
          {{ item.shortLabel || item.label || item.title || item.name }}
        </a-button>
      </a-row>
      <CodeEditor ref="expressionEditor"
                  v-model="expression"
                  language="ruleDesignExpression"
                  :theme="theme"
                  width="570px"
                  height="340px"
                  :read-only="disabled"
                  :suggestions-provider="$refs.variableTree?.variableSuggestionsProvider"></CodeEditor>
      <div class="eq-divider">=</div>
      <a-input placeholder="请输入结果"
               v-model="result"
               @change="handleResultChange" />
    </a-col>
  </a-row>
</template>

<script>
import { fastFunctions } from '../../../../assets/config/apiFunctions'
import CodeEditor from '../code-editor'
import VariableTree from '../variable-tree'
import { checkArgment } from '../../../../utils/checkArgments'

export default {
  name: 'Formula',
  components: {
    CodeEditor,
    VariableTree
  },
  props: {
    expressionObj: {
      type: Object,
      default: () => ({})
    },
    controlName: {
      type: String,
      default: ''
    },
    theme: { type: String, default: 'dark' },
    ruleNode: {
      type: Object,
      default: () => ({})
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      calcFunctionOptions: fastFunctions,
      cursorPoint: null,
      expression: '', // 表达式
      result: ''
    }
  },
  created() {
    this.analysisExpressionText()
  },
  mounted() {},
  methods: {
    // 解析表达式文本 回显数据
    analysisExpressionText() {
      this.expression = this.expressionObj.expression
      this.result = this.expressionObj.expressionArguments || this.controlName
    },
    // 在光标的位置插入按钮上的字符
    handleButtonClick(item) {
      const text = item.suggestion || item.value || item.label
      const { expressionEditor } = this.$refs
      expressionEditor && expressionEditor.insertText(text)
    },
    handleVariablePick(variableName) {
      const { expressionEditor } = this.$refs
      expressionEditor && expressionEditor.insertText(variableName)
    },
    handleResultChange() {
      if (!checkArgment(this.result)) {
        this.message.error('变量不能包含特殊字符')
      }
    },
    submit() {
      if (!this.expression) {
        this.message.warning('请输入表达式！')
        return false
      }
      return {
        expression: this.expression,
        expressionArguments: this.result
      }
    }
  }
}
</script>

<style lang='less' scoped>
.formula {
  width: 800px;
  height: 500px;
  display: flex;
  justify-content: flex-start;
  .left-container {
    width: 200px;
    height: 100%;
    border-right: 1px solid #ebebeb;
    overflow: auto;
    .button {
      width: 100px;
      height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      margin: 10px auto;
    }
  }
  .right-container {
    flex: 1;
    padding: 15px;
    position: relative;
    .function-button {
      height: 30px;
      .button {
        margin-right: 10px;
      }
    }
    .eq-divider {
      padding: 10px 0;
      font-size: 24px;
      color: #60be29;
    }
    .text {
      position: absolute;
      bottom: 15px;
      left: 15px;
      font-size: 20px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      max-width: 620px;
      max-height: 150px;
      overflow: hidden;
      .expression-text {
        color: green;
      }
      .equal {
        margin: 0 10px;
      }
      .result-text {
        color: orange;
      }
    }
  }
}
.formula-dark {
  .left-container {
    border-right-color: #595959;
  }
}
</style>