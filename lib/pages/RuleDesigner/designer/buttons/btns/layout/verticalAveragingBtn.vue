<template>
  <RuleIconButton color="#ffffff"
                  label="垂直均分"
                  command="LayoutVerticalAveraging"
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
                points="60 734 212 734"></polyline>
      <polyline stroke-width="36"
                stroke-darharray=""
                stroke="currentColor"
                fill="none"
                name="line"
                points="812 734 966 734"></polyline>
      <polyline stroke-width="36"
                stroke-darharray=""
                stroke="currentColor"
                fill="none"
                name="line"
                points="60 290 966 290"></polyline>
      <svg name="root"
           width="400"
           height="300"
           x="312"
           y="140">
        <rect name="bg"
              x="18"
              y="18"
              width="364"
              height="264"
              stroke="currentColor"
              stroke-width="36"
              rx="5"
              ry="5"
              fill="currentColor"></rect>
      </svg>
      <svg name="root"
           width="600"
           height="300"
           x="212"
           y="584">
        <rect name="bg"
              x="18"
              y="18"
              width="564"
              height="264"
              stroke="currentColor"
              stroke-width="36"
              rx="5"
              ry="5"
              fill="transparent"></rect>
      </svg>
    </svg>
  </RuleIconButton>

</template>

<script>
import RuleIconButton from '../iconBtn.vue'

import verticalAveraging from '@/assets/images/vertical-averaging.png'// 垂直均分

export default {
  name: 'LayoutVerticalAveragingButton',
  components: {
    RuleIconButton
  },
  props: {
    path: { type: String, default: verticalAveraging }
  }
}
</script>