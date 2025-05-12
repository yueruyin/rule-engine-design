<template>
  <div class="entry-input">
    <a-input :placeholder="placeholder"
             :value="value"
             :disabled="disabled"
             @change="change"
             @focus="focus"></a-input>
  </div>
</template>

<script>
export default {
  name: 'EntryInput',
  props: {
    placeholder: {
      type: String,
      default: '请输入变量'
    },
    value: {
      type: String,
      default: ''
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      variable: ''
    }
  },
  created() {},
  mounted() {},
  methods: {
    change(e) {
      this.$emit('input', e.target.value)
    },
    focus() {
      this.$emit('focus', ...arguments)
    }
  }
}
</script>

<style lang='less' scoped>
.entry-input {
  width: 100%;
}
</style>