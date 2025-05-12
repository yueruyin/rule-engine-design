<template>
  <RuleIconButton icon="bug"
                  color="#0dbc79"
                  label="调试"
                  command="RuleDebug"
                  :fontSize="fontSize"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RuleDebugButton',
  components: {
    RuleIconButton
  },
  props: {
    fontSize: { type: String, default: '16px' }
  }
}
</script>
