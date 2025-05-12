/**
 * 提供执行结果处理需要的方法
 * @author wangyb
 * @createTime 2023-04-17 14:06:13
 */

import { isArray, isObject } from 'lodash'

/**
 * 解析执行结果，并合并已有的结果
 */
export function analysisExecuteResult (executeResult, result) {
  if (isArray(executeResult)) {
    executeResult = executeResult[0]
  }
  if (!executeResult || !isObject(executeResult)) {
    return
  }
  let columns = []
  let columnMap = {}
  let temp
  for (let key in executeResult) {
    temp = {
      column: key,
      title: null,
      def: null,
      selected: false
    }
    columns.push(temp)
    columnMap[key] = temp
  }
  // 合并已配置的项
  result = result || []
  if (isArray(result)) {
    result.forEach(item => {
      if (columnMap[item.column]) {
        Object.assign(columnMap[item.column], item)
      }
    })
  }
  return columns
}