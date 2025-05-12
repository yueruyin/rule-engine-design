<template>
  <span class="rule-design-btn--icon"
        :class="classNames"
        :title="title || label"
        :style="{ color: !disabled ? color: '#afafaf', fontSize: fontSize }"
        @click="onClick">
    <slot>
      <a-icon :type="icon"
              style="vertical-align: text-top;"
              :style="iconStyle"></a-icon>
    </slot>
  </span>
</template>

<script>
import ButtonMixin from '../mixins/button'

export default {
  name: 'RuleIconButton',
  mixins: [ButtonMixin],
  props: {
    icon: { type: String, default: null },
    iconStyle: { type: [String, Object], default: null },
    fontSize: { type: String, default: null }
  }
}
</script>