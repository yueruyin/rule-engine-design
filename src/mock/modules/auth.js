import Mock from 'mockjs2'
const random = Mock.Random

export default {
  // key: disable#method#url
  'false#post#/sys/sso/login': ({ body, url }) => {
    return {
      code: 0,
      message: 'success',
      data: null
    }
  }
}