<template>
  <RuleImageButton label="垂直均分"
                   command="LayoutVerticalAveraging"
                   :path="path"
                   v-bind="$attrs"
                   v-on="$listeners"></RuleImageButton>
</template>

<script>
import RuleImageButton from '../imageBtn.vue'

import verticalAveraging from '@/assets/images/vertical-averaging.png'// 垂直均分

export default {
  name: 'LayoutVerticalAveragingButton',
  components: {
    RuleImageButton
  },
  props: {
    path: { type: String, default: verticalAveraging }
  }
}
</script>