/**
 * 规则引擎sql相关的接口
 * @author wangyb
 * @createTime 2023-04-10 11:46:41
 */
import { create } from '../http'

const http = create()

/**
 * 验证sql是否被允许
 * @param {*} sqlStatement sql语句
 */
export function previewHttp (params) {
  return http.post('/v1/engine/http/send', params)
}

/**
 * 查询可用的系统
 */
export function querySystemList () {
  return http.get('/v1/engine/system/list')
}