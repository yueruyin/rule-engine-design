<template>
  <RuleImageButton label="上对齐"
                   command="LayoutAlignTop"
                   :path="path"
                   v-bind="$attrs"
                   v-on="$listeners"></RuleImageButton>
</template>

<script>
import RuleImageButton from '../imageBtn.vue'

import alignTop from '@/assets/images/align-top.png'// 上对齐

export default {
  name: 'LayoutAlignTopButton',
  components: {
    RuleImageButton
  },
  props: {
    path: { type: String, default: alignTop }
  }
}
</script>