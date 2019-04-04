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
            <el-button icon="el-icon-delete" @click="handleBoundMenu">{{$t('common.boundMenu')}}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-table ref="dataTable" :data="list" v-loading="listLoading" :element-loading-text="$t('common.loadingText')" border :fit="true" highlight-current-row stripe @selection-change="handleSelectionChange" @row-click="handleRowClick" tooltip-effect="light">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" width="50" align="center" />
        <el-table-column :label="$t('role.name')" prop="name" align="center" :render-header="labelHead"/>
        <el-table-column :label="$t('role.description')" prop="description" align="center" :render-header="labelHead"/>
        <el-table-column :label="$t('role.creator')" prop="creatorName" align="center" :render-header="labelHead"/>
        <el-table-column :label="$t('role.createTime')" prop="createTime" align="center" :render-header="labelHead"/>
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
      <el-dialog :close-on-click-modal="false" :title="dialogTitle" :visible.sync="boundMenuFlag">
        <el-row style="margin-bottom: 10px;">
          <el-col :span="23" :offset="1">
            <el-col :span="4">模块</el-col>
            <el-col :span="20">功能</el-col>
          </el-col>
        </el-row>
        <el-checkbox-group v-model="roleMenuList">
          <el-row :key="menu.id" v-for="menu in allMenuList">
            <el-col class="p-col" :span="23" :offset="1">
              <el-checkbox :label="menu.id">{{menu.name}}</el-checkbox>
            </el-col>
            <el-col :span="23" :offset="1" :key="child.id" v-for="(child, index) in menu.children" :class="{'bg-col': (index + 1) % 2}">
              <el-col :span="4" class="child-col" :style="getStyle(child.children)"><el-checkbox :label="child.id" @change="check(child.id)">{{child.name}}</el-checkbox></el-col>
              <el-col :span="20">
                <el-col :span="6" class="leaf-col" :key="grandson.id" v-for="grandson in child.children"><el-checkbox :label="grandson.id" @change="check(grandson.id)">{{grandson.name}}</el-checkbox></el-col>
              </el-col>
            </el-col>
          </el-row>
        </el-checkbox-group>
        <el-row style="margin-top: 20px;">
          <el-col :span="23" :offset="1">
            <el-checkbox @change="checkAll">全选</el-checkbox>
            <el-button type="primary" @click="boundMenu">{{$t('common.save')}}</el-button>
            <el-button @click="boundMenuFlag = false">{{$t('common.cancel')}}</el-button>
          </el-col>
        </el-row>
      </el-dialog>
  </div>
</template>
<script>
import { fetchList, createRole, updateRole, deleteRole, getMenuIdListByRoleId, boundMenu } from '@/api/role'
import { getMenuTree } from '@/api/menu'

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
      createTime: undefined,
      allMenuList: undefined,
      roleMenuList: undefined,
      role: undefined,
      boundMenuFlag: false
    }
  },
  created () {
    if (window.self === window.top) {
      location.href = 'home.html'
    }
    this.getList()
    this.getAllMenuList()
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
    },
    handleBoundMenu () {
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
      this.boundMenuFlag = true
      this.role = this.multipleSelection[0]
      this.dialogTitle = '绑定权限--' + this.role.name
      this.roleMenuList = undefined
      // 加载所有的权限列表
      this.getAllMenuList()
      // 加载角色分配的权限列表
      this.getRoleMenuList()
    },
    getStyle (children) {
      let style = ''
      if (children && children.length > 0) {
        const rows = Math.ceil(children.length / 4)
        style = 'height: ' + 30 * rows + 'px; line-height: ' + 30 * rows + 'px;'
      }
      return style
    },
    getAllMenuList () {
      getMenuTree().then(response => {
        this.allMenuList = response.data
      })
    },
    getRoleMenuList () {
      getMenuIdListByRoleId(this.role.id).then(response => {
        this.roleMenuList = response.data
      })
    },
    checkAll (val) {
      if (val) {
        let listTem = []
        this.mapMenuIdList(this.allMenuList, listTem)
        this.roleMenuList = listTem
      } else {
        this.roleMenuList = []
      }
    },
    mapMenuIdList (list, listTem) {
      list.forEach(item => {
        listTem.push(item.id)
        if (item.children && item.children.length > 0) {
          this.mapMenuIdList(item.children, listTem)
        }
      })
    },
    boundMenu () {
      if (this.roleMenuList && this.roleMenuList.length > 0) {
        const roleId = this.role.id
        boundMenu({ menuIds: this.roleMenuList, roleId: roleId }).then(() => {
          this.$message.success({
            message: this.role.name + '绑定权限成功!',
            onClose: () => {
              this.boundMenuFlag = false
            }
          })
        })
      } else {
        this.$message.warning({
          message: '绑定权限不能为空!'
        })
      }
    },
    contain (list, val) {
      return list.some(item => {
        return item.id === val
      })
    },
    getPMenuId (list, pMenuId, menuId) {
      list.some(item => {
        if (item.children && item.children.length > 0) {
          if (this.contain(item.children, menuId)) {
            pMenuId.push(item.id)
            return true
          } else {
            this.getPMenuId(item.children, pMenuId, menuId)
          }
        }
      })
    },
    check (val) {
      if (this.roleMenuList.indexOf(val) !== -1) {
        // 查找当前权限的上级权限，并将上级权限添加到选中的权限中
        let pMenuId = []
        this.getPMenuId(this.allMenuList, pMenuId, val)
        if (pMenuId.length > 0) {
          this.roleMenuList.push(pMenuId[0])
          this.check(pMenuId[0])
        }
      }
    }
  }
}

</script>

<style lang="scss">
  @import "../../styles/content.less";

  .p-col .el-checkbox__label {
    color: black;
  }

  .child-col .el-checkbox__label {
    color: black;
    vertical-align: middle;
  }

  .leaf-col {
    height: 30px;
    line-height: 30px;
    vertical-align: middle;
    .el-checkbox__label {
      color: black;
      font-weight: normal;
    }
  }

  .bg-col {
    background-color: #ECF5FF;
  }
</style>
