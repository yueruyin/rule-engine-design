<template>
  <div class="choose-date">
    <a-date-picker :value="value"
                   class="date-picker"
                   :disabled="disabled"
                   @change="change" />
  </div>
</template>

<script>
export default {
  name: 'ChooseDate',
  props: {
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
    change(date, dateString) {
      this.$emit('input', dateString)
    }
  }
}
</script>

<style lang='less' scoped>
.choose-date {
  width: 100%;
  .date-picker {
    width: 100%;
  }
}
</style>