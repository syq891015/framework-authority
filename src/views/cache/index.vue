<template>
  <div id="app">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" label-position="left">
        <el-form-item>
          <el-button icon="el-icon-refresh" v-if="hasPermission('sys:cache:refresh')" @click="batchRefresh">
            {{$t('common.refresh')}}
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-table ref="dataTable" :data="list" v-loading="listLoading" :element-loading-text="$t('common.loadingText')"
              border :fit="true" highlight-current-row stripe @selection-change="handleSelectionChange"
              @row-click="handleRowClick" tooltip-effect="light">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column type="index" width="50" align="center"/>
      <el-table-column :label="$t('cache.name')" prop="name" align="center"/>
      <el-table-column align="center" :label="$t('common.actions')">
        <template slot-scope="scope">
          <el-button v-if="hasPermission('sys:cache:refresh')" @click="refresh(scope.row.serviceName)">{{$t('common.refresh')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {fetchList, refresh} from '@/api/cache'
import {hasPermission} from '@/utils/permission'

export default {
  name: 'cache',
  data () {
    return {
      list: null,
      listLoading: true,
      multipleSelection: []
    }
  },
  created () {
    if (window.self === window.top) {
      location.href = 'home.html'
    }
    this.getList()
  },
  methods: {
    hasPermission,
    handleRowClick (row) {
      this.$refs.dataTable.toggleRowSelection(row)
    },
    handleSelectionChange (selection) {
      this.multipleSelection = selection.reduce((ary, cur, idx) => {
        ary.push(cur)
        return ary
      }, []
      )
    },
    getList () {
      this.listLoading = true

      fetchList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    batchRefresh () {
      if (this.multipleSelection.length === 0) {
        this.$message.warning({
          message: '请至少选择一项！'
        })
        return
      }
      const serviceNames = this.multipleSelection.map(item => {
        return item.serviceName
      })
      this.refresh(serviceNames.join(','))
    },
    refresh (serviceNames) {
      refresh(serviceNames).then(response => {
        if (response.code === 0) {
          this.$message.success('刷新成功!')
        }
      })
    }
  }
}
</script>
<style lang="less">
  @import "../../styles/content.less";
</style>
