<template>
  <RuleIconButton color="#ffffff"
                  label="水平均分"
                  command="LayoutHorizontalAveraging"
                  v-bind="$attrs"
                  v-on="$listeners">
    <svg viewBox="0 0 1024 1024"
         data-icon="align-top"
         width="1em"
         height="1em"
         fill="currentColor"
         aria-hidden="true"
         focusable="false"
         class="">

      <polyline stroke-width="36"
                stroke-darharray=""
                stroke="currentColor"
                fill="none"
                name="line"
                points="290 60 290 212"></polyline>
      <polyline stroke-width="36"
                stroke-darharray=""
                stroke="currentColor"
                fill="none"
                name="line"
                points="290 812 290 966"></polyline>
      <polyline stroke-width="36"
                stroke-darharray=""
                stroke="currentColor"
                fill="none"
                name="line"
                points="734 60 734 966"></polyline>
      <svg name="root"
           width="300"
           height="600"
           x="140"
           y="212">
        <rect name="bg"
              x="18"
              y="18"
              width="264"
              height="564"
              stroke="currentColor"
              stroke-width="36"
              rx="5"
              ry="5"
              fill="transparent"></rect>
      </svg>
      <svg name="root"
           width="300"
           height="400"
           x="584"
           y="312">
        <rect name="bg"
              x="18"
              y="18"
              width="264"
              height="364"
              stroke="currentColor"
              stroke-width="36"
              rx="5"
              ry="5"
              fill="currentColor"></rect>
      </svg>
    </svg>
  </RuleIconButton>
</template>

<script>
import RuleIconButton from '../iconBtn.vue'

import horizontalAveraging from '@/assets/images/horizontal-averaging.png'// 水平均分

export default {
  name: 'LayoutHorizontalAveragingButton',
  components: {
    RuleIconButton
  },
  props: {
    path: { type: String, default: horizontalAveraging }
  }
}
</script>