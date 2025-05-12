<template>
  <RuleIconButton icon="caret-right"
                  color="#0dbc79"
                  label="执行"
                  command="RuleExecute"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RuleExecuteButton',
  components: {
    RuleIconButton
  }
}
</script>
