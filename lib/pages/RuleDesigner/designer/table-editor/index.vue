<template>
  <div class="table-editor"
       :class="{ 'table-editor--dark': theme === 'dark'}"
       :style="containerStyleComputed"
       @click="handleGlobalCancel">
    <div style="text-align: right;">
      <a v-if="allowCreate && showOperation"
         @click="createNewRecord()">新增</a>
    </div>
    <a-table :columns="tableColumns"
             :data-source="dataSource"
             :row-selection="rowSelectionComputed"
             :locale="locale"
             :scroll="{ y: scrollY }"
             :rowKey="fieldId"
             :size="size"
             :pagination="pagination"
             :customRow="handleCustomRow">
      <template v-for="col, index of tableEditColumns"
                :slot="col.slot"
                slot-scope="text, record">
        <div :key="col.name"
             style="min-height: 20px; position: relative;">
          <template v-if="record[fieldId] === editRecordKey && !disabled">
            <component v-if="showOperation"
                       ref="cellInput"
                       :is="col.editor || 'a-input'"
                       v-model="recordFormData[col.name]"
                       :size="size"
                       style="margin: -1px 0;"
                       @change="handleColumnValueChange(record, col.name)"
                       @focus="handleColumnFocus(record, col)"
                       @blur="handleColumnBlur" />
            <component v-else
                       ref="cellInput"
                       :is="col.editor || 'a-input'"
                       v-model="record[col.name]"
                       :size="size"
                       style="margin: -1px 0;"
                       @change="handleColumnValueChange(record, col.name)"
                       @focus="handleColumnFocus(record, col)"
                       @blur="handleColumnBlur" />
          </template>
          <template v-else-if="record[fieldAutoCreate]">
            <span class="cell-content placeholder"
                  :data-column-index="index"
                  :title="col.placeholder || col.name">
              {{ col.placeholder || col.name }}
            </span>
          </template>
          <template v-else>
            <span class="cell-content"
                  :data-column-index="index"
                  :title="text">{{ text }}</span>
          </template>
          <template v-if="allowDelete && !record[fieldAutoCreate] && index === tableEditColumns.length - 1">
            <a-icon type="delete"
                    class="delete-btn"
                    @click.prevent.stop="del(record)" />
          </template>
        </div>
      </template>
      <template slot="operation"
                slot-scope="text, record">
        <div class="table-editor-operations">
          <span v-if="record[fieldId] === editRecordKey">
            <a @click="() => save(record)">保存</a>
            <a-popconfirm title="是否取消，修改将不会保留?"
                          ok-text="确定"
                          cancel-text="取消"
                          :size="size"
                          @confirm="() => cancel(record)">
              <a>取消</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a :disabled="editRecordKey"
               @click="() => edit(record)">编辑</a>
            <a v-if="allowDelete"
               :disabled="editRecordKey"
               @click="() => del(record)">删除</a>
          </span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script>
/* eslint-disable */
import { uniqueId, isArray } from 'lodash'
import { defineUnenumerableProperty } from '../../js/components/modules/common'

const FIELDS = {
  fieldId: '__teid__',
  fieldAutoCreate: '__teAutoCreate__',
  fieldForbidCheck: '__teForbidCheck__'
}

export default {
  name: 'ExecuteTableEditor',
  props: {
    value: Array,
    height: { type: Number, default: null },
    // 多少行数据开始滚动
    scrollRows: { type: Number, default: 4 },
    size: { type: String, default: 'small' },
    theme: { type: String, default: '' },
    pagination: { type: Boolean, default: false },
    // rowKey: { type: String, default: 'column' },
    columns: {
      type: Array,
      default() {
        return [
          {
            title: '结果名',
            key: 'title',
            dataIndex: 'title',
            editable: true,
            scopedSlots: { customRender: 'titleEditor' }
          },
          {
            title: '值路径',
            key: 'path',
            dataIndex: 'path',
            editable: true,
            scopedSlots: { customRender: 'pathEditor' }
          },
          {
            title: '默认值',
            key: 'def',
            dataIndex: 'def',
            editable: true,
            scopedSlots: { customRender: 'defEditor' }
          }
        ]
      }
    },
    locale: {
      type: Object,
      default() {
        return { emptyText: '暂无数据' }
      }
    },
    rowSelection: {
      type: Object,
      default() {
        return {}
      }
    },
    showOperation: { type: Boolean, default: false },
    showTeid: { type: Boolean, default: false },
    allowCreate: { type: Boolean, default: true },
    allowDelete: { type: Boolean, default: true },
    silenceCancel: { type: Boolean, default: true },
    silenceDelete: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      ...FIELDS,
      selected: [],
      selectedRowKeys: [],
      editRecordKey: null,
      recordFormData: {}
    }
  },
  computed: {
    dataSource() {
      if (this.showOperation || !this.allowCreate) {
        return this.selected
      }
      // 自动增加
      let dataSource = [].concat(this.selected || [])
      // 已存在自动增长记录则跳过
      if (dataSource.filter((item) => item[this.fieldAutoCreate]).length) {
        return dataSource
      }
      dataSource.push(this.createNewRecord(true))
      return dataSource
    },
    containerStyleComputed() {
      return {
        border: '1px solid transparent',
        boxSizing: 'content-box',
        minHeight: this.height + 'px'
      }
    },
    scrollY() {
      if (this.height) {
        // 计算头部高度, 当前写死39, 行头
        return this.height - 39
      }
      if (this.scrollRows) {
        return Math.min(this.dataSource.length, this.scrollRows) * 39 + 20
      }
      return null
    },
    tableEditColumns() {
      let columns = this.columns || []
      return columns
        .filter((item) => !!item.editable && item.dataIndex)
        .map((item) => {
          return {
            slot:
              (item.scopedSlots && item.scopedSlots.customRender) ||
              item.dataIndex,
            name: item.dataIndex
          }
        })
    },
    tableColumns() {
      let columns = [].concat(this.columns || [])
      if (this.showOperation) {
        columns.push({
          title: '操作',
          key: 'operation',
          dataIndex: 'operation',
          width: '80px',
          scopedSlots: { customRender: 'operation' }
        })
      }
      // 显示内置ID
      if (this.showTeid) {
        columns.splice(0, 0, {
          title: 'ID',
          key: FIELDS.fieldId,
          dataIndex: FIELDS.fieldId
        })
      }
      return columns
    },
    rowSelectionComputed() {
      return Object.assign(
        {},
        {
          // 默认勾选设置
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.handleSelectionChange,
          getCheckboxProps: (record) => {
            return {
              props: {
                disabled: record[FIELDS.fieldForbidCheck]
              }
            }
          }
        },
        this.rowSelection
      )
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal !== this.selected) {
          // 处理值，增加内置ID，避免字段修改导致ID变更
          this.checkTableRecordId(newVal)
          this.selected = newVal || []
          this.updateSelectionKeys()
        }
      },
      immediate: true
    }
  },
  methods: {
    handleSelectionChange(selectedRowKeys, selectedRows) {
      this.selected.forEach((item) => {
        item.selected = false
      })
      selectedRows.forEach((item) => {
        item.selected = true
      })
      this.selectedRowKeys = selectedRowKeys
      this.submit()
    },
    handleEditorRowClick(record, recordIndex, e) {
      // 不允许同时编辑多行
      if (this.editRecordKey) {
        // 同一行时不做处理
        if (record[this.fieldId] === this.editRecordKey) {
          return
        }
        // 手动保存时，切换编辑行，自动调用保存方法
        if (this.showOperation) {
          this.save(this.recordFormData)
        }
      }
      // 判断选中的列
      const target = e.target
      let columnIndex = 0
      if (target && target.dataset['columnIndex'] !== undefined) {
        columnIndex = +target.dataset['columnIndex']
      }
      this.edit(record, columnIndex)
    },
    handleColumnValueChange(record, columnName) {
      if (columnName == 'title' || columnName == 'key') {
        if (record[columnName] == '') {
          this.message.error('变量名不能为空')
          return
        }

        // 验证变量是否符合标准
        if (
          this.isSpec(record[columnName]) ||
          record[columnName].indexOf(' ') !== -1
        ) {
          this.message.error('变量不能包含特殊字符')
        }
      }
      if (record[this.fieldAutoCreate]) {
        // 自动新增列被修改
        delete record[this.fieldAutoCreate]
        delete record[this.fieldForbidCheck]
        record.selected = true
        // 更新数据
        this.update(record, record)
      }
    },
    isSpec(s) {
      var pattern = new RegExp(
        '[ \\[ \\] \\^ \\*×――(^)$%~!＠@＃#$…&%￥—+=<>《》!！??？:：•`·、。，；,;/\'"{}（）‘’“”]'
      )
      return pattern.test(s)
    },
    save(record) {
      this.update(record, this.recordFormData)
      this.cancel()
    },
    update(record, newVal) {
      // 更新数据
      let selected = [].concat(this.selected)
      let key = record[this.fieldId]
      let index = this.selected.findIndex((item) => key === item[this.fieldId])
      if (index === -1) {
        selected.push(newVal)
      } else {
        selected.splice(index, 1, newVal)
      }
      this.selected = selected
      this.submit()
      this.updateSelectionKeys()
    },
    cancel(event) {
      this.editRecordKey = false
      this.recordFormData = {}
      this.$emit('blur')
    },
    edit(record, index = 0) {
      this.$emit('focus')
      this.editRecordKey = record[this.fieldId]
      if (this.showOperation) {
        this.recordFormData = Object.assign({}, record)
        // 生成一个ID
        this.defineTeid(this.recordFormData, record['__teid__'])
      }
      // 自动聚焦第一个输入框
      this.$nextTick(() => {
        let { cellInput } = this.$refs
        if (isArray(cellInput)) {
          cellInput = cellInput[index]
        }
        if (!cellInput) {
          return
        }
        cellInput.$el.focus()
      })
    },
    del(record) {
      // 更新数据
      let selected = [].concat(this.selected)
      let key = record[this.fieldId]
      let index = this.selected.findIndex((item) => key === item[this.fieldId])
      selected.splice(index, 1)
      this.selected = selected
      this.submit()
    },
    add() {
      let selected = [].concat(this.selected)
      selected.push(this.createNewRecord())
      this.selected = selected
      this.submit()
      this.updateSelectionKeys()
    },
    createNewRecord(autoCreate) {
      let record = {
        selected: true
      }
      // 默认初始化所有字段
      this.columns.forEach((item) => {
        record[item.dataIndex] = null
      })
      this.defineTeid(record)
      if (autoCreate) {
        this.defineAutoCreateRecord(record)
        this.defineForbidCheck(record)
      }
      return record
    },
    submit() {
      this.$emit('change', this.selected)
      this.$emit('input', this.selected)
    },
    updateSelectionKeys() {
      let selectedRowKeys = this.selected
        .filter((item) => item.selected)
        .map((item) => item[this.fieldId])
      if (this.rowSelection && 'selectedRowKeys' in this.rowSelection) {
        this.rowSelection.selectedRowKeys = selectedRowKeys
      }
      this.selectedRowKeys = selectedRowKeys
    },
    checkTableRecordId(list) {
      if (list === null || list === undefined) {
        return
      }
      list.forEach((item) => {
        if (this.fieldId in item) {
          return
        }
        this.defineTeid(item)
      })
    },
    defineTeid(record, id) {
      // 生成一个ID
      defineUnenumerableProperty(
        record,
        this.fieldId,
        id || uniqueId(this.fieldId)
      )
    },
    defineAutoCreateRecord(record, autoCreate = true) {
      // 定义自动新增状态
      defineUnenumerableProperty(record, this.fieldAutoCreate, autoCreate)
    },
    defineForbidCheck(record, checkable = true) {
      // 定义自动新增状态
      defineUnenumerableProperty(record, this.fieldForbidCheck, checkable)
    },
    handleGlobalCancel(event) {
      const target = event.target
      // 如果是placeholder，则不做处理
      if (target.tagName === 'SPAN' && !target.parentNode) {
        return
      }
      let parent = target.parentNode
      let isTobyChild = false
      while (parent) {
        if (parent.tagName === 'TBODY') {
          isTobyChild = true
          break
        }
        parent = parent.parentNode
      }
      if (!isTobyChild) {
        this.cancel()
      }
    },
    handleCustomRow(record, index) {
      return {
        on: {
          // 事件
          click: (e) => {
            this.handleEditorRowClick(record, index, e)
          } // 点击行
        }
      }
    },
    handleColumnFocus(record, col, index) {
      this.focusInfo = {
        record: record,
        column: col,
        index
      }
      this.$emit('focus')
    },
    handleColumnBlur() {
      this.$emit('blur')
    },
    insertText(text) {
      if (!this.focusInfo) {
        return
      }
      // 如果是新增列
      let { record, column } = this.focusInfo
      if (this.focusInfo.record.__teAutoCreate__) {
        record = this.createNewRecord()
        record[column.name] = text
        this.selected.push(record)
        this.focusInfo.record = record
      } else {
        record[column.name] = record[column.name]
          ? record[column.name] + text
          : text
      }
      this.submit()
    }
  }
}
</script>

<style lang="less">
.table-editor-operations {
  a {
    font-size: 12px;
  }
  a + a {
    margin-left: 10px;
  }
}
.table-editor {
  .ant-table-row {
    .delete-btn {
      display: none;
      // right: 5px;
      // top: 6px;
      right: 0px;
      top: 0px;
      z-index: 999;
      padding: 5px;
      border-radius: 2px;
      cursor: pointer;
    }
    .delete-btn:hover {
      background-color: #ffc069;
      color: #fff;
    }
  }
  .ant-table-row:hover {
    position: relative;
    .delete-btn {
      display: block;
      position: absolute;
    }
  }
  .placeholder {
    color: #b2b2b2;
  }

  .cell-content {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    height: 37px;
    line-height: 37px;
    margin: -8px 0;
  }
}
.table-editor--dark {
  .ant-table {
    color: #fff;
    border: 1px solid #595959;
  }
  .ant-table-content > table > tr,
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #595959;
    background: #212121;
  }

  .ant-table-header {
    background: #212121;
  }

  .ant-table-tbody
    > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td {
    background-color: #8f8f8f;
  }
  .ant-table-tbody > tr.ant-table-row-selected td {
    background-color: #595959;
  }

  .ant-table-thead > tr > th {
    color: #fff;
  }
  .ant-table-fixed-header
    > .ant-table-content
    > .ant-table-scroll
    > .ant-table-body {
    background-color: #212121;
  }
  .ant-table-placeholder {
    background: transparent;
    border: 0;
  }
  .ant-input {
    background: #2c2c2c;
    color: #fff;
  }
}
</style>