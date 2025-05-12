<template>
  <div class="entry-type-select">
    <a-select class="entry-type-select"
              placeholder="请选择类型"
              :value="value"
              :disabled="disabled"
              @change="change">
      <a-select-option v-for="(item,index) in entryOptions"
                       :key="index"
                       :value="item.value">
        {{ item.label }}
      </a-select-option>
    </a-select>
  </div>
</template>

<script>
import { TYPE_OPTIONS } from './config'

export default {
  name: 'EntryTypeSelect',
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      entryOptions: TYPE_OPTIONS
    }
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
.entry-type-select {
  width: 100%;
}
</style>