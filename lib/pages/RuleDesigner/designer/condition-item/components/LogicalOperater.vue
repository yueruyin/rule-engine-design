<template>
  <div class="logical-operater">
    <a-radio-group :value="value"
                   :disabled="disabled"
                   @change="change">
      <a-radio value="and">
        且条件
      </a-radio>
      <a-radio value="or">
        或条件
      </a-radio>
    </a-radio-group>
  </div>
</template>

<script>
export default {
  name: 'LogicalOperater',
  props: {
    value: {
      type: String,
      default: 'and'
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      logicalValue: 'and'
    }
  },
  created() {},
  mounted() {},
  methods: {
    change(e) {
      this.logicalValue = e.target.value
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style lang='less' scoped>
.logical-operater {
  width: 100%;
  /deep/.ant-radio-wrapper {
    margin-right: 0;
    margin-left: 15px;
    span {
      padding-right: 0;
    }
  }
}
</style>