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
export function validateSql (sqlStatement) {
  return http.post('/v1/engine/sql/validate', {
    sql: sqlStatement
  })
}

/**
 * 验证sql是否被允许
 * @param {*} sqlStatement sql语句
 */
export function previewSql (dataBase, sqlStatement, params, result) {
  return http.post('/v1/engine/sql/preview', {
    dataBase,
    sql: sqlStatement,
    arguments: params,
    result
  })
}

/**
 * 查询可用的数据源
 */
export function queryDataBaseList () {
  return http.get('/v1/engine/data/list')
}