// ========================================================
// 画布
// @author wangyb
// @createTime 2023-05-17 14:19:24
// ========================================================
export default {
  CONTROL_ID: '999',
  CONTROL_TYPE: '999',
  groupname: '容器',
  grouporderno: 2,
  imgpath: '/nodeImgs/juhe.png',
  CONTROL_NAME: '画布',
  CONTROL_DESC: '画布',
  orderno: 0,
  WIDTH: 2000,
  HEIGHT: 1000,
  visiable: 0
}

// 定义组件的属性
export const attributes = {
  name: '规则信息',
  children: [
    {
      CP_ID: '10001',
      CP_CODE: 'ruleName',
      CP_PATH: 'attrs',
      CP_NAME: '名称',
      CONTROL_ID: '1000',
      GROUPNAME: '基础信息',
      CP_CONTROL_TYPE: 'text',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: '',
      orderno: 1,
      value: null
    },
    {
      CP_ID: '10002',
      CP_CODE: 'ruleCode',
      CP_PATH: 'attrs',
      CP_NAME: '编码',
      CONTROL_ID: '1000',
      GROUPNAME: '基础信息',
      CP_CONTROL_TYPE: 'text',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: '',
      orderno: 1,
      value: null,
      READONLY: window.$rule?.forbidEditRuleCode ? 1 : 0,
      rules: [{ validator: 'checkRuleCode', trigger: 'blur' }]
    },
    {
      CP_ID: '10003',
      CP_CODE: 'ruleVersion',
      CP_PATH: 'attrs',
      CP_NAME: '版本',
      CONTROL_ID: '1000',
      GROUPNAME: '基础信息',
      CP_CONTROL_TYPE: 'text',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: '',
      orderno: 1,
      value: null,
      READONLY: 1
    },
    {
      CP_ID: '10004',
      CP_CODE: 'ruleURI',
      CP_PATH: 'attrs',
      CP_NAME: 'URI',
      CONTROL_ID: '1000',
      GROUPNAME: 'URI',
      CP_CONTROL_TYPE: 'text',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: '',
      orderno: 1,
      value: null,
      READONLY: 1
    },
    {
      CP_ID: '10003',
      CP_CODE: 'ruleGroup',
      CP_PATH: 'attrs',
      CP_NAME: '分组',
      CONTROL_ID: '1000',
      GROUPNAME: '基础信息',
      CP_CONTROL_TYPE: 'group-select-tree',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: 0,
      orderno: 1,
      value: null,
      READONLY: 0,
      vif(designer) {
        return !designer.isTemplateEditMode
      }
    },
    {
      CP_ID: '10004',
      CP_CODE: 'ruleGroup',
      CP_PATH: 'attrs',
      CP_NAME: '标签',
      CONTROL_ID: '1000',
      GROUPNAME: '基础信息',
      CP_CONTROL_TYPE: 'select-tag',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: 0,
      orderno: 1,
      value: null,
      READONLY: 0,
      vif(designer) {
        return !!designer.isTemplateEditMode
      }
    },
    {
      CP_ID: '10005',
      CP_CODE: 'ruleDesc',
      CP_PATH: 'attrs',
      CP_NAME: '描述',
      CONTROL_ID: '1000',
      GROUPNAME: 'desc',
      CP_CONTROL_TYPE: 'textarea',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: '',
      orderno: 1,
      value: null
    },
    {
      CP_ID: '10006',
      CP_CODE: 'ruleArguments',
      CP_PATH: 'attrs',
      CP_NAME: '执行参数',
      CONTROL_ID: '1001',
      GROUPNAME: 'arguments',
      CP_CONTROL_TYPE: 'table-editor',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: [],
      orderno: 1,
      value: null
    },
    {
      CP_ID: '10007',
      CP_CODE: 'resultDefine',
      CP_PATH: 'attrs',
      CP_NAME: '返回值设置',
      CONTROL_ID: '1002',
      GROUPNAME: 'resultDefine',
      CP_CONTROL_TYPE: 'rule-result-editor',
      CP_DATA_SOURCE: null,
      CP_DATA_TYPE: '',
      DEFAULVALUE: '{}',
      orderno: 1,
      value: null
    }
  ]
}
