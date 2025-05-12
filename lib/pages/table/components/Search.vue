<template>
  <div class="search">
    <div class="form-container">
      <span>名称：</span>
      <a-input class="input"
               v-model="name"></a-input>
    </div>
    <div class="form-container">
      <span>code：</span>
      <a-input class="input"
               v-model="code"></a-input>
    </div>
    <a-button type="primary"
              class="search-button v-a-1"
              @click="search">搜索</a-button>
  </div>
</template>

<script>
export default {
  name: 'Search',
  props: {
    data: { type: Object, default: null }
  },
  data () {
    return {
      name: '',
      code: ''
    }
  },
  watch: {
    data: {
      handler (newVal) {
        if (!newVal) {
          return
        }
        this.name = newVal.name || ''
        this.code = newVal.code || ''
      },
      immediate: true
    }
  },
  created () { },
  mounted () { },
  methods: {
    search () {
      const obj = {
        name: this.name,
        code: this.code
      }
      this.$emit('search', obj)
    }
  }
}
</script>

<style lang='less' scoped>
.search {
  width: 100%;
  .form-container {
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
    margin-right: 20px;
    color: #757575;
    .input {
      display: inline-block;
      width: 150px;
    }
    /deep/.ant-input {
      font-size: 12px;
      display: flex;
      align-items: center;
      background: #212121;
      color: #fff;
      border: none;
    }
  }
  .search-button {
    margin-left: 15px;
    background: #3662ec;
    color: #fff;
    border: none;
  }
}
</style>