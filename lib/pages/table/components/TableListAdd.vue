<template>
  <div class="table-list-add"
       :style="{
         width:width+'px'
       }">
    <div class="add"
         @click="$emit('add')">
      <img class="add-list"
           src="@/assets/images/add-list.png" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableListAdd',
  props: {
    width: {
      type: Number,
      default: 328
    }
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang='less' scoped>
.table-list-add {
  padding: 0 10px;
  margin: 0 0 10px 10px;
  height: 206px;
  background: #212121;
  border-radius: 4px;
  float: left;
  display: flex;
  align-items: center;
  justify-content: center;
  .add {
    cursor: pointer;
    width: calc(100% - 20px);
    height: calc(100% - 40px);
    border: 1px dashed #3662ec;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    .add-list {
      width: 33px;
    }
  }
}
</style>