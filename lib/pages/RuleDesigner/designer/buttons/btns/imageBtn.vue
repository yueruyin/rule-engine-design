<template>
  <span class="rule-design-btn--img"
        :class="classNames"
        :title="label"
        @click="onClick">
    <img :src="path" />
  </span>
</template>

<script>
import ButtonMixin from '../mixins/button'

export default {
  name: 'RuleImageButton',
  mixins: [ButtonMixin],
  props: {
    path: { type: String, default: null }
  }
}
</script>