import start from '@/assets/images/start.png'
import execute from '@/assets/images/execute.png'
import calculate from '@/assets/images/calculate.png'
import condition from '@/assets/images/condition.png'
import conditionItem from '@/assets/images/conditionItem.png'
import sql from '@/assets/images/sql-1.png'
import http from '@/assets/images/http-1.png'
import end from '@/assets/images/end.png'

export const BUTTON_CONFIG = [
  {
    name: '开始',
    isActive: false,
    icon: start,
    code: 1000204
  },
  {
    name: '执行',
    isActive: false,
    icon: execute,
    code: 1000206
  },
  {
    name: '计算',
    isActive: false,
    icon: calculate,
    code: 1000209
  },
  {
    name: 'SQL',
    isActive: false,
    icon: sql,
    code: 1000210
  },
  {
    name: 'HTTP',
    isActive: false,
    icon: http,
    code: 1000211
  },
  {
    name: '子规则',
    isActive: false,
    icon: execute,
    code: 1000301
  },
  {
    name: '条件',
    isActive: false,
    icon: condition,
    code: 1000207
  },
  {
    name: '条件项',
    isActive: false,
    icon: conditionItem,
    code: 1000208
  },
  {
    name: 'JSON',
    isActive: false,
    icon: execute,
    code: 1000212
  },
  {
    name: '结束',
    isActive: false,
    icon: end,
    code: 1000205
  }
]