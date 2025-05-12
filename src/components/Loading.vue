<template>
  <div class="loading">
    <div class="mask"></div>
    <a-spin class="spin"
            tip="Loading..."></a-spin>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  data () {
    return {}
  },
  created () { },
  mounted () { },
  methods: {}
}
</script>

<style lang='less' scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  .mask {
    width: 100%;
    height: 100%;
    background: #aaa;
    opacity: 0.5;
  }
  .spin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
}
</style>