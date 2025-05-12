<template>
  <div class="dialog-content-wrapper">
    <div class="dialog-content-left">
      <VariableTree ref="variableTree"
                    :rule-node="data"
                    @pick="handleVariablePick"></VariableTree>
    </div>
    <a-form :form="form"
            class="dialog-content-right"
            :style="formStyleComputed"
            @submit="handleSubmit">
      <a-form-item label="系统"
                   :label-col="labelCol"
                   :wrapper-col="wrapperCol">
        <a-select v-decorator="[
                    'system',
                    { rules: [{ required: true, message: '请选择系统' }] },
                  ]"
                  not-found-content="暂无数据"
                  dropdown-class-name="dark"
                  :disabled="disabled">
          <a-select-option v-for="item in systemList"
                           :key="item"
                           :value="item">{{ item }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="接口"
                   :label-col="labelCol"
                   :wrapper-col="wrapperCol">
        <a-input-group compact>
          <a-select style="width: 80px"
                    v-model="formData.method"
                    not-found-content="暂无数据"
                    :disabled="disabled">
            <a-select-option v-for="item in methodList"
                             :key="item"
                             :value="item">{{ item }}</a-select-option>
          </a-select>
          <a-input style="width: calc(100% - 160px)"
                   v-decorator="[
                     'url',
                     { rules: [{ required: true, message: '请输入接口地址' }] },
                   ]"
                   allow-clear
                   :disabled="disabled"></a-input>
          <a-button style="width: 80px"
                    type="primary"
                    @click="handleHttpExecuteClick">发送</a-button>
        </a-input-group>
      </a-form-item>
      <a-tabs v-model="configTab"
              :animated="tabAnimated"
              style="margin-bottom: 16px; overflow: visible;">
        <a-tab-pane key="query"
                    tab="Query参数">
          <ExecuteTableEditor ref="queryEditor"
                              v-model="formData.query"
                              :data-source="formData.query"
                              :columns="paramColumns"
                              :size="size"
                              :theme="theme"
                              :height="200"
                              :disabled="disabled"></ExecuteTableEditor>
        </a-tab-pane>
        <a-tab-pane key="body">
          <span slot="tab">
            Body数据
            <a-popover title="Body数据示例"
                       :overlay-class-name="theme === 'dark' ? 'hint-popover--dark' : ''">
              <template slot="content">
                <CodePreview language="json"
                             :theme="theme"
                             width="620px"
                             height="300px">{{ bodyConfigRule }}</CodePreview>
              </template>
              <a-icon type="question-circle" />
            </a-popover>
          </span>
          <CodeEditor ref="bodyEditor"
                      v-model="formData.body"
                      language="ruleDesignJSON"
                      :theme="theme"
                      :suggestions-provider="$refs.variableTree?.variableSuggestionsProvider"
                      :read-only="disabled"></CodeEditor>
        </a-tab-pane>
        <a-tab-pane key="header"
                    tab="Header数据">
          <ExecuteTableEditor ref="headerEditor"
                              v-model="formData.header"
                              :data-source="formData.header"
                              :columns="paramColumns"
                              :size="size"
                              :theme="theme"
                              :height="200"
                              :disabled="disabled"></ExecuteTableEditor>
        </a-tab-pane>
        <a-tab-pane key="result">
          <span slot="tab">
            结果配置
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
                              :disabled="disabled"></ExecuteTableEditor>
        </a-tab-pane>
      </a-tabs>
      <a-tabs v-model="executeTab"
              :animated="tabAnimated"
              style="margin-bottom: 16px; overflow: visible;">
        <a-tab-pane key="variableConfig"
                    tab="变量配置">
          <CodeEditor v-model="formData.arguments"
                      language="json"
                      :theme="theme"></CodeEditor>
        </a-tab-pane>
        <a-tab-pane key="executeResult"
                    tab="执行结果">
          <CodeEditor ref="executeResultEditor"
                      v-model="formData.executeResult"
                      language="json"
                      :theme="theme"></CodeEditor>
        </a-tab-pane>
        <a-tab-pane key="mappingResult"
                    tab="映射结果">
          <CodeEditor ref="mappingResultEditor"
                      v-model="formData.mappingResult"
                      language="json"
                      :theme="theme"></CodeEditor>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </div>
</template>

<script>
import {
  querySystemList,
  previewHttp
} from '../../../../api/rule-designer/http'

import CodeEditor from '../code-editor'
import CodePreview from '../code-editor/code-preview'
import ExecuteTableEditor from '../table-editor'
import VariableTree from '../variable-tree'

import SingleFormMixin from '../mixins/SingleFormMixin'

import {
  HIT_RESULT_PATH_RULE,
  HIT_BODY_CONFIG_RULE
} from '../../config/hint-config'

export default {
  name: 'HttpItem',
  mixins: [SingleFormMixin],
  components: {
    CodeEditor,
    CodePreview,
    VariableTree,
    ExecuteTableEditor
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
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      formData: {
        system: null,
        url: null,
        method: 'GET',
        query: [],
        body: null,
        header: [],
        result: [],
        arguments: null,
        executeResult: null,
        mappingResult: null
      },
      systemList: [],
      methodList: ['GET', 'POST'],
      configTab: 'query',
      executeTab: 'variableConfig',
      tabAnimated: false,
      labelCol: {
        // 24格栅格系统，label所占为 a
        md: 2 // ≥768px 响应式栅格
      },
      wrapperCol: {
        // 24格栅格系统，label后面内容所占为 24-a
        md: 22
      },
      paramColumns: [
        {
          title: '参数名',
          key: 'key',
          dataIndex: 'key',
          editable: true,
          editor: 'a-input',
          scopedSlots: { customRender: 'key' }
        },
        {
          title: '参数值',
          key: 'value',
          dataIndex: 'value',
          editable: true,
          editor: 'a-input',
          scopedSlots: { customRender: 'value' }
        },
        {
          title: '描述',
          key: 'description',
          dataIndex: 'description',
          editable: true,
          editor: 'a-input',
          scopedSlots: { customRender: 'description' }
        }
      ],
      bodyConfigRule: HIT_BODY_CONFIG_RULE,
      resultPathRule: HIT_RESULT_PATH_RULE
    }
  },
  methods: {
    initFormData() {
      const { executeHttp } = this.data.attrs
      if (!executeHttp) {
        return
      }
      this.setFormValue('system', executeHttp.system || null)
      this.setFormValue('url', executeHttp.url || null)
      this.formData.method = executeHttp.method || null
      this.formData.query = executeHttp.query || []
      this.formData.body = executeHttp.body || null
      this.formData.header = executeHttp.header || null
      this.formData.result = executeHttp.result || []
      this.formData.arguments = executeHttp.arguments || null
    },
    loadSystemList() {
      querySystemList().then((res) => {
        this.systemList = res
        // 设置默认值
        if (!this.getFormValue('system')) {
          this.setFormValue('system', this.systemList[0])
        }
      })
    },
    handleHttpExecuteClick() {
      this.formValidate().then(() => {
        // 执行sql结果
        previewHttp({
          ...this.getFormValues(),
          method: this.formData.method,
          query: this.formData.query,
          body: this.formData.body,
          header: this.formData.header,
          result: this.formData.result,
          arguments: this.formData.arguments
        })
          .then((res) => {
            if (res.origin) {
              this.formData.executeResult = JSON.stringify(res.origin)
              this.executeTab = 'executeResult'
            }
            if (res.mapping) {
              this.formData.mappingResult = JSON.stringify(res.mapping)
              this.executeTab = 'mappingResult'
            }
            this.$nextTick(() => {
              const { executeResultEditor } = this.$refs
              executeResultEditor && executeResultEditor.formatValue()
            })
          })
          .catch((e) => {
            this.executeResult = e.message
            console.error(e, '执行Http请求报错')
            this.executeTab = 'executeResult'
          })
      })
    },
    submit() {
      return new Promise((resolve, reject) => {
        //
        this.formValidate()
          .then(() => {
            resolve({
              ...this.getFormValues(),
              method: this.formData.method,
              query: this.formData.query,
              body: this.formData.body,
              header: this.formData.header,
              result: this.formData.result,
              arguments: this.formData.arguments
            })
          })
          .catch((e) => reject(e))
      })
    },
    getVariableParameters() {
      let params = null
      if (this.formData.arguments) {
        try {
          params = JSON.parse(this.formData.arguments)
        } catch (e) {}
      }
      return params
    },
    handleVariablePick(text) {
      // 不同的插入情况
      if (this.configTab === 'query') {
        const { queryEditor } = this.$refs
        queryEditor && queryEditor.insertText(text)
      } else if (this.configTab === 'body') {
        const { bodyEditor } = this.$refs
        bodyEditor &&
          bodyEditor.insertText(text.startsWith('$') ? `"${text}"` : text)
      } else if (this.configTab === 'header') {
        const { headerEditor } = this.$refs
        headerEditor && headerEditor.insertText(text)
      }
    }
  },
  mounted() {
    this.loadSystemList()
  }
}
</script>

<style>
</style>