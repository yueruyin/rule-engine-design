<template>
  <div class="login">
    <div class="content">
      <div class="content-left"></div>
      <div class="content-right">
        <div class="login-form">
          <div class="title">中天规则引擎</div>
          <a-form-model ref="form" :model="form" class="user-layout-login">
            <a-form-item label="" class="ant-input-wrapper">
              <a-input
                v-model="form.username"
                class="login-input"
                placeholder="请输入账号"
              />
            </a-form-item>
            <a-form-item label="" class="ant-input-wrapper">
              <a-input
                v-model="form.password"
                class="login-input"
                placeholder="请输入密码"
                type="password"
              />
            </a-form-item>
            <a-form-item size="large">
              <a-button type="primary" @click="login" class="login-button">
                登录
              </a-button>
            </a-form-item>
          </a-form-model>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 1、引入Vue等框架组件库或插件
// 2、引入自定义组件
// 3、引入第三方工具类插件
// 4、引入自定义工具或插件或混入或基类等

// 5、引入API
import { login, userinfo } from '../../lib/api/login/index.js'
import Cookies from 'js-cookie'

export default {
  props: {},
  data() {
    return {
      loginMessage: '',
      user: '',
      form: {
        username: 'rule',
        password: 'rule'
      }
    }
  },
  methods: {
    login() {
      const values = Object.assign({}, this.form)
      login(this.form)
        .then((response) => {
          this.loginSuccess(response)
        })
        .catch((e) => {
          Cookies.remove('token')
          this.loginMessage = '登录失败'
        })
    },
    loginSuccess(response) {
      // 缓存 token
      Cookies.set('token', response.token)
      Cookies.set('refreshToken', response.refreshToken)
      Cookies.set('tokenExp', response.tokenExp)
      userinfo()
        .then((response) => {
          this.$store.setLoginUser(response)
          this.user = JSON.stringify(response, null, 4)
          Cookies.set('user', this.user)
          this.loginMessage = `登录成功`
          this.$router.push({
            path: this.$route.query.redirect || '/'
          })
        })
        .catch((e) => {
          Cookies.remove('token')
          this.loginMessage = '获取用户信息失败'
        })
    }
  }
}
</script>

<style lang="less" scoped>
.login {
  width: 100%;
  height: 100%;
}

.content-left {
  width: 60%;
  height: 100%;
  float: left;
}

.content-right {
  width: 40%;
  height: 100%;
  float: left;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .title {
    width: 100%;
    margin: 55px 0 37px 0;
    font-size: 36px;
    color: #3064e4;
    font-weight: bold;
    text-align: center;
  }

  .login-form {
    width: 397px;
    height: 452px;
    background: #fff;
    margin-right: 139px;

    .form-container {
      width: 360px;
      margin: 0 auto;
    }
  }
}

.login-icon {
  font-size: 24px;
  color: 'rgba(0,0,0,.25)';
}

.login-input {
  width: 320px;
  height: 65px;
  font-size: 18px;
  margin-left: 42px;

  /deep/.ant-input-wrapper {
    height: 65px;
  }

  /deep/.ant-input-affix-wrapper {
    height: 65px;
  }

  /deep/.ant-input {
    width: 100%;
    height: 100%;
    padding-left: 50px;
  }
}

.desc-input {
  font-size: 16px;
  height: 60px;
}

.shortcuts-input {
  font-size: 16px;
  height: 50px;

  /deep/.ant-input {
    width: 100%;
    height: 100%;
    padding-left: 50px;
  }
}

.password-operate {
  width: 360px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

.content {
  width: 100%;
  height: 100%;
  background: url('../assets/images/login-black.jpg');
  background-size: 100% 100%;
}

.user-layout-login {
  width: 400px;
  margin: auto;

  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    display: block;
    margin: 0 auto;
    font-size: 24px;
    height: 65px;
    width: 360px;
    background: 'rgb(64,101,224)';
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #2955ee;
      }
    }

    .register {
      float: right;
    }
  }
}

.login-mode {
  text-align: center;
  margin-bottom: 20px;

  > div {
    display: inline-block;

    > * {
      display: inline-block;
      width: 120px;
      height: 48px;
      font-size: 16px;
      line-height: 3;
      cursor: pointer;
    }

    > .active {
      border-bottom: 2px solid rgb(64, 101, 224);
    }
  }
}

/deep/.x-captcha-image {
  .ant-input-group-addon:last-child {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    padding: 0px;
  }
}
</style>
