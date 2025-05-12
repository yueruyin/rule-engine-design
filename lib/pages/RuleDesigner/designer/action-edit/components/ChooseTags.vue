<template>
  <a-row class="choose-tags">
    <a-col class="tags-container"
           :span="24">
      <a-tag class="tag"
             closable
             @close="closeTag(index)"
             v-for="(item,index) in tagOptions"
             :color="index%2===0?'#87d068':'#2db7f5'"
             :key="item.value">
        {{ item.label }}
      </a-tag>
    </a-col>
    <a-col :span="24">
      <a-select class="select-tags dark"
                placeholder="请选择标签"
                mode="multiple"
                v-model="selectValue"
                dropdownClassName="dark"
                @change="change">
        <a-select-option v-for="item in options"
                         :key="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-col>
  </a-row>
</template>

<script>
import { getActionConfig } from '../../../../../api/rule-designer/index'
import { awaitWrap } from '../../../../../../utils/sugars'
import isEmpty from 'lodash/isEmpty'
export default {
  name: 'ChooseTags',
  props: {
    execute: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    tagOptions: {
      handler (option) {
        const arr = option.map(item => item.value)
        this.$emit('change', { type: '0', value: arr })
      },
      deep: true
    }
  },
  data () {
    return {
      selectValue: [],
      options: [
        {
          label: '选项1',
          value: '0'
        },
        {
          label: '选项2',
          value: '1'
        },
        {
          label: '选项3',
          value: '2'
        },
        {
          label: '选项4',
          value: '3'
        },
        {
          label: '选项5',
          value: '4'
        },
        {
          label: '选项6',
          value: '5'
        }
      ],
      tagOptions: [],
      colorArr: ['#f50', '#2db7f5', '#87d068', '#108ee9']
    }
  },
  created () {
    this.getActionConfig()
  },
  methods: {
    // 关闭标签回调
    closeTag (index) {
      this.tagOptions.splice(index, 1)
      this.selectValue = this.tagOptions.map(item => item.value)
    },
    setDefaultData () {
      if (!isEmpty(this.execute)) {
        this.createTagOptions(this.execute.executeDefault)
        this.selectValue = this.execute.executeDefault
      }
    },
    // 生成标签数据
    createTagOptions (arr) {
      arr.forEach(item => {
        const obj = this.options.find(node => node.value === item)
        this.tagOptions.push(obj)
      })
    },
    async getActionConfig () {
      const [err, data] = await awaitWrap(getActionConfig())
      if (!err) {
        this.options = data.map(item => ({
          label: item.name,
          value: item.code
        }))
        this.setDefaultData()
      }
    },
    change (value) {
      this.tagOptions.length = 0
      this.createTagOptions(value)
    },
    // 提交数据方法
    submit () {
      return this.tagOptions.map(item => item.code)
    }
  }
}
</script>

<style lang='less' scoped>
.choose-tags {
  width: 100%;
  padding: 0px 15px 10px 15px;
  .select-tags {
    width: 100%;
    margin-top: 10px;
  }
  .tags-container {
    display: block;
    width: 100%;
    padding: 10px;
    height: 200px;
    border: 1px solid #595959;
    border-radius: 5px;
    .tag {
      margin-bottom: 5px;
    }
  }
}
</style>