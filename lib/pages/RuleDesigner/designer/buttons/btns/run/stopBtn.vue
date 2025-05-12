<template>
  <RuleShapeButton command="RuleStop"
                   label="停止"
                   :disabled="disabled"
                   v-bind="$attrs"
                   v-on="$listeners">
    <span class="shape"
          :style="{ backgroundColor: disabled ? '#afafaf' : '#f5222d', width, height } "></span>
  </RuleShapeButton>
</template>

<script>
import RuleShapeButton from '../shapeBtn.vue'

export default {
  name: 'RuleStopButton',
  props: {
    disabled: { type: Boolean, default: false },
    width: { type: String, default: undefined },
    height: { type: String, default: undefined }
  },
  components: {
    RuleShapeButton
  }
}
</script>