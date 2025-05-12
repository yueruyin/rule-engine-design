<template>
  <div class="attribute">
    <div class="title-container p-10">
      <span>{{ tabInitName }}</span>
    </div>
    <div class="content-container p-b-20">
      <template v-for="(group) in showAttr">
        <div v-if="group.visiable != 0"
             :key="group.name"
             :header="group.name">
          <template v-for="attr in group.children">
            <div v-if="attr.visiable != 0 && (!attr.vif || attr.vif(designer, ruleCanvasData))"
                 class="attr-box"
                 :key="attr.CP_ID">
              <div class="title"
                   v-if="attr.CP_NAME != 'CODE'">
                <div class="attr-name"
                     v-if="attr.CP_NAME != 'NONE'&& attr.CP_CONTROL_TYPE != 'text'">
                  {{ attr.CP_NAME }}
                </div>
                <!-- 文本框 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'text'"
                     v-show="attr.CP_NAME!='CODE'">
                  <a-input v-model="attr.value"
                           :disabled="formDisabled || !!attr.READONLY"
                           class="attr-input"
                           @change="valueChange(attr)"
                           @focus="enterEditing()"
                           @blur="exitEditing()">
                    <span class="input-label"
                          slot="prefix">{{ attr.CP_NAME }}</span>
                  </a-input>
                </div>
                <!-- 数字框 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'inputnumber'"
                     v-show="attr.CP_NAME!='CODE'">
                  <a-input-number v-model="attr.value"
                                  style="width:90px"
                                  @change="valueChange(attr)"
                                  @focus="enterEditing()"
                                  step="1"
                                  @blur="exitEditing()"
                                  :disabled="formDisabled || !!attr.READONLY"
                                  :min="0"
                                  :max="10">
                  </a-input-number>
                </div>

                <!-- 弹出窗按钮-->
                <div v-if="attr.CP_CONTROL_TYPE == 'ejectButton'">
                  <button @click="handleButtonClick(attr)"
                          data-v-6073c6a4=""
                          type="button"
                          class="ant-btn ant-btn-sm execute-button"
                          style="width: 100%;"
                          ant-click-animating-without-extra-node="false">
                    <i aria-label="图标: plus"
                       class="anticon anticon-plus">
                      <svg viewBox="64 64 896 896"
                           data-icon="plus"
                           width="1em"
                           height="1em"
                           fill="currentColor"
                           aria-hidden="true"
                           focusable="false"
                           class="">
                        <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
                        <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
                      </svg>
                    </i>
                    <span>编辑{{ attr.CP_NAME }}</span>
                  </button>
                </div>
                <!-- 按钮 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'addButton'">
                  <ul style=" font-size: 500%; margin-left: 100px; color: #e6e6fa; ">
                    <i class="a-icon-plus"></i>
                  </ul>
                </div>
                <!-- 大文本框 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'textarea'">
                  <a-input class="textarea"
                           type="textarea"
                           v-model="attr.value"
                           @change="valueChange(attr)"
                           @focus="enterEditing()"
                           @blur="exitEditing()"
                           :rows="3"
                           :disabled="formDisabled || !!attr.READONLY" />
                </div>
                <!-- 单选框 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'radio'">
                  <a-radio-group @change="valueChange(attr,$event)"
                                 :value="attr.value"
                                 :disabled="formDisabled || !!attr.READONLY"
                                 button-style="solid">
                    <a-radio-button :value="a.value"
                                    :key="a.value"
                                    :disabled="a.disabled"
                                    v-for="a in attr.dataSource">
                      {{ a.text }}
                    </a-radio-button>
                  </a-radio-group>
                </div>
                <!-- 下拉框 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'combo'">
                  <a-select @change="valueChange(attr,$event)"
                            style="width: 170px"
                            :value="attr.value"
                            :disabled="formDisabled || !!attr.READONLY"
                            button-style="solid">
                    <a-select-option :value="a.value"
                                     :key="a.value"
                                     v-for="a in attr.dataSource">
                      {{ a.text }}
                    </a-select-option>
                  </a-select>
                </div>
                <!-- 复选框 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'checkbox'">
                  <a-checkbox-group @change="valueChange(attr)"
                                    v-model="attr.value"
                                    :disabled="formDisabled || !!attr.READONLY">
                    <a-checkbox v-for="a in attr.dataSource"
                                :key="a.value"
                                :value="a.value"
                                :label="a.text"></a-checkbox>
                  </a-checkbox-group>
                </div>
                <!-- switch切换-->
                <div v-if="attr.CP_CONTROL_TYPE == 'switch'">
                  <a-switch @change="valueChange(attr)"
                            :checked="attr.value == '2'"
                            :disabled="formDisabled || !!attr.READONLY">
                    <a-icon slot="checkedChildren"
                            type="check" />
                    <a-icon slot="unCheckedChildren"
                            type="close" />
                  </a-switch>

                </div>

                <!-- tableEditor -->
                <div v-if="attr.CP_CONTROL_TYPE == 'table-editor'">
                  <ExecuteTableEditor v-model="attr.value"
                                      :columns="paramColumns"
                                      :row-selection="{ columnWidth: '24px' }"
                                      :disabled="formDisabled || !!attr.READONLY"
                                      theme="dark"
                                      @change="($event) => valueChange(attr, $event)"
                                      @focus="enterEditing()"
                                      @blur="exitEditing()"></ExecuteTableEditor>
                </div>

                <!-- ruleResultEditor -->
                <div v-if="attr.CP_CONTROL_TYPE == 'rule-result-editor'">
                  <RuleResultEditor v-model="attr.value"
                                    theme="dark"
                                    class="execute-button"
                                    style="width: 100%;"
                                    :disabled="formDisabled || !!attr.READONLY"
                                    :load-result-arguments="loadResultArguments"
                                    @change="($event) => valueChange(attr, $event)"
                                    @focus="enterEditing()"
                                    @blur="exitEditing()"></RuleResultEditor>
                </div>

                <!-- 分组树 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'group-select-tree'">
                  <GroupSelectTree v-model="attr.value"
                                   theme="dark"
                                   :disabled="formDisabled || !!attr.READONLY"
                                   @change="($event) => valueChange(attr, $event)"
                                   @focus="enterEditing()"
                                   @blur="exitEditing()"></GroupSelectTree>
                </div>

                <!-- 标签选择 -->
                <div v-if="attr.CP_CONTROL_TYPE == 'select-tag'">
                  <SelectTag v-model="attr.value"
                             theme="dark"
                             :disabled="formDisabled || !!attr.READONLY"
                             class="full-w"
                             @change="($event) => valueChange(attr, $event)"
                             @focus="enterEditing()"
                             @blur="exitEditing()"></SelectTag>
                </div>
              </div>
            </div>
          </template>
          <template v-if="designer?.isTemplateEditMode && ruleCanvasData?.modelType !== 'RuleCanvas' && ruleCanvasData?.modelType !== 'RDLine'">
            <div class="attr-box"
                 key="permission">
              <div class="title">
                <div class="attr-name">
                  权限
                </div>
                <div>
                  <RulePermissionCheckbox v-model="permission"
                                          :rules="permissionRules"
                                          theme="dark"
                                          @change="onPermissionChange"></RulePermissionCheckbox>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import bus from '../../js/bus.js'
import propertiesListDefine from '../../js/config/properties.js'
import ConditionItem from '../condition-item/ConditionItem.vue'
import SqlItem from '../sql-item/SqlItem'
import HttpItem from '../http-item/HttpItem'
import JsonItem from '../json-item/JsonItem'
import RuleCallConfig from '../rule-call/index.vue'
import ActionEdit from '../action-edit/ActionEdit.vue'
import Formula from '../formula/Formula.vue'
import ExecuteTableEditor from '../table-editor'
import RuleResultEditor from '../rule-result'
import GroupSelectTree from '../../../table/components/SelectTree'
import SelectTag from '../../../table/components/SelectTag.vue'
import RDSetting from '../../js/ruledesigner_setting.js'
import RulePermissionCheckbox from '../../../../components/permission/checkbox.vue'
import { checkArgment, checkArgments } from '../../../../utils/checkArgments'

import PanelMixin from './mixins/panel'
import { get as getByPath, cloneDeep, isString, isFunction } from 'lodash'
import { isEmpty } from '../../js/components/modules/common'
import {
  RULE_PERMISSION_ENUM,
  RULE_PERMISSION_OPTIONS
} from '../../config/permission'

const defaultValidator = function (rule, value, callback) {
  callback()
}

// 处理配置信息
const handlePropertiesListDefine = function (define = {}, designer) {
  define = cloneDeep(define)
  for (let key in define) {
    if (!define[key]) {
      continue
    }
    define[key].forEach((group) => {
      group.children = group.children || []
      group.children.forEach((field) => {
        if (!field.rules) {
          return
        }
        field.rules.forEach((rule) => {
          if (rule.validator && isString(rule.validator)) {
            rule.validator = designer[rule.validator] || defaultValidator
          }
          if (!isFunction(rule.validator)) {
            rule.validator = defaultValidator
          }
        })
      })
    })
  }
  return define
}

export default {
  name: 'RuleAttributes',
  mixins: [PanelMixin],
  components: {
    ExecuteTableEditor,
    RuleResultEditor,
    GroupSelectTree,
    SelectTag,
    RulePermissionCheckbox
  },
  panel: {
    id: 'RuleAttributes',
    title: '属性',
    icon: {
      type: 'bars',
      color: 'inherit'
    }
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    rulesData: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    item: function (newvalue) {
      this.data = newvalue
    }
  },
  data() {
    let propertiesDefine = handlePropertiesListDefine(
      propertiesListDefine,
      this.designer
    )
    return {
      tabInitName: '规则信息',
      propertiesDefine,
      showAttr: propertiesDefine['999'],
      value: '',
      data: [],
      childItem: [],
      conditionData: [],
      change: [],
      conditionSetValue: '',
      ruleCanvasData: {},
      permission: 0,
      permissionRules: RULE_PERMISSION_OPTIONS,
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
        }
      ]
    }
  },
  computed: {
    nodeEditable() {
      return (
        !this.ruleCanvasData?.checkPermission ||
        this.ruleCanvasData?.checkPermission(RULE_PERMISSION_ENUM.MODIFY)
      )
    },
    formDisabled() {
      return !this.nodeEditable
    }
  },
  mounted() {
    this.setBasicMessage()
    this.initAttrs()
    // 接收showAttr触发this.show()
    // bus.$on('showAttr', (data) => {
    //   this.ruleCanvasData = data
    //   this.show(data)
    //   this.setControlState(data)
    // })
  },

  methods: {
    setModel(data) {
      this.ruleCanvasData = data
      this.permission = data.options?.permission
      this.show(data)
      this.setControlState(data)
    },
    // 聚合节点动态disabled
    setControlState(data) {
      let togetherCount = 0
      const linkGroups = data.rd?.linkGroups
      if (!isEmpty(linkGroups)) {
        for (let [, value] of Object.entries(linkGroups)) {
          value.lines.forEach((item) => {
            if (item.endLinkGroup.model.id === data.id) {
              togetherCount++
            }
          })
        }
      }
      if (togetherCount < 4) {
        this.showAttr[0].children.forEach((item) => {
          if (item.CP_CODE === 'together') {
            item.dataSource[0].disabled = true
          }
        })
      }
    },
    computedDefaultData() {
      if (!isEmpty(this.rulesData)) {
        return this.rulesData
      } else {
        return this.$route.query
      }
    },
    // 设置基础信息
    setBasicMessage() {
      const query = this.computedDefaultData()
      const designJson = JSON.parse(query.designJson || '{ "attrs": {} }')
      this.showAttr[0].children.forEach((item) => {
        switch (item.CP_CODE) {
          case 'ruleName':
            item.value = query.name
            break
          case 'ruleCode':
            item.value = query.code
            break
          case 'ruleVersion':
            item.value = query.version
            break
          case 'ruleGroup':
            item.value = query.groupId
            break
          case 'ruleURI':
            item.value = query.URI
            break
          case 'ruleDesc':
            item.value = query.desc
            break
          case 'ruleArguments':
            item.value = designJson.attrs[item.CP_CODE] || item.DEFAULVALUE
            break
        }
      })
    },
    /**
     * 获取控件值，显示到规则属性条件设置框
     */
    sendRemarkText(value) {
      for (let item of this.showAttr) {
        for (let attr of item.children) {
          if (attr.CP_CODE == 'conditionText') {
            attr.value = value
            this.valueChange(attr)
          }
        }
      }
    },
    /**
     * 发生json文本到后端
     */
    getJsonText(value) {
      this.$emit('jsonText', value)
    },
    /**
     * 进入编辑状态
     */
    enterEditing() {
      window.editing = true
    },

    /**
     * 退出编辑状态
     */
    exitEditing() {
      window.editing = false
      this.canvas?.focus()
    },

    onBlur(e, attr) {
      // 判断
      if (attr.rules) {
        const callback = function (error) {
          if (!error) {
            this.executeHttp()
            attr.errorMessage = ''
            attr.showError = false
            return
          }
          if (isString(error)) {
            attr.errorMessage = error
            attr.showError = true
          } else if (error instanceof Error) {
            attr.errorMessage = error.message
            attr.showError = true
          }
        }
        // 责任链执行
        attr.rules.some((rule) => {
          if (
            rule.validator &&
            rule.validator(rule, attr.value, callback, attr, this.designer)
          ) {
          }
        })
      } else {
        this.exitEditing()
      }
    },

    initAttrs() {
      window.allAttr = this.propertiesDefine
    },
    // 更新条件项组件数据
    updateConditionComponent(result) {
      let attrObj = {
        code: 'text',
        datatype: 'text',
        value: result.text,
        groupname: '条件项属性'
      }
      this.designer.$refs.draw.setAttr(attrObj)
    },
    // 点击按钮
    handleButtonClick(attr) {
      // 条件项控件
      if (attr.CONTROL_ID === '1000208') {
        this.openConditionItem()
      }
      // 执行控件
      if (attr.CONTROL_ID === '1000206') {
        this.openActionDialog()
      }
      // 计算控件
      if (attr.CONTROL_ID === '1000209') {
        this.openComputedDialog()
      }
      // SQL控件
      if (attr.CONTROL_ID === '1000210') {
        this.openSqlContentDialog()
      }
      // Http控件
      if (attr.CONTROL_ID === '1000211') {
        this.openHttpContentDialog()
      }
      // RuleCall控件
      if (attr.CONTROL_ID === '1000301') {
        this.openRuleCallContentDialog()
      }
      // Json控件
      if (attr.CONTROL_ID === '1000212') {
        this.openJsonContentDialog()
      }
    },
    // 更新计算控件的值
    updateComputedComponent(result) {
      let attrObj = {
        code: 'text',
        datatype: 'text',
        value: result.expression,
        groupname: '规则属性'
      }
      this.designer.$refs.draw.setAttr(attrObj)
    },
    // 更新节点内容显示
    updateNodeText(text) {
      if (text) {
        this.updateComputedComponent({
          expression: text
        })
      }
    },
    // 打开计算公式弹窗
    openComputedDialog() {
      const expressionObj = {
        expression: this.ruleCanvasData.attrs.expression,
        expressionArguments: this.ruleCanvasData.attrs.expressionArguments
      }
      window.editing = true
      this.dialog({
        title: '计算公式配置',
        body: (
          <Formula
            ref="Formula"
            expressionObj={expressionObj}
            controlName={this.ruleCanvasData.attrs.name}
            ruleNode={this.ruleCanvasData}
            disabled={this.formDisabled}
          />
        ),
        negativeBtnText: '',
        theme: 'dark',
        beforeClose: (type, close) => {
          if (type === 'confirm' && !this.formDisabled) {
            const result = this.$refs.Formula.submit()
            if (result) {
              if (!checkArgment(result.expressionArguments)) {
                this.message.error('变量不能包含特殊字符')
                return
              }
              this.emitChangeEvent()
              this.ruleCanvasData.attrs.expression = result.expression
              this.ruleCanvasData.attrs.expressionArguments =
                result.expressionArguments
              this.showAttr[0].children.forEach((item) => {
                if (item.CP_CODE === 'text') {
                  item.value = result.expression
                }
              })
              this.updateNodeText(result.expression)
              window.editing = false
              close()
            }
          } else {
            window.editing = false
            close()
          }
        }
      })
    },
    onDialogClose() {
      window.editing = false
      console.log('this.canvas', this.canvas)
      this.canvas?.focus()
    },
    // 打开执行控件配置弹窗
    openActionDialog() {
      const execute = this.ruleCanvasData.attrs.execute || {}
      window.editing = true
      this.dialog({
        title: '执行配置',
        body: (
          <ActionEdit
            ref="ActionEdit"
            execute={execute}
            data={this.ruleCanvasData}
            disabled={this.formDisabled}
            onupdate:visible={this.onDialogClose}
          />
        ),
        negativeBtnText: '',
        theme: 'dark',
        beforeClose: (type, close) => {
          if (type === 'confirm' && !this.formDisabled) {
            const result = this.$refs.ActionEdit.submit()
            if (result) {
              this.emitChangeEvent()
              const obj = Object.assign(result, { executeType: 'serial' })
              this.ruleCanvasData.attrs.execute = obj
              // this.updateNodeText(result.executeCustom)
              // 通知图形更新
              this.ruleCanvasData.renderDelay()
              close()
            }
          } else {
            close()
          }
        },
        onClose: this.onDialogClose
      })
    },
    // 打开条件项弹窗
    openConditionItem() {
      this.$nextTick(() => {
        window.editing = true
        this.dialog({
          title: '条件项',
          body: (
            <ConditionItem
              ref="ConditionItem"
              data={this.ruleCanvasData}
              disabled={this.formDisabled}
            />
          ),
          negativeBtnText: '',
          theme: 'dark',
          beforeClose: (type, close) => {
            if (type === 'confirm' && !this.formDisabled) {
              const result = this.$refs.ConditionItem.submit()
              if (result) {
                this.emitChangeEvent()
                this.ruleCanvasData.attrs.conditionJson = result.data
                this.showAttr[0].children.forEach((item) => {
                  if (item.CP_CODE === 'conditionText') {
                    item.value = result.text
                  }
                })
                this.updateNodeText(result.text)
                close()
              }
            } else {
              close()
            }
          },
          onClose: this.onDialogClose
        })
      })
    },
    // 打开sql内容编辑弹出框
    openSqlContentDialog() {
      this.$nextTick(() => {
        window.editing = true
        this.dialog({
          title: 'SQL编辑',
          body: (
            <SqlItem
              ref="SqlItem"
              data={this.ruleCanvasData}
              disabled={this.formDisabled}
            />
          ),
          negativeBtnText: '',
          theme: 'dark',
          beforeClose: (type, close) => {
            if (type === 'confirm' && !this.formDisabled) {
              this.$refs.SqlItem.submit().then((result) => {
                if (!checkArgments(result.result, 'title')) {
                  this.message.error('变量名称不能为空或包含特殊字符!')
                  return
                }
                if (result) {
                  this.emitChangeEvent()
                  // 合并属性
                  const { attrs } = this.ruleCanvasData
                  let executeSql = {}
                  executeSql.dataBase = result.dataBase || null
                  executeSql.sql = result.sql || null
                  executeSql.result = result.result || []
                  executeSql.arguments = result.arguments || null
                  attrs.executeSql = executeSql
                  // this.updateNodeText(executeSql.sql)
                  this.ruleCanvasData.renderDelay()
                  close()
                }
              })
            } else {
              close()
            }
          },
          onClose: this.onDialogClose
        })
      })
    },
    // 打开Http内容编辑弹出框
    openHttpContentDialog() {
      this.$nextTick(() => {
        window.editing = true
        this.dialog({
          title: '请求参数编辑',
          body: (
            <HttpItem
              ref="HttpItem"
              data={this.ruleCanvasData}
              disabled={this.formDisabled}
            />
          ),
          negativeBtnText: '',
          theme: 'dark',
          beforeClose: (type, close) => {
            if (type === 'confirm' && !this.formDisabled) {
              this.$refs.HttpItem.submit().then((result) => {
                var b = false
                if (result.result) {
                  b = !checkArgments(result.result, 'title')
                }
                if (result.query.length > 0 && !b) {
                  b = !checkArgments(result.query, 'key')
                }
                if (result.header.length > 0 && !b) {
                  b = !checkArgments(result.header, 'key')
                }
                if (b) {
                  this.message.error('变量名称不能为空或包含特殊字符!')
                  return
                }
                if (result) {
                  this.emitChangeEvent()
                  // 合并属性
                  const { attrs } = this.ruleCanvasData
                  let executeHttp = {}
                  executeHttp.system = result.system || null
                  executeHttp.url = result.url || null
                  executeHttp.method = result.method || null
                  executeHttp.query = result.query || null
                  executeHttp.body = result.body || null
                  executeHttp.header = result.header || null
                  executeHttp.result = result.result || []
                  executeHttp.arguments = result.arguments || null
                  attrs.executeHttp = executeHttp
                  // this.updateNodeText(executeHttp.url)
                  this.ruleCanvasData.renderDelay()
                  close()
                }
              })
            } else {
              close()
            }
          },
          onClose: this.onDialogClose
        })
      })
    },
    // 打开RuleCall内容编辑弹出框
    openRuleCallContentDialog() {
      this.$nextTick(() => {
        window.editing = true
        this.dialog({
          title: '调用参数编辑',
          body: (
            <RuleCallConfig
              ref="ruleCall"
              data={this.ruleCanvasData}
              ignore-keys={this.rulesData ? [this.rulesData.code] : []}
              disabled={this.formDisabled}
            />
          ),
          negativeBtnText: '',
          theme: 'dark',
          beforeClose: (type, close) => {
            if (type === 'confirm' && !this.formDisabled) {
              this.$refs.ruleCall.submit().then((result) => {
                let b = false
                if (result.result) {
                  b = !checkArgments(result.result, 'title')
                }
                if (result.arguments.length > 0 && !b) {
                  b = !checkArgments(result.arguments, 'key')
                }
                if (b) {
                  this.message.error('变量名称不能为空或包含特殊字符!')
                  return
                }
                if (result) {
                  this.emitChangeEvent()
                  // 合并属性
                  const { attrs } = this.ruleCanvasData
                  attrs.executeCallRule = cloneDeep(result)
                  // this.updateNodeText(result.ruleName || '子规则')
                  this.ruleCanvasData.renderDelay()
                  close()
                }
              })
            } else {
              close()
            }
          },
          onClose: this.onDialogClose
        })
      })
    },
    // 打开Json内容编辑弹出框
    openJsonContentDialog() {
      this.$nextTick(() => {
        window.editing = true
        this.dialog({
          title: 'JSON设置',
          body: (
            <JsonItem
              ref="jsonItem"
              data={this.ruleCanvasData}
              disabled={this.formDisabled}
            />
          ),
          negativeBtnText: '',
          theme: 'dark',
          beforeClose: (type, close) => {
            if (type === 'confirm' && !this.formDisabled) {
              this.$refs.jsonItem.submit().then((result) => {
                if (result) {
                  this.emitChangeEvent()
                  // 合并属性
                  const { attrs } = this.ruleCanvasData
                  attrs.executeJson = cloneDeep(result)
                  this.ruleCanvasData.renderDelay()
                  close()
                }
              })
            } else {
              close()
            }
          },
          onClose: this.onDialogClose
        })
      })
    },
    checkArgments(items) {
      items.forEach((item) => {
        if (!this.$refs.Formula.checkArgment(item['key'])) {
          return false
        }
      })
      return true
    },
    // 弹出属性框，显示属性
    show(data) {
      // 取得控件类型
      let controlType = data.controlType
      // 取得控件的属性定义
      this.showAttr = cloneDeep(window.allAttr[controlType])
      if (!this.showAttr || this.showAttr.size == 0) {
        this.showAttr = [{ name: '属性', children: [] }]
        console.warn('属性不存在')
        return
      }
      this.showGroupAttrValue(this.showAttr, data)

      this.tabInitName = this.showAttr[0].name

      this.$forceUpdate()
    },

    showGroupAttrValue: function (showAttrs, data) {
      // 循环控件的属性定义，结合控件的实际属性，显示属性列表
      for (let i = 0; i < showAttrs.length; i++) {
        // 属性列表的第一级是属性分组
        let group = showAttrs[i]
        // 循环分组下的属性
        for (let j = 0; j < group.children.length; j++) {
          // 设置属性模型的值，如果在【控件.属性表.属性】下有值，就用,否则就用【控件.属性】的值
          let item = group.children[j]
          // 获取绑定的字段
          let field = (item.CP_PATH ? item.CP_PATH + '.' : '') + item.CP_CODE
          // 取得属性已设置的值
          item.value = getByPath(data, field, item.value)
          // 取得属性的缺省值
          if (isEmpty(item.value)) {
            let defaultValue = item.DEFAULVALUE
            if (
              defaultValue !== null &&
              defaultValue !== undefined &&
              defaultValue !== ''
            ) {
              item.value = defaultValue
            }
          }

          // 对checkbox控件进行特殊处理
          if (item.CP_CONTROL_TYPE == 'checkbox') {
            item.value = item.value
              ? item.value
              : item.DEFAULVALUE
              ? item.DEFAULVALUE.split(',')
              : []
          }

          // 如果从【控件.属性表.属性】以及【控件.属性】中，得到的都是undefined，则将其转换为空值
          if (item.value === undefined) {
            item.value = null
          }
          if (!item.dataSource) {
            let type = item.CP_CONTROL_TYPE
            if (
              type == 'radio' ||
              type == 'checkbox' ||
              type == 'combo' ||
              type == 'switchGroup' ||
              type == 'timer' ||
              type == 'ejectButton'
            ) {
              item.dataSource = item.CP_DATA_SOURCE
            }
          }

          // 给模型的option设置值
          data.setOption(field, item.value)
        }

        // 调用值改变事件
        // this.attrsValueChange(group.children, data)
      }
    },

    valueChange: function (attr, $event) {
      this.$forceUpdate()
      if (attr.CP_CONTROL_TYPE == 'switch') {
        if (attr.value == '2') {
          attr.value = '1'
        } else {
          attr.value = '2'
        }
      } else if (
        attr.CP_CONTROL_TYPE == 'radio' ||
        attr.CP_CONTROL_TYPE == 'checkbox' ||
        attr.CP_CONTROL_TYPE == 'combo' ||
        attr.CP_CONTROL_TYPE == 'timer'
      ) {
        if (typeof $event == 'string') {
          attr.value = $event
        } else {
          attr.value = $event.target.value
        }
      } else if (attr.CP_CONTROL_TYPE == 'ejectButton') {
      } else if (attr.CP_CONTROL_TYPE == 'table-editor') {
        attr.value = $event
      } else if (attr.CP_CODE == 'code') {
        if (attr.code == '') {
          return
        }
        // 验证code是否唯一
        let rdJSON = RDSetting.toMininJSON(this.designer.$refs.draw.rdInfo)
        for (const key in rdJSON.rootModels) {
          if (rdJSON.rootModels[key].code == attr.value) {
            this.message.error('编码重复!')
            return
          }
        }
      }
      let attrObj = {
        code: attr.CP_CODE,
        path: attr.CP_PATH,
        datatype: attr.CP_DATA_TYPE,
        value: attr.value,
        groupname: attr.GROUPNAME,
        cascade: attr.CASCADE,
        cascade_group: attr.CASCADE_GROUP
      }
      // 获取子组件传入的value值显示
      // attr.value = this.conditionSetValue
      this.designer.$refs.draw.setAttr(attrObj)
      // 记录设计被修改
      this.emitChangeEvent()
    },
    emitChangeEvent() {
      this.designer.changed = true
      this.$emit('change')
    },
    attrsValueChange: function (attrs, md) {
      this.$forceUpdate()
      const { draw } = this.designer.$refs
      draw && draw.setAttributes(attrs, md)
    },
    tabClick() {},
    addcondition() {},
    /** 处理条件分支默认排序
     * model 当前点击的条件控件
     */
    setConditionDefaultValue() {
      // 条件分支
    },
    submit() {
      // this.tabInitName = '规则信息'
      // this.showAttr = propertiesListDefine['999']
      // return this.showAttr
      return this.propertiesDefine['999']
    },
    loadResultArguments() {
      // 获取所有节点的返回结果
      let canvas = this.designer.$refs.draw.rdInfo
      let mapping = {}
      let variables = []
      // 获取所有的节点
      canvas.models
        .filter((item) => {
          return (
            item.baseModelType === 'Activity' &&
            item.attrs &&
            item.attrs.expressionResult === 'y'
          )
        })
        .map((item) => {
          // 不同的节点，不同的处理方式
          let resultConfig = []
          if (item.modelType === 'RuleSql') {
            // 获取结果配置
            resultConfig =
              (item.attrs.executeSql && item.attrs.executeSql.result) || []
          } else if (item.modelType === 'RuleHttp') {
            // 获取结果配置
            resultConfig =
              (item.attrs.executeHttp && item.attrs.executeHttp.result) || []
          } else if (item.modelType === 'RuleCall') {
            // 获取结果配置
            resultConfig =
              (item.attrs.executeCallRule &&
                item.attrs.executeCallRule.result) ||
              []
          } else if (item.modelType === 'RuleAction') {
          } else if (item.modelType === 'RuleCompute') {
            resultConfig = [
              {
                title: item.attrs.expressionArguments || item.attrs.name,
                path: null,
                def: null,
                seleted: true
              }
            ]
          } else if (item.modelType === 'RuleJson') {
            resultConfig =
              (item.attrs.executeJson && item.attrs.executeJson.result) || []
          }
          resultConfig.forEach((item) => {
            let key = item.title
            if (!key) {
              return
            }
            if (mapping[key]) {
              return
            }
            mapping[key] = true
            key = key.startsWith('$') ? key.substring(1) : key
            variables.push({
              value: key,
              label: key,
              previewPath: 'data.result.' + key,
              preview: null
            })
          })
        })
      return variables
    },
    onPermissionChange(newVal) {
      if (this.ruleCanvasData.options) {
        this.ruleCanvasData.options.permission = newVal
      }
      this.ruleCanvasData?.renderDelay()
      this.$emit('change')
    }
  }
}
</script>
<style scoped lang="less">
.attribute {
  width: 100%;
  height: 100%;
  background: #212121;
  color: #fff;
  .title-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 40px;
    border-bottom: 1px solid #080808;
    color: #fff;
    .double-right {
      margin: 0 8px;
    }
  }

  .content-container {
    height: calc(100% - 40px);
    overflow: auto;
  }

  .attr-input {
    display: flex;
    /deep/.input-label {
      display: inline-block;
      color: #757575;
      width: 50px;
      font-size: 12px;
    }
    /deep/.ant-input {
      font-size: 12px;
      display: flex;
      align-items: center;
      background: #2c2c2c;
      color: #fff;
      padding-left: 70px;
      border: none;
    }
  }
}
.attr-box {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;

  .title {
    padding: 0 10px;
    color: #838383;
    flex: 1;
    .attr-name {
      margin-bottom: 6px;
    }
  }
  .execute-button {
    height: 32px;
    border-radius: 3px;
    background: #2c2c2c;
    border: none;
    color: #fff;
  }
  .textarea {
    background: #2c2c2c;
    color: #fff;
    border: none;
    width: 100%;
    height: 138px;
  }
}

.m-colorPicker {
  z-index: 9999;
}
.conditionCombo {
  width: 90px;
  height: 70px;
  margin-bottom: 2px;
  margin-left: 5px;
  margin-top: 30px;
}
.conditionText {
  width: 60px;
  height: 70px;
  margin-left: 6px;
  margin-top: 30px;
}
.conditionTitle {
  float: left;
  margin-left: 10px;
}

.collapse-leave,
.collapse-enter-active {
  transform: translate3d(0, 0, 0);
  transition: all 0.6s;
}

.collapse-enter,
.collapse-leave-active {
  transition: all 0.2s;
  transform: translate3d(100%, 0, 0);
}
</style>
