import { create } from '@zh/common-utils/http'

const http = create(process.env.VUE_APP_API_RULE_BUSINESS)
/**
* 加载规则执行过程
* @param {Object} params
*/
export function loadRuleDetail (id) {
  console.log(id)
  return http.get('/kpidemo/ruledetail?id=' + id)
}