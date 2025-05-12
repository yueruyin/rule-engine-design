<template>
  <div class="rule-permission-checkbox-group"
       :class="[theme ? 'rule-permission-checkbox-group--' + theme : '', theme ? theme : '']">
    <template v-if="rules?.length">
      <a-checkbox v-if="showCheckAll"
                  :indeterminate="allPermissionIndeterminate"
                  :checked="allPermissionChecked"
                  :size="size"
                  :disabled="disabled"
                  @change="onAllPermissionChange">全选</a-checkbox>
      <a-checkbox-group v-model="checkedList"
                        :disabled="disabled"
                        @change="onChange">
        <a-checkbox v-for="item in rules"
                    :key="item.value"
                    :value="item.value"
                    :size="size">{{ item.label }}</a-checkbox>
      </a-checkbox-group>
    </template>
    <span v-else
          class="placeholder">
      未配置权限
    </span>
  </div>
</template>

<script>
// 计算权限值
const calcPermission = function (checkedList = []) {
  if (!checkedList?.length) {
    return 0
  }
  let p = 0
  checkedList.forEach((item) => {
    p = p | item
  })
  return p
}
// 拆解权限值
const calcCheckedList = function (p = 0, pList = []) {
  if (!pList?.length || !p) {
    return []
  }
  let checkedList = []
  pList.forEach((item) => {
    if ((p & item) === item) {
      checkedList.push(item)
    }
  })
  return checkedList
}
export default {
  name: 'RulePermissionCheckbox',
  props: {
    // 位合并值，1 | 2 | 4 = 7
    value: { type: Number, default: 0 },
    size: { type: String, default: undefined },
    theme: { type: String, default: undefined },
    // 是否显示全选
    showCheckAll: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    // 传入[{value: 1, label: '移动'}, {value: 2, label: '修改'}, {value: 4, label: '删除'}]
    rules: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      valueComp: 0,
      checkedList: []
    }
  },
  computed: {
    permissionList() {
      return (this.rules || []).map((item) => item.value)
    },
    allPermission() {
      return calcPermission(this.permissionList)
    },
    allPermissionIndeterminate() {
      return !!this.valueComp && this.valueComp !== this.allPermission
    },
    allPermissionChecked() {
      return this.valueComp === this.allPermission
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal !== this.valueComp) {
          this.valueComp = newVal
          this.checkedList = calcCheckedList(
            this.valueComp,
            this.permissionList
          )
        }
      },
      immediate: true
    }
  },
  methods: {
    emitChange() {
      this.valueComp = calcPermission(this.checkedList)
      this.$emit('input', this.valueComp)
      this.$emit('change', this.valueComp)
    },
    onChange() {
      this.emitChange()
    },
    onAllPermissionChange(e) {
      if (e.target.checked) {
        this.checkedList = this.permissionList
      } else {
        this.checkedList = []
      }
      this.emitChange()
    }
  }
}
</script>

<style lang="less">
.rule-permission-checkbox-group {
  &--dark {
    .ant-checkbox-wrapper {
      margin-left: 0px;
      margin-right: 10px;
      color: #ffffff;
    }
    .ant-checkbox-disabled + span {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}
</style>