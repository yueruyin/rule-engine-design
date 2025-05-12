<template>
  <RuleImageButton label="垂直居中对齐"
                   command="LayoutAlignVerticalCenter"
                   :path="path"
                   v-bind="$attrs"
                   v-on="$listeners"></RuleImageButton>
</template>

<script>
import RuleImageButton from '../imageBtn.vue'

import alignVerticalCenter from '@/assets/images/align-vertical-center.png'// 垂直居中对齐

export default {
  name: 'LayoutAlignVerticalCenterButton',
  components: {
    RuleImageButton
  },
  props: {
    path: { type: String, default: alignVerticalCenter }
  }
}
</script>