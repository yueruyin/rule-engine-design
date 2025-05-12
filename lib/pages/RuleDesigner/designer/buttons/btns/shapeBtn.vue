<template>
  <span class="rule-design-btn--shape"
        :class="classNames"
        :title="label"
        @click="onClick">
    <!-- 只提供基础包装，由按钮去实现内部的图形 -->
    <slot></slot>
  </span>
</template>

<script>
import ButtonMixin from '../mixins/button'

export default {
  name: 'RuleShapeButton',
  mixins: [ButtonMixin]
}
</script>