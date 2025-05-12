// ========================================================
// RuleCall节点
// @author wangyb
// @createTime 2023-05-17 14:15:32
// ========================================================

export default {
  'CONTROL_ID': '1000301',
  'CONTROL_TYPE': '31',
  'groupname': '子规则控件',
  'grouporderno': 2,
  'imgpath': '/nodeImgs/juhe.png',
  'CONTROL_NAME': '子规则',
  'CONTROL_DESC': '子规则节点',
  'orderno': 30,
  'WIDTH': 160,
  'HEIGHT': 64,
  'visiable': 1
}

// 定义组件的属性
export const attributes = {
  'name': '子规则属性',
  'children': [
    {
      'CP_CODE': 'id',
      'CP_NAME': 'ID',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': null,
      'orderno': 1,
      'value': null,
      'visiable': 0
    },
    {
      'CP_CODE': 'type',
      'CP_PATH': 'attrs',
      'CP_NAME': '类型',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '子规则',
      'orderno': 1,
      'value': null,
      'visiable': 1,
      'READONLY': 1
    },
    {
      'CP_CODE': 'name',
      'CP_PATH': 'attrs',
      'CP_NAME': '名称',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_TYPE': 'string',
      'CP_DATA_SOURCE': null,
      'CASCADE': 'descText',
      'CASCADE_GROUP': '图形属性',
      'orderno': 1,
      'DEFAULVALUE': '子规则节点',
      'value': null,
      'visiable': 1
    },
    {
      'CP_CODE': 'code',
      'CP_PATH': 'attrs',
      'CP_NAME': '编码',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': null,
      'orderno': 1,
      'value': null
    },
    {
      'CP_CODE': 'together',
      'CP_PATH': 'attrs',
      'CP_NAME': '聚合节点',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'radio',
      'CP_DATA_SOURCE': [{ 'text': '是', 'value': 'y' }, { 'text': '否', 'value': 'n' }],
      'CP_DATA_TYPE': 'string',
      'DEFAULVALUE': 'n',
      'orderno': 2,
      'value': null,
      'visiable': 1
    },
    {
      'CP_CODE': 'executeCallRule',
      'CP_PATH': 'attrs',
      'CP_NAME': '调用参数',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'ejectButton',
      'CP_DATA_SOURCE': [],
      'DEFAULVALUE': null,
      'orderno': 2,
      'value': null,
      'visiable': 1
    },
    {
      'CP_CODE': 'expressionResult',
      'CP_PATH': 'attrs',
      'CP_NAME': '返回值',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'radio',
      'CP_DATA_SOURCE': [{ 'text': '是', 'value': 'y' }, { 'text': '否', 'value': 'n' }],
      'DEFAULVALUE': 'y',
      'orderno': 2,
      'value': null,
      'visiable': 1
    },
    {
      'CP_CODE': 'desc',
      'CP_PATH': 'attrs',
      'CP_NAME': '描述',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'textarea',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'string',
      'DEFAULVALUE': '',
      'orderno': 2,
      'value': null,
      'visiable': 1
    }
  ],
  'visiable': 1
}

// 定义图形属性
export const shapeAttributes = {
  'name': '样式属性',
  'children': [
    {
      'CP_CODE': 'width',
      'CP_NAME': '宽度',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': null,
      'orderno': 5,
      'value': null,
      'visiable': 0
    },
    {
      'CP_CODE': 'height',
      'CP_NAME': '高度',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': null,
      'orderno': 6,
      'value': null,
      'visiable': 0
    },
    {
      'CP_CODE': 'align',
      'CP_NAME': '横向对齐',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'radio',
      'CP_DATA_SOURCE': [{ 'text': '左', 'value': 'left' }, { 'text': '中', 'value': 'center' }, { 'text': '右', 'value': 'right' }],
      'DEFAULVALUE': null,
      'orderno': 7,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000211922',
      'CP_CODE': 'valign',
      'CP_NAME': '纵向对齐',
      'CONTROL_ID': '1000211',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'radio',
      'CP_DATA_SOURCE': [{ 'text': '上', 'value': 'top' }, { 'text': '中', 'value': 'middle' }, { 'text': '下', 'value': 'bottom' }],
      'DEFAULVALUE': null,
      'orderno': 8,
      'value': null,
      'visiable': 0
    },
    {
      'CP_CODE': 'feed',
      'CP_NAME': '换行',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'switch',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': null,
      'orderno': 9,
      'value': null,
      'visiable': 0
    },
    {
      'CP_CODE': 'autoScaleFill',
      'CP_NAME': '缩小字体填充',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'switch',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': null,
      'orderno': 10,
      'value': null,
      'visiable': 0
    },
    {
      'CP_CODE': 'font',
      'CP_NAME': '字体',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': null,
      'orderno': 12,
      'value': null,
      'visiable': 0
    },
    {
      'CP_CODE': 'border',
      'CP_NAME': '边框',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': null,
      'orderno': 18,
      'value': null,
      'visiable': 0
    },

    {
      'CP_CODE': 'fill',
      'CP_NAME': '填充',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': null,
      'orderno': 26,
      'value': null,
      'visiable': 0
    },
    {
      'CP_CODE': 'imageInfo',
      'CP_NAME': '图片信息',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': null,
      'orderno': 26,
      'value': null,
      'visiable': 0
    }
  ],
  'visiable': 0
}

// 定义组件的事件
export const events = {
  'name': '事件',
  'children': [{
    'CP_CODE': 'mouseoverlistener',
    'CP_NAME': '鼠标移入事件',
    'GROUPNAME': '事件',
    'CP_CONTROL_TYPE': 'text',
    'CP_DATA_SOURCE': '',
    'CP_DATA_TYPE': '',
    'DEFAULVALUE': '',
    'orderno': 1,
    'value': null,
    'visiable': 0
  },
  {
    'CP_CODE': 'mouseoutlistener',
    'CP_NAME': '鼠标移出事件',
    'GROUPNAME': '事件',
    'CP_CONTROL_TYPE': 'text',
    'CP_DATA_SOURCE': '',
    'CP_DATA_TYPE': '',
    'DEFAULVALUE': '',
    'orderno': 2,
    'value': null,
    'visiable': 0
  }
  ],
  'visiable': 0
}
