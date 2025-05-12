// ========================================================
// 规则权限配置
// @author wangyb
// @createTime 2023-11-15
// ========================================================

export const RULE_PERMISSION_ENUM = {
  MODIFY: 1,
  DELETE: 2
}

export const RULE_PERMISSION_NAMES = {
  [RULE_PERMISSION_ENUM.MODIFY]: '修改',
  [RULE_PERMISSION_ENUM.DELETE]: '删除'
}

const options = []
let allPermission = 0

for (let key in RULE_PERMISSION_ENUM) {
  options.push({
    value: RULE_PERMISSION_ENUM[key],
    label: RULE_PERMISSION_NAMES[RULE_PERMISSION_ENUM[key]]
  })
  allPermission = allPermission | RULE_PERMISSION_ENUM[key]
}

export const RULE_PERMISSION_OPTIONS = options

export const RULE_ALL_PERMISSION = allPermission
