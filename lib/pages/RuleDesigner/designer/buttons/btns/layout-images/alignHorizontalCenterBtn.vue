<template>
  <RuleImageButton label="水平居中对齐"
                   command="LayoutAlignHorizontalCenter"
                   :path="path"
                   v-bind="$attrs"
                   v-on="$listeners"></RuleImageButton>
</template>

<script>
import RuleImageButton from '../imageBtn.vue'

import alignHorizontalCenter from '@/assets/images/align-horizontal-center.png'// 水平居中对齐

export default {
  name: 'LayoutAlignHorizontalCenterButton',
  components: {
    RuleImageButton
  },
  props: {
    path: { type: String, default: alignHorizontalCenter }
  }
}
</script>