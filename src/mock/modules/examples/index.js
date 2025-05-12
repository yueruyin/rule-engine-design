import Mock from 'mockjs2'
const random = Mock.Random

export default {
  // key: disable#method#url
  /**
   *  分页列表查询
   */
  'false#post#/example/getExamplePage': ({ body, url }) => {
    return {
      code: 0,
      message: 'success',
      data: null // Any
    }
  },
  /**
   * 保存
   */
  'post#/example/saveExampleData': ({ body, url }) => {
    return {
      code: 0,
      message: 'success',
      data: null // Any
    }
  }
}