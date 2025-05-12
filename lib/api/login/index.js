import { create } from '../http'
import { http } from '@zh/common-utils/http'
import Cookies from 'js-cookie'

const request = create()

http.beforeLoad = config => {
  config.headers['token'] = Cookies.get('token')
}

// 登录
export function login (loginInfo = {}) {
  return request.post('/v1/user/login', loginInfo)
}

// 获取用户信息
export function userinfo () {
  return request.get('/v1/user/info')
}
