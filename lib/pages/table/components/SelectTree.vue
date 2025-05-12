<template>
  <RuleDesignSelectTree ref="tree"
                        v-model="valueComputed"
                        :tree-data="treeData"></RuleDesignSelectTree>
</template>

<script>
import { getTreeData as getTreeDataApi } from '../../../api/table'
import RuleDesignSelectTree from '../../../components/tree/select.vue'

export default {
  name: 'GroupSelectTree',
  components: {
    RuleDesignSelectTree
  },
  props: {
    value: { type: [Number, String], default: null },
    ignoreKey: { type: [Number, String], default: null }
  },
  data () {
    return {
      searchValue: null,
      treeData: [],
      expandedKeys: []
    }
  },
  computed: {
    valueComputed: {
      get () {
        this.expandSelectedNodes(this.value)
        return this.value
      },
      set (newVal) {
        this.$emit('input', newVal)
        this.$emit('change', newVal)
      }
    }
  },
  mounted () {
    this.loadTreeData()
  },
  methods: {
    loadTreeData () {
      getTreeDataApi().then(res => {
        res = this.handleTreeData(res)
        this.treeData = [{
          // 使可以使用自定义插槽
          scopedSlots: {
            title: 'title'
          },
          key: 0,
          id: 0,
          value: 0,
          // 节点名称
          name: '顶级',
          children: res
        }]
        this.expandSelectedNodes(this.valueComputed)
      })
    },
    expandSelectedNodes (value) {
      let { tree } = this.$refs
      tree && tree.expandSelectedNodes(value)
    },
    handleTreeData (data) {
      data = [].concat(data.filter(item => item.id !== this.ignoreKey))
      data.forEach(item => {
        if (item.children.length) {
          item.children = this.handleTreeData(item.children)
        }
      })
      return data
    }
  }
}
</script>