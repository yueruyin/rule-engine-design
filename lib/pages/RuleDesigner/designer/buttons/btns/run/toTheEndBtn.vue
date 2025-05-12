<template>
  <RuleIconButton icon="fast-forward"
                  color="#0dbc79"
                  label="继续执行"
                  command="RuleToTheEnd"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'RuleToTheEndButton',
  components: {
    RuleIconButton
  }
}
</script>
