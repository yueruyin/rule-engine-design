<template>
  <RuleIconButton icon="forward"
                  color="#0dbc79"
                  label="执行所有"
                  command="RuleExecuteAll"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RuleExecuteAllButton',
  components: {
    RuleIconButton
  }
}
</script>