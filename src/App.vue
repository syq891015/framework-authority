<template>
  <div id="app">
    <el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">系统配置</el-menu-item>
      <el-menu-item index="2">字典大类设置</el-menu-item>
      <el-menu-item index="3">字典设置</el-menu-item>
      <el-menu-item index="4">权限管理</el-menu-item>
      <el-menu-item index="5">角色管理</el-menu-item>
      <el-menu-item index="6">用户管理</el-menu-item>
    </el-menu>
    <config v-if="activeIndex === '1'"></config>
    <base-dic v-if="activeIndex === '2'"></base-dic>
    <dic v-if="activeIndex === '3'"></dic>
    <menu-app v-if="activeIndex === '4'"></menu-app>
    <role-app v-if="activeIndex === '5'"></role-app>
    <user-app v-if="activeIndex === '6'"></user-app>
  </div>
</template>

<script>
import config from '@/views/config'
import baseDic from '@/views/baseDic'
import dic from '@/views/dic'
import menuApp from '@/views/menu'
import roleApp from '@/views/role'
import userApp from '@/views/user'

export default {
  name: 'App',
  components: {
    config,
    baseDic,
    dic,
    menuApp,
    roleApp,
    userApp
  },
  data () {
    return {
      activeIndex: '1'
    }
  },
  methods: {
    handleSelect (key, keyPath) {
      this.activeIndex = key[0]
    }
  }
}
</script>

<style lang="scss">
  body {
    margin: 0;
    padding: 0;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }

  /** 解决表头错位问题 **/
  body .el-table th.gutter {
    display: table-cell !important;
  }

  body .el-table colgroup.gutter {
    display: table-cell !important;
  }

  .help-info .el-alert--info {
    height: 20px !important;
    padding-left: 0 !important;
    background-color: #fff !important;
  }
</style>
