// ========================================================
// 支持的功能函数
// @author wangyb
// @createTime 2023-07-12 11:39:39
// ========================================================

import { cloneDeep } from 'lodash'

const apiFunctions = [
  {
    id: 'apiGroupBasic',
    label: '基础函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'print',
        label: 'print',
        value: 'print',
        suggestion: '', // 提示内容
        demo: '' // 示例
      },
      {
        id: 'panic',
        label: 'panic'
      },
      {
        id: 'isNil',
        label: 'isNil'
      },
      {
        id: 'if',
        label: '条件',
        shortLabel: 'IF',
        value: 'if',
        suggestion: 'if(1=1,1,2)',
        fast: true,
        fastSort: 8
      }
    ]
  },
  // 执行函数
  {
    id: 'apiGroupExecute',
    label: '执行函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'executeEnginePool',
        label: 'executeEnginePool'
      },
      {
        id: 'executeEngineRule',
        label: 'executeEngineRule'
      },
      {
        id: 'executeEngineCallRule',
        label: 'executeEngineCallRule'
      },
      {
        id: 'buildExecuteEngineNext',
        label: 'buildExecuteEngineNext'
      },
      {
        id: 'processRecord',
        label: 'processRecord'
      },
      {
        id: 'togetherCheck',
        label: 'togetherCheck'
      },
      {
        id: 'togetherCheck2',
        label: 'togetherCheck2'
      },
      {
        id: 'togetherCondition',
        label: 'togetherCondition'
      }
    ]
  },
  // 返回值函数
  {
    id: 'apiGroupResult',
    label: '返回值函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'setRuleResult',
        label: 'setRuleResult'
      },
      {
        id: 'appendRuleResult',
        label: 'appendRuleResult'
      },
      {
        id: 'removeRuleResult',
        label: 'removeRuleResult'
      }
    ]
  },
  // 时间函数
  {
    id: 'apiGroupDate',
    label: '时间函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'dateAfterNow',
        label: 'dateAfterNow'
      },
      {
        id: 'dateNow',
        label: 'dateNow'
      },
      {
        id: 'timeAfter',
        label: 'timeAfter'
      },
      {
        id: 'timeAfterEqual',
        label: 'timeAfterEqual'
      },
      {
        id: 'timeBefore',
        label: 'timeBefore'
      },
      {
        id: 'timeBeforeEqual',
        label: 'timeBeforeEqual'
      },
      {
        id: 'timeEqual',
        label: 'timeEqual'
      }
    ]
  },
  // 数据库相关函数
  {
    id: 'apiGroupDatabase',
    label: '数据库函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'executeSql',
        label: 'executeSql'
      },
      {
        id: 'executeSqlResult',
        label: 'executeSqlResult'
      },
      {
        id: 'connectDataBase',
        label: 'connectDataBase'
      },
      {
        id: 'connectDataExecuteSql',
        label: 'connectDataExecuteSql'
      }
    ]
  },
  // 计算函数
  {
    id: 'apiGroupComputed',
    label: '计算函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'computeExpression',
        label: 'computeExpression',
        visible: false
      },
      {
        id: 'sum',
        label: '求和',
        value: 'sum',
        suggestion: 'sum(1,2,3,...)',
        fast: true,
        fastSort: 1
      },
      {
        id: 'max',
        label: '最大值',
        value: 'max',
        suggestion: 'max(1,2,3,...)',
        fast: true,
        fastSort: 2
      },
      {
        id: 'min',
        label: '最小值',
        value: 'min',
        suggestion: 'min(1,2,3,...)',
        fast: true,
        fastSort: 3
      },
      {
        id: 'avg',
        label: '平均值',
        value: 'avg',
        suggestion: 'avg(1,2,3,...)',
        fast: true,
        fastSort: 4
      },
      {
        id: 'mod',
        label: '取余',
        value: 'mod',
        suggestion: 'mod(4,3)',
        fast: true,
        fastSort: 7
      },
      {
        id: 'round',
        label: '四舍五入',
        shortLabel: '舍入',
        value: 'round',
        suggestion: 'round(0.5,0)',
        fast: true,
        fastSort: 5
      },
      {
        id: 'int',
        label: '转整数',
        shortLabel: 'INT',
        value: 'int',
        suggestion: 'int(0.1)',
        fast: true,
        fastSort: 6
      },
      {
        id: 'power',
        label: '取次方数',
        value: 'power',
        suggestion: 'power(2,3)'
      },
      {
        id: 'abs',
        label: '取绝对值',
        value: 'abs',
        suggestion: 'abs(-1)'
      },
      {
        id: 'log',
        label: '取对数',
        value: 'log',
        suggestion: 'log(4,2)'
      },
      {
        id: 'countif',
        label: '满足给定条件的个数',
        value: 'countif',
        suggestion: 'countif([1,2,3],>=2)'
      },
      {
        id: 'sumif',
        label: '对满足条件的数求和',
        value: 'sumif',
        suggestion: 'sumif([1,2,3],>=1)'
      },
      {
        id: 'isnumber',
        label: '检查一个数是否为数值',
        value: 'isnumber',
        suggestion: 'isnumber(这不是一个数字)'
      },
      {
        id: 'find',
        label: '返回字符串在另一个字符串中出现的起始位置',
        value: 'find',
        suggestion: 'find(字符串, 一个字符串)'
      },
      {
        id: 'mid',
        label: '取字符串中间的值',
        value: 'mid',
        suggestion: 'mid(一个字符串,3,3)'
      },
      {
        id: 'concat',
        label: '拼接多个文本',
        value: 'concat',
        suggestion: 'concat(一个,字符,串)'
      },
      {
        id: 'len',
        label: '获取字符串长度',
        value: 'len',
        suggestion: 'len(一个字符串)'
      },
      {
        id: 'lenB',
        label: '获取字符长度',
        value: 'lenB',
        suggestion: 'lenB(一个字符串)'
      },
      {
        id: 'substitute',
        label: '将字符串中的部分字符替换为新的字符',
        value: 'substitute',
        suggestion: 'substitute(原始字符串,原始,新)'
      },
      {
        id: 'replace',
        label: '将一个字符串中的部分字符用另一个字符串替换',
        value: 'replace',
        suggestion: 'replace(这是一个字符串,1,3,new)'
      },
      {
        id: 'left',
        label: '从一个文本字符串的第一个字符开始返回指定个数的字符',
        value: 'left',
        suggestion: 'left(这是一个字符串,2)'
      },
      {
        id: 'right',
        label: '从一个文本字符串的最后一个字符开始返回指定个数的字符',
        value: 'right',
        suggestion: 'right(这是一个字符串,2)'
      }
    ]
  },
  // 取参函数
  {
    id: 'apiGroupArguments',
    label: '取参函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'loadNumberArguments',
        label: 'loadNumberArguments'
      },
      {
        id: 'loadStringArguments',
        label: 'loadStringArguments'
      },
      {
        id: 'loadDateArguments',
        label: 'loadDateArguments'
      },
      {
        id: 'loadArgumentsAndTypeOf',
        label: 'loadArgumentsAndTypeOf'
      }
    ]
  },
  // http请求函数
  {
    id: 'apiGroupHttp',
    label: 'HTTP函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'XGet',
        label: 'XGet'
      },
      {
        id: 'XPost',
        label: 'XPost'
      },
      {
        id: 'XSend',
        label: 'XSend'
      }
    ]
  },
  // 转换函数
  {
    id: 'apiGroupConvert',
    label: '转换函数',
    visible: true,
    expand: false,
    isLeaf: false,
    type: 'group',
    children: [
      {
        id: 'toNumber',
        label: 'toNumber'
      },
      {
        id: 'ToMap',
        label: 'ToMap'
      },
      {
        id: 'toDate',
        label: 'toDate'
      },
      {
        id: 'toBool',
        label: 'toBool'
      },
      {
        id: 'stringToArray',
        label: 'stringToArray'
      },
      {
        id: 'lenArray',
        label: 'lenArray'
      }
    ]
  }
]

const functionNames = []

const fastFunctions = []

// 提取函数名, 快捷函数等
const extractFunction = function (functions) {
  if (!functions || !functionNames) {
    return
  }
  functions.forEach(item => {
    if (item.type === 'group') {
      extractFunction(item.children)
    }
    let name = item.value || item.label
    name && functionNames.push(name)
    if (item.fast) {
      fastFunctions.push(cloneDeep(item))
    }
  })
}

extractFunction(apiFunctions)

// 给快捷函数排序
fastFunctions.sort((a, b) => a.fastSort - b.fastSort)

// 加入默认按钮
fastFunctions.push({
  id: 'multi',
  label: '*',
  value: '*'
})
fastFunctions.push({
  id: 'division',
  label: '/',
  value: '/'
})

export {
  functionNames,
  fastFunctions
}

export default apiFunctions