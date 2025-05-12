// ========================================================
// 通用的方法
// @author wangyb
// @createTime 2023-06-28 17:26:04
// ========================================================

export function getPreRuleNodes (rootModels, ...ruleNodes) {
  let preNodes = []
  // 如果查询所有上级节点
  for (let id in rootModels) {
    let line = rootModels[id]
    if (line.baseModelType !== 'Line') {
      continue
    }
    // 如果存在以当前节点为结束model的线，则把节点对应的上级节点作为返回值
    if (ruleNodes.includes(line.endLinkGroup.model)) {
      preNodes.push(line.startLinkGroup.model)
    }
  }
  if (preNodes.length) {
    preNodes = preNodes.concat(getPreRuleNodes(rootModels, ...preNodes))
  }
  return preNodes
}

export function getPreNodeVariables (ruleNode) {
  if (!ruleNode) {
    return []
  }
  const ruleCanvas = ruleNode.__canvas__
  const { rootModels } = ruleCanvas
  // 先获取所有以当前节点为结束节点的线
  let preRuleNodes = getPreRuleNodes(rootModels, ruleNode)
  // 节点排重
  let mapping = {}
  preRuleNodes = preRuleNodes.filter(item => {
    if (mapping[item.id]) {
      return false
    }
    // 过滤没有参数的节点
    if (item.code === 'start' || item.modelType === 'RuleCondition' || item.modelType === 'RuleConditionItem') {
      return false
    }
    mapping[item.id] = true
    return true
  })
  // 提取节点中的参数配置
  mapping = {}
  let variables = []
  preRuleNodes.forEach(item => {
    let resultConfig = []
    if (item.modelType === 'RuleSql') {
      // 获取结果配置
      resultConfig = (item.attrs.executeSql && item.attrs.executeSql.result) || []
    } else if (item.modelType === 'RuleHttp') {
      // 获取结果配置
      resultConfig = (item.attrs.executeHttp && item.attrs.executeHttp.result) || []
    } else if (item.modelType === 'RuleCall') {
      // 获取结果配置
      resultConfig = (item.attrs.executeCallRule && item.attrs.executeCallRule.result) || []
    } else if (item.modelType === 'RuleAction') {

    } else if (item.modelType === 'RuleCompute') {
      resultConfig = [{
        title: item.attrs.expressionArguments || item.attrs.name,
        path: null,
        def: null,
        seleted: true
      }]
    } else if (item.modelType === 'RuleJson') {
      resultConfig = (item.attrs.executeJson && item.attrs.executeJson.result) || []
    }
    resultConfig.forEach(item => {
      let key = item.title
      if (!key) {
        return
      }
      if (mapping[key]) {
        return
      }
      mapping[key] = true
      key = key.startsWith('$') ? key.substring(1) : key
      variables.push({
        id: key,
        label: '$' + key,
        isLeaf: true,
        selectable: true
      })
    })
  })
  return variables
}

export function getRuleArguments (ruleCanvas) {
  if (!ruleCanvas) {
    return []
  }
  let map = {}
  const { attrs } = ruleCanvas
  const { ruleArguments = [] } = attrs
  let result = []
  ruleArguments.map(item => {
    if (map[item.key]) {
      return
    }
    map[item.key] = true
    result.push({
      id: item.key,
      label: '$' + item.key,
      isLeaf: true,
      selectable: true
    })
  })
  return result
}