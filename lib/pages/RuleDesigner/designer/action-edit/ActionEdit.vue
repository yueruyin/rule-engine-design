<template>
  <ConfigProvider :locale="locale">
    <div class="action-edit">
      <a-tabs v-model="currentTab"
              style="height: 100%">
        <a-tab-pane v-for="item in paneOptions"
                    :key="item.value"
                    :tab="item.label">
          <compponent ref="components"
                      :is="item.componentName"
                      :disabled="disabled"
                      v-bind="$attrs"
                      @change="change" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </ConfigProvider>

</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { ConfigProvider } from 'ant-design-vue'
import ChooseTags from './components/ChooseTags.vue'
import CustomScript from './components/CustomScript.vue'
export default {
  name: 'ActionEdit',
  components: {
    ConfigProvider,
    ChooseTags,
    CustomScript
  },
  props: {
    disabled: { type: Boolean, default: false }
  },
  computed: {
    locale() {
      // 全局中文
      return zhCN
    }
  },
  data() {
    return {
      paneOptions: [
        // {
        //   label: '默认',
        //   value: '0',
        //   componentName: 'ChooseTags'
        // },
        {
          label: '自定义',
          value: '1',
          componentName: 'CustomScript'
        }
      ],
      currentTab: '1',
      executeCustom: '', // 自定义脚本
      executeDefault: [] // 默认
    }
  },
  created() {},
  mounted() {
    const { execute } = this.$attrs
    this.executeCustom = this.$attrs.execute.executeCustom
    this.executeDefault = this.$attrs.execute.executeDefault
    // 如果只配置了自定义，则切换默认tab为自定义
    if (
      execute &&
      execute.executeCustom &&
      (!execute.executeDefault || !execute.executeDefault.length)
    ) {
      this.currentTab = '1'
    }
  },
  methods: {
    change(obj) {
      // type '0':默认 '1':自定义
      if (obj.type === '0') {
        this.executeDefault = obj.value
      } else if (obj.type === '1') {
        this.executeCustom = obj.value
      }
    },
    submit() {
      // if (this.executeCustom === '' && this.executeDefault.length === 0) {
      //   this.message.error('请配置执行脚本')
      //   return false
      // }
      return {
        executeCustom: this.executeCustom,
        executeDefault: this.executeDefault
      }
    }
  }
}
</script>

<style lang='less' scoped>
.action-edit {
  width: 800px;
  height: 500px;

  /deep/.ant-tabs-content {
    height: calc(100% - 43px);
  }
}
</style>