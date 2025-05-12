// ========================================================
// 线
// @author wangyb
// @createTime 2023-05-17 14:16:08
// ========================================================

export default {
  'CONTROL_ID': '4000001',
  'CONTROL_TYPE': '41',
  'groupname': '控件',
  'grouporderno': 2,
  'imgpath': '/nodeImgs/juhe.png',
  'CONTROL_NAME': '连接线',
  'orderno': 1,
  'visiable': 0
}

// 定义组件的属性
export const attributes = {
  'name': '线属性',
  'children': [{
    // todo 改为动态生成
    'CP_ID': '4000001100',
    'CP_CODE': 'code',
    'CP_NAME': 'CODE',
    // todo 改为动态追加
    'CONTROL_ID': '4000001',
    'GROUPNAME': '规则属性',
    'CP_CONTROL_TYPE': 'text',
    'CP_DATA_SOURCE': null,
    'DEFAULVALUE': null,
    'orderno': 1,
    'value': null
  },
  {
    'CP_ID': '4000001101',
    'CP_CODE': 'id',
    'CP_NAME': 'ID',
    'CONTROL_ID': '4000001',
    'GROUPNAME': '规则属性',
    'CP_CONTROL_TYPE': 'text',
    'CP_DATA_SOURCE': null,
    'DEFAULVALUE': null,
    'orderno': 1,
    'value': null,
    'visiable': 0
  },
  {
    'CP_ID': '4000001102',
    'CP_CODE': 'text',
    'CP_NAME': '标签',
    'CONTROL_ID': '4000001',
    'GROUPNAME': '规则属性',
    'CP_CONTROL_TYPE': 'text',
    'CP_DATA_SOURCE': null,
    'DEFAULVALUE': '',
    'orderno': 2,
    'value': null,
    'visiable': 0
  }
  ],
  'visiable': 1
}

// 定义图形属性
export const shapeAttributes = {
  'name': '样式属性',
  'children': [
    {
      'CP_ID': '4000001901',
      'CP_CODE': 'lineType',
      'CP_NAME': '线段类型',
      'CONTROL_ID': '4000001',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'integer',
      'DEFAULVALUE': '2',
      'orderno': 2,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '4000001902',
      'CP_CODE': 'lineWeight',
      'CP_NAME': '线段宽度',
      'CONTROL_ID': '4000001',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'float',
      'DEFAULVALUE': '2',
      'orderno': 3,
      'value': null,
      'visiable': 0
    },
    {
      'CP_ID': '4000001903',
      'CP_CODE': 'lineDash',
      'CP_NAME': '虚线',
      'CONTROL_ID': '4000001',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'float',
      'DEFAULVALUE': '2',
      'orderno': 6,
      'value': null,
      'visiable': 0
    },

    {
      'CP_ID': '4000001924',
      'CP_CODE': 'lineOpacity',
      'CP_NAME': '透明度',
      'CONTROL_ID': '4000001',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'CP_DATA_TYPE': 'float',
      'DEFAULVALUE': '0',
      'orderno': 10,
      'value': null
    },
    {
      'CP_ID': '4000001913',
      'CP_CODE': 'font',
      'CP_NAME': '字体',
      'CONTROL_ID': '4000001',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '{"default":{"family":"STSong-Light","color":"red","size":"22"},"selected":{"family":"STSong-Light","color":"blue","size":"24"}}',
      'orderno': 12,
      'value': null
    },

    {
      'CP_ID': '4000001911',
      'CP_CODE': 'fill',
      'CP_NAME': '填充',
      'CONTROL_ID': '4000001',
      'GROUPNAME': '图形属性',
      'CP_CONTROL_TYPE': 'text',
      'CP_DATA_SOURCE': null,
      'DEFAULVALUE': '{"default":{"color":"#FFFFFF"},"selected":{"color":"#01FBF2"}}',
      'orderno': 26,
      'value': null
    }
  ],
  'visiable': 1
}

// 定义组件的事件
export const events = {
  'name': '事件',
  'children': [{
    'CP_ID': '4000001301',
    'CP_CODE': 'mouseoverlistener',
    'CP_NAME': '鼠标移入事件',
    'CONTROL_ID': '4000001',
    'GROUPNAME': '事件',
    'CP_CONTROL_TYPE': 'text',
    'CP_DATA_SOURCE': '',
    'CP_DATA_TYPE': '',
    'DEFAULVALUE': '',
    'orderno': 1,
    'value': null
  },
  {
    'CP_ID': '4000001302',
    'CP_CODE': 'mouseoutlistener',
    'CP_NAME': '鼠标移出事件',
    'CONTROL_ID': '4000001',
    'GROUPNAME': '事件',
    'CP_CONTROL_TYPE': 'text',
    'CP_DATA_SOURCE': '',
    'CP_DATA_TYPE': '',
    'DEFAULVALUE': '',
    'orderno': 2,
    'value': null
  }
  ],
  'visiable': 0
}
