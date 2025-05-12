<template>
  <ConfigProvider :locale="locale">
    <a-row class="rules-set">
      <a-form-model ref="formModel"
                    :rules="rules"
                    :model="form"
                    :label-col="labelCol"
                    :wrapper-col="wrapperCol">
        <a-form-model-item label="名称"
                           prop="name">
          <a-input ref="nameInput"
                   v-model="form.name" />
        </a-form-model-item>
        <a-form-model-item label="编码"
                           prop="code">
          <a-input v-model="form.code" />
        </a-form-model-item>
        <a-form-model-item label="版本号"
                           prop="version">
          <a-input disabled
                   v-model="form.version" />
        </a-form-model-item>
        <a-form-model-item label="分组"
                           prop="groupId"
                           v-if="type == '0'">
          <GroupSelectTree v-model="form.groupId"></GroupSelectTree>
        </a-form-model-item>
        <a-form-model-item label="标签"
                           prop="groupId"
                           v-if="type == '1'">
          <SelectTag v-model="form.groupId"></SelectTag>
        </a-form-model-item>

        <a-form-model-item label="规则"
                           v-if="type == '1'">
          <RuleDesignSelectTree ref="tree"
                                v-model="form.ruleCode"
                                :tree-data="treeData"
                                placeholder="基于现有规则创建模版"
                                allow-clear
                                @change="onRuleCodeChange"></RuleDesignSelectTree>
        </a-form-model-item>
        <a-form-model-item label="规则版本"
                           v-if="type == '1'">
          <a-select v-model="form.ruleVersion"
                    placeholder="默认最新发布"
                    dropdown-class-name="dark"
                    allow-clear
                    :label-col="{ span: 6 }"
                    :wrapper-col="{ span: 18 }">
            <a-select-option v-for="item in versionData"
                             :key="item"
                             :value="item">{{ item }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="模板"
                           prop="templateId"
                           v-if="type == '0'">
          <TemplateSelectTree v-model="form.templateId"></TemplateSelectTree>
        </a-form-model-item>
        <!-- <a-form-model-item label="URI"
                           prop="URI">
          <a-input v-model="form.URI" />
        </a-form-model-item> -->
        <a-form-model-item label="描述"
                           prop="desc">
          <a-textarea v-model="form.desc"
                      :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-model-item>
      </a-form-model>
    </a-row>
  </ConfigProvider>
</template>

<script>
import { checkEngineData, queryRuleTree } from '../../../api/table'
import { awaitWrap } from '../../../../utils/sugars'
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { ConfigProvider } from 'ant-design-vue'
import GroupSelectTree from './SelectTree.vue'
import TemplateSelectTree from './TemplateSelectTree.vue'
import SelectTag from './SelectTag.vue'
import RuleDesignSelectTree from '../../../components/tree/select.vue'

import { getRuleVersionList } from '../../../api/rule-designer/index'

export default {
  name: 'RuleSet',
  components: {
    ConfigProvider,
    GroupSelectTree,
    TemplateSelectTree,
    SelectTag,
    RuleDesignSelectTree
  },
  props: {
    groupId: { type: [Number, String], default: 0 },
    type: { type: [String], default: '0' } // 类型(1.规则 2.模版)
  },
  data() {
    return {
      locale: zhCN,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        name: '', // 名称
        code: '', // 编码
        groupId: 0, // 分组ID
        version: '1.0', // 版本号
        URI: '', // 自定义接口名称
        desc: '',
        type: '0', // 描述
        ruleCode: undefined,
        ruleVersion: undefined
      },
      // ignoreKeys: {
      //   type: Array,
      //   default() {
      //     return []
      //   }
      // },
      treeData: [
        {
          id: '',
          value: '',
          name: '无规则'
        }
      ],
      versionData: [],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { pattern: /^[^\s]*$/, message: '禁止输入空格' }
        ],
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' },
          { pattern: /^[^\s]*$/, message: '禁止输入空格' }
        ],
        version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.setFormData({
      groupId: this.groupId,
      type: this.type
    })
  },
  mounted() {
    this.initFormData()
    this.loadTreeData()
    this.loadVersionData()
  },
  methods: {
    setFormData(newFormData) {
      this.form = Object.assign({}, this.form, newFormData)
    },
    // 校验code码、版本号字段和已保存数据是否重复
    async checkFormData() {
      const jsonData = {
        code: this.form.code
      }
      const [err, data] = await awaitWrap(checkEngineData(jsonData))
      if (!err) {
        if (data) {
          // data为true说明数据重复
          this.message.warning('编码或版本号重复，请重新填写')
        }
        return !data
      }
    },
    // 校验表单必填项
    async validateForm() {
      let validResult = await this.$refs.formModel.validate()
      return validResult
    },
    async submit() {
      const result = await this.validateForm()
      if (result) {
        const data = await this.checkFormData()
        if (data) {
          return this.form
        }
      }
    },
    focus() {
      this.$nextTick(() => {
        if (this.$refs.nameInput.$el.focus) {
          this.$refs.nameInput.$el.focus()
        } else {
          this.$refs.nameInput.$el.querySelector('input').focus()
        }
      })
    },
    initFormData() {
      this.form.ruleCode = this.form.ruleCode || undefined
      this.form.ruleVersion = this.form.ruleVersion || undefined
    },
    loadTreeData() {
      queryRuleTree().then((res) => {
        let data = [].concat(res)
        data = this.handleTreeData(data, 0)
        this.treeData = data
      })
    },
    loadVersionData(clearVersion) {
      if (this.form.ruleCode) {
        getRuleVersionList(this.form.ruleCode).then((res) => {
          this.versionData = res
        })
      } else {
        this.versionData = []
      }
      if (clearVersion) {
        this.form.ruleVersion = undefined
      }
    },
    handleTreeData(data, pid) {
      if (!data) {
        return data
      }
      // data = data.filter(
      //   (item) =>
      //     !this.ignoreKeys.includes(item.code) &&
      //     !this.ignoreKeys.includes(item.id)
      // )
      // 数据过滤
      data.forEach((item) => {
        item.parentId = pid
        if (item.type === 'group') {
          item.id = 'group_' + item.id
          item.selectable = false
          item.children = this.handleTreeData(item.children, item.id)
          item.icon = 'folder'
        } else {
          item.id = item.code
          item.icon = 'file-text'
        }
        item.children = item.children || []
      })
      return data
    },
    onRuleCodeChange() {
      this.loadVersionData(true)
    }
  }
}
</script>

<style lang='less' scoped>
.rules-set {
  padding: 20px;
  width: 600px;
}
</style>