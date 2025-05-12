<template>
  <a-row class="header">
    <div class="logo"
         @click="handleLogoClick">
      <img class="logo-icon"
           src="@/assets/images/logo.png" />
      <span class="title">{{ title + (version ? ' - V' + version : '') }}</span>
    </div>
    <div class="header-tags"
         v-if="tagHide">
      <a-tabs :default-active-key="type"
              class="rule-tabs-menu"
              @change="tagsBack"
              style="color: #fff; border-bottom: 0;">
        <a-tab-pane key="1"
                    tab="规则列表">
        </a-tab-pane>
        <a-tab-pane key="2"
                    tab="模版列表"
                    force-render>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="header-right float-clear">
      <a-dropdown class="dropdown-right">
        <a-avatar style="color: #3662ec; backgroundColor: #cfeefd">{{ form.username }}</a-avatar>
        <a-menu slot="overlay">
          <!-- <a-menu-item key="0">
            <a target="_blank"
               rel="noopener noreferrer"
               href="http://www.alipay.com/">个人信息</a>
          </a-menu-item> -->
          <a-menu-item key="0"
                       disabled>
            {{ form.rolename }}
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="1">
            <a target="_blank"
               @click="loginout">退出登录</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
      <slot name="right" />
    </div>
  </a-row>
</template>

<script>
import Cookies from 'js-cookie'
const appVersion = window.APP_VERSION
const appName = window.APP_NAME
export default {
  name: 'Header',
  props: {
    title: { type: String, default: appName },
    version: { type: String, default: appVersion },
    rootPath: { type: String, default: '/' }
  },
  data() {
    return {
      form: {
        username: 'admin',
        rolename: 'admin'
      },
      type: '1',
      tagHide: true
    }
  },
  created() {
    if (window.location.href.includes('template')) {
      this.type = '2'
    }
    if (window.location.href.includes('rule-designe')) {
      this.tagHide = false
    }
  },
  mounted() {
    let userCookie = Cookies.get('user')
    // 初始化用户信息
    if (userCookie) {
      let user = JSON.parse(userCookie)
      this.form.username = user.username
      this.form.rolename = user.rolename
    }
  },
  methods: {
    handleLogoClick() {
      this.$router.push(this.rootPath)
    },
    loginout() {
      Cookies.remove('token')
      this.$router.push('/login')
    },
    tagsBack(key) {
      if (key == 1) {
        // 跳转规则列表
        this.$router.push('/')
      } else {
        // 跳转规则模版
        this.$router.push('/template')
      }
    }
  }
}
</script>

<style lang='less' scoped>
.header {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  background: #212121;
  border-bottom: 1px solid #080808;
  .logo {
    margin-left: 20px;
    display: inline-block;
    text-align: left;
    cursor: pointer;
    line-height: 0px;

    .title {
      font-size: 19px;
      color: #fff;
    }
    .logo-icon {
      width: 29px;
      height: 21px;
      margin-right: 10px;
      vertical-align: sub;
    }
  }
}
.header-right {
  flex: 1;
  padding-right: 20px;
}
.dropdown-right {
  float: right;
  margin-left: 10px;
}
.header-tags {
  padding-left: 20px;
  margin-top: 20px;
}

.rule-tabs-menu {
  color: #fff;
  /deep/ .ant-tabs-bar {
    border-bottom: 0;
  }
}
</style>