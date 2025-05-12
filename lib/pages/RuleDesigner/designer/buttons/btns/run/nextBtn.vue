<template>
  <RuleIconButton icon="step-forward"
                  color="#0dbc79"
                  label="下一步"
                  command="RuleNext"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RuleNextButton',
  components: {
    RuleIconButton
  }
}
</script>
