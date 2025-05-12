<template>
  <a-layout class="rule-design rule-design--dark">
    <a-layout-header class="rule-design-header ant-layout-header--small">
      <Header showButton :root-path="isTemplateEditMode ? '/template' : '/'">
        <template #right>
          <div class="float-r">
            <template v-if="rulesData.id">
              <label
                class="rule-publish-status m-r-10"
                :class="{ published: rulesData.publish }"
              >
                {{ rulesData.publish ? '已' : '未' }}发布
                <template v-if="changed">*</template>
              </label>
              <div
                class="inline-input-wrapper inline-input-wrapper--small m-r-10"
                style="width: 140px"
              >
                <label class="inline-input-label">版本</label>
                <a-select
                  v-model="rulesData.version"
                  size="small"
                  :options="versionList"
                  class="inline-input"
                  dropdown-class-name="dark"
                  @change="changeRuleVersion"
                >
                </a-select>
              </div>
            </template>
            <label v-else class="rule-publish-status m-r-10"> 未保存 * </label>
            <!-- <a-button type="primary"
                      class="rule-design-button"
                      size="small"
                      @click="showExecuteGraph">
              <a-icon type="picture" />
              <span>执行图</span>
            </a-button> -->
            <a-button
              type="primary"
              class="rule-design-button"
              size="small"
              @click="saveJson(saveDesign)"
            >
              <img class="button-icon" src="@/assets/images/save.png" />
              <span>保存</span>
            </a-button>
            <a-button
              type="primary"
              class="rule-design-button"
              size="small"
              @click="saveJson(publishEngin)"
              v-if="!isTemplateEditMode"
            >
              <img class="button-icon" src="@/assets/images/publish.png" />
              <span>发布</span>
            </a-button>
          </div>
        </template>
      </Header>
    </a-layout-header>
    <a-layout>
      <a-layout-sider
        class="rule-design-sider rule-design-sider--left"
        :width="leftPanel.width"
      >
        <RuleDesignTabs
          v-model="leftPanel.tab"
          tab-position="left"
          tab-direction="vertical"
          height="100%"
          @change="(tab) => onPanelChange(tab, leftPanel, 'width', 180)"
        >
          <RuleControlsPanel
            :controls="buttonConfig"
            @dragstart="createControlPrepare"
          ></RuleControlsPanel>
        </RuleDesignTabs>
      </a-layout-sider>
      <a-layout-content>
        <Draw ref="draw" @model-select="onModelSelect" />
      </a-layout-content>
      <a-layout-sider
        class="rule-design-sider rule-design-sider--right"
        :width="rightPanel.width"
      >
        <!-- <Attribute ref="attribute"
                   :rulesData="rulesData"
                   @jsonText="jsonText">
        </Attribute> -->

        <RuleDesignTabs
          v-model="rightPanel.tab"
          tab-position="right"
          tab-direction="vertical"
          height="100%"
          @change="(tab) => onPanelChange(tab, rightPanel, 'width', 300)"
        >
          <RuleAttributesPanel
            ref="attribute"
            :rulesData="rulesData"
            @jsonText="jsonText"
          ></RuleAttributesPanel>
        </RuleDesignTabs>
      </a-layout-sider>
    </a-layout>
    <a-layout-footer class="rule-design-footer">
      <RuleDesignTabs
        v-model="bottomPanel.tab"
        tab-position="bottom"
        :show-content="bottomPanel.open"
        :height="bottomPanel.height"
        @change="(tab) => onPanelChange(tab, bottomPanel, 'height', 360)"
      >
        <RuleExecutePanel
          ref="ruleExecutePanel"
          :disabled="debugging"
        ></RuleExecutePanel>
        <RuleDebuggerPanel ref="ruleDebuggerPanel"></RuleDebuggerPanel>
      </RuleDesignTabs>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import Draw from './designer/draw.vue'
import controlListDefine from './js/config/control'
import RDSetting from './js/ruledesigner_setting.js'
import {
  saveDesign,
  publishEngin,
  getRuleVersionList,
  getRuleByCodeAndVersion,
  checkCode
} from '../../api/rule-designer/index.js'
import { getEngineDataById } from '../../api/table/index'
import { awaitWrap } from '../../../utils/sugars'
import { uniq, cloneDeep } from 'lodash'
import Header from '../../components/Header.vue'
import ButtonWithIcon from '../../components/ButtonWithIcon.vue'
import { BUTTON_CONFIG } from './config/button-config'
import { isTempLine } from './js/components/modules/line'
import CodeEditor from './designer/code-editor'

import RuleDesignTabs from './designer/panels/tabs.vue'
import RuleExecutePanel from './designer/panels/execute.vue'
import RuleDebuggerPanel from './designer/panels/debugger.vue'
import RuleControlsPanel from './designer/panels/controls.vue'
import RuleAttributesPanel from './designer/panels/attributes.vue'
import RuleViewer from './RuleViewer.vue'

import RulePermissionSetting from '../../components/permission/rule-permission-setting.vue'

import { confirm } from '../../utils/confirm'
import { toFixed } from './js/components/modules/math'

import bus from './js/bus'
import UpgradeHandlers from './js/upgrade'
import { getShapesPosition } from './js/components/modules/shape'

import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { ConfigProvider } from 'ant-design-vue'
import { RULE_ALL_PERMISSION } from './config/permission'

const designerVersion = window.APP_VERSION

export default {
  name: 'RuleDesigner',
  extends: null,
  mixins: [],
  provide() {
    return {
      designer: this
    }
  },
  components: {
    Draw,
    Header,
    ButtonWithIcon,
    CodeEditor,
    RuleDesignTabs,
    RuleExecutePanel,
    RuleDebuggerPanel,
    RuleControlsPanel,
    RuleAttributesPanel,
    RulePermissionSetting
  },
  props: {},
  data() {
    return {
      buttonConfig: BUTTON_CONFIG,
      // 编辑状态
      loaded: false,
      changed: false,
      debugging: false,
      // 默认直接显示
      showAttrs: false,
      size: 'A4',
      direction: '1',
      activeKey: ['1', '2'],
      propertiesPanelKey: ['1'],
      // 控件ID和控件定义构成的数据
      controlMap: {},
      jsonTextArr: [],
      rulesData: {},
      templated: 0,
      versionList: [],
      layoutLeftWidth: '140px',
      rightSideWidth: 260,
      leftPanel: {
        tab: 'RuleControls',
        width: 180
      },
      rightPanel: {
        tab: 'RuleAttributes',
        width: 300
      },
      bottomPanel: {
        tab: null,
        height: 40
      }
    }
  },
  computed: {
    canvas() {
      const { draw } = this.$refs
      return draw && draw.rdInfo
    },
    // 是否模板编辑模式
    isTemplateEditMode() {
      if ('type' in this.rulesData) {
        return this.rulesData.type === 1
      }
      return this.$route.query?.type === '1'
    },
    // 是否管理员编辑
    isManager() {
      return this.$store.getLoginUser()?.rolename === 'ROLE_ADMIN'
    }
  },
  watch: {
    changed(newVal) {
      // 阻止默认离开事件
      if (newVal && this.loaded) {
        window.onbeforeunload = this.onBeforeUnload
      } else {
        window.onbeforeunload = null
      }
    }
  },
  created() {
    this.initListeners()
  },
  mounted() {
    this.loadRuleData(this.$route.query)

    // 加载控件定义到MAP中方便后续取用
    for (let i = 0; i < controlListDefine.length; i++) {
      this.controlMap[controlListDefine[i].CONTROL_ID] = controlListDefine[i]
    }

    // 钩子函数，创建控件前的校验
    window.createControlValidator = function (createModel, canvas, e) {
      // 判断开始控件，界面上只能有一个开始控件
      if (
        createModel['CONTROL_ID'] == '1000204' ||
        createModel['controlType'] == '1000204'
      ) {
        for (let i in canvas.rootModels) {
          if (
            canvas.rootModels[i]['CONTROL_ID'] == '1000204' ||
            canvas.rootModels[i]['controlType'] == '1000204'
          ) {
            console.log('只能存在一个开始控件')
            return false
          }
        }
      }
      return true
    }

    // 钩子函数，建立或修改线段连接之前的校验
    window.changeLineBeforeValidator = function (
      sourceModel,
      distModel,
      lineModel,
      canvas,
      e
    ) {
      // 如果连线结束控件为”条件项“控件，那么开始节点必须为条件控件
      if (distModel && distModel.controlType === '1000208') {
        if (sourceModel.controlType !== '1000207') {
          throw new Error('条件项控件的开始节点必须是条件控件')
        }
      }

      // 节点重复连接
      if (sourceModel && distModel) {
        let lines = sourceModel.getLines('start')
        lines.forEach((item) => {
          const endId = item.endLinkGroup.model.id
          // 不能是当前连线，不能是临时连线
          if (
            endId === distModel.id &&
            item !== lineModel &&
            !isTempLine(item)
          ) {
            throw new Error('两个节点不能直接重复连接')
          }
        })
      }

      // 判断循环连接
      if (distModel && sourceModel.findParent(distModel.id)) {
        throw new Error('节点之间不能循环连接')
      }

      // 开始节点不能作为目标节点
      if (distModel && distModel.controlType == '1000204') {
        // 不需要提示，直接改用禁用标志
        throw new Error('开始节点不能作为目标节点')
      }
      // END节点不能作为源节点
      if (sourceModel && sourceModel.controlType == '1000205') {
        // 不需要提示，直接改用禁用标志
        throw new Error('结束节点不能作为源节点')
      }
      // 节点不能直接自连接
      if (sourceModel == distModel) {
        throw new Error('节点不能直接自连接')
      }

      // TODO 其它的校验逻辑
      return true
    }
  },
  destroyed() {
    this.destroyListeners()
  },
  beforeRouteLeave(to, from, next) {
    if (this.changed || (this.loaded && !this.rulesData.id)) {
      confirm(this, {
        title: '规则未保存',
        content: '是否执行保存后离开？',
        buttons: [
          { key: 'cancel', title: '取消' },
          // this.rulesData.id ? { key: 'leave', title: '继续离开' } : null,
          { key: 'leave', title: '继续离开' },
          { key: 'saveAndLeave', title: '保存后离开', type: 'primary' }
        ],
        closable: true,
        maskClosable: true
      }).then(({ key }) => {
        if (key === 'leave') {
          this.exitDebugStatus()
          next()
        } else if (key === 'saveAndLeave') {
          this.saveJson(saveDesign).then(() => {
            this.exitDebugStatus()
            next()
          })
        }
      })
      return
    }
    this.exitDebugStatus()
    next()
  },
  methods: {
    // 发布接口
    publishEngin,
    // 保存接口
    saveDesign,
    initListeners() {
      bus.$on('save', this.onSave)
      bus.$on('canvasError', this.onCanvasError)
      bus.$on('command', this.onCommand)
      bus.$on('modelChange', this.onModelChange)
      bus.$on('modelDragend', this.onModelChange)
      bus.$on('modelLinked', this.onModelChange)
      bus.$on('modelLineChange', this.onModelChange)
      bus.$on('modelLineRemove', this.onModelLineRemove)
      bus.$on('modelLineBarChange', this.onModelChange)
      bus.$on('modelRemove', this.onModelRemove)
    },
    destroyListeners() {
      bus.$off('save', this.onSave)
      bus.$off('canvasError', this.onCanvasError)
      bus.$off('command', this.onCommand)
      bus.$off('modelChange', this.onModelChange)
      bus.$off('modelDragend', this.onModelChange)
      bus.$off('modelLinked', this.onModelChange)
      bus.$off('modelLineChange', this.onModelChange)
      bus.$off('modelLineRemove', this.onModelLineRemove)
      bus.$off('modelLineBarChange', this.onModelChange)
      bus.$off('modelRemove', this.onModelRemove)
      window.onbeforeunload = null
    },
    doubleLeftClick() {
      return
    },
    doubleRightClick() {
      this.layoutLeftWidth = '140px'
    },
    async loadRuleData({
      id,
      code,
      version,
      type,
      templateId,
      ruleCode,
      ruleVersion
    }) {
      let request
      let isCreateFromTemplate = false
      if (id) {
        request = getEngineDataById(id)
      } else {
        request = getRuleByCodeAndVersion(code, version)
      }
      let [err, data] = await awaitWrap(request)
      // 加载完成时，标记下，避免未登录导致加载数据失败时无法跳转
      if (!err) {
        this.loaded = true
      }
      this.$hideLoading()
      if (!isCreateFromTemplate && !err && data.id) {
        // 根据传入的路由参数，替换一些运行变更的信息，如规则名字，分组等
        this.changed = this.syncRouteParams(data)
        this.rulesData = data
        this.createRD(this.rulesData.designJson)
        this.loadRuleVersionList(this.rulesData.code)
        return
      }
      // 传入模板ID时，加载模板数据
      if (templateId) {
        request = getEngineDataById(templateId)
        isCreateFromTemplate = true
        ;[err, data] = await awaitWrap(request)
      } else if (ruleCode) {
        this.isCreateFromRule = true
        request = getRuleByCodeAndVersion(ruleCode, ruleVersion)
        ;[err, data] = await awaitWrap(request)
      }
      // 初始化一个画布
      this.changed = false
      if (!err && data.id) {
        // 根据传入的路由参数，替换一些运行变更的信息，如规则名字，分组等
        this.syncRouteParams(data)
        // 使用模板数据创建画布
        this.createRD(data?.designJson)
      } else {
        // 创建空白画布
        this.createRD()
      }
      this.initRuleVersionList()
      console.log('this.changed', this.changed)
    },
    initRuleVersionList() {
      let version = this.rulesData.version || this.$route.query.version
      this.versionList = [
        {
          value: version,
          label: version
        }
      ]
      // this.rulesData.version = this.versionList[0].value
    },
    async loadRuleVersionList(code) {
      // 查询版本信息
      const [err, data] = await awaitWrap(getRuleVersionList(code))
      if (err) {
        return
      }
      this.versionList = data.map((item) => ({
        value: item,
        label: item
      }))
    },
    changeRuleVersion(version) {
      let params = {
        code: this.rulesData.code || this.$route.query.code,
        version
      }
      this.loadRuleData(params)
    },
    // 创建控件，拖拽时触发
    createControlPrepare(control) {
      let controlid = control.code
      // 创建控件，缺省创建在X和Y都是100的地方
      let data = this.controlMap[controlid]
      window.tempCreateControlData = data
    },
    // 初始化规则设计器
    createRD(rdJSON) {
      // 先隐藏属性栏
      // this.showAttrs = false
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
      // 设置是否开启权限, 模板编辑不校验权限
      canvas.setPermissionEnable(!this.isTemplateEditMode)
      this.$refs.draw.rdInfo = canvas
      canvas.clickTab = this.$refs.draw.rdClick
      this.$emit('event', canvas)
      // 选中画布
      this.selectCanvas()
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
    // 获取前端的JSON
    jsonText(newValue) {
      this.jsonTextArr = newValue
    },

    getBasicMessage() {
      const data = {}
      let canvasAttrs = this.$refs.draw.rdInfo.attrs
      for (let key in canvasAttrs) {
        switch (key) {
          case 'ruleName':
            data.name = canvasAttrs[key]
            break
          case 'ruleCode':
            data.code = canvasAttrs[key]
            break
          case 'ruleVersion':
            data.version = canvasAttrs[key]
            break
          case 'ruleGroup':
            data.groupId = canvasAttrs[key]
            break
          case 'ruleURI':
            data.uri = canvasAttrs[key]
            break
          case 'ruleDesc':
            data.desc = canvasAttrs[key]
            break
        }
      }
      if (!data.name || !data.code || !data.version) {
        this.message.warning('请完善"名称"、"编码"和"版本号"信息')
        return false
      }
      // data.type = parseInt(this.templated)
      data.type = this.isTemplateEditMode ? 1 : 0
      return data
    },

    syncRouteParams(data) {
      let designJson = JSON.parse(data.designJson || '{}')
      let canvasAttrs = designJson.attrs || {}
      let { name, groupId, code } = this.$route.query || {}
      let changed = false
      if (name && data.name !== name) {
        canvasAttrs.ruleName = data.name = name
        changed = true
      }
      if (groupId && data.group_id + '' !== groupId) {
        canvasAttrs.ruleGroup = data.group_id = groupId
        changed = true
      }
      if (code && data.code !== code) {
        canvasAttrs.ruleCode = data.code = code
        canvasAttrs.ruleURI = data.uri = ''
        changed = true
      }
      // 如果是从规则中创建模板
      if (this.isCreateFromRule) {
        let models = designJson.rootModels || {}
        for (let key in models) {
          models[key].permission = RULE_ALL_PERMISSION
        }
      }
      if (changed) {
        data.designJson = JSON.stringify(designJson)
      }
      return changed
    },

    // 将json保存至后端并解析
    saveJson(api) {
      return new Promise((resolve, reject) => {
        const obj = this.getBasicMessage()
        if (!obj) {
          reject(new Error('基础信息不存在'))
          return
        }
        this.checkRuleCode({}, obj.code, (error) => {
          if (!error) {
            this._saveJson(api, obj)
              .then((res) => {
                resolve(res)
              })
              .catch((e) => {
                reject(e)
              })
            return
          }
          let errorMessage
          if (typeof error === 'string') {
            errorMessage = error
          } else if (error instanceof Error) {
            errorMessage = error.message
          }
          if (errorMessage) {
            this.message.error(
              (api === this.publishEngin ? '发布' : '保存') +
                '失败：' +
                errorMessage
            )
          }
          // 定位画布
          this.canvas.makeSelection(this.canvas)
          // 还原原始值
          this.$nextTick(() => {
            let oldRuleCode = this.rulesData.code || this.$route.query.code
            // 强行修改属性配置的值
            let attrGroups = this.$refs.attribute.showAttr
            let attrs = attrGroups[0]?.children || []
            attrs.some((attr) => {
              if (attr.CP_CODE === 'ruleCode') {
                attr.value = oldRuleCode
                this.$refs.attribute.valueChange(attr)
                return true
              }
            })
          })
          reject(new Error(errorMessage))
        })
      })
    },

    async _saveJson(api, baseInfo = {}) {
      // let rdJSON = RDSetting.toMininJSON(this.$refs.draw.rdInfo)
      let rdJSON = cloneDeep(this.$refs.draw.rdInfo.toJSON())
      rdJSON.designerVersion = designerVersion
      const designJson = {
        ...baseInfo,
        id: Number(this.rulesData.id) || null,
        publish: Number(this.rulesData.publish) || 0,
        designJson: JSON.stringify(rdJSON)
      }
      this.$showLoading()
      let apiName = api === this.publishEngin ? '发布' : '保存'
      const [err, data] = await awaitWrap(api(designJson))
      this.$hideLoading()
      if (err) {
        this.message.error(`${apiName}失败：${err.message}`)
        throw err
      }

      this.message.success(`${apiName}成功`)
      this.rulesData = data
      this.createRD(this.rulesData.designJson)
      this.changed = false
      // 重新加载版本列表
      this.loadRuleVersionList(this.rulesData.code)
      return data
    },

    onPreviewDesignJson() {
      // let json = RDSetting.toMininJSON(this.$refs.draw.rdInfo)
      let json = cloneDeep(this.$refs.draw.rdInfo.toJSON())
      json.designerVersion = designerVersion
      json = JSON.stringify(json)
      window.editing = true
      this.dialog({
        title: '设计JSON预览',
        body: (
          <div style="padding: 10px;">
            <CodeEditor
              ref="designJson"
              value={json}
              language="json"
              width="800px"
              height="480px"
              theme="dark"
            />
          </div>
        ),
        footer: false,
        theme: 'dark',
        beforeClose: (type, close) => {
          window.editing = false
          close()
        }
      })
    },

    onCommand(command) {
      switch (command) {
        case 'RuleExecute':
          this.onRuleExecute()
          break
        case 'RuleDebug':
          this.onRuleDebug()
          break
        case 'RuleDebugRestart':
          this.onRuleDebugRestart()
          break
        case 'PreviewDesignJson':
          this.onPreviewDesignJson()
          break
        case 'LayoutAlignTop':
          this.onLayoutAlignTop()
          break
        case 'LayoutAlignHorizontalCenter':
          this.onLayoutAlignHorizontalCenter()
          break
        case 'LayoutHorizontalAveraging':
          this.onLayoutHorizontalAveraging()
          break
        case 'LayoutBottomJustify':
          this.onLayoutBottomJustify()
          break
        case 'LayoutVerticalAveraging':
          this.onLayoutVerticalAveraging()
          break
        case 'LayoutRightAlignment':
          this.onLayoutRightAlignment()
          break
        case 'LayoutLeftJustify':
          this.onLayoutLeftJustify()
          break
        case 'LayoutAlignVerticalCenter':
          this.onLayoutAlignVerticalCenter()
          break
        case 'RulePermissionSetting':
          this.onRulePermissionSetting()
          break
      }
    },

    onCanvasError(e) {
      this.message.error(e.message)
    },

    onRuleExecute(e) {
      let executeFunc = () => {
        // 先打开
        this.bottomPanel.tab = 'RuleExecute'
        this.onPanelChange(
          this.bottomPanel.tab,
          this.bottomPanel,
          'height',
          360
        )
        this.$nextTick(() => {
          this.$refs.ruleExecutePanel.executeRule()
        })
      }
      // 是否修改过
      if (this.changed || !this.rulesData.id) {
        confirm(this, {
          title: '规则未保存',
          content: '是否执行保存后执行规则？',
          buttons: [
            { key: 'cancel', title: '取消' },
            this.rulesData.id ? { key: 'execute', title: '继续执行' } : null,
            { key: 'saveAndExecute', title: '保存后执行', type: 'primary' }
          ],
          closable: true,
          maskClosable: true
        }).then(({ key }) => {
          if (key === 'execute') {
            executeFunc()
          } else if (key === 'saveAndExecute') {
            this.saveJson(saveDesign).then(() => {
              executeFunc()
            })
          }
        })
        return
      }
      // 先打开
      executeFunc()
    },

    onRuleDebug() {
      let debugFunc = () => {
        // 先打开
        this.bottomPanel.tab = 'RuleDebugger'
        this.onPanelChange(
          this.bottomPanel.tab,
          this.bottomPanel,
          'height',
          360
        )
        this.$nextTick(() => {
          this.$refs.ruleDebuggerPanel.debugRule()
        })
      }
      // 是否修改过
      if (this.changed || !this.rulesData.id) {
        confirm(this, {
          title: '规则未保存',
          content: '是否执行保存后调试规则？',
          buttons: [
            { key: 'cancel', title: '取消' },
            this.rulesData.id ? { key: 'debug', title: '继续调试' } : null,
            { key: 'saveAndDebug', title: '保存后调试', type: 'primary' }
          ],
          closable: true,
          maskClosable: true
        }).then(({ key }) => {
          if (key === 'debug') {
            debugFunc()
          } else if (key === 'saveAndDebug') {
            this.saveJson(saveDesign).then(() => {
              debugFunc()
            })
          }
        })
        return
      }
      // 先打开
      debugFunc()
    },

    onRuleDebugRestart() {
      this.bottomPanel.tab = 'RuleDebugger'
      this.onPanelChange(this.bottomPanel.tab, this.bottomPanel, 'height', 360)
      this.$nextTick(() => {
        this.$refs.ruleDebuggerPanel.restartDebugRule()
      })
    },

    onPanelChange(tab, panel, sizeField, defaulSize = 300, minSize = 40) {
      let oldSize = panel[sizeField]
      if (!tab) {
        panel['_' + sizeField] = panel[sizeField]
        panel[sizeField] = minSize
      } else if (panel[sizeField] === minSize) {
        panel[sizeField] = panel['_' + sizeField] || defaulSize
      }
      let newSize = panel[sizeField]
      if (oldSize !== newSize) {
        // 需要等待动画效果执行完成
        setTimeout(() => {
          // 触发画布大小计算
          const { canvas } = this
          canvas && canvas.autoSize()
        }, 200)
      }
    },

    onSave(e) {
      e.preventDefault()
      this.saveJson(saveDesign)
    },

    // 上对齐
    onLayoutAlignTop() {
      const { canvas } = this
      let models = canvas.getSelectedModels()
      if (models.length < 2) {
        this.message.warning('请选择两个及以上节点')
        return
      }
      // 获取顶点位置
      let outRectShape = getShapesPosition(...models)
      // 带自动排版的对齐
      // let offsetX = 0
      // let marginX = 40
      // // 先按照x排序, 设置每个模型的位置
      // models.sort((a, b) => a.x - b.x).forEach(model => {
      //   model.y = model.attrs.y = outRectShape.y
      //   if (model.x < offsetX) {
      //     model.x = offsetX + marginX
      //   }
      //   // 记录偏移量
      //   offsetX = model.x + model.width
      //   model.renderDelay()
      // })
      models.forEach((model) => {
        model.y = model.attrs.y = outRectShape.y
        model.renderDelay()
      })
      // 更新框选位置
      canvas.auxRect.setModels(models)
    },
    // 中对齐
    onLayoutAlignHorizontalCenter() {
      const { canvas } = this
      let models = canvas.getSelectedModels()
      if (models.length < 2) {
        this.message.warning('请选择两个及以上节点')
        return
      }
      // 获取顶点位置
      let outRectShape = getShapesPosition(...models)
      // 设置每个模型的位置
      models.forEach((model) => {
        model.y = model.attrs.y =
          outRectShape.y + outRectShape.height / 2 - model.height / 2
        model.renderDelay()
      })
      // 更新框选位置
      canvas.auxRect.setModels(models)
    },
    // 水平均分
    onLayoutHorizontalAveraging() {
      const { canvas } = this
      let models = canvas.getSelectedModels()
      if (models.length < 2) {
        this.message.warning('请选择两个及以上节点')
        return
      }
      // 获取顶点位置
      let outRectShape = getShapesPosition(...models)
      let l = models.length
      let totalWidth = 0
      models.forEach((item) => {
        totalWidth += item.width
      })
      // 计算分布
      let offsetX = toFixed((outRectShape.width - totalWidth) / (l - 1), 2)
      let currentX = 0
      // 设置每个模型的位置
      models
        .sort((a, b) => a.x - b.x)
        .forEach((model, i) => {
          if (i === 0 || i === l - 1) {
            currentX = model.x + model.width
            return
          }
          model.x = model.attrs.x = currentX + offsetX
          currentX = model.x + model.width
          model.renderDelay()
        })
      // 更新框选位置
      canvas.auxRect.setModels(models)
    },
    // 下对齐
    onLayoutBottomJustify() {
      const { canvas } = this
      let models = canvas.getSelectedModels()
      if (models.length < 2) {
        this.message.warning('请选择两个及以上节点')
        return
      }
      // 获取顶点位置
      let outRectShape = getShapesPosition(...models)
      // 设置每个模型的位置
      models.forEach((model) => {
        model.y = model.attrs.y =
          outRectShape.y + outRectShape.height - model.height
        model.renderDelay()
      })
      // 更新框选位置
      canvas.auxRect.setModels(models)
    },
    // 垂直均分
    onLayoutVerticalAveraging() {
      const { canvas } = this
      let models = canvas.getSelectedModels()
      if (models.length < 2) {
        this.message.warning('请选择两个及以上节点')
        return
      }
      // 获取顶点位置
      let outRectShape = getShapesPosition(...models)
      let l = models.length
      let totalHeight = 0
      models.forEach((item) => {
        totalHeight += item.height
      })
      // 计算分布
      let offsetY = toFixed((outRectShape.height - totalHeight) / (l - 1), 2)
      let currentY = 0
      // 设置每个模型的位置
      models
        .sort((a, b) => a.y - b.y)
        .forEach((model, i) => {
          if (i === 0 || i === l - 1) {
            currentY = model.y + model.height
            return
          }
          model.y = model.attrs.height = currentY + offsetY
          currentY = model.y + model.height
          model.renderDelay()
        })
      // 更新框选位置
      canvas.auxRect.setModels(models)
    },
    // 右对齐
    onLayoutRightAlignment() {
      const { canvas } = this
      let models = canvas.getSelectedModels()
      if (models.length < 2) {
        this.message.warning('请选择两个及以上节点')
        return
      }
      // 获取顶点位置
      let outRectShape = getShapesPosition(...models)
      // 设置每个模型的位置
      models.forEach((model) => {
        model.x = model.attrs.x =
          outRectShape.x + outRectShape.width - model.width
        model.renderDelay()
      })
      // 更新框选位置
      canvas.auxRect.setModels(models)
    },
    // 左对齐
    onLayoutLeftJustify() {
      const { canvas } = this
      let models = canvas.getSelectedModels()
      if (models.length < 2) {
        this.message.warning('请选择两个及以上节点')
        return
      }
      // 获取顶点位置
      let outRectShape = getShapesPosition(...models)
      // 设置每个模型的位置
      models.forEach((model) => {
        model.x = model.attrs.x = outRectShape.x
        model.renderDelay()
      })
      // 更新框选位置
      canvas.auxRect.setModels(models)
    },
    // 居中
    onLayoutAlignVerticalCenter() {
      const { canvas } = this
      let models = canvas.getSelectedModels()
      if (models.length < 2) {
        this.message.warning('请选择两个及以上节点')
        return
      }
      // 获取顶点位置
      let outRectShape = getShapesPosition(...models)
      // 设置每个模型的位置
      models.forEach((model) => {
        model.x = model.attrs.x =
          outRectShape.x + outRectShape.width / 2 - model.width / 2
        model.renderDelay()
      })
      // 更新框选位置
      canvas.auxRect.setModels(models)
    },

    onRulePermissionSetting() {
      let json = JSON.stringify(
        Object.assign({}, this.$refs.draw.rdInfo.toJSON(), {
          designerVersion
        })
      )
      let _json = json
      let onPermissionChange = (newVal) => {
        _json = newVal
      }
      this.dialog({
        title: '权限设置',
        body: (
          <ConfigProvider locale={zhCN}>
            <RulePermissionSetting
              ref="permissionSetting"
              value={json}
              onchange={onPermissionChange}
              theme="dark"
              style="width: 800px;"
              height={400}
            />
          </ConfigProvider>
        ),
        negativeBtnText: '',
        theme: 'dark',
        beforeClose: (type, close) => {
          if (type === 'confirm') {
            // 设置新的画布
            this.createRD(_json)
            this.changed = true
            close()
          } else {
            close()
          }
        },
        onClose: this.onDialogClose
      })
    },

    onModelSelect(model) {
      this.$refs.attribute.setModel(model)
    },

    onModelChange() {
      this.changed = true
    },

    onModelRemove(model) {
      this.changed = true
    },

    onModelLineRemove(line) {
      this.changed = true
      // 检查聚合状态
      this.checkModelTogether(line.startLinkGroup && line.startLinkGroup.model)
      this.checkModelTogether(line.endLinkGroup && line.endLinkGroup.model)
    },

    onBeforeUnload(e) {
      return false
    },

    checkRuleCode(rule, value, callback) {
      let ruleId = this.rulesData.id
      if (!value || !value.trim()) {
        callback(new Error('规则编码是必填项'))
        return
      }
      checkCode(value, ruleId)
        .then((res) => {
          if (res) {
            callback(new Error('规则编码已存在'))
          } else {
            callback()
          }
        })
        .catch((e) => {
          console.error(e)
          callback(new Error('规则编码校验失败'))
        })
    },

    checkModelTogether(model) {
      const { canvas } = this
      // 模型不在画布中则跳过
      if (model.baseModelType === 'Activity' && !canvas.includeModel(model)) {
        return
      }
      // 获取连接了多少条线
      if (model.getLines('end').length < 2) {
        // 强制设置为非聚合节点
        model.together = model.attrs.together = 'n'
      }
    },

    exitDebugStatus() {
      if (this.debugging) {
        let { ruleDebuggerPanel } = this.$refs
        ruleDebuggerPanel && ruleDebuggerPanel.onExecuteStop()
      }
    },

    showExecuteGraph() {
      this.dialog({
        title: '设计JSON预览',
        // 采用弹框时，一定要传入数据
        body: (
          <RuleViewer
            code={this.rulesData.code}
            version={this.rulesData.version}
            width="1000px"
            height="640px"
            theme="dark"
          ></RuleViewer>
        ),
        footer: false,
        theme: 'dark'
      })
    }
  }
}
</script>

<style lang="less"></style>
