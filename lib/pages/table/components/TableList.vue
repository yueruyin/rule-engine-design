<template>
  <div class="table-list"
       :style="{
         width:width+'px'
       }">
    <div class="tag"
         v-if="templated == 1"></div>
    <div class="title">
      <span class="text"
            :title="data.name">{{ data.name }}</span>
      <span class="version"
            v-if="templated !=1"
            :class="{'orange':data.publish !== 1}">V{{ data.version }}</span>
    </div>
    <div class="date">
      <span class="code"
            :title="data.code">{{ data.code }}</span>
      <span class="time">{{ data.update_time }}</span>
    </div>
    <div class="describe">
      {{ data.desc }}
    </div>
    <div class="operate">
      <div class="copy"
           @click="$emit('copy')">
        <a-icon type="copy" />
      </div>
      <div class="edit"
           @click="$emit('edit')">
        <a-icon type="edit" />
      </div>
      <div class="delete"
           @click="$emit('delete')">
        <a-icon type="delete" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableList',
  props: {
    width: {
      type: Number,
      default: 328
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return { templated: 0 }
  },
  created() {
    if (window.location.href.includes('template')) {
      this.templated = 1
    } else {
      this.templated = 0
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang='less' scoped>
.table-list {
  position: absolute;
  padding: 0 20px;
  display: inline-block;
  margin: 0 0 10px 10px;
  height: 206px;
  background: #212121;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  .tag {
    &::before {
      position: absolute;
      content: '';
      -webkit-font-smoothing: antialiased;
      background-color: #017fff;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(46deg);
      right: -25px;
      top: 16px;
      width: 98px;
      height: 22px;
    }

    &::after {
      font-size: 24px;
      line-height: 12px;
      right: 0px;
      top: 20px;
      position: absolute;
      -webkit-font-smoothing: antialiased;
      content: '模版';
      -webkit-transform: scale(0.5);
      -ms-transform: scale(0.5);
      transform: scale(0.5);
      color: #fff;
    }
  }

  .title {
    margin-top: 20px;
    font-size: 16px;
    color: #fff;
    display: flex;
    .text {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .version {
      color: #5bc18d;
      text-align: right;
      width: 32px;
      font-size: 14px;
    }
    .orange {
      color: orange;
    }
  }
  .date {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 12px;
    color: #898989;
    .code {
      color: #d55e43;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .time {
      text-align: right;
      width: 70px;
    }
  }
  .describe {
    padding: 10px;
    margin-top: 10px;
    height: 90px;
    background: #2c2c2c;
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    overflow: auto;
  }
  .operate {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    div {
      width: 33.33%;
      text-align: center;
      border-right: 1px solid #5c5c5c;
      &:last-child {
        border: none;
      }
    }
    .finshed {
      color: #5bc18d;
    }
    .edit,
    .delete,
    .copy {
      cursor: pointer;
      color: #fff;

      :hover {
        color: #1890ff;
      }
    }
  }
}
</style>