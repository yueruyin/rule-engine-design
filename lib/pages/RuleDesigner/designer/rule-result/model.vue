<template>
  <a-layout class="result-editor-container"
            :class="['result-editor-container--' + theme]"
            :style="{ width, height }">
    <a-layout-content class="config-content">
      <div>
        <a-button type="danger"
                  :size="size"
                  icon="delete"
                  :disabled="disabled"
                  @click="clearCheckedOptions">清空</a-button>
        <a-button type="info"
                  :size="size"
                  icon="undo"
                  style="margin-left: 10px;"
                  :disabled="disabled"
                  @click="setCheckedOptions(value)">重置</a-button>
      </div>
      <a-form :size="size">
        <template v-for="group in options">
          <a-form-item v-if="group.children && group.children.length"
                       :key="group.value"
                       :label="group.label">
            <a-checkbox v-if="group.children.length > 1"
                        :indeterminate="group.indeterminate"
                        :checked="group.checkAll"
                        class="config-checkbox"
                        :disabled="disabled || checkDisabled(group)"
                        @change="(e) => handleCheckAllChange(group, e)">全选</a-checkbox>
            <template v-if="group.type === 'checkgroup'">
              <a-checkbox-group v-model="checkedOptions[group.value]"
                                :options="group.children"
                                :disabled="disabled || checkDisabled(group)"
                                class="config-checkbox-group"
                                @change="handleResultOptionChange(group)"></a-checkbox-group>
            </template>
            <template v-else>
              <a-checkbox v-for="item in group.children"
                          :key="item.value"
                          v-model="checkedOptions[item.value]"
                          class="config-checkbox"
                          :disabled="disabled || checkItemDisabled(group, item)"
                          @change="handleResultOptionChange(group)">{{ item.label }}</a-checkbox>
            </template>
          </a-form-item>
        </template>
      </a-form>
    </a-layout-content>
    <a-layout-sider class="preview-content"
                    :width="previewWidth">
      <div style="line-height: 40px;">执行结果预览</div>
      <CodeEditor ref="codeEditor"
                  v-model="previewResult"
                  language="json"
                  :theme="theme"
                  :read-only="disabled"
                  width="100%"
                  height="calc(100% - 40px)"
                  @inited="onInited"></CodeEditor>
    </a-layout-sider>
  </a-layout>
</template>

<script>
import CodeEditor from '../code-editor'
import DefaultOptions from './options'
import {
  get as _get,
  set as _set,
  cloneDeep,
  isObject,
  isString,
  isFunction,
  kebabCase
} from 'lodash'

const defaultLoadFunc = function () {
  return []
}

export default {
  name: 'RuleResultEditorModel',
  components: {
    CodeEditor
  },
  props: {
    value: { type: [String, Object], default: null },
    valueType: { type: String, default: 'String' },
    size: { type: String, default: null },
    theme: { type: String, default: 'dark' },
    width: { type: String, default: '960px' },
    height: { type: String, default: '560px' },
    previewWidth: { type: String, default: '480px' },
    extendProps: {
      type: Object,
      default() {
        return {}
      }
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      previewResult: '',
      indeterminate: false,
      checkAll: false,
      checkedOptions: {},
      options: []
    }
  },
  watch: {
    value(newVal) {
      this.setCheckedOptions(newVal)
    }
  },
  mounted() {
    this.initOptions()
    this.setCheckedOptions(this.value)
  },
  methods: {
    initOptions() {
      let options = cloneDeep(DefaultOptions)
      // 处理数据源
      options.forEach((item) => {
        // 已经加载
        if (item.loaded) {
          return
        }
        if (item.dataSourceType === 'method') {
          let funcName =
            'load' +
            item.value.charAt(0).toUpperCase() +
            item.value.substring(1)
          let kebabCaseFuncName = kebabCase(funcName)
          // 获取方法
          let func =
            this[funcName] ||
            this.extendProps[funcName] ||
            this.extendProps[kebabCaseFuncName] ||
            this.$attrs[funcName] ||
            this.$attrs[kebabCaseFuncName]
          if (!isFunction(func)) {
            func = defaultLoadFunc
          }
          // 加载数据
          item.children = func()
        }
        item.loaded = true
        item.indeterminate = false
        item.checkAll = false
        item.children = item.children || []
      })
      this.options = options
    },
    onInited() {
      this.generatePreviewResult()
    },
    generatePreviewResult() {
      let result = {
        code: '0',
        data: {},
        message: '成功'
      }
      const { options, checkedOptions } = this
      options.forEach((group) => {
        let isRootScope = group.type !== 'checkgroup'
        group.children.forEach((item) => {
          // 判断是否被选中
          let seleced = isRootScope
            ? checkedOptions[item.value]
            : checkedOptions[group.value] &&
              checkedOptions[group.value].includes(item.value)
          if (!seleced || item.preview === false) {
            return
          }
          let previewPath = item.previewPath || 'data.' + item.value
          let obj = _get(result, previewPath)
          if (!obj || !isObject(obj) || !isObject(item.preview)) {
            _set(
              result,
              previewPath,
              item.preview ? cloneDeep(item.preview) : null
            )
          } else {
            Object.assign(obj, cloneDeep(item.preview) || null)
          }
        })
      })
      this.previewResult = JSON.stringify(result)
      this.$nextTick(() => {
        const { codeEditor } = this.$refs
        codeEditor && codeEditor.formatValue()
      })
    },
    handleCheckAllChange(group, e) {
      const { checkedOptions } = this
      if (group.type === 'checkgroup') {
        this.$set(
          checkedOptions,
          group.value,
          e.target.checked ? group.children.map((item) => item.value) : []
        )
      } else {
        let options = group.children
        options.forEach((item) => {
          this.$set(checkedOptions, item.value, e.target.checked)
        })
      }
      group.indeterminate = false
      group.checkAll = e.target.checked
      this.generatePreviewResult()
    },
    handleResultOptionChange(group) {
      const { checkedOptions } = this
      let checkAll = false
      let indeterminate = false
      if (group.type === 'checkgroup') {
        let list = checkedOptions[group.value]
        checkAll = list && list.length === group.children.length
        indeterminate =
          list && list.length > 0 && list.length !== group.children.length
      } else {
        let options = group.children
        checkAll = options.every((item) => checkedOptions[item.value])
        indeterminate =
          !checkAll && options.some((item) => checkedOptions[item.value])
      }
      this.$set(group, 'checkAll', checkAll)
      this.$set(group, 'indeterminate', indeterminate)
      this.generatePreviewResult()
    },

    checkDisabled(group) {
      let disabled = group.disabled
      if (typeof disabled === 'boolean') {
        return disabled
      }
      if (isFunction(disabled)) {
        return disabled(this.checkedOptions)
      }
      return false
    },

    checkItemDisabled(group, item) {
      return this.checkDisabled(group) || this.checkDisabled(item)
    },

    setCheckedOptions(newVal) {
      newVal = newVal || {}
      if (isString(newVal)) {
        newVal = JSON.parse(newVal)
      }
      this.checkedOptions = Object.assign({}, newVal)
      this.options.forEach((group) => {
        this.handleResultOptionChange(group)
      })
      this.generatePreviewResult()
    },

    clearCheckedOptions() {
      this.checkedOptions = {}
      this.options.forEach((group) => {
        group.indeterminate = false
        group.checkAll = false
      })
      this.generatePreviewResult()
    },

    submit() {
      let isString =
        this.valueType === 'String' || typeof this.value === 'string'
      let result = isString
        ? JSON.stringify(this.checkedOptions)
        : cloneDeep(this.checkedOptions)
      // 提交数据
      this.$emit('input', result)
      this.$emit('change', result)
      return result
    }
  }
}
</script>

<style lang="less">
.config-content {
  box-sizing: border-box;
  padding: 10px;
}
.preview-content {
  border-left: 1px solid #efefef;
  box-sizing: border-box;
  background: transparent;
  padding: 10px;
}
.result-editor-container--dark {
  background-color: #212121;

  .preview-content {
    border-left-color: #595959;
  }

  .config-checkbox,
  .config-checkbox-group .ant-checkbox-wrapper {
    margin-left: 0px;
    margin-right: 10px;
    color: #ffffff;
  }
  .config-checkbox .ant-checkbox-disabled + span,
  .config-checkbox-group .ant-checkbox-disabled + span {
    color: #9f9f9f;
  }
}
</style>
