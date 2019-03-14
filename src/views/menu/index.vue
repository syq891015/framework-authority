<template>
  <div id="app">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="listQuery" label-position="left">
        <el-form-item :label="$t('menu.pMenuName')">
          <el-input v-model="listQuery.pMenuName" :placeholder="$t('menu.pMenuName')" clearable @clear="listQuery.pMenuName = undefined" />
        </el-form-item>
        <el-form-item :label="$t('menu.name')">
          <el-input v-model="listQuery.name" :placeholder="$t('menu.name')" clearable @clear="listQuery.name = undefined" />
        </el-form-item>
        <el-form-item :label="$t('menu.url')">
          <el-input v-model="listQuery.url" :placeholder="$t('menu.url')" clearable @clear="listQuery.url = undefined" />
        </el-form-item>
        <el-form-item :label="$t('menu.perms')">
          <el-input v-model="listQuery.perms" :placeholder="$t('menu.perms')" clearable @clear="listQuery.perms = undefined" />
        </el-form-item>
        <el-form-item :label="$t('menu.createTime')">
          <el-date-picker v-model="createTime" type="datetimerange" unlink-panels range-separator="-" start-placeholder="起" end-placeholder="止" value-format="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item :label="$t('menu.topMenu')">
          <el-checkbox v-model="listQuery.pMenuId" :true-label="0" :false-label="1"></el-checkbox>
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
      <el-table-column :label="$t('menu.name')" prop="name" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('menu.pMenuName')" prop="pMenuName" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('menu.url')" prop="url" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('menu.perms')" prop="perms" align="center" :render-header="labelHead">
        <template slot-scope="scope">
          <div class="icon-item" v-if="scope.row.perms" @click="handleClipboard(scope.row.perms,$event)">
            <span class="disabled">{{scope.row.perms}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('menu.type')" align="center" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 0">
            <svg-icon icon-class="catalog" class-name="icon-lagger" />
          </span>
          <span v-if="scope.row.type === 1">
            <svg-icon icon-class="menu1" class-name="icon-lagger" />
          </span>
          <span v-if="scope.row.type === 2">
            <svg-icon icon-class="btn" class-name="icon-lagger" />
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('menu.icon')" align="center" prop="icon" :render-header="labelHead">
        <template slot-scope="scope">
          <div class="icon-item" v-if="scope.row.icon" @click="handleClipboard(scope.row.icon,$event)">
            <svg-icon :icon-class="scope.row.icon" class-name="disabled"/>
            <span>{{scope.row.icon}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('menu.orderNum')" prop="orderNum" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('menu.creator')" prop="creatorName" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('menu.createTime')" prop="createTime" align="center" :render-header="labelHead"/>
    </el-table>
    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-sizes="[20,30,50,100]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog :close-on-click-modal="false" :title="dialogTitle" :visible.sync="dialogFormVisible" class="help-info">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="120px" style='width: 90%;'>
        <el-form-item :label="$t('menu.pMenuName')" prop="pMenuId" v-if="this.temp.pMenuId && this.dialogStatus === 'add'">
          <el-input v-model="pMenuName" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('menu.name')" prop="name">
          <el-input v-model="temp.name" clearable></el-input>
          <el-alert title="菜单名称是必填的；长度应小于32个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('menu.url')" prop="url">
          <el-input v-model="temp.url" clearable></el-input>
          <el-alert title="长度应小于64个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('menu.perms')" prop="perms">
          <el-input v-model="temp.perms" clearable></el-input>
          <el-alert title="长度应小于512个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('menu.type')" prop="type">
          <el-select v-model="temp.type">
            <el-option v-for="(item, index) in ['目录', '菜单', '功能']" :label="item" :key="index" :value="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('menu.icon')" prop="icon">
          <el-input v-model="temp.icon" clearable></el-input>
          <el-alert title="长度应小于50个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('menu.orderNum')" prop="orderNum">
          <el-input v-model="temp.orderNum" type="number" style="width: 70px;"></el-input>
          <el-alert title="长度应小于2个字符" :closable="false" />
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
import { fetchList, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import clipboard from '@/utils/clipboard'

export default {
  name: 'menuApp',
  data () {
    return {
      tableKey: 0, // 用于table结构改变时使用，此时无用
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name: undefined,
        url: undefined,
        perms: undefined,
        icon: undefined,
        beginCreateTime: undefined,
        endCreateTime: undefined,
        pMenuName: undefined,
        pMenuId: 1
      },
      multipleSelection: [],
      temp: {
        id: undefined,
        pMenuId: undefined,
        name: undefined,
        url: undefined,
        perms: undefined,
        type: undefined,
        icon: undefined,
        orderNum: undefined,
        creator: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      rules: {
        name: [
          { required: true, message: '菜单名称是必填的', trigger: 'change' },
          { max: 32, message: '小于32个字符', trigger: 'change' }
        ],
        url: [
          { max: 64, message: '小于64个字符', trigger: 'change' }
        ],
        perms: [
          { max: 512, message: '小于512个字符', trigger: 'change' }
        ],
        type: [
          { required: true, message: '类型是必选的', trigger: 'change' }
        ],
        icon: [
          { max: 50, message: '小于50个字符', trigger: 'change' }
        ]
      },
      createTime: undefined,
      pMenuName: undefined
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
    handleClipboard (text, event) {
      clipboard(text, event)
    },
    resetTemp () {
      this.temp = {
        id: undefined,
        pMenuId: undefined,
        name: undefined,
        url: undefined,
        perms: undefined,
        type: undefined,
        icon: undefined,
        orderNum: undefined,
        creator: undefined
      }
    },
    handleCreate () {
      if (this.multipleSelection.length === 0) {
        this.$confirm('此操作添加顶级权限！如果添加子权限，请"取消"，并在列表中选择上级权限。', '提示', {
          type: 'warning'
        }).then(() => {
          this.handleAdd()
          this.pMenuName = undefined
        })
      } else if (this.multipleSelection.length === 1) {
        const row = this.multipleSelection[0]
        if (row.type === '2') {
          this.$message.warning({
            message: '不能在按钮下创建子权限！'
          })
          return
        }
        this.handleAdd()
        this.temp.pMenuId = row.id
        this.pMenuName = row.name
      } else {
        this.$message.warning({
          message: '只能选择一项权限！'
        })
      }
    },
    handleAdd () {
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
          createMenu(this.temp).then(() => {
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
          message: '请选择一项权限！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项权限！'
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
          updateMenu(tempData).then(() => {
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
          message: '请选择一项权限！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项权限！'
        })
        return
      }
      this.$confirm('确定删除吗？删除后将无法恢复！', '提示', {
        type: 'warning'
      }).then(() => {
        deleteMenu(this.multipleSelection[0].id).then(response => {
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
  @import "../../styles/content.less";

  .icon-lagger {
    font-size: 20px;
  }

  .icon-item {
    color: #24292e;
    cursor: pointer;

    .disabled {
      pointer-events: none;
    }
  }
</style>
