<template>
  <div>
    <!-- <a-space>
      <a-button @click="getData">
        提取数据
      </a-button>
    </a-space> -->
    <!-- 设计器 -->
    <FlowDesign :flowId="flowId"
                :version="version"
                :propertyConfig="propertyConfig"
                :formDesc="formDesc"
                ref="FlowDesign" />
  </div>
</template>

<script>
// 设计器控件
import { FlowDesign } from '@zh/feiliu-ant'
// 额外属性配置文件
import config from './config'
// 表单条件项目mock文件
import conditionMock from './conditionMock'
export default {
  name: 'FlowExpandProperty',
  components: { FlowDesign },
  data () {
    return {
      // 流程id
      flowId: '1554659468468314113',
      // 额外属性配置
      propertyConfig: config,
      // 表单设计版本
      version: '',
      // 表单条件项目
      formDesc: conditionMock
    }
  },
  mounted () { },
  methods: {
    getData() {
      const serialDesign = this.$refs.FlowDesign.getFlowCanvas()
    }
  }
}
</script>

<style lang="less" scoped>
</style>