<template>
  <a-tree-select v-model="valueComputed"
                 :tree-data="treeData"
                 :search-value.sync="searchValue"
                 show-search
                 style="width: 100%"
                 :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                 :dropdown-class-name="theme && ('ant-select-dropdown--' + theme)"
                 :tree-expanded-keys.sync="expandedKeys"
                 :filter-tree-node="filterTreeNode"
                 tree-node-filter-prop="title"
                 v-bind="$attrs"
                 v-on="$listeners"
                 @search="onSearch">
    <template slot="title"
              slot-scope="node">
      <span style="display: inline-block; width: 100%; height: 100%;"
            @click="onNodeClick(node, $event)">
        <a-icon v-if="node.icon"
                :type="node.icon"
                class="m-r-10" />
        <span v-if="searchValue && node.selectable !== false && node[searchKey].indexOf(searchValue) > -1"
              :style="{'border-bottom': '1px solid ' + searchHighlightColor}">
          {{ node.name.substr(0, node.name.indexOf(searchValue)) }}
          <span :style="{ color: searchHighlightColor }">{{ searchValue }}</span>
          {{ node.name.substr(node.name.indexOf(searchValue) + searchValue.length) }}
        </span>
        <span v-else>{{ node.name }}</span>
      </span>
    </template>
  </a-tree-select>
</template>

<script>
import TreeMixin from './mixin'

export default {
  name: 'RuleDesignSelectTree',
  mixins: [TreeMixin],
  props: {
    searchKey: { type: String, default: 'name' },
    ignoreKey: { type: [Number, String], default: null }
  },
  data() {
    return {}
  },
  computed: {
    valueComputed: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    }
  },
  watch: {
    treeData(newData) {
      this.handleTreeData(newData)
    }
  },
  mounted() {
    this.expandSelectedNodes(this.valueComputed)
  },
  methods: {
    handleTreeData(data) {
      data = [].concat(data.filter((item) => item.id !== this.ignoreKey))
      data.forEach((item) => {
        item.value = item.id
        item.key = item.id
        item.scopedSlots = {
          title: 'title'
        }
        if (item.children?.length) {
          item.children = this.handleTreeData(item.children)
        }
      })
      return data
    },
    getSelectedNodes() {
      let selectedKeys = [].concat(this.valueComputed)
      return selectedKeys && selectedKeys.map((key) => this.findNode(key))
    }
  }
}
</script>