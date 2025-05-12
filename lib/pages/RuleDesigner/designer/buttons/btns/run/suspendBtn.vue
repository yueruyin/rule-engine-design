<template>
  <RuleIconButton icon="pause"
                  color="#faad14"
                  label="暂停"
                  command="RuleSuspend"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RuleSuspendButton',
  components: {
    RuleIconButton
  }
}
</script>
