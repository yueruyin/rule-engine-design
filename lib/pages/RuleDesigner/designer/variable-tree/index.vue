<template>
  <div class="variable-tree"
       :class="{ 'variable-tree-dark': theme === 'dark' }">
    <RuleDesignTree :tree-data="treeData"
                    :load-data="handleLoadData"
                    :tree-expanded-keys="defaultExpandedKeysComputed"
                    :tree-show-line="false"
                    :tree-selectable="true"
                    :tree-node-hit-handler="handleTreeNodeHit"
                    @select="handleNodeSelect"></RuleDesignTree>
  </div>
</template>

<script>
import { DEFAULT_VARIABLE_GROUPS } from './config'
import { getPreNodeVariables, getRuleArguments } from './common'
import { cloneDeep, isFunction, uniqueId, isString } from 'lodash'

import RuleDesignTree from '../../../../components/tree'

const cleanTreeData = function (data, options = {}) {
  if (!data || !data.length) {
    return data
  }
  let {
    visibleGroups = [],
    invisibleGroups = []
  } = options
  data.forEach(item => {
    // 处理标题
    item.title = item.title || item.label
    // 如果是分组，则不能被选中
    if (item.type === 'group') {
      item.selectable = false
      item.key = item.id
      if (visibleGroups.includes(item.id)) {
        item.visible = true
      } else if (invisibleGroups.includes(item.id)) {
        item.visible = false
      }
      item.icon = item.icon || 'folder'
    } else {
      item.key = uniqueId('vt')
      item.isLeaf = true
      item.icon = item.icon || 'file'
    }
    // 子节点
    item.children = cleanTreeData(item.children, options)
  })
  // 移除不需要展示的节点
  data = data.filter(item => item.visible !== false)
  return data
}

export default {
  name: 'VariableTree',
  components: {
    RuleDesignTree
  },
  props: {
    ruleNode: { type: Object, default () { return {} } },
    groups: { type: Array, default () { return null } },
    visibleGroups: { type: [String, Array], default () { return null } },
    invisibleGroups: { type: [String, Array], default () { return null } },
    dataHandlers: { type: Object, default () { return {} } },
    size: { type: String, default: 'small' },
    theme: { type: String, default: 'dark' },
    showLine: { type: Boolean, default: true },
    showIcon: { type: Boolean, default: false }
  },
  data () {
    return {
      visible: true,
      searchText: null,
      treeData: [],
      innerDataHandlers: {
        loadProcessVariableList: this.loadProcessVariableList,
        loadExecuteVariableList: this.loadExecuteVariableList
      }
    }
  },
  computed: {
    defaultExpandedKeysComputed () {
      let groups = this.treeData || []
      return groups.filter(item => !!item.expand).map(item => item.id)
    },
    dataHandlersComputed () {
      return Object.assign({}, this.dataHandlers, this.innerDataHandlers)
    }
  },
  watch: {
    groups: {
      handler (newVal) {
        let groups
        if (newVal && newVal.length) {
          groups = newVal
        }
        if (!groups) {
          // 深度克隆数据
          groups = cloneDeep(DEFAULT_VARIABLE_GROUPS)
        }
        let visibleGroups = this.visibleGroups || []
        if (isString(visibleGroups)) {
          visibleGroups = visibleGroups.split(',')
        }
        let invisibleGroups = this.invisibleGroups || []
        if (isString(invisibleGroups)) {
          invisibleGroups = invisibleGroups.split(',')
        }
        // 处理数据
        this.treeData = cleanTreeData(groups, {
          visibleGroups,
          invisibleGroups
        })
      },
      immediate: true
    }
  },
  methods: {
    // 异步加载数据
    handleLoadData (node) {
      return new Promise((resolve, reject) => {
        try {
          // 节点数据
          const nodeData = node.dataRef
          // 以及加载过数据
          if (nodeData.children && nodeData.children.length) {
            resolve()
            return
          }
          // 根据数据源加载数据
          const { dataSource } = nodeData
          if (!dataSource) {
            // 设置为叶子节点
            this.$set(nodeData, 'isLeaf', true)
            resolve()
            return
          }
          // 使用dataHandler
          if (dataSource.type === 'dataHandler') {
            if (!dataSource.method) {
              throw new Error(`variable-tree error: 节点[${node.label}]未设置method属性`)
            }
            let handler = this.dataHandlersComputed[dataSource.method]
            if (!handler) {
              throw new Error(`variable-tree error: dataHandler[${dataSource.method}]未指定`)
            }
            handler(nodeData).then((nodes) => {
              if (!nodes || !nodes.length) {
                this.$set(nodeData, 'isLeaf', true)
              } else {
                // 清洗数据
                nodes = cleanTreeData(nodes)
                this.$set(nodeData, 'children', nodes)
              }
              this.$forceUpdate()
              resolve()
            }).catch(e => reject(e))
          } else {
            throw new Error(`variable-tree error: 缺少加载数据源的方式`)
          }
        } catch (e) {
          reject(e)
        }
      })
    },
    handleNodeSelect (selectedKeys, { node }) {
      const nodeData = node.dataRef
      if (nodeData.selectable !== false) {
        // 默认插入内容=建议信息 || 值 || 标题
        this.$emit('pick', nodeData.suggestion || nodeData.value || nodeData.label, nodeData)
      }
    },
    handleTreeNodeHit (node) {
      return node && (node.title + (node.suggestion ? '\n' + node.suggestion : ''))
    },
    loadProcessVariableList (nodeData) {
      return new Promise((resolve, reject) => {
        // 获取当前节点
        let variables = getPreNodeVariables(this.ruleNode)
        // 获取当前节点所有关联的上级节点
        resolve(variables)
      })
    },
    loadExecuteVariableList () {
      return new Promise((resolve, reject) => {
        resolve(getRuleArguments(this.ruleNode?.getCanvas()))
      })
    },
    findNodes (nodes, label) {
      let result = []
      nodes.forEach(item => {
        if (item.label && item.label.includes(label)) {
          result.push(item)
        }
        if (item.children) {
          result = result.concat(this.findNodes(item.children, label))
        }
      })
      return result
    },
    findNodesWith (nodes, compare) {
      if (!isFunction(compare)) {
        return []
      }
      let result = []
      nodes.forEach(item => {
        if (compare(item)) {
          result.push(item)
        }
        if (item.children) {
          result = result.concat(this.findNodesWith(item.children, compare))
        }
      })
      return result
    },
    getAllVariables () {
      // 获取所有节点
      return this.findNodesWith(this.treeData, item => !!item.isLeaf)
    },
    variableSuggestionsProvider () {
      let suggestions = []
      this.findNodesWith(this.treeData, item => !!item.isLeaf)
        .forEach(item => {
          suggestions.push({
            label: item.value || item.label,
            insertText: item.value || item.label
          })
          if (item.suggestion) {
            suggestions.push({
              label: item.suggestion,
              insertText: item.suggestion
            })
          }
        })
      // 获取所有节点
      return suggestions
    }
  }
}
</script>

<style lang="less">
.variable-tree {
  height: 100%;
  overflow-y: auto;
}
</style>