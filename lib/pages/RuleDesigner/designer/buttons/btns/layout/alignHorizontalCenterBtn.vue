<template>
  <RuleIconButton color="#ffffff"
                  label="水平居中对齐"
                  command="LayoutAlignHorizontalCenter"
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
      <svg>
        <polyline stroke-width="36"
                  stroke-darharray=""
                  stroke="currentColor"
                  fill="none"
                  name="line"
                  points="60 512 140 512"></polyline>
      </svg>
      <svg>
        <polyline stroke-width="36"
                  stroke-darharray=""
                  stroke="currentColor"
                  fill="none"
                  name="line"
                  points="440 512 964 512"></polyline>
      </svg>
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

import alignHorizontalCenter from '@/assets/images/align-horizontal-center.png'// 水平居中对齐

export default {
  name: 'LayoutAlignHorizontalCenterButton',
  components: {
    RuleIconButton
  },
  props: {
    path: { type: String, default: alignHorizontalCenter }
  }
}
</script>