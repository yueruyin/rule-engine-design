<template>
  <RuleImageButton label="左对齐"
                   command="LayoutLeftJustify"
                   :path="path"
                   v-bind="$attrs"
                   v-on="$listeners"></RuleImageButton>
</template>

<script>
import RuleImageButton from '../imageBtn.vue'

import leftJustify from '@/assets/images/left-justify.png'// 左对齐

export default {
  name: 'LayoutLeftJustifyButton',
  components: {
    RuleImageButton
  },
  props: {
    path: { type: String, default: leftJustify }
  }
}
</script>