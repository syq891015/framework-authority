<template>
  <div id="app">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="listQuery" label-position="left">
        <el-form-item :label="$t('role.name')">
          <el-input v-model="listQuery.name" :placeholder="$t('role.name')" clearable @clear="listQuery.name = undefined" />
        </el-form-item>
        <el-form-item :label="$t('role.description')">
          <el-input v-model="listQuery.description" :placeholder="$t('role.description')" clearable @clear="listQuery.description = undefined" />
        </el-form-item>
        <el-form-item :label="$t('role.createTime')">
          <el-date-picker v-model="createTime" type="datetimerange" unlink-panels range-separator="-" start-placeholder="起" end-placeholder="止" value-format="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleFilter">{{$t('common.search')}}</el-button>
          <el-button icon="el-icon-plus" @click="handleCreate">{{$t('common.add')}}</el-button>
          <el-button icon="el-icon-edit" @click="handleUpdate">{{$t('common.edit')}}</el-button>
          <el-button icon="el-icon-delete" @click="handleDelete">{{$t('common.delete')}}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-table ref="dataTable" :data="list" v-loading="listLoading" :element-loading-text="$t('common.loadingText')" border :fit="true" highlight-current-row stripe @selection-change="handleSelectionChange" @row-click="handleRowClick" tooltip-effect="light">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" align="center" />
      <el-table-column :label="$t('role.name')" prop="name" align="center" />
      <el-table-column :label="$t('role.description')" prop="description" align="center" />
      <el-table-column :label="$t('role.creator')" prop="creatorName" align="center" />
      <el-table-column :label="$t('role.createTime')" prop="createTime" align="center" />
    </el-table>
    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-sizes="[20,30,50,100]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog :close-on-click-modal="false" :title="dialogTitle" :visible.sync="dialogFormVisible" class="help-info">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="120px" style='width: 90%;'>
        <el-form-item :label="$t('role.name')" prop="name">
          <el-input v-model="temp.name" clearable></el-input>
          <el-alert title="角色名称是必填的；长度应小于32个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('role.description')" prop="description">
          <el-input v-model="temp.description" clearable></el-input>
          <el-alert title="长度应小于100个字符" :closable="false" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button v-if="dialogStatus === 'add'" type="primary" @click="createData">{{$t('common.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('common.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { fetchList, createRole, updateRole, deleteRole } from '@/api/role'

export default {
  name: 'role',
  data () {
    return {
      tableKey: 0, // 用于table结构改变时使用，此时无用
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name,
        description: undefined,
        beginCreateTime: undefined,
        endCreateTime: undefined
      },
      multipleSelection: [],
      temp: {
        id: undefined,
        name: undefined,
        description: undefined,
        creator: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      rules: {
        name: [
          { required: true, message: '角色名称是必填的', trigger: 'change' },
          { max: 32, message: '小于32个字符', trigger: 'change' }
        ],
        description: [
          { max: 100, message: '小于100个字符', trigger: 'change' }
        ]
      },
      createTime: undefined
    }
  },
  created () {
    this.getList()
  },
  methods: {
    handleSizeChange (val) {
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange (val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleRowClick (row) {
      this.$refs.dataTable.toggleRowSelection(row)
    },
    handleSelectionChange (selection) {
      this.multipleSelection = selection.reduce((ary, cur, idx) => {
        ary.push(cur)
        return ary
      }, [])
    },
    handleFilter () {
      this.listQuery.pageNum = 1
      this.getList()
    },
    getList () {
      this.listLoading = true

      if (this.createTime && this.createTime.length === 2) {
        this.listQuery.beginCreateTime = this.createTime[0]
        this.listQuery.endCreateTime = this.createTime[1]
      } else {
        this.listQuery.beginCreateTime = undefined
        this.listQuery.endCreateTime = undefined
      }

      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    resetTemp () {
      this.temp = {
        id: undefined,
        name: undefined,
        description: undefined,
        creator: undefined
      }
    },
    handleCreate () {
      this.resetTemp()
      this.dialogStatus = 'add'
      this.dialogTitle = this.$t('common.' + this.dialogStatus)
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    createData () {
      const fm = this.$refs.dataForm
      fm.validate((valid) => {
        if (valid) {
          createRole(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$message.success({
              message: '保存成功!'
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate () {
      if (this.multipleSelection.length === 0) {
        this.$message.warning({
          message: '请选择一项角色！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项角色！'
        })
        return
      }
      this.temp = Object.assign({}, this.multipleSelection[0]) // copy obj
      this.dialogStatus = 'edit'
      this.dialogTitle = this.$t('common.' + this.dialogStatus)
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    updateData () {
      const fm = this.$refs.dataForm
      fm.validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateRole(tempData).then(() => {
            this.dialogFormVisible = false
            this.$message.success({
              message: '修改成功!'
            })
            this.getList()
          })
        }
      })
    },
    handleDelete () {
      if (this.multipleSelection.length === 0) {
        this.$message.warning({
          message: '请选择一项角色！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项角色！'
        })
        return
      }
      this.$confirm('确定删除吗？删除后将无法恢复！', '提示', {
        type: 'warning'
      }).then(() => {
        deleteRole(this.multipleSelection[0].id).then(response => {
          if (response.code === 0) {
            this.$message.success({
              message: '删除成功!'
            })
            this.getList()
          }
        })
      })
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
