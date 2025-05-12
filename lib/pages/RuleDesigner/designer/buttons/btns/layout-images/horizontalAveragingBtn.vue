<template>
  <RuleImageButton label="水平均分"
                   command="LayoutHorizontalAveraging"
                   :path="path"
                   v-bind="$attrs"
                   v-on="$listeners"></RuleImageButton>
</template>

<script>
import RuleImageButton from '../imageBtn.vue'

import horizontalAveraging from '@/assets/images/horizontal-averaging.png'// 水平均分

export default {
  name: 'LayoutHorizontalAveragingButton',
  components: {
    RuleImageButton
  },
  props: {
    path: { type: String, default: horizontalAveraging }
  }
}
</script>