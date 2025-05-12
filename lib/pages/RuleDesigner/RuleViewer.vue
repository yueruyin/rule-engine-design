<template>
  <div class="ruledesigner flex"
       :style="{width: width, height: height}">
    <Draw ref="draw"
          class="layout center"
          :show-toolbar="false"
          @model-select="onModelSelect" />
    <div v-if="showResultPanel"
         class="result-panel"
         style="width: 480px;">
      <CodeEidtor ref="resultEditor"
                  v-model="resultJSON"
                  :height="height"
                  language="json"></CodeEidtor>
    </div>
  </div>
</template>

<script>
import Draw from './designer/draw.vue'
import RDSetting from './js/ruledesigner_setting.js'
import CodeEidtor from './designer/code-editor'
import UpgradeHandlers from './js/upgrade'
import { getRuleByCodeAndVersion } from '../../api/rule-designer/index.js'
import { getEngineDataById } from '../../api/table/index'
import { ModelStatusEnum } from './js/components/constants/status'

const designerVersion = window.APP_VERSION

export default {
  name: 'RuleDetailView',
  extends: null,
  mixins: [],
  components: { Draw, CodeEidtor },
  provide() {
    return {
      designer: this
    }
  },
  props: {
    id: { type: String, default: undefined },
    code: { type: String, default: undefined },
    version: { type: String, default: undefined },
    ruleData: { type: Object, default: undefined },
    executeResult: { type: Object, default: undefined },
    readOnly: { type: Boolean, default: true },
    width: { type: String, default: undefined },
    height: { type: String, default: undefined }
  },
  data() {
    return {
      size: 'A4',
      direction: '1',
      activeKey: ['1', '2'],
      propertiesPanelKey: ['1'],
      // 控件ID和控件定义构成的数据
      controlMap: {},
      jsonTextArr: [],
      stepList: [],
      resultJSON: ''
    }
  },
  computed: {
    // 传入执行结果时将，显示执行面板
    showResultPanel() {
      return !!this.executeResult
    },
    canvas() {
      return this.$refs.draw?.rdInfo
    }
  },
  watch: {},
  methods: {
    // 根据列表传过来的数据回显流程图
    showDesign() {
      if (this.ruleData) {
        this.initCanvas(this.ruleData.designJson)
        return
      }
      let api,
        params = []
      if (
        this.executeResult &&
        this.executeResult.code &&
        this.executeResult.version
      ) {
        api = getRuleByCodeAndVersion
        params = [this.executeResult.code, this.executeResult.version]
      } else if (this.id) {
        api = getEngineDataById
        params = [this.id]
      } else if (this.code) {
        api = getRuleByCodeAndVersion
        params = [this.code, this.version]
      } else if (this.$route.query.id) {
        api = getEngineDataById
        params = [this.$route.query.id]
      } else if (this.$route.query.code) {
        api = getRuleByCodeAndVersion
        params = [this.$route.query.code, this.$route.query.version]
      }
      api
        .apply(this, params)
        .then((res) => {
          this.initCanvas(res.designJson)
        })
        .catch((e) => {
          console.error(e)
          // 初始化一个画布
          this.initCanvas()
        })
    },

    // 初始化规则设计器
    initCanvas(rdJSON) {
      let params = [this.$refs.draw.getContainer()]
      // 传入规则设计JSON则从json中初始化画布，否则创建默认画布
      if (rdJSON) {
        rdJSON = JSON.parse(rdJSON)
        if (!rdJSON.designerVersion) {
          rdJSON = RDSetting.restoreFromMininJSON(rdJSON)
        }
        // 判断版本是否一致
        if (rdJSON.designerVersion !== designerVersion) {
          // 查找升级处理器，增加默认升至最新的处理器
          let upgradeHandlerName =
            (rdJSON.designerVersion || '').replaceAll(/\./g, '_') +
            'To' +
            designerVersion.replaceAll(/\./g, '_')
          let defaultUpgradeHandlerName =
            (rdJSON.designerVersion || '').replaceAll(/\./g, '_') + 'ToLast'
          let upgradeHandler =
            UpgradeHandlers[upgradeHandlerName] ||
            UpgradeHandlers[defaultUpgradeHandlerName]
          if (upgradeHandler) {
            upgradeHandler(rdJSON)
          }
        }
        params.push(rdJSON)
        // 画布宽
        params.push(
          parseInt(rdJSON.canvasWidth ? rdJSON.canvasWidth : rdJSON.width)
        )
        // 画布高
        params.push(
          parseInt(rdJSON.canvasHeight ? rdJSON.canvasHeight : rdJSON.height)
        )
      }
      const canvas = window.initRD(...params)
      this.$refs.draw.rdInfo = canvas
      canvas.setReadOnly(this.readOnly)
      canvas.clickTab = this.$refs.draw.rdClick
      this.$emit('event', canvas)
      // 选中画布
      this.selectCanvas()
      // 如果传入了执行结果，则改变节点状态
      this.executeResult && this.changeStatusByExecuteResult(this.executeResult)
    },
    // 选中画布
    selectCanvas() {
      const canvas = this.$refs.draw.rdInfo
      if (!canvas) {
        return
      }
      this.showAttrs = true
      this.$nextTick(() => {
        // 默认选中画布
        canvas.makeSelection(canvas)
      })
    },
    changeStatusByExecuteResult(result) {
      this.handleTracks(result.tracks)
    },
    onModelSelect(model) {
      if (!this.executeResult) {
        return
      }
      if (this.canvas === model) {
        this.resultJSON = JSON.stringify(this.executeResult)
        this.formatResult()
        return
      }
      // 在执行步骤中找
      let result = this.executeResult.tracks?.find(
        (item) => item.code === model.attrs?.code
      )
      if (result) {
        this.resultJSON = JSON.stringify(result)
        this.formatResult()
      } else {
        this.resultJSON = ''
      }
    },
    formatResult() {
      const { resultEditor } = this.$refs
      resultEditor && resultEditor.formatValue()
    },
    handleTracks(tracks = []) {
      if (!tracks.length) {
        return
      }
      const canvas = this.canvas
      let model, code
      for (let i = 0, l = tracks.length; i < l; i++) {
        code = tracks[i].code
        model = canvas.models.find(
          (item) => (item.attrs && item.attrs.code) === code
        )
        if (!model) {
          continue
        }
        if (tracks[i].status === '1') {
          this.setModelStatus(
            model,
            ModelStatusEnum.Error,
            ModelStatusEnum.Executed
          )
        } else {
          this.setModelStatus(
            model,
            ModelStatusEnum.Executed,
            ModelStatusEnum.Error
          )
        }
      }
      canvas.makeSelection(model)
      canvas.focusModel(model)
    },
    setModelStatus(model, status, removeStatus) {
      model.removeStatus(removeStatus)
      model.addStatus(status)
      model.renderDelay()
      // 如果是条件节点，则获取下一级的条件项节点，并标记状态
      if (model.modelType === 'RuleCondition') {
        let nextConditionItemModels = model
          .getLines()
          ?.filter((line) => line.getStartLinkModel() === model)
          .map((line) => line.getEndLinkModel())
          .filter((nextModel) => nextModel.modelType === 'RuleConditionItem')
        nextConditionItemModels?.forEach((nextModel) =>
          this.setModelStatus(nextModel, status, removeStatus)
        )
      }
    }
  },
  mounted() {
    this.showDesign()
  }
}
</script>
<style scoped>
.ruledesigner {
  position: relative;
  overflow: hidden;
}
.layout {
  position: relative;
  display: inline-block;
  vertical-align: top;
}
.left {
  height: calc(100vh - 90px);
  width: 140px;
  border-right: 1px solid #ececec;
}
.top {
  height: 40px;
  width: 100%;
  border-right: 1px solid #ececec;

  padding-top: 4px;
  text-align: center;
}
.center {
  height: 100%;
  width: 100%;
  flex: 1;
  border-right: 1px solid #ececec;
  overflow: auto;
  background-color: rgb(249, 249, 249);
}
.right {
  width: 1px;
  height: calc(100vh - 90px);
  overflow: auto;
}
.save-button {
  float: right;
}
#saveJSONDiv {
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
