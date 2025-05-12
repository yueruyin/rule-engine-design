<template>
  <RuleImageButton label="右对齐"
                   command="LayoutRightAlignment"
                   :path="path"
                   v-bind="$attrs"
                   v-on="$listeners"></RuleImageButton>
</template>

<script>
import RuleImageButton from '../imageBtn.vue'

import rightAlignment from '@/assets/images/right-alignment.png'// 右对齐

export default {
  name: 'LayoutRightAlignmentButton',
  components: {
    RuleImageButton
  },
  props: {
    path: { type: String, default: rightAlignment }
  }
}
</script>