import { create } from '../http'

const http = create()

/**
* 保存规则设计
* @param {Object} params
*/
export function saveDesign (data) {
  return http.post('v1/engine', data)
}

/**
* 发布规则
*/
export function publishEngin (params) {
  return http.post('v1/engine/publish', params)
}

/**
 * 获取执行规则
 */
export function getActionConfig () {
  return http.get('v1/default/rule/list')
}

/**
 * 获取计算组件固定字符
 */
export function getFormulaDefine () {
  return http.get('v1/engine/param/define')
}

export function preExecuteRule (params) {
  return http.post('/v1/execute/rule', params)
}

export function preExecuteRuleByResultMapping (params) {
  return http.post('/v1/execute/rule/preview', params)
}

export function debugRule (params) {
  return http.post('/v1/debug/execute/rule', params)
}

export function jsonPreview (params) {
  return http.post('/v1/engine/json/preview', params)
}

/**
 * 获取版本列表
 * @param {*} code 规则编号
 * @returns 版本列表
 */
export function getRuleVersionList (code) {
  return http.get('/v1/engine/list/version', {
    params: {
      code
    }
  })
}

/**
 * 根据code和version获取列表数据
 */
export function getRuleByCodeAndVersion (code, version) {
  return http.get(`v1/engine/get/design`, {
    params: {
      code,
      version
    }
  })
}

/**
 * 根据code和version获取参数配置
 */
export function getRuleArguments (code, version) {
  return http.get(`/v1/rule/execute/arguments`, {
    params: {
      code,
      version
    }
  })
}

/**
 * 判断是否code重复
 * @param {*} code 需要判断的code
 * @param {*} id 需要排除的ID
 */
export function checkCode (code, id) {
  return http.get(`/v1/engine/check/code`, {
    params: {
      code,
      id
    }
  })
}