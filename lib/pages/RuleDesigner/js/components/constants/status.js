// ========================================================
// 状态常量
// @author wangyb
// @createTime 2023-06-19 11:38:18
// ========================================================

export const ModelStatusEnum = {
  Default: 1, // 默认状态
  Selected: 2, // 被选中
  Executed: 4, // 已执行
  Executing: 8, // 执行中
  Error: 16 // 错误
}

export const ModelStatusPriorityMap = {
  [ModelStatusEnum.Default]: 0,
  [ModelStatusEnum.Selected]: 10,
  [ModelStatusEnum.Executed]: 20,
  [ModelStatusEnum.Executing]: 21,
  [ModelStatusEnum.Error]: 81
}

export const ModelStatusPrefixMap = {
  [ModelStatusEnum.Default]: '',
  [ModelStatusEnum.Selected]: '',
  [ModelStatusEnum.Executed]: '',
  [ModelStatusEnum.Executing]: '',
  [ModelStatusEnum.Error]: ''
}

export const ModelStatusPostfixMap = {
  [ModelStatusEnum.Default]: '',
  [ModelStatusEnum.Selected]: 'Selected',
  [ModelStatusEnum.Executed]: 'Executed',
  [ModelStatusEnum.Executing]: 'Executing',
  [ModelStatusEnum.Error]: 'Error'
}