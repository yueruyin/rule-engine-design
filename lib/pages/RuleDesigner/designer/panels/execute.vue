<template>
  <a-layout class="rule-design-panel">
    <a-layout-sider :width="40"
                    class="rule-design-panel--right-border p-10 of-h">
      <RuleExecuteButton style="margin: 0 10px 0 -2px;"
                         @command="onCommand"></RuleExecuteButton>
    </a-layout-sider>
    <a-layout-content class="rule-design-panel-content p-10"
                      style="width: calc(50% - 40px);">
      <div class="full of-v">
        <div style="line-height: 20px; margin-bottom: 10px;">执行参数: </div>
        <CodeEditor ref="ruleArgumentsEditor"
                    v-model="ruleArgumentsJSON"
                    language="json"
                    height="calc(100% - 30px)"
                    :theme="theme"></CodeEditor>
      </div>
    </a-layout-content>
    <a-layout-sider width="50%"
                    class="rule-design-panel--left-border p-10">
      <div class="full of-v">
        <a-spin :spinning="loading"
                wrapperClassName="full">
          <div style="line-height: 20px; margin-bottom: 10px;">
            <span>执行结果: </span>
            <a v-if="executeResult"
               class="m-l-20"
               @click="showExecuteGraph">
              <a-icon class="m-r-5"
                      type="picture" />
              <span>执行图</span>
            </a>
          </div>
          <CodeEditor ref="ruleResultEditor"
                      v-model="executeResultJSON"
                      language="json"
                      height="calc(100% - 30px)"
                      :theme="theme"></CodeEditor>
        </a-spin>
      </div>
    </a-layout-sider>
  </a-layout>
</template>

<script>
import CodeEditor from '../code-editor/index.vue'

import PanelMixin from './mixins/panel'

import { preExecuteRule } from '../../../../api/rule-designer/index'
import { isArray, isObject, cloneDeep } from 'lodash'

import RuleIconButton from '../buttons/btns/iconBtn.vue'
import RuleExecuteButton from '../buttons/btns/run/executeBtn.vue'
import RuleViewer from '../../RuleViewer.vue'
import bus from '../../js/bus'

export default {
  name: 'RuleExecutePanel',
  components: {
    CodeEditor,
    RuleIconButton,
    RuleExecuteButton
  },
  mixins: [PanelMixin],
  panel: {
    id: 'RuleExecute',
    title: '预执行',
    icon: {
      type: 'bars',
      color: 'inherit'
    }
  },
  data () {
    return {
      loading: false,
      ruleArguments: {},
      executeResult: null,
      ruleArgumentsJSON: '',
      executeResultJSON: ''
    }
  },
  watch: {
    'canvas.attrs.ruleArguments': {
      handler (newVal) {
        //
        this.updateRuleArguments(newVal)
      },
      deep: true
    },
    ruleArgumentsJSON (newVal) {
      let arg
      try {
        arg = JSON.parse(newVal)
        this.ruleArguments = arg
      } catch (e) {
        console.error(e)
      }
    }
  },
  created () {
    this.updateRuleArguments(this.canvas.attrs.ruleArguments)
  },
  mounted () {
  },
  methods: {
    updateRuleArguments (ruleArguments) {
      let map = {}
      if (isArray(ruleArguments)) {
        ruleArguments.forEach(item => {
          map[item.key] = item.value
        })
      } else if (isObject(ruleArguments)) {
        Object.assign(map, cloneDeep(ruleArguments))
      }
      this.ruleArgumentsJSON = JSON.stringify(map)
      // this.formatEditorJSON(this.$refs.ruleArgumentsEditor)
    },
    onCommand (command) {
      // 执行按钮被点击，通知全局处理，让设计器接管
      bus.$emit(command)
      bus.$emit('command', command)
    },
    executeRule () {
      const { canvas } = this
      if (!canvas) {
        this.message.error('设计器初始化未完成')
        return
      }
      this._executeRule()
    },
    _executeRule () {
      const { canvas } = this
      this.showLoading()
      // 执行
      let canvasAttrs = canvas.attrs || {}
      let ruleArguments = this.ruleArguments
      let params = {
        code: canvasAttrs.ruleCode,
        businessId: 'pre-execute',
        variable: 0,
        version: canvasAttrs.ruleVersion || '',
        arguments: ruleArguments,
        env: 'dev'
      }
      preExecuteRule(params).then(res => {
        this.hideLoading()
        this.executeResult = res
        this.executeResultJSON = JSON.stringify(res)
        this.formatEditorJSON(this.$refs.ruleResultEditor)
      }).catch(e => {
        this.hideLoading()
        this.executeResult = null
        this.executeResultJSON = JSON.stringify(e.response)
        this.formatEditorJSON(this.$refs.ruleResultEditor)
      })
    },
    formatEditorJSON (editor) {
      if (!editor) {
        return
      }
      setTimeout(() => {
        editor.formatValue()
      }, 10)
    },
    showLoading () {
      this.loading = true
    },
    hideLoading () {
      this.loading = false
    },
    showExecuteGraph () {
      this.dialog({
        title: '执行图',
        // 采用弹框时，一定要传入数据
        body: <RuleViewer execute-result={this.executeResult} width="1200px" height="640px" theme="dark"></RuleViewer>,
        footer: false,
        theme: 'dark'
      })
    }
  }
}
</script>
