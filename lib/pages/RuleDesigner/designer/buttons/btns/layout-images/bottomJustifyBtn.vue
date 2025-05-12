<template>
  <RuleImageButton label="下对齐"
                   command="LayoutBottomJustify"
                   :path="path"
                   v-bind="$attrs"
                   v-on="$listeners"></RuleImageButton>
</template>

<script>
import RuleImageButton from '../imageBtn.vue'

import bottomJustify from '@/assets/images/bottom-justify.png'// 下对齐

export default {
  name: 'LayoutBottomJustifyButton',
  components: {
    RuleImageButton
  },
  props: {
    path: { type: String, default: bottomJustify }
  }
}
</script>