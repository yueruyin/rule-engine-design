/**
 * 默认的变量分组配置
 * @author wangyb
 * @createTime 2023-04-20 15:14:17
 */

import ApiFunctions from '../../../../assets/config/apiFunctions'

export const DEFAULT_VARIABLE_GROUPS = [
  {
    id: 'process_variable',
    label: '过程变量',
    visible: true,
    expand: true,
    isLeaf: false,
    type: 'group',
    // 定义如何加载数据，可以是异步请求
    dataSource: {
      // 表示使用传入的handlers中的函数，必须是返回一个Promise
      type: 'dataHandler',
      method: 'loadProcessVariableList'
    }
  },
  {
    id: 'execute_variable',
    label: '执行参数',
    desc: '执行规则时传入的变量，可以在设计器的规则信息中设置',
    visible: true,
    expand: true,
    isLeaf: false,
    type: 'group',
    dataSource: {
      type: 'dataHandler',
      method: 'loadExecuteVariableList'
    }
  },
  {
    id: 'external_global_variable',
    label: '外部全局变量',
    visible: false,
    expand: true,
    isLeaf: false,
    type: 'group'
  },
  {
    id: 'function',
    label: '功能函数',
    visible: false,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: ApiFunctions
  },
  {
    id: 'libraries',
    label: '知识库',
    desc: '保存的自定义脚本片段',
    visible: false,
    isLeaf: false,
    type: 'group'
  }
]