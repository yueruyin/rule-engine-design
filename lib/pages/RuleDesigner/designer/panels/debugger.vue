<template>
  <a-layout class="rule-design-panel">
    <a-layout-sider :width="40"
                    class="rule-design-panel--right-border p-10 of-h">
      <RuleDebugButton v-show="notInDebuggerStatus"
                       :style="sideVerticalTopBtnStyle"
                       @command="onDebugStart"></RuleDebugButton>
      <RuleDebugRestartButton title="重新调试"
                              v-show="inDebuggerStatus"
                              :style="sideVerticalTopBtnStyle"
                              @command="onDebugRestart"></RuleDebugRestartButton>
      <RuleExecuteNextButton title="执行到下一步"
                             :disabled="notInDebuggerStatus"
                             :style="sideVerticalBtnStyle"
                             @command="onExecuteNextStep"></RuleExecuteNextButton>
      <RuleDebugNextButton :disabled="notInDebuggerStatus"
                           :style="sideVerticalBtnStyle"
                           @command="onExecuteNextDebug"></RuleDebugNextButton>
      <RuleExecuteAllButton title="执行所有"
                            :disabled="notInDebuggerStatus"
                            :style="sideVerticalBtnStyle"
                            @command="onExecuteAll"></RuleExecuteAllButton>
      <RuleExecuteStopButton title="终止调试"
                             :disabled="notInDebuggerStatus"
                             width="12px"
                             height="12px"
                             :style="sideVerticalBtnStyle"
                             @command="onExecuteStop"></RuleExecuteStopButton>
    </a-layout-sider>
    <!-- <a-layout-content class="rule-design-panel-content p-10"
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
          <div style="line-height: 20px; margin-bottom: 10px;">执行结果: </div>
          <CodeEditor ref="ruleResultEditor"
                      v-model="executeResultJSON"
                      language="json"
                      height="calc(100% - 30px)"
                      :theme="theme"></CodeEditor>
        </a-spin>
      </div>
    </a-layout-sider> -->
    <a-layout-content class="rule-design-panel-content"
                      style="width: calc(100% - 40px);">
      <a-tabs v-model="debuggerTab"
              type="card"
              class="rule-design-panel-tabs full">
        <a-tab-pane key="arguments"
                    tab="参数"
                    class="rule-design-panel">
          <CodeEditor ref="ruleArgumentsEditor"
                      v-model="ruleArgumentsJSON"
                      language="json"
                      class="p-10"
                      height="100%"
                      :theme="theme"></CodeEditor>
        </a-tab-pane>
        <a-tab-pane key="variables"
                    tab="变量"
                    class="rule-design-panel">
          <CodeEditor ref="ruleVriablesEditor"
                      v-model="executeVariablesJSON"
                      language="json"
                      class="p-10"
                      height="100%"
                      :theme="theme"></CodeEditor>
        </a-tab-pane>
        <a-tab-pane key="output"
                    tab="输出"
                    class="rule-design-panel">
          <CodeEditor ref="ruleResultEditor"
                      v-model="executeResultJSON"
                      language="json"
                      class="p-10"
                      height="100%"
                      :theme="theme"></CodeEditor>
        </a-tab-pane>
      </a-tabs>
    </a-layout-content>
  </a-layout>
</template>

<script>
import CodeEditor from '../code-editor/index.vue'

import PanelMixin from './mixins/panel'

import { debugRule } from '../../../../api/rule-designer/index'
import { isArray, isObject, cloneDeep } from 'lodash'

import RuleIconButton from '../buttons/btns/iconBtn.vue'
import RuleExecuteAllButton from '../buttons/btns/run/executeAllBtn.vue'
import RuleExecuteNextButton from '../buttons/btns/run/nextBtn.vue'
import RuleExecuteStopButton from '../buttons/btns/run/stopBtn.vue'
import RuleDebugButton from '../buttons/btns/run/debugBtn.vue'
import RuleDebugRestartButton from '../buttons/btns/run/restartBtn.vue'
import RuleDebugNextButton from '../buttons/btns/run/debugNextBtn.vue'
import bus from '../../js/bus'
import { ModelStatusEnum } from '../../js/components/constants/status'

const DebugMode = {
  Execute: 0,
  NextStep: 1,
  NextAll: 2,
  Stop: 3
}

export default {
  name: 'RuleDebuggerPanel',
  components: {
    CodeEditor,
    RuleIconButton,
    RuleExecuteAllButton,
    RuleExecuteNextButton,
    RuleExecuteStopButton,
    RuleDebugButton,
    RuleDebugRestartButton,
    RuleDebugNextButton
  },
  mixins: [PanelMixin],
  panel: {
    id: 'RuleDebugger',
    title: '调试',
    icon: {
      type: 'bars',
      color: 'inherit'
    }
  },
  computed: {
    inDebuggerStatus () {
      return this.designer && this.designer.debugging
    },
    notInDebuggerStatus () {
      return !this.inDebuggerStatus
    }
  },
  data () {
    return {
      loading: false,
      executeId: '',
      debuggerTab: 'arguments',
      ruleArguments: {},
      ruleArgumentsJSON: '',
      executeVariablesJSON: '',
      executeResultJSON: '',
      result: {},
      sideVerticalTopBtnStyle: {
        margin: '0 10px 0 -2px'
      },
      sideVerticalBtnStyle: {
        margin: '5px 10px 0 -2px'
      }
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
    this.initListeners()
  },
  destroyed () {
    this.destroyListeners()
    if (this.executeId) {
      this.onExecuteStop()
    }
  },
  methods: {
    initListeners () {
      bus.$on('modelSelect', this.onModelSelect)
    },
    destroyListeners () {
      bus.$off('modelSelect', this.onModelSelect)
    },
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

    onDebugStart (command) {
      bus.$emit('command', command)
    },

    onDebugRestart () {
      this.onExecuteStop().then(() => {
        this._debugRule()
      })
    },

    onExecuteAll () {
      // 执行后续所有节点，不管debug标记
      this._debugRule({ mode: DebugMode.NextAll })
    },

    onExecuteNextStep () {
      // 执行下一步
      this._debugRule({ mode: DebugMode.NextStep })
    },

    onExecuteNextDebug () {
      // 执行下一步
      this._debugRule({ mode: DebugMode.Execute })
    },

    onExecuteStop () {
      if (this.stopping) {
        return
      }
      this.stopping = true
      return new Promise((resolve, reject) => {
        this._debugRule({ mode: DebugMode.Stop }).then(res => {
          this.stopping = false
          this.exitDebugStatus()
          resolve(res)
        }).catch(e => {
          this.stopping = false
          reject(e)
          this.message.error('停止调试失败')
        })
      })
    },

    onModelSelect () {
      if (this.inDebuggerStatus) {
        this.switchOutput()
      }
    },

    debugRule () {
      const { canvas } = this
      if (!canvas) {
        this.message.error('设计器初始化未完成')
        return
      }
      this._debugRule()
    },
    restartDebugRule () {
      this.onDebugRestart()
    },
    _debugRule (p = {}) {
      const { canvas } = this
      this.showLoading()
      // 执行
      let canvasAttrs = canvas.attrs || {}
      let ruleArguments = this.ruleArguments
      let breakPoints = []
      let breakPointArguments = {}
      // 提取断点参数
      canvas.models.forEach(item => {
        if (!item.debugger) {
          return
        }
        let code = item.attrs.code
        breakPoints.push(code)
        let debuggerCondition = item.getOption('debuggerCondition')
        if (debuggerCondition) {
          breakPointArguments[code] = debuggerCondition
        }
      })
      let executeArguments = {}
      if (this.executeVariablesJSON && this.executeVariablesJSON.trim()) {
        try {
          executeArguments = JSON.parse(this.executeVariablesJSON)
        } catch (e) {
          this.message.error('变量数据格式错误')
          this.debuggerTab = 'variables'
          return
        }
      }
      let params = Object.assign({
        code: canvasAttrs.ruleCode,
        businessId: 'debug',
        variable: 0,
        version: canvasAttrs.ruleVersion || '',
        arguments: ruleArguments,
        executeArguments: executeArguments,
        breakPoint: breakPoints,
        breakPointArguments: breakPointArguments,
        mode: DebugMode.Execute, // 进入调试
        executeId: this.executeId
      }, p)
      return new Promise((resolve, reject) => {
        debugRule(params).then(res => {
          this.hideLoading()
          this.result = res
          if (this.debuggerTab == 'arguments') {
            this.debuggerTab = 'output'
          }
          if (res.done) {
            // 已经执行完成
            this.exitDebugStatus()
            this.executeResultJSON = JSON.stringify(this.result)
            this.formatEditorJSON(this.$refs.ruleResultEditor)
          } else {
            // 记录执行ID，后续会使用
            this.designer.debugging = true
            this.executeId = res.executeId
            this.handleDebugTracks(res.tracks)
          }
          resolve(res)
        }).catch(e => {
          this.hideLoading()
          this.executeResultJSON = JSON.stringify(e.response)
          this.exitDebugStatus()
          this.formatEditorJSON(this.$refs.ruleResultEditor)
          reject(e)
        })
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
    handleDebugTracks (tracks = []) {
      if (!tracks.length) {
        return
      }
      const canvas = this.canvas
      let model, code
      for (let i = 0, l = tracks.length - 1; i < l; i++) {
        code = tracks[i].code
        model = canvas.models.find(item => (item.attrs && item.attrs.code) === code)
        if (model) {
          this.setModelStatus(model, ModelStatusEnum.Executed, ModelStatusEnum.Executing)
        }
      }
      let currentNode = tracks[tracks.length - 1]
      model = canvas.models.find(item => (item.attrs && item.attrs.code) === currentNode.code)
      if (model) {
        this.setModelStatus(model, ModelStatusEnum.Executing, ModelStatusEnum.Executed)
      }
      canvas.makeSelection(model)
      canvas.focusModel(model)
      this.executeVariablesJSON = JSON.stringify(currentNode.output)
      this.formatEditorJSON(this.$refs.ruleVriablesEditor)
    },
    setModelStatus (model, status, removeStatus) {
      model.removeStatus(removeStatus)
      model.addStatus(status)
      model.renderDelay()
      // 如果是条件节点，则获取下一级的条件项节点，并标记状态
      if (model.modelType === 'RuleCondition') {
        let nextConditionItemModels =
          model.getLines()?.filter(line => line.getStartLinkModel() === model)
            .map(line => line.getEndLinkModel())
            .filter(nextModel => nextModel.modelType === 'RuleConditionItem')
        nextConditionItemModels?.forEach(nextModel => this.setModelStatus(nextModel, status, removeStatus))
      }
    },
    exitDebugStatus () {
      this.executeId = ''
      this.executeVariablesJSON = ''
      this.designer.debugging = false
      const canvas = this.canvas
      canvas.models.forEach(model => {
        model.removeStatus(ModelStatusEnum.Executed)
        model.removeStatus(ModelStatusEnum.Executing)
        model.renderDelay()
      })
    },
    switchOutput () {
      let canvas = this.canvas
      let currentModel = canvas.currentModel || canvas
      if (currentModel === canvas) {
        this.executeResultJSON = JSON.stringify(this.result)
      } else {
        this.executeResultJSON = JSON.stringify(this.result.tracks.find(item => item.code === currentModel.attrs.code) || {})
      }
      this.formatEditorJSON(this.$refs.ruleResultEditor)
    }
  }
}
</script>
