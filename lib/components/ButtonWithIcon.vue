<template>
  <div class="button-with-icon"
       :class="{'active':isActive}"
       :style="{
         width:width
       }">
    <img class="button-icon"
         :src="iconLink" />
    <span>{{ buttonName }}</span>
  </div>
</template>

<script>
import start from '@/assets/images/start.png'
export default {
  name: 'ButtonWithIcon',
  props: {
    width: {
      type: String,
      default: '100%'
    },
    iconLink: {
      type: String,
      default: start
    },
    buttonName: {
      type: String,
      default: '按钮'
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      start
    }
  },
  created () { },
  mounted () { },
  methods: {}
}
</script>

<style lang='less' scoped>
.button-with-icon {
  cursor: pointer;
  color: #fff;
  height: 29px;
  line-height: 29px;
  background: #212121;
  border: 1px dashed rgb(75, 72, 72);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  &:hover {
    background: #323232;
  }

  .button-icon {
    width: 13px;
    margin: 0 11px 0 18px;
  }
}
.active {
  background: #3662ec;
  &:hover {
    background: #3662ec;
  }
}
</style>