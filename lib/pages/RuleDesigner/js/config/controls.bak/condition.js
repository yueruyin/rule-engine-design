// ========================================================
// 条件节点
// @author wangyb
// @createTime 2023-05-17 14:12:50
// ========================================================

export default {
  'CONTROL_ID': '1000207',
  'CONTROL_TYPE': '26',
  'groupname': '控件',
  'grouporderno': 2,
  'imgpath': '/nodeImgs/juhe.png',
  'CONTROL_NAME': '条件节点',
  'CONTROL_DESC': '添加条件',
  'orderno': 1,
  'WIDTH': 100,
  'HEIGHT': 100,
  'visiable': 1
}

// 定义组件的属性
export const attributes = {
  'name': '条件属性',
  'children': [
    {
      'CP_ID': '1000207101',
      'CP_CODE': 'id',
      'CP_NAME': 'ID',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': null,
      'orderno': 1,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207102',
      'CP_CODE': 'type',
      'CP_NAME': '类型',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '条件',
      'orderno': 1,
      'value': null,
      'visiable': 1,
      'READONLY': 1
    },
    {
      'CP_ID': '1000207104',
      'CP_CODE': 'name',
      'CP_NAME': '名称',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '名称',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'string',
      'DEFAULVALUE': '条件节点',
      'CASCADE': 'text',
      'CASCADE_GROUP': '图形属性',
      'orderno': 1,
      'value': null,
      'visiable': 1
    },
    {
      'CP_ID': '1000207103',
      'CP_CODE': 'code',
      'CP_NAME': '编码',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '',
      'orderno': 1,
      'value': null,
      'visiable': 1
    },
    {
      'CP_ID': '1000207105',
      'CP_CODE': 'descText',
      'CP_NAME': '条件',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'textarea',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'string',
      'DEFAULVALUE': '',
      'orderno': 2,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207106',
      'CP_CODE': 'desc',
      'CP_NAME': '描述',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '规则属性',
      'CP_DATA_TYPE': 'string',
      'CP_CONTROL_TYPE': 'textarea',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '',
      'orderno': 2,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207107',
      'CP_CODE': 'together',
      'CP_NAME': '聚合节点',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '规则属性',
      'CP_CONTROL_TYPE': 'radio',
      'CP_DATA_SOURCE': [{ 'text': '是', 'value': 'y' }, { 'text': '否', 'value': 'n' }],
      'CP_DATA_TYPE': 'string',
      'DEFAULVALUE': 'n',
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
      'CP_ID': '1000207901',
      'CP_CODE': 'width',
      'CP_NAME': '宽度',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': '80',
      'orderno': 5,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207902',
      'CP_CODE': 'height',
      'CP_NAME': '高度',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': '24',
      'orderno': 6,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207921',
      'CP_CODE': 'align',
      'CP_NAME': '横向对齐',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'radio',
      'CP_DATA_SOURCE': [{ 'text': '左', 'value': 'left' }, { 'text': '中', 'value': 'center' }, { 'text': '右', 'value': 'right' }],
      'DEFAULVALUE': 'center',
      'orderno': 7,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207922',
      'CP_CODE': 'valign',
      'CP_NAME': '纵向对齐',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'radio',
      'CP_DATA_SOURCE': [{ 'text': '上', 'value': 'top' }, { 'text': '中', 'value': 'middle' }, { 'text': '下', 'value': 'bottom' }],
      'DEFAULVALUE': 'middle',
      'orderno': 8,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207923',
      'CP_CODE': 'feed',
      'CP_NAME': '换行',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'switch',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': '1',
      'orderno': 9,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207924',
      'CP_CODE': 'autoScaleFill',
      'CP_NAME': '缩小字体填充',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'switch',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': '1',
      'orderno': 10,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207913',
      'CP_CODE': 'font',
      'CP_NAME': '字体',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '{"default":{"family":"Arial Normal","color":"black","size":"8"},"selected":{"family":"Arial Normal","color":"black","size":"8"}}',
      'orderno': 12,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207903',
      'CP_CODE': 'border',
      'CP_NAME': '边框',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '{"default":{"left":{"width":"1","color":"transparent","dash":""},"right":{"width":"1","color":"transparent","dash":""},"top":{"width":"1","color":"transparent","dash":""},"bottom":{"width":"1","color":"transparent","dash":""}},"selected":{"left":{"width":"3","color":"#2461ef","dash":""},"right":{"width":"3","color":"#2461ef","dash":""},"top":{"width":"3","color":"#2461ef","dash":""},"bottom":{"width":"3","color":"#2461ef","dash":""}}}',
      'orderno': 18,
      'value': null,
      'visiable': 0
    },

    {
      'CP_ID': '1000207911',
      'CP_CODE': 'fill',
      'CP_NAME': '填充',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '{"default":{"color":"#3662ec"},"selected":{"color":"#233661"}}',
      'orderno': 26,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '1000207925',
      'CP_CODE': 'imageInfo',
      'CP_NAME': '图片信息',
      'CONTROL_ID': '1000207',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '{"path":"condition","wight":30,"heigth":30}',
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
    'CP_ID': '1000207301',
    'CP_CODE': 'mouseoverlistener',
    'CP_NAME': '鼠标移入事件',
    'CONTROL_ID': '1000207',
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
    'CP_ID': '1000207302',
    'CP_CODE': 'mouseoutlistener',
    'CP_NAME': '鼠标移出事件',
    'CONTROL_ID': '1000207',
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
