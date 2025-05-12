<template>
  <div class="choose-symbol">
    <a-select class="choose-symbol-select"
              :value="value"
              :disabled="disabled"
              @change="change"
              placeholder="请选择符号">
      <a-select-option v-for="(item,index) in options"
                       :key="index"
                       :value="item.value">
        {{ item.label }}
      </a-select-option>
    </a-select>
  </div>
</template>

<script>
export default {
  name: 'ChooseSymbol',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {
    change(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang='less' scoped>
.choose-symbol {
  width: 100%;
  .choose-symbol-select {
    width: 100%;
  }
}
</style>