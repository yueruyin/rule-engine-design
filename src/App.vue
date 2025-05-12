<template>
  <ConfigProvider :locale="locale">
    <div id="app">
      <!-- <nav>
        <router-link v-for="(routeItem, index) in routes"
                     :key="index"
                     :to="routeItem.path">
          {{ routeItem.meta.title }}
        </router-link>
      </nav>
      <div style="background-color: #F0F2F5; padding: 10px; position:absolute; left: 50px; right:0px; top:0px; bottom:0px;">
        <router-view style="background-color: #FFF; border: 1px solid #E8E8E8; padding: 10px;" />
      </div> -->
      <router-view />
      <Loading v-if="loadingState" />
    </div>
  </ConfigProvider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { ConfigProvider } from 'ant-design-vue'
import { routes } from './router/index'
import Loading from './components/Loading.vue'
export default {
  name: 'App',
  components: {
    ConfigProvider,
    Loading
  },
  computed: {
    locale() {
      // 全局中文
      return zhCN
    }
  },
  data() {
    return {
      routes,
      loadingState: false
    }
  },
  created() {
    this.filterRoutes()
    this.changeLoadingState()
  },
  methods: {
    changeLoadingState() {
      this.$eventBus.$on('showLoading', () => {
        this.loadingState = true
      })
      this.$eventBus.$on('hideLoading', () => {
        this.loadingState = false
      })
    },
    // 过滤routes中不需要的数据,隐藏登录页面
    filterRoutes() {
      this.routes = this.routes.filter((item) => item.path !== '/login')
    }
  }
}
</script>

<style type="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.ant-divider-inner-text {
  font-size: 14px;
  color: #a3a3a3;
}

code {
  display: inline-block;
  background: #dddddd;
  margin: 4px 0px;
  padding: 4px 10px;
  border-radius: 4px;
}

nav {
  padding: 0px 6px;
  width: 50px;
  float: left;
  height: 100%;
  overflow-y: auto;
}
nav > a {
  display: block;
  margin: 4px;
  padding: 2px 6px;
  text-decoration: none;
}

nav > .router-link-active {
  color: coral;
  font-weight: bold;
}
</style>
