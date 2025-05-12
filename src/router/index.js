import Vue from 'vue'
import Router from 'vue-router'
import Cookies from 'js-cookie'
import { userinfo } from '../../lib/api/login/index.js'
import debounce from 'lodash/debounce'

import {
  FlowList,
  FlowEdit,
  FlowControl,
  FlowDetail,
  RuleDesigner,
  RuleViewer
} from '@zh/feiliu-ant'

Vue.use(Router)

const files = require.context('../views', true, /route.js$/)
const map = {}
let routes = []
files.keys().forEach((key) => {
  map[files(key).default[0].path] = files(key).default
})

Object.keys(map)
  .sort()
  .map((k) => {
    routes = routes.concat(map[k])
  })

routes = [
  {
    path: '/',
    component: () => import('../../lib/pages/table/Table.vue'),
    meta: {
      title: '规则列表'
    }
  },
  {
    path: '/template',
    component: () => import('../../lib/pages/table/Template.vue'),
    meta: {
      title: '模版列表'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/index',
    name: 'index',
    redirect: '/'
  },
  {
    path: '/table',
    name: 'table',
    redirect: '/'
  },
  {
    path: '/rule-designer',
    component: { render: (e) => e('router-view') },
    redirect: '/rule-designer/edit',
    meta: {
      title: '规则设计器'
    },
    children: [
      {
        path: 'edit',
        name: 'ruleDesigner-edit',
        component: RuleDesigner
      }
    ]
  },
  {
    path: '/rule-viewer',
    component: { render: (e) => e('router-view') },
    redirect: '/rule-viewer/viewer',
    meta: {
      title: '规则展示器'
    },
    children: [
      {
        path: 'viewer',
        name: 'ruleViewer-viewer',
        component: RuleViewer
      }
    ]
  }
].concat(routes)

// 处理路由，绝对路径的路径加上前缀
const ROUTE_BASE_URL = process.env.BASE_URL
const handleRouteBaseURL = function (routes) {
  if (!routes || !ROUTE_BASE_URL || ROUTE_BASE_URL === '/') {
    return
  }
  routes.forEach((route) => {
    if (
      route.path &&
      route.path.startsWith('/') &&
      !route.path.startsWith(ROUTE_BASE_URL)
    ) {
      if (route.path === '/') {
        route.path = ROUTE_BASE_URL
      } else if (route.path.startsWith('/')) {
        route.path = ROUTE_BASE_URL + route.path
      }
      route.path = route.path.replaceAll(/\/{2,}/g, '/')
    }

    if (
      route.redirect &&
      route.redirect.startsWith('/') &&
      !route.redirect.startsWith(ROUTE_BASE_URL)
    ) {
      if (route.redirect === '/') {
        route.redirect = ROUTE_BASE_URL
      } else if (route.redirect.startsWith('/')) {
        route.redirect = ROUTE_BASE_URL + route.redirect
      }
      route.redirect = route.redirect.replaceAll(/\/{2,}/g, '/')
    }
    handleRouteBaseURL(route.children)
  })
}
handleRouteBaseURL(routes)

// 替换路由处理
const router = new Router({
  mode: 'history',
  routes
})

const handleRouteTo = function (to) {
  // 处理跳转路径
  if (typeof to === 'string') {
    to = {
      path: to
    }
  }
  if (ROUTE_BASE_URL && to.path && !to.path.startsWith(ROUTE_BASE_URL)) {
    if (to.path === '/') {
      to.path = ROUTE_BASE_URL
    } else if (to.path.startsWith('/')) {
      to.path = ROUTE_BASE_URL + to.path
    }
    to.path = to.path.replaceAll(/\/{2,}/g, '/')
  }
  return to
}
const _push = router.push
router.push = function (to, onSuccess, onFail) {
  to = handleRouteTo(to)
  return _push.call(this, to, onSuccess, onFail)
}

const _replace = router.replace
router.replace = function (to, onSuccess, onFail) {
  to = handleRouteTo(to)
  return _replace.call(this, to, onSuccess, onFail)
}

// 设置
router.beforeEach((to, from, next) => {
  if (to.path.endsWith('/login')) {
    next()
    return
  }
  if (!router.app.$store) {
    setTimeout(() => {
      beforeEachCheckLoginUser(to, from, next)
    })
  } else {
    beforeEachCheckLoginUser(to, from, next)
  }
})

export function beforeEachCheckLoginUser (to, from, next) {
  // 判断是否有用户信息
  let loginUserInfo = router.app.$store.getLoginUser()
  if (!loginUserInfo) {
    // 获取cookie中的用户信息
    let cookieUser = Cookies.get('user')
    if (cookieUser) {
      loginUserInfo = JSON.parse(cookieUser)
      router.app.$store.setLoginUser(loginUserInfo)
      next()
      return
    }
    // 判断cookie中是否有token，没有则取url中的token参数
    let token = Cookies.get('token')
    if (!token) {
      token = to.query.token
      if (token) {
        Cookies.set('token', token)
      }
    }
    if (!token) {
      // 跳转登陆页面
      redirectLogin(to.fullPath)
      return
    }
    userinfo().then(res => {
      router.app.$store.setLoginUser(res)
      Cookies.set('user', JSON.stringify(res, null, 4))
    }).catch(e => {
      console.error(e)
      // 跳转登陆页面
      redirectLogin(to.fullPath)
    })
  }
  next()
}

const redirectLogin = debounce(function (redirectUrl) {
  redirectUrl = redirectUrl || router.currentRoute.fullPath
  if (redirectUrl === '/login') {
    redirectUrl = '/'
  }
  // 跳转登陆页面
  router.push({
    path: '/login',
    query: {
      redirect: redirectUrl
    }
  })
}, 100)

export default router

export {
  routes,
  redirectLogin
}
