<template>
  <RuleIconButton icon="fast-forward"
                  color="#0dbc79"
                  label="执行到下一个断点"
                  command="RuleNextDebug"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RuleNextDebugButton',
  components: {
    RuleIconButton
  }
}
</script>