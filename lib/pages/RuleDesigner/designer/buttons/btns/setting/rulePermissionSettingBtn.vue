<template>
  <RuleIconButton icon="setting"
                  color="#ffffff"
                  label="权限设置"
                  command="RulePermissionSetting"
                  :fontSize="fontSize"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RulePermissionSettingButton',
  components: {
    RuleIconButton
  },
  props: {
    fontSize: { type: String, default: '16px' }
  }
}
</script>
