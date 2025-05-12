<template>
  <div class="table-editor"
       :class="[theme ? 'table-editor--' + theme: '']"
       :style="{height: height + 38 + 'px'}">
    <a-table :data-source="nodes"
             :columns="columns"
             row-key="id"
             :pagination="false"
             :size="size"
             :scroll="tableScroll">
      <template #permissionTitle>
        <RulePermissionCheck v-model="permission"
                             :rules="rules"
                             :size="size"
                             :theme="theme"
                             :disabled="!nodes?.length"
                             @change="onAllPermissionChange"></RulePermissionCheck>
      </template>
      <template #permission="text, scope">
        <RulePermissionCheck v-model="scope.permission"
                             :rules="rules"
                             :size="size"
                             :theme="theme"
                             @change="onPermissionChange"></RulePermissionCheck>
      </template>
    </a-table>
  </div>
</template>

<script>
import RulePermissionCheck from './checkbox.vue'

import { RULE_PERMISSION_OPTIONS } from '../../pages/RuleDesigner/config/permission'

export default {
  name: 'RulePermissionSetting',
  components: {
    RulePermissionCheck
  },
  props: {
    // 传入规则JSON
    value: { type: [String, Object], default: undefined },
    theme: { type: String, default: 'dark' },
    size: { type: String, default: 'small' },
    height: { type: Number, default: undefined }
  },
  data() {
    return {
      valueComp: null,
      ruleDesign: {},
      nodes: [],
      columns: [
        {
          title: '编码',
          dataIndex: 'code'
        },
        {
          title: '节点',
          dataIndex: 'name'
        },
        {
          dataIndex: 'permission',
          width: 300,
          slots: { title: 'permissionTitle' },
          scopedSlots: { customRender: 'permission' }
        }
      ],
      rules: RULE_PERMISSION_OPTIONS,
      permission: 0
    }
  },
  computed: {
    tableScroll() {
      let scroll = {
        x: false
      }
      if (this.height) {
        scroll.y = this.height
      }
      return scroll
    },
    allPermission() {
      let p = 0
      this.rules.forEach((item) => (p = p | item.value))
      return p
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal !== this.valueComp) {
          this.valueComp = newVal
          //
          if (typeof newVal === 'string') {
            newVal = JSON.parse(newVal)
          }
          this.ruleDesign = newVal
          // 提取节点
          let rootModels = this.ruleDesign.rootModels || {}
          let node
          let nodes = []
          let index = 0
          for (let key in rootModels) {
            node = rootModels[key]
            // 不需要对线进行权限设置
            if (node.modelType === 'RDLine') {
              continue
            }
            console.log('permission', node.permission)
            nodes.push({
              id: node.id,
              code: node.attrs?.code,
              name: node.attrs?.title || node.attrs?.name,
              permission: node.permission || 0,
              index: ++index
            })
          }
          this.nodes = nodes
          // 计算所有权限的值
          this.calcPermission()
        }
      },
      immediate: true
    }
  },
  methods: {
    emitChange() {
      // 合并权限值
      let rootModels = this.ruleDesign.rootModels || {}
      this.nodes.forEach(({ id, permission }) => {
        rootModels[id].permission = permission
      })
      if (typeof this.valueComp === 'string') {
        this.valueComp = JSON.stringify(this.ruleDesign)
      } else {
        this.valueComp = this.ruleDesign
      }
      if (this.valueComp !== this.value) {
        this.$emit('input', this.valueComp)
        this.$emit('change', this.valueComp)
      }
    },
    onPermissionChange() {
      // 计算所有权限的值
      this.calcPermission()
      this.emitChange()
    },
    onAllPermissionChange(allPermission) {
      this.nodes.forEach((item) => {
        item.permission = allPermission
      })
      this.emitChange()
    },
    calcPermission() {
      // 没有节点时，只能为0
      if (!this.nodes?.length) {
        this.permission = 0
        return
      }
      let p = this.allPermission
      this.nodes.every(({ permission: np }) => {
        // 如果有任意节点权限未设置，则返回0值
        if (!np) {
          p = 0
          return false
        }
        // 合并节点权限
        p = p & np
        return true
      })
      this.permission = p
    }
  }
}
</script>