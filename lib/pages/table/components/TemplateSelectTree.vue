<template>
  <RuleDesignSelectTree ref="tree"
                        v-model="valueComputed"
                        :tree-data="treeData"></RuleDesignSelectTree>
</template>

<script>
import { getTemplateTreeData } from '../../../api/table'
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
  data() {
    return {
      searchValue: null,
      treeData: [],
      expandedKeys: []
    }
  },
  computed: {
    valueComputed: {
      get() {
        this.expandSelectedNodes(this.value)
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
        this.$emit('change', newVal)
      }
    }
  },
  mounted() {
    this.loadTreeData()
  },
  methods: {
    loadTreeData() {
      getTemplateTreeData().then((res) => {
        res = this.handleTreeData(res)
        this.treeData = res
        this.expandSelectedNodes(this.valueComputed)
      })
    },
    expandSelectedNodes(value) {
      let { tree } = this.$refs
      tree && tree.expandSelectedNodes(value)
    },
    handleTreeData(data) {
      data = [].concat(data.filter((item) => item.id !== this.ignoreKey))
      data.forEach((item) => {
        if (item.type == 0) {
          item.disabled = true
        }
        if (item.children?.length) {
          item.children = this.handleTreeData(item.children)
        }
      })
      return data
    }
  }
}
</script>