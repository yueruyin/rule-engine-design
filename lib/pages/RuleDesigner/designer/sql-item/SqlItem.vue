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
      <a-form-item name="dataBase"
                   label="数据源选择"
                   :label-col="labelCol"
                   :wrapper-col="wrapperCol">
        <a-select not-found-content="暂无数据"
                  v-decorator="[
                    'dataBase',
                    { rules: [{ required: true, message: '请选择数据源' }] },
                  ]"
                  :disabled="disabled">
          <a-select-option v-for="item of dataBaseList"
                           :key="item"
                           :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-tabs v-model="configTab"
              :animated="false"
              style="margin-bottom: 16px; overflow: visible;">
        <a-tab-pane key="sql"
                    tab="SQL配置">
          <a-form-item name="sql">
            <CodeEditor ref="sqlEditor"
                        v-decorator="[ 'sql' ]"
                        language="ruleDesignSql"
                        :theme="theme"
                        :suggestions-provider="$refs.variableTree?.variableSuggestionsProvider"
                        :read-only="disabled"></CodeEditor>
          </a-form-item>
        </a-tab-pane>
        <a-tab-pane key="resultConfig">
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
          <a-form-item>
            <ExecuteTableEditor v-model="formData.result"
                                :data-source="formData.result"
                                :size="size"
                                :theme="theme"
                                :height="200"
                                :disabled="disabled"></ExecuteTableEditor>
          </a-form-item>
        </a-tab-pane>
        <a-button slot="tabBarExtraContent"
                  type="primary"
                  @click="handleSqlExecuteClick">执行SQL</a-button>
      </a-tabs>
      <a-tabs v-model="executeTab"
              :animated="false"
              style="margin-bottom: 16px; overflow: visible;">
        <a-tab-pane key="variableConfig"
                    tab="变量配置">
          <CodeEditor ref="sqlParametersEditor"
                      v-model="formData.arguments"
                      language="json"
                      :theme="theme"></CodeEditor>
        </a-tab-pane>
        <a-tab-pane key="executeResult">
          <span slot="tab">
            执行结果
            <a-popover :overlay-class-name="theme === 'dark' ? 'hint-popover--dark' : ''">
              <template slot="content">
                <span class="text-content">Sql预执行最大支持查询1000条数据</span>
              </template>
              <a-icon type="question-circle" />
            </a-popover>
          </span>
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
import { isEmpty } from 'lodash'
import {
  validateSql,
  previewSql,
  queryDataBaseList
} from '../../../../api/rule-designer/sql'

import CodeEditor from '../code-editor'
import CodePreview from '../code-editor/code-preview'
import ExecuteTableEditor from '../table-editor'
import VariableTree from '../variable-tree'

import SingleFormMixin from '../mixins/SingleFormMixin'

import { HIT_RESULT_PATH_RULE } from '../../config/hint-config'

export default {
  name: 'SqlItem',
  mixins: [SingleFormMixin],
  components: {
    CodeEditor,
    CodePreview,
    ExecuteTableEditor,
    VariableTree
  },
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    size: { type: String, default: 'small' },
    sqlEditorHeight: { type: String, default: '200px' },
    sqlEditorWidth: { type: String, default: '100%' },
    sqlEditorStyle: {
      type: Object,
      default() {
        return {}
      }
    },
    tabContentHeight: { type: String, default: '200px' },
    theme: { type: String, default: 'dark' },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      // 执行结果
      formData: {
        dataBase: null,
        sql: null,
        arguments: null,
        result: [],
        executeResult: null,
        mappingResult: null
      },
      //
      dataBaseList: [],
      labelCol: {
        // 24格栅格系统，label所占为 a
        md: 3 // ≥768px 响应式栅格
      },
      wrapperCol: {
        // 24格栅格系统，label后面内容所占为 24-a
        md: 21
      },
      configTab: 'sql',
      executeTab: 'variableConfig',
      resultPathRule:
        '// 值路径和默认值都没有配置时，表示取所有的返回结果\n' +
        HIT_RESULT_PATH_RULE
    }
  },
  watch: {
    'data.attrs.executeSql.dataBase': {
      handler(newVal) {
        this.setFormValue('dataBase', newVal)
      }
    },
    'data.attrs.executeSql.sql': {
      handler(newVal) {
        this.setFormValue('sql', newVal)
        // 解析sql
        this.analysisSql(newVal)
      }
    },
    'data.attrs.executeSql.result': {
      handler(newVal) {
        this.formData.result = newVal || []
      }
    },
    'data.attrs.executeSql.arguments': {
      handler(newVal) {
        this.formData.arguments = newVal || null
      }
    }
  },
  methods: {
    loadDataBaseList() {
      queryDataBaseList().then((res) => {
        this.dataBaseList = res || []
        this.setFormDefaultValue('dataBase', this.dataBaseList[0])
      })
    },
    initFormData() {
      const { executeSql } = this.data.attrs
      if (!executeSql) {
        return
      }
      this.setFormValue('dataBase', executeSql.dataBase || null)
      this.setFormValue('sql', executeSql.sql || null)
      this.setResultColumns(executeSql.result || [])
      this.formData.arguments = executeSql.arguments || null
    },
    formValidate() {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (err) {
            reject(err)
            return
          }
          // 手动校验sql
          const sql = this.getFormValue('sql')
          this.sqlValidator(null, this.getFormValue('sql'), (e) => {
            if (e) {
              reject(e)
              // 设置字段校验结果
              this.form.setFields({
                sql: {
                  value: sql,
                  errors: [e]
                }
              })
              this.configTab = 'sql'
              return
            }
            // 设置字段校验结果
            this.form.setFields({
              sql: {
                value: sql,
                errors: []
              }
            })
            // 校验通过
            resolve()
          })
        })
      })
    },
    /**
     * 验证sql是否被允许
     * 调用后端接口
     */
    sqlValidator(rule, sqlStatement, cb) {
      if (!sqlStatement) {
        cb()
        return
      }
      validateSql(sqlStatement)
        .then((res) => {
          cb()
          // 更新参数配置
          res && res.parameters && this.updateSqlParamters(...res.parameters)
        })
        .catch((e) => {
          cb(e)
        })
    },
    submit() {
      return new Promise((resolve, reject) => {
        this.formValidate()
          .then(() => {
            resolve({
              ...this.getFormValues(),
              result: this.formData.result,
              arguments: this.formData.arguments
            })
          })
          .catch(reject)
      })
    },
    handleSqlExecuteClick() {
      this.formValidate().then(() => {
        // 如果存在参数更新，则先不执行
        if (this.formData.argumentsUpdated) {
          this.formData.argumentsUpdated = false
          this.executeTab = 'variableConfig'
          return
        }
        let params = this.getSqlParameters()
        previewSql(
          this.getFormValue('dataBase'),
          this.getFormValue('sql'),
          params,
          this.formData.result
        )
          .then((res) => {
            // this.setResultColumns(analysisExecuteResult(res, this.formData.result))
            if (res.origin) {
              this.formData.executeResult = JSON.stringify(res.origin)
              this.executeTab = 'executeResult'
            }
            if (res.mapping && Object.keys(res.mapping).length) {
              this.formData.mappingResult = JSON.stringify(res.mapping)
              this.executeTab = 'mappingResult'
            }
            this.$nextTick(() => {
              const { executeResultEditor, mappingResultEditor } = this.$refs
              executeResultEditor && executeResultEditor.formatValue()
              mappingResultEditor && mappingResultEditor.formatValue()
            })
          })
          .catch((e) => {
            this.formData.executeResult = e.message
            console.error(e, '执行SQL报错')
            this.executeTab = 'executeResult'
          })
      })
    },
    setResultColumns(columns) {
      columns = columns || []
      this.formData.result = columns
    },
    getSqlParameters() {
      let params = null
      if (this.formData.arguments) {
        try {
          params = JSON.parse(this.formData.arguments)
        } catch (e) {}
      }
      return params
    },
    updateSqlParamters(...parameters) {
      // 参数更新状态还原
      this.formData.argumentsUpdated = false
      // 获取参数
      let params = this.getSqlParameters() || {}
      parameters &&
        parameters.forEach((item) => {
          if (item in params) {
            return
          }
          params[item] = null
          // 标记参数更新
          this.formData.argumentsUpdated = true
        })
      if (!isEmpty(params)) {
        // 设置回去
        this.formData.arguments = JSON.stringify(params)
      } else {
        this.formData.arguments = ''
      }
      // 格式化
      this.$nextTick(() => {
        const { sqlParametersEditor } = this.$refs
        sqlParametersEditor && sqlParametersEditor.formatValue()
      })
    },
    handleVariablePick(text) {
      this.configTab = 'sql'
      const { sqlEditor } = this.$refs
      sqlEditor && sqlEditor.insertText(text)
    }
  },
  mounted() {
    this.loadDataBaseList()
  }
}
</script>

<style>
</style>