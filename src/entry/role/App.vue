<template>
  <div id="app">
    <role/>
  </div>
</template>

<script>
import role from '@/views/role'
export default {
  name: 'roleApp',
  components: {
    role
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
