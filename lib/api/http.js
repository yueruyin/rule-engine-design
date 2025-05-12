import axios from '@zh/common-utils/http/axios'
import { http } from '@zh/common-utils/http'
import Cookies from 'js-cookie'
import { redirectLogin } from '@/router'

const caches = {}

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  return response
}, function (error) {
  if (error.response?.code === 401) {
    redirectLogin()
  }
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  return Promise.reject(error)
})

http.beforeLoad = config => {
  if (config.url.includes('/refresh/token')) {
    return
  }
  // 验证失效时间
  var tokenExp = Cookies.get('tokenExp')
  let staytimeGap = parseInt(tokenExp + '000') - parseInt(new Date().getTime())
  let leave = staytimeGap % (3600 * 1000 * 24)
  let leave1 = leave % (3600 * 1000)
  let stayMin = Math.floor(leave1 / (60 * 1000))
  if (stayMin < 30 && stayMin > 0) {
    // 小于30分钟刷新token
    http.post(config.baseURL + '/v1/refresh/token?refreshToken=' + Cookies.get('refreshToken')).then(res => {
      Cookies.set('token', res.token)
      Cookies.set('tokenExp', res.tokenExp)
    })
  }
  config.headers['token'] = Cookies.get('token')
  // config.headers['token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJydWxlIiwicm9sZUlkIjoxLCJyb2xlbmFtZSI6IlJPTEVfQURNSU4iLCJvcmdJZCI6MCwiZXhwIjo4ODkwODUzMTIzLCJpc3MiOiJ6ZW5pdGgifQ.6vst7X19QpRfA5wwhbqI4jg5bNJ2X3x7YNW5bjhSpRA"
}

export class HttpRequest {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  post (url, params = {}, config) {
    config = config || {}
    config.baseURL = this.baseURL
    return axios.post(url, params, config)
  }

  get (url, config) {
    config = config || {}
    config.baseURL = this.baseURL
    return axios.get(url, config)
  }

  delete (url, params, config = {}) {
    config = config || {}
    config.baseURL = this.baseURL
    return axios.delete(url, params, config)
  }
}

export function create (baseURL) {
  baseURL = resolveBaseURL(baseURL)
  if (caches[baseURL]) {
    return caches[baseURL]
  }
  const instance = new HttpRequest(baseURL)
  caches[baseURL] = instance
  return instance
}

function resolveBaseURL (baseURL) {
  if (!baseURL) {
    return window.VUE_APP_API || process.env.VUE_APP_API_BASE_URL
  }
  if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
    baseURL = `${window.VUE_APP_API || process.env.VUE_APP_API_BASE_URL}/${baseURL}`
  }
  return baseURL
}