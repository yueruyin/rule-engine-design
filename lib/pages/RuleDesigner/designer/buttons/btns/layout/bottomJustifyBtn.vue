<template>
  <RuleIconButton color="#ffffff"
                  label="下对齐"
                  command="LayoutBottomJustify"
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
                points="60 846 964 846"></polyline>
      <svg name="root"
           width="300"
           height="600"
           x="140"
           y="110">
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
           y="310">
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

import bottomJustify from '@/assets/images/bottom-justify.png'// 下对齐

export default {
  name: 'LayoutBottomJustifyButton',
  components: {
    RuleIconButton
  },
  props: {
    path: { type: String, default: bottomJustify }
  }
}
</script>