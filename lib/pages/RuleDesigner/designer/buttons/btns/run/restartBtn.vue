<template>
  <RuleIconButton icon="retweet"
                  color="#0dbc79"
                  label="重启"
                  command="RuleRestart"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RuleRestartButton',
  components: {
    RuleIconButton
  }
}
</script>
