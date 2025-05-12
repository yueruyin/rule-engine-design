
/** 条件项控件操作:设置完条件后调用 */
const getConditionHtmlText = function (conditionValue) {
  if (!conditionValue) {
    return '待设置'
  }
  return '条件已设置'
}
export { getScopeHtmlText, getConditionHtmlText }
