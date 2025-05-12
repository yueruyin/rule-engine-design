<template>
  <ConfigProvider :locale="locale">
    <a-form-model ref="form"
                  :model="formData"
                  :size="size"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                  :rules="rules"
                  :style="{ width, height }"
                  style="padding: 20px;"
                  @submit="submit">
      <a-form-model-item label="分组名"
                         prop="name"
                         required>
        <a-input ref="nameInput"
                 v-model="formData.name"
                 allow-clear></a-input>
      </a-form-model-item>
      <a-form-model-item v-if="showParentId"
                         label="父分组"
                         prop="parentId">
        <GroupSelectTree v-model="formData.parentId"
                         :ignore-key="groupInfo && groupInfo.id"></GroupSelectTree>
      </a-form-model-item>
      <a-form-model-item label="归属角色">
        <RoleSelect @selected-event="handleEvent"
                    :groupInfo="this.groupInfo"></RoleSelect>
      </a-form-model-item>
    </a-form-model>
  </ConfigProvider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { ConfigProvider } from 'ant-design-vue'
import GroupSelectTree from './SelectTree.vue'
import RoleSelect from './RoleSelect.vue'

export default {
  name: 'GroupModel',
  components: {
    ConfigProvider,
    GroupSelectTree,
    RoleSelect
  },
  props: {
    groupInfo: { type: Object, default: null },
    size: { type: String, default: null },
    theme: { type: String, default: 'dark' },
    width: { type: String, default: '600px' },
    height: { type: String, default: '460px' },
    showParentId: { type: Boolean, default: true }
  },
  data() {
    return {
      locale: zhCN,
      roleInfo: [],
      formData: {
        roleIds: []
      },
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      rules: {
        name: [{ required: true, message: '分组名是必填项' }]
      }
    }
  },
  created() {},
  mounted() {
    this.setFormData(this.groupInfo)
  },
  methods: {
    handleEvent(data) {
      this.formData.roleIds = data
    },
    setFormData(newFormData) {
      this.formData = Object.assign({}, newFormData)
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
    submit() {
      return new Promise((resolve, reject) => {
        const { form } = this.$refs
        form &&
          form.validate((valid, err) => {
            if (valid) {
              resolve(this.formData)
            } else {
              reject(err)
            }
          })
      })
    }
  }
}
</script>
