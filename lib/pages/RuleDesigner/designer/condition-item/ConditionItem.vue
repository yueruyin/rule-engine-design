<template>
  <ConfigProvider :locale="locale">
    <div class="dialog-content-wrapper">
      <div class="dialog-content-left">
        <VariableTree :rule-node="data"
                      @pick="handleVariablePick"></VariableTree>
      </div>
      <div class="dialog-content-right">
        <a-row class="condition-item">
          <a-button type="primary"
                    :disabled="disabled"
                    @click.native="addCondition">添加条件</a-button>
          <a-row class="single-condition-entry"
                 v-for="(item,index) in conditionSet"
                 :key="index"
                 :class="{'selected': item === currentItem}"
                 @click.native="handleItemFocus(item)">
            <a-row class="title">
              <a-col class="title-text"
                     :span="12">单条件录入</a-col>
              <a-col class="logincal-operater"
                     :span="12">
                <LogicalOperater v-if="index>0"
                                 v-model="item.logic"
                                 :disabled="disabled" />
              </a-col>
            </a-row>
            <a-row class="form-container">
              <a-col :span="5">
                <EntryTypeSelect v-model="item.type"
                                 :disabled="disabled"
                                 @input="changeType($event,item)" />
              </a-col>
              <a-col :span="5">
                <EntryInput v-model="item.field"
                            :disabled="disabled" />
              </a-col>
              <a-col :span="5">
                <ChooseSymbol v-model="item.operator"
                              :options="optionsMap[item.type]"
                              :disabled="disabled" />
              </a-col>
              <a-col :span="5">
                <ChooseDate v-model="item.value"
                            v-if="item.type==='date'"
                            :disabled="disabled" />
                <a-input-number v-else-if="item.type==='int'"
                                v-model="item.value"
                                placeholder="请输入比较值"
                                class="full-w"
                                :disabled="disabled"></a-input-number>
                <a-select v-else-if="item.type==='typeof'"
                          v-model="item.value"
                          placeholder="请选择类型"
                          class="full-w"
                          :disabled="disabled">
                  <a-select-option v-for="opt in classOptions"
                                   :key="opt.value"
                                   :value="opt.value">{{ opt.label }}</a-select-option>
                </a-select>
                <EntryInput v-model="item.value"
                            v-else
                            placeholder="请输入比较值"
                            :disabled="disabled" />
              </a-col>
            </a-row>
            <a-icon v-if="index>0 || conditionSet.length>1"
                    @click="deleteCondition(index)"
                    class="delete-icon"
                    theme="twoTone"
                    type="delete" />
          </a-row>
          <a-row class="rule-text">
            {{ ruleText }}
          </a-row>
        </a-row>
      </div>
    </div>

  </ConfigProvider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { ConfigProvider } from 'ant-design-vue'
import EntryTypeSelect from './components/EntryTypeSelect.vue'
import EntryInput from './components/EntryInput.vue'
import ChooseSymbol from './components/ChooseSymbol.vue'
import ChooseDate from './components/ChooseDate.vue'
import LogicalOperater from './components/LogicalOperater.vue'
import VariableTree from '../variable-tree'
import {
  INT_OPTIONS,
  STRING_OPTIONS,
  DATE_OPTIONS,
  OPERATOR_RELATION,
  CLASS_OPTIONS
} from './components/config'
import { cloneDeep } from 'lodash'
import Dayjs from 'dayjs'

export default {
  name: 'ConditionItem',
  components: {
    ConfigProvider,
    EntryTypeSelect,
    EntryInput,
    ChooseSymbol,
    ChooseDate,
    LogicalOperater,
    VariableTree
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    locale() {
      // 全局中文
      return zhCN
    }
  },
  watch: {
    conditionSet: {
      handler(value) {
        if (value.length > 0) {
          this.setRuleText()
        }
      },
      deep: true
    }
  },
  data() {
    return {
      optionsMap: {
        int: INT_OPTIONS,
        string: STRING_OPTIONS,
        date: DATE_OPTIONS,
        typeof: STRING_OPTIONS
      },
      conditionSet: [
        {
          type: 'int', // 数据类型 int  string  date
          field: '', // 变量名
          operator: '',
          value: '',
          logic: 'and'
        }
      ],
      ruleText: '',
      currentItem: null,
      classOptions: CLASS_OPTIONS
    }
  },
  created() {},
  mounted() {
    this.setDefaultData()
  },
  methods: {
    setDefaultData() {
      let attrs = this.data.attrs || {}
      if (attrs.conditionJson) {
        this.conditionSet.length = 0
        this.conditionSet = cloneDeep(attrs.conditionJson)
        // 解析操作符
        this.conditionSet.forEach((item) => {
          item.operator = OPERATOR_RELATION.find(
            (node) => node.value === item.operator
          ).text
        })
      }
      this.currentItem = this.conditionSet[0]
    },
    // 修改类型
    changeType($event, item) {
      if ($event === 'string') {
        item.value =
          item.value === null || item.value === undefined ? '' : item.value + ''
      } else if ($event === 'int') {
        if (isNaN(+item.value)) {
          item.value = undefined
        }
      } else if ($event === 'date') {
        let value = item.value + ''
        // 不符合日期格式
        if (
          !/^\d{4}-?\d{2}-?\d{2}\s*(\d{2}(:\d{2}(:\d{2}(\.\d{1,})?)?)?)?$/.test(
            value
          )
        ) {
          item.value = undefined
        } else {
          item.value = new Dayjs('20230101 12:23:32.324').format('YYYY-MM-DD')
        }
      } else if ($event === 'typeof') {
        if (!CLASS_OPTIONS.find((opt) => opt.value === item.value)) {
          item.value = undefined
        }
      }
      let options = this.optionsMap[item.type] || []
      if (!options.some((op) => op.value === item.operator)) {
        item.operator = null
      }
    },
    // 解析规则显示文本
    setRuleText() {
      const arr = []
      this.conditionSet.forEach((item, index) => {
        const obj = {}
        let value =
          item.value !== undefined && item.value !== null ? item.value : ''
        if (item.type === 'string' && value !== '""') {
          value = '"' + value.replaceAll(/"/g, '\\"') + '"'
        } else if (item.type === 'typeof') {
          let classOpt = CLASS_OPTIONS.find((opt) => item.value === opt.value)
          value = classOpt ? classOpt.label : value
        }
        let field = item.field || ''
        if (item.type === 'typeof') {
          field = 'typeof ' + field
        }
        let operator = item.operator || ''
        obj.text = field + ' ' + operator + ' ' + value
        if (index > 0) {
          obj.logicText = item.logic === 'and' ? ' 并且 ' : ' 或者 '
        }
        arr.push(obj)
      })
      this.jointRuleText(arr)
    },
    // 拼接文本
    jointRuleText(arr) {
      if (arr.length > 1) {
        let str = ''
        arr.forEach((node, index) => {
          let logicStr = ''
          if (index > 0) {
            logicStr = node.logicText
          }
          str += `${logicStr}( ${node.text} )`
        })
        this.ruleText = str
      } else {
        this.ruleText = arr[0].text
      }
    },
    // 添加条件
    addCondition() {
      const obj = {
        type: 'int', // 数据类型 int  string  date
        field: '', // 变量名
        operator: '',
        operatorOptions: INT_OPTIONS,
        value: '',
        logic: 'and'
      }
      this.conditionSet.push(obj)
    },
    // 删除条件
    deleteCondition(index) {
      if (this.disabled) {
        return
      }
      if (this.conditionSet.length > 1) {
        this.conditionSet.splice(index, 1)
      }
    },
    // 校验数据是否填写完整
    validateConditionSet() {
      for (let item of this.conditionSet) {
        for (let [, value] of Object.entries(item)) {
          if (value === null || value === undefined) {
            return false
          }
        }
      }
      return true
    },
    handleItemFocus(item) {
      this.currentItem = item
    },
    handleVariablePick(text) {
      if (this.disabled) {
        return
      }
      if (this.currentItem) {
        this.$set(this.currentItem, 'field', text)
      }
    },
    // 提交数据
    submit() {
      const validateResult = this.validateConditionSet()
      if (!validateResult) {
        this.message.warning('请先完善规则！')
        return false
      }
      // 解析操作符
      this.conditionSet.forEach((item) => {
        item.operator = OPERATOR_RELATION.find(
          (node) => item.operator === node.text
        ).value
      })
      return {
        data: this.conditionSet,
        text: this.ruleText
      }
    }
  }
}
</script>

<style lang='less' scoped>
.condition-item {
  width: 800px;
  height: 500px;
  overflow: auto;
  padding: 10px;
  .single-condition-entry {
    position: relative;
    width: 100%;
    height: 100px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 20px;
    .title {
      display: flex;
      justify-content: space-between;
      margin: 15px 60px 15px 30px;
    }
    &.selected {
      .title-text::before {
        content: '';
        display: inline-block;
        width: 1em;
        height: 1em;
        border-radius: 50%;
        background: #ffc069;
        vertical-align: middle;
        margin-right: 5px;
      }
    }
    .form-container {
      display: flex;
      justify-content: space-between;
      padding-right: 28px;
    }
    .logincal-operater {
      text-align: right;
    }
    .delete-icon {
      font-size: 16px;
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }
  .rule-text {
    width: 100%;
    height: 50px;
    font-size: 16px;
    margin-top: 10px;
  }
}
</style>