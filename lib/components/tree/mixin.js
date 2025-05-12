// ========================================================
// 树组件通用的配置
// @author wangyb
// @createTime 2023-06-13 11:09:14
// ========================================================
import { uniq, flatten } from 'lodash'

export default {
  props: {
    value: { type: [Number, String, Array, Object], default: undefined },
    theme: { type: String, default: 'dark' },
    size: { type: String, default: undefined },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: { type: String, default: '名称' },
    searchHighlightColor: { type: String, default: '#ff5500' },
    searchKey: { type: String, default: 'title' },
    replaceFields: { type: Object, default: undefined },
    treeData: { type: Array, default: undefined },
    loadData: { type: Function, default: undefined },
    treeExpandedKeys: {
      type: Array,
      default() {
        return []
      }
    },
    treeShowLine: { type: Boolean, default: false },
    treeShowIcon: { type: Boolean, default: false },
    treeSelectable: { type: Boolean, default: true },
    treeNodeHitHandler: { type: Function, default: null }
  },

  data() {
    return {
      selectedKeys: [],
      expandedKeys: [],
      autoExpandParent: false,
      searchValue: null
    }
  },

  watch: {
    treeExpandedKeys: {
      handler(newVal) {
        newVal = newVal || []
        if (this.expandedKeys !== newVal) {
          this.expandedKeys = newVal
        }
      },
      immediate: true
    },
    expandedKeys(newVal) {
      if (newVal !== this.treeExpandedKeys) {
        this.$emit('update:treeExpandedKeys', newVal)
      }
    }
  },

  methods: {
    onSearch(text) {
      if (!text) {
        // 重新展开节点
        this.expandSelectedNodes(this.valueComputed)
        return
      }
      // 计算哪些节点需要展开
      const value = text
      let expandedKeys = []
      let { searchKey = 'title' } = this
      if (value) {
        expandedKeys = this.filterNodes(
          this.treeData,
          (item) => item[searchKey] && item[searchKey].indexOf(value) > -1
        ).map((item) => this.getNodePath(this.treeData, item.key, false))
        expandedKeys = uniq(
          flatten(expandedKeys)
            .filter((item) => item.children && item.children.length)
            .map((item) => item.key)
        )
      }
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true
      })
    },

    expandSelectedNodes(value) {
      if (value === undefined) {
        value = this.selectedKeys[0]
      }
      this.$nextTick(() => {
        if (value !== undefined && value !== null) {
          // 自动展开
          let expandedKeys = this.getNodePath(this.treeData, value, false)
          this.expandedKeys = expandedKeys
            ? expandedKeys.map((item) => item.key)
            : this.expandedKeys
        } else {
          this.expandedKeys =
            this.treeData.length === 1 ? [this.treeData[0].key] : []
        }
      })
    },

    filterTreeNode(value, treeNode) {
      let { name } = treeNode.data.props
      return name && name.indexOf(value) > -1
    },

    filterNodes(list, filter) {
      let result = []
      if (!list) {
        return result
      }
      // 如果查询所有上级节点
      for (let item of list) {
        if (filter(item)) {
          result.push(item)
        }
        let subItems = this.filterNodes(item.children, filter)
        result = result.concat(subItems)
      }
      return result
    },
    findNode(key) {
      let nodes = this.filterNodes(this.treeData, (item) => item.key === key)
      return nodes[0] || null
    },
    getNodePath(list, key, hasSelf = true) {
      if (!list) {
        return null
      }
      for (let item of list) {
        if (item.key === key) {
          return hasSelf ? [item] : []
        }
        let subItems = this.getNodePath(item.children, key)
        if (subItems) {
          return [item].concat(subItems)
        }
      }
      return null
    },
    getSelectedNodes() {
      return (
        this.selectedKeys && this.selectedKeys.map((key) => this.findNode(key))
      )
    },
    onNodeClick(node, e) {
      // this.$emit('nodeClick', node, e)
      // 如果是不能被选中的父节点，则自动展开收折节点
      let key = node.key
      if (node.selectable === false) {
        if (this.expandedKeys.includes(key)) {
          this.expandedKeys.splice(this.expandedKeys.indexOf(key), 1)
        } else {
          this.expandedKeys.push(key)
        }
      }
    }
  }
}
