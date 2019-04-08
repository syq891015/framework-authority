<template>
  <div id="app">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="listQuery" label-position="left">
        <el-form-item :label="$t('user.account')">
          <el-input v-model="listQuery.account" :placeholder="$t('user.account')" clearable @clear="listQuery.account = undefined" />
        </el-form-item>
        <el-form-item :label="$t('user.name')">
          <el-input v-model="listQuery.name" :placeholder="$t('user.name')" clearable @clear="listQuery.name = undefined" />
        </el-form-item>
        <el-form-item :label="$t('user.createTime')">
          <el-date-picker v-model="createTime" type="datetimerange" unlink-panels range-separator="-" start-placeholder="起" end-placeholder="止" value-format="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleFilter">{{$t('common.search')}}</el-button>
          <el-button icon="el-icon-plus" @click="handleCreate">{{$t('common.add')}}</el-button>
          <el-button icon="el-icon-edit" @click="handleUpdate">{{$t('common.edit')}}</el-button>
          <el-button icon="el-icon-delete" @click="handleDelete">{{$t('common.delete')}}</el-button>
          <el-button icon="el-icon-delete" @click="handleBoundRole">{{$t('common.boundRole')}}</el-button>
          <el-button icon="el-icon-delete" @click="resetPwd">{{$t('common.resetPwd')}}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-table ref="dataTable" :data="list" v-loading="listLoading" :element-loading-text="$t('common.loadingText')" border :fit="true" highlight-current-row stripe @selection-change="handleSelectionChange" @row-click="handleRowClick" tooltip-effect="light">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" align="center" />
      <el-table-column :label="$t('user.account')" prop="account" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('user.name')" prop="name" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('user.sex')" prop="sex" align="center" :render-header="labelHead">
        <template slot-scope="scope">
          <span v-if="scope.row.sex === 1">男</span>
          <span v-if="scope.row.sex === 2">女</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user.phone')" prop="phone" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('user.status')" prop="status" align="center" :render-header="labelHead">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0">锁定</span>
          <span v-if="scope.row.status === 1">激活</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user.creator')" prop="creatorName" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('user.createTime')" prop="createTime" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('user.modifier')" prop="modifierName" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('user.modifyTime')" prop="modifyTime" align="center" :render-header="labelHead"/>
    </el-table>
    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-sizes="[20,30,50,100]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog :close-on-click-modal="false" :title="dialogTitle" :visible.sync="dialogFormVisible" class="help-info">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="120px" style='width: 90%;'>
        <el-form-item :label="$t('user.account')" prop="account">
          <el-input v-model="temp.account" clearable></el-input>
          <el-alert title="账号是必填的；长度应小于20个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('user.name')" prop="name">
          <el-input v-model="temp.name" clearable></el-input>
          <el-alert title="姓名是必填的；长度应小于64个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('user.sex')" prop="sex">
          <el-radio v-model="temp.sex" :label="1">男</el-radio>
          <el-radio v-model="temp.sex" :label="2">女</el-radio>
        </el-form-item>
        <el-form-item :label="$t('user.phone')" prop="phone">
          <el-input v-model="temp.phone" clearable></el-input>
          <el-alert title="长度应小于32个字符" :closable="false" />
        </el-form-item>
        <el-form-item>
          <i class="el-icon-info"></i>&nbsp;&nbsp;默认密码是123
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button v-if="dialogStatus === 'add'" type="primary" @click="createData">{{$t('common.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('common.confirm')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" :title="boundTitle" :visible.sync="dialogBoundVisible">
      <el-checkbox-group v-model="checkList">
        <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">{{role.name}}</el-checkbox>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogBoundVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="boundRole">{{$t('common.save')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { fetchList, createUser, updateUser, deleteUser, getRoleIdListByUserId, boundRole, resetPwd } from '@/api/user'
import { fetchList as fetchAllRole } from '@/api/role'

export default {
  name: 'user',
  data () {
    return {
      tableKey: 0, // 用于table结构改变时使用，此时无用
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        account: undefined,
        passwd: undefined,
        name: undefined,
        phone: undefined,
        beginCreateTime: undefined,
        endCreateTime: undefined
      },
      multipleSelection: [],
      temp: {
        id: undefined,
        account: undefined,
        name: undefined,
        sex: undefined,
        phone: undefined,
        status: undefined,
        creator: undefined,
        modifier: undefined,
        deleted: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      rules: {
        account: [
          { required: true, message: '账号是必填的', trigger: 'change' },
          { max: 20, message: '小于20个字符', trigger: 'change' }
        ],
        name: [
          { required: true, message: '姓名是必填的', trigger: 'change' },
          { max: 64, message: '小于64个字符', trigger: 'change' }
        ],
        phone: [
          { max: 32, message: '小于32个字符', trigger: 'change' }
        ]
      },
      createTime: undefined,
      user: undefined,
      checkList: [],
      roleList: [],
      dialogBoundVisible: false,
      boundTitle: ''
    }
  },
  created () {
    if (window.self === window.top) {
      location.href = 'home.html'
    }
    this.getList()
  },
  methods: {
    labelHead (h, {column}) {
      if (this.list && column.property) {
        column.minWidth = this.__columnWidth(this.list, column.property, column.label)
        // 然后将列标题放在一个div块中，注意块的宽度一定要100%，否则表格显示不完全
        return h('div', {style: {width: '100%'}}, [column.label])
      }
    },
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
        account: undefined,
        passwd: undefined,
        name: undefined,
        sex: undefined,
        phone: undefined,
        status: undefined,
        creator: undefined,
        modifier: undefined,
        deleted: undefined
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
          createUser(this.temp).then(() => {
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
          message: '请选择一项用户！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项用户！'
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
          updateUser(tempData).then(() => {
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
          message: '请选择一项用户！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项用户！'
        })
        return
      }
      this.$confirm('确定删除吗？删除后将无法恢复！', '提示', {
        type: 'warning'
      }).then(() => {
        deleteUser(this.multipleSelection[0].id).then(response => {
          if (response.code === 0) {
            this.$message.success({
              message: '删除成功!'
            })
            this.getList()
          }
        })
      })
    },
    handleBoundRole () {
      if (this.multipleSelection.length === 0) {
        this.$message.warning({
          message: '请选择一项用户！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项用户！'
        })
        return
      }
      this.user = this.multipleSelection[0]
      this.boundTitle = '绑定角色 -- ' + this.user.name
      this.dialogBoundVisible = true
      getRoleIdListByUserId(this.user.id).then(response => {
        this.checkList = response.data
      })
      fetchAllRole({}).then(response => {
        this.roleList = response.data
      })
    },
    boundRole () {
      const checkIdAry = this.checkList
      if (checkIdAry.length === 0) {
        this.$message.warning({
          message: '绑定角色不能为空!'
        })
        return
      }
      const userId = this.user.id
      boundRole({ roleIds: checkIdAry, userId: userId }).then(() => {
        this.dialogBoundVisible = false
        this.$message.success({
          message: this.user.name + '绑定角色成功!'
        })
      })
    },
    resetPwd () {
      if (this.multipleSelection.length === 0) {
        this.$message.warning({
          message: '请选择一项用户！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项用户！'
        })
        return
      }
      resetPwd(this.multipleSelection[0].id).then(() => {
        this.$message.success({
          message: this.multipleSelection[0].name + '重置密码成功，重置后为默认密码!'
        })
      })
    }
  }
}

</script>

<style>
  @import "../../styles/content.less";
</style>
