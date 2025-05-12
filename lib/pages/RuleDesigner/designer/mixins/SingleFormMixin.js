/**
 * 针对单表单组件的通用功能
 * @author wangyb
 * @createTime 2023-04-17 14:32:38
 */

export default {
  props: {
    formWidth: { type: String, default: '800px' },
    formHeight: { type: String, default: null },
    autoInitForm: { type: Boolean, default: true },
    autoInitFormData: { type: Boolean, default: true }
  },
  data () {
    return {
      // ant-design 的表单对象
      form: null,
      formData: {}
    }
  },
  computed: {
    formStyleComputed () {
      return {
        width: this.formWidth,
        height: this.formHeight,
        padding: '6px 15px 0 15px'
      }
    }
  },
  methods: {
    initForm () {
      this.form = this.$form.createForm(this, this.formData)
    },
    setFormValue (name, value) {
      this.form.setFieldsValue({
        [name]: value
      })
    },
    setFormDefaultValue (name, defValue) {
      let value = this.getFormValue(name)
      if (value === null || value === undefined) {
        this.form.setFieldsValue({
          [name]: defValue
        })
      }
    },
    getFormValue (name) {
      return this.form.getFieldValue(name)
    },
    getFormValues () {
      return this.form.getFieldsValue(...arguments)
    },
    // 阻止默认提交
    handleSubmit (e) {
      e.preventDefault()
    },
    // Promise形式的校验
    formValidate () {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (err) {
            reject(err)
            return
          }
          // 校验通过
          resolve()
        })
      })
    }
  },
  // 默认初始化表单对象
  created () {
    this.autoInitForm && this.initForm()
  },
  // 默认构建
  mounted () {
    this.autoInitFormData && this.initFormData()
  }
}
