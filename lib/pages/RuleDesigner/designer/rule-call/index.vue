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
            <a-col :span="16">
              <a-form-model-item label="规则编号">
                <RuleDesignSelectTree ref="tree"
                                      v-model="formData.ruleCode"
                                      :tree-data="treeData"
                                      placeholder="未设置将不会被执行"
                                      allow-clear
                                      :disabled="disabled"
                                      @change="onRuleCodeChange"></RuleDesignSelectTree>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="版本"
                                 :label-col="{ span: 6 }"
                                 :wrapper-col="{ span: 18 }">
                <a-select v-model="formData.ruleVersion"
                          placeholder="默认最新发布"
                          dropdown-class-name="dark"
                          allow-clear
                          :disabled="disabled"
                          @change="initArguments">
                  <a-select-option v-for="item in versionData"
                                   :key="item"
                                   :value="item">{{ item }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="16">
              <a-form-model-item label="循环变量">
                <a-input v-model="formData.loopKey"
                         :disabled="disabled"
                         @focus="onFocus('loopKey')"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="合并返回值"
                                 :label-col="{ span: 10 }"
                                 :wrapper-col="{ span: 14 }">
                <a-switch v-model="formData.loopJoin"
                          :disabled="disabled"></a-switch>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-tabs v-model="configTab"
                  :animated="tabAnimated"
                  style="margin-bottom: 16px; overflow: visible;">
            <a-tab-pane key="arguments"
                        tab="执行参数">
              <ExecuteTableEditor ref="argumentsEditor"
                                  v-model="formData.arguments"
                                  :data-source="formData.arguments"
                                  :columns="argumentsColumns"
                                  :size="size"
                                  :theme="theme"
                                  :height="200"
                                  :disabled="disabled"
                                  @focus="onFocus('argument')"></ExecuteTableEditor>
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
                                  :disabled="disabled"
                                  @focus="onFocus('result')"></ExecuteTableEditor>
            </a-tab-pane>
            <a-button slot="tabBarExtraContent"
                      type="primary"
                      @click="handleRuleExecuteClick">执行规则</a-button>
            <a-button slot="tabBarExtraContent"
                      class="m-l-10"
                      :disabled="disabled"
                      @click="onSyncRuleArguments">同步参数</a-button>
          </a-tabs>
          <a-tabs v-model="executeTab"
                  :animated="tabAnimated"
                  style="margin-bottom: 16px; overflow: visible;">
            <a-tab-pane key="executeResult"
                        tab="执行结果">
              <CodeEditor ref="executeResultEditor"
                          v-model="executeResult"
                          language="json"
                          :theme="theme"></CodeEditor>
            </a-tab-pane>
            <a-tab-pane key="mappingResult"
                        tab="映射结果">
              <CodeEditor ref="mappingResultEditor"
                          v-model="mappingResult"
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

import { queryRuleTree } from '../../../../api/table/index'
import {
  getRuleVersionList,
  preExecuteRuleByResultMapping,
  getRuleArguments
} from '../../../../api/rule-designer/index'

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
        ruleCode: undefined,
        ruleVersion: undefined,
        arguments: [],
        result: [],
        loopKey: null,
        loopJoin: false
      },
      executeResult: null,
      mappingResult: null,
      configTab: 'arguments',
      executeTab: 'executeResult',
      tabAnimated: false,
      labelCol: {
        // 24格栅格系统，label所占为 a
        md: 3 // ≥768px 响应式栅格
      },
      wrapperCol: {
        // 24格栅格系统，label后面内容所占为 24-a
        md: 21
      },
      argumentsColumns: [
        {
          title: '参数名',
          key: 'key',
          dataIndex: 'key',
          editable: true,
          editor: 'a-input',
          scopedSlots: { customRender: 'key' }
        },
        {
          title: '变量',
          key: 'value',
          dataIndex: 'value',
          editable: true,
          editor: 'a-input',
          scopedSlots: { customRender: 'value' }
        },
        {
          title: '默认值',
          key: 'def',
          dataIndex: 'def',
          editable: true,
          editor: 'a-input',
          scopedSlots: { customRender: 'description' }
        }
      ],
      bodyConfigRule: HIT_BODY_CONFIG_RULE,
      resultPathRule: HIT_RESULT_PATH_RULE,
      treeData: [
        {
          id: '',
          value: '',
          name: '无规则'
        }
      ],
      versionData: []
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
    loadTreeData() {
      queryRuleTree().then((res) => {
        let data = [].concat(res)
        data = this.handleTreeData(data, 0)
        this.treeData = data
      })
    },
    loadVersionData(clearVersion) {
      if (this.formData.ruleCode) {
        getRuleVersionList(this.formData.ruleCode).then((res) => {
          this.versionData = res
        })
      } else {
        this.versionData = []
      }
      if (clearVersion) {
        this.formData.ruleVersion = undefined
      }
    },
    initArguments() {
      if (!this.formData.ruleCode) {
        return
      }
      getRuleArguments(this.formData.ruleCode, this.formData.ruleVersion).then(
        (res) => {
          res = res || []
          let args = res.map((item) => ({
            selected: true,
            key: item.key,
            value: undefined,
            def: item.value
          }))
          this.formData.arguments = args
        }
      )
    },
    handleTreeData(data, pid) {
      if (!data) {
        return data
      }
      data = data.filter(
        (item) =>
          !this.ignoreKeys.includes(item.code) &&
          !this.ignoreKeys.includes(item.id)
      )
      // 数据过滤
      data.forEach((item) => {
        item.parentId = pid
        if (item.type === 'group') {
          item.id = 'group_' + item.id
          item.selectable = false
          item.children = this.handleTreeData(item.children, item.id)
          item.icon = 'folder'
        } else {
          item.id = item.code
          item.icon = 'file-text'
        }
        item.children = item.children || []
      })
      return data
    },
    initFormData() {
      let executeCallRule = this.data.attrs && this.data.attrs.executeCallRule
      if (executeCallRule) {
        this.formData = Object.assign({}, cloneDeep(executeCallRule))
      }
      this.formData.ruleCode = this.formData.ruleCode || undefined
      this.formData.ruleVersion = this.formData.ruleVersion || undefined
    },
    submit() {
      return new Promise((resolve, reject) => {
        //
        this.$refs.form.validate((valid, err) => {
          if (valid) {
            let nodes = this.$refs.tree.getSelectedNodes()
            let ruleName = nodes[0] && nodes[0].name
            resolve({
              ruleName: ruleName,
              ruleCode: this.formData.ruleCode || null,
              ruleVersion: this.formData.ruleVersion || null,
              arguments: this.formData.arguments || null,
              result: this.formData.result || null,
              loopKey: this.formData.loopKey || null,
              loopJoin: this.formData.loopJoin || false
            })
          } else {
            reject(err)
          }
        })
      })
    },
    handleVariablePick(text) {
      if (this.focusType === 'loopKey') {
        this.formData.loopKey = text
      } else if (this.configTab === 'arguments') {
        const { argumentsEditor } = this.$refs
        argumentsEditor && argumentsEditor.insertText(text)
      } else if (this.configTab === 'result') {
        const { resultEditor } = this.$refs
        resultEditor && resultEditor.insertText(text)
      }
    },
    // 阻止默认提交
    handleSubmit(e) {
      e.preventDefault()
    },
    handleRuleExecuteClick() {
      this.$refs.form.validate((valid, err) => {
        if (!valid) {
          return
        }
        // if (!this.formData.ruleCode) {
        //   return
        // }
        let ruleArguments = {}
        // let argumentsConfig = this.formData.arguments || []
        // argumentsConfig.forEach(item => {
        //   ruleArguments[item.key] = item.def
        // })
        let params = {
          code: this.formData.ruleCode,
          businessId: 'pre-execute',
          variable: 0,
          version: this.formData.ruleVersion || '',
          arguments: ruleArguments,
          result: this.formData.result || [],
          callArguments: this.formData.arguments || []
        }
        this.$showLoading()
        preExecuteRuleByResultMapping(params)
          .then((res) => {
            this.$hideLoading()
            if (Object.keys(res.origin).length) {
              this.executeResult = JSON.stringify(res.origin)
            } else {
              this.executeResult = '{}'
            }
            let tab = 'executeResult'
            if (Object.keys(res.mapping).length) {
              this.mappingResult = JSON.stringify(res.mapping)
              tab = 'mappingResult'
            } else {
              this.mappingResult = ''
            }
            this.executeTab = tab
            this.$nextTick(() => {
              const { executeResultEditor } = this.$refs
              executeResultEditor && executeResultEditor.formatValue()
            })
            this.$nextTick(() => {
              const { mappingResultEditor } = this.$refs
              mappingResultEditor && mappingResultEditor.formatValue()
            })
          })
          .catch((e) => {
            this.$hideLoading()
            this.executeResult = e.message
            this.executeTab = 'executeResult'
          })
      })
    },
    onRuleCodeChange() {
      this.loadVersionData(true)
    },

    onSyncRuleArguments() {
      if (this.formData.arguments.length) {
        this.confirm({
          title: '同步子规则参数配置',
          content:
            '当前已设置了传入子规则的参数，继续同步将会覆盖现有配置，是否继续？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            this.initArguments()
          }
        })
      } else {
        this.initArguments()
      }
    },

    onFocus(type) {
      this.focusType = type
    }
  },
  mounted() {
    this.initFormData()
    this.loadTreeData()
    this.loadVersionData()
  }
}
</script>