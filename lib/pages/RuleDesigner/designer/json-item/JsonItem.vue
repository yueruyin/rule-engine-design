<template>
  <ConfigProvider :lacale="locale">
    <a-layout>
      <a-layout-sider width="200px"
                      class="dialog-content-left">
        <VariableTree :rule-node="data"
                      @pick="handleVariablePick"></VariableTree>
      </a-layout-sider>
      <a-layout-content style="overflow: visible;">
        <a-form-model ref="form"
                      :model="formData"
                      :style="formStyleComputed"
                      :label-col="labelCol"
                      :wrapper-col="wrapperCol"
                      @submit="handleSubmit">
          <a-row>
            <a-col :span="24">
              <a-form-model-item label="变量(JSON)">
                <!-- <CodeEditor ref="resultEditor"
                          v-model="formData.jsonArguments"
                          language="json"
                          :theme="theme" @focus="onFocus('jsonArguments')"></CodeEditor> -->
                <a-input v-model="formData.jsonArguments"
                         @focus="onFocus('jsonArguments')"
                         v-decorator="[
                           'jsonArguments',
                           { rules: [{ required: true, message: '请输入JSON格式字符串或JSON格式变量' }] },
                         ]"
                         :disabled="disabled"></a-input>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="24">
              <a-form-model-item label="模版(JSON)">
                <!-- <CodeEditor ref="resultEditor"
                          v-model="formData.jsonArguments"
                          language="json"
                          :theme="theme" @focus="onFocus('jsonArguments')"></CodeEditor> -->
                <CodeEditor ref="jsonModelEditor"
                            v-model="formData.jsonModel"
                            language="json"
                            :theme="theme"
                            height="50px"
                            :read-only="disabled"></CodeEditor>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-tabs v-model="configTab"
                  :animated="tabAnimated"
                  style="margin-bottom: 8px; overflow: visible;">
            <a-tab-pane key="result">
              <span slot="tab">
                获取数据
                <a-popover title="路径配置示例"
                           :overlay-class-name="theme === 'dark' ? 'hint-popover--dark' : ''">
                  <template slot="content">
                    <CodePreview language="json"
                                 :theme="theme"
                                 width="620px"
                                 height="450px">{{ resultPathRule }}</CodePreview>
                  </template>
                  <a-icon type="question-circle" />
                </a-popover>
              </span>
              <ExecuteTableEditor ref="resultEditor"
                                  v-model="formData.result"
                                  :data-source="formData.result"
                                  :size="size"
                                  :theme="theme"
                                  :height="200"
                                  :disabled="disabled"
                                  @focus="onFocus('result')"></ExecuteTableEditor>
            </a-tab-pane>
            <a-tab-pane key="arguments"
                        tab="设置数据">
              <ExecuteTableEditor ref="argumentsEditor"
                                  v-model="formData.setResult"
                                  :data-source="formData.setResult"
                                  :columns="setResultColumns"
                                  :size="size"
                                  :theme="theme"
                                  :height="200"
                                  :disabled="disabled"
                                  @focus="onFocus('argument')"></ExecuteTableEditor>
            </a-tab-pane>
            <a-button slot="tabBarExtraContent"
                      type="primary"
                      @click="handleRuleExecuteClick">预览json</a-button>
          </a-tabs>
          <a-tabs v-model="executeTab"
                  :animated="tabAnimated"
                  style="margin-bottom: 8px; overflow: visible;">
            <a-tab-pane key="result"
                        tab="映射结果">
              <CodeEditor ref="resultEditor"
                          v-model="result"
                          language="json"
                          :theme="theme"></CodeEditor>
            </a-tab-pane>
            <a-tab-pane key="setResult"
                        tab="JSON结果">
              <CodeEditor ref="setResultEditor"
                          v-model="setResult"
                          language="json"
                          :theme="theme"></CodeEditor>
            </a-tab-pane>
          </a-tabs>
        </a-form-model>
      </a-layout-content>
    </a-layout>
  </ConfigProvider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { ConfigProvider } from 'ant-design-vue'

import { jsonPreview } from '../../../../api/rule-designer/index'

import CodeEditor from '../code-editor'
import CodePreview from '../code-editor/code-preview'
import ExecuteTableEditor from '../table-editor'
import VariableTree from '../variable-tree'
import RuleDesignSelectTree from '../../../../components/tree/select.vue'

import {
  HIT_RESULT_PATH_RULE,
  HIT_BODY_CONFIG_RULE
} from '../../config/hint-config'

import { cloneDeep } from 'lodash'

export default {
  name: 'RuleCallConfig',
  components: {
    CodeEditor,
    CodePreview,
    VariableTree,
    ExecuteTableEditor,
    RuleDesignSelectTree,
    ConfigProvider
  },
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    size: { type: String, default: 'small' },
    theme: { type: String, default: 'dark' },
    formWidth: { type: String, default: '800px' },
    formHeight: { type: String, default: null },
    ignoreKeys: {
      type: Array,
      default() {
        return []
      }
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      locale: zhCN,
      focusType: 'argument',
      formData: {
        setResult: [],
        result: [],
        jsonArguments: null,
        jsonModel: null
      },
      setResult: null,
      result: null,
      configTab: 'arguments',
      executeTab: 'setResult',
      tabAnimated: false,
      labelCol: {
        // 24格栅格系统，label所占为 a
        md: 3 // ≥768px 响应式栅格
      },
      wrapperCol: {
        // 24格栅格系统，label后面内容所占为 24-a
        md: 21
      },
      setResultColumns: [
        {
          title: '路径',
          key: 'key',
          dataIndex: 'key',
          editable: true,
          editor: 'a-input',
          scopedSlots: { customRender: 'key' }
        },
        {
          title: '值',
          key: 'value',
          dataIndex: 'value',
          editable: true,
          editor: 'a-input',
          scopedSlots: { customRender: 'value' }
        }
        // { title: '默认值', key: 'def', dataIndex: 'def', editable: true, editor: 'a-input', scopedSlots: { customRender: 'description' } }
      ],
      bodyConfigRule: HIT_BODY_CONFIG_RULE,
      resultPathRule: HIT_RESULT_PATH_RULE
    }
  },
  computed: {
    formStyleComputed() {
      return {
        width: this.formWidth,
        height: this.formHeight,
        padding: '6px 15px 0 15px'
      }
    }
  },
  methods: {
    initFormData() {
      let executeJson = this.data.attrs && this.data.attrs.executeJson
      if (executeJson) {
        this.formData = Object.assign({}, cloneDeep(executeJson))
      }
      this.formData.jsonArguments = this.formData.jsonArguments || undefined
      this.formData.jsonModel = this.formData.jsonModel || undefined
    },
    submit() {
      return new Promise((resolve, reject) => {
        resolve({
          jsonArguments: this.formData.jsonArguments || null,
          jsonModel: this.formData.jsonModel || null,
          result: this.formData.result || null,
          setResult: this.formData.setResult || null
        })
      })
    },
    handleVariablePick(text) {
      if (this.focusType === 'jsonArguments') {
        this.formData.jsonArguments = text
      } else if (this.configTab === 'arguments') {
        const { argumentsEditor } = this.$refs
        argumentsEditor && argumentsEditor.insertText(text)
      } else if (this.configTab === 'result') {
        const { resultEditor } = this.$refs
        resultEditor && resultEditor.insertText(text)
      }
    },
    handleSubmit(e) {
      e.preventDefault()
    },
    handleRuleExecuteClick() {
      let params = {
        jsonModel: this.formData.jsonModel || '',
        result: this.formData.result || [],
        setResult: this.formData.setResult || []
      }
      this.$showLoading()
      jsonPreview(params)
        .then((res) => {
          this.$hideLoading()
          if (Object.keys(res.origin).length) {
            this.setResult = JSON.stringify(res.origin)
          } else {
            this.setResult = '{}'
          }
          let tab = 'setResult'
          if (Object.keys(res.mapping).length) {
            this.result = JSON.stringify(res.mapping)
            tab = 'result'
          } else {
            this.result = ''
          }
          this.executeTab = tab
          this.$nextTick(() => {
            const { setResultEditor } = this.$refs
            setResultEditor && setResultEditor.formatValue()
          })
          this.$nextTick(() => {
            const { resultEditor } = this.$refs
            resultEditor && resultEditor.formatValue()
          })
        })
        .catch((e) => {
          this.$hideLoading()
          this.setResult = e.message
          this.executeTab = 'setResult'
        })
    },
    onFocus(type) {
      this.focusType = type
    }
  },
  mounted() {
    this.initFormData()
  }
}
</script>