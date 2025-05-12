<template>
  <RuleIconButton icon="read"
                  color="#ffffff"
                  label="执行"
                  command="PreviewDesignJson"
                  v-bind="$attrs"
                  v-on="$listeners" />
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

export default {
  name: 'PreviewDesignJsonButton',
  components: {
    RuleIconButton
  }
}
</script>
