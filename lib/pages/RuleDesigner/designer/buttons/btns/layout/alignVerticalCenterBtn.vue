<template>
  <RuleIconButton color="#ffffff"
                  label="垂直居中对齐"
                  command="LayoutAlignVerticalCenter"
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
                points="512 884 512 966"></polyline>
      <polyline stroke-width="36"
                stroke-darharray=""
                stroke="currentColor"
                fill="none"
                name="line"
                points="512 60 512 584"></polyline>
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

import alignVerticalCenter from '@/assets/images/align-vertical-center.png'// 垂直居中对齐

export default {
  name: 'LayoutAlignVerticalCenterButton',
  components: {
    RuleIconButton
  },
  props: {
    path: { type: String, default: alignVerticalCenter }
  }
}
</script>