<template>
  <div id="app">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="listQuery" label-position="left">
        <el-form-item :label="$t('config.key')">
          <el-input v-model="listQuery.key" :placeholder="$t('config.key')" clearable @clear="listQuery.key = undefined" />
        </el-form-item>
        <el-form-item :label="$t('config.value')">
          <el-input v-model="listQuery.value" :placeholder="$t('config.value')" clearable @clear="listQuery.value = undefined" />
        </el-form-item>
        <el-form-item :label="$t('config.remark')">
          <el-input v-model="listQuery.remark" :placeholder="$t('config.remark')" clearable @clear="listQuery.remark = undefined" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleFilter">{{$t('common.search')}}</el-button>
          <el-button icon="el-icon-plus" v-if="hasPermission('sys:config:add')" @click="handleCreate">{{$t('common.add')}}</el-button>
          <el-button icon="el-icon-edit" v-if="hasPermission('sys:config:update')" @click="handleUpdate">{{$t('common.edit')}}</el-button>
          <el-button icon="el-icon-delete" v-if="hasPermission('sys:config:delete')" @click="handleDelete">{{$t('common.delete')}}</el-button>
          <el-button @click="handleEnable" v-if="hasPermission('sys:config:enable')"><svg-icon icon-class="enable"/>{{$t('common.enable')}}</el-button>
          <el-button icon="el-icon-fa fa-stop" v-if="hasPermission('sys:config:disable')" @click="handleDisable">{{$t('common.disable')}}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-table ref="dataTable" :data="list" v-loading="listLoading" :element-loading-text="$t('common.loadingText')" border :fit="true" highlight-current-row stripe @selection-change="handleSelectionChange" @row-click="handleRowClick" tooltip-effect="light">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" align="center" />
      <el-table-column :label="$t('config.key')" align="center" prop="key" :render-header="labelHead">
        <template slot-scope="scope">
          <span style="cursor: pointer;" @click="handleClipboard(scope.row.key,$event)">{{scope.row.key}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('config.value')" prop="value" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('config.enabled')" align="center" prop="enabled" :render-header="labelHead">
        <template slot-scope="scope">
          <svg-icon v-if="scope.row.enabled === '1'" icon-class="enable"/>
          <i v-if="scope.row.enabled === '0'" class="el-icon-fa fa-stop"></i>
        </template>
      </el-table-column>
      <el-table-column :label="$t('config.remark')" prop="remark" align="center" :render-header="labelHead"/>
    </el-table>
    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-sizes="[20,30,50,100]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog :close-on-click-modal="false" :title="dialogTitle" :visible.sync="dialogFormVisible" class="help-info">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="120px" style='width: 90%;'>
        <el-form-item v-if="dialogStatus === 'add'" :label="$t('config.key')" prop="key">
          <el-input v-model="temp.key" clearable></el-input>
          <el-alert title="配置键是必填的；长度应小于50个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('config.value')" prop="value">
          <el-input v-model="temp.value" clearable></el-input>
          <el-alert title="配置值是必填的；长度应小于2000个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('config.remark')" prop="remark">
          <el-input v-model="temp.remark" clearable></el-input>
          <el-alert title="长度应小于500个字符" :closable="false" />
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
import { fetchList, createConfig, updateConfig, deleteConfig, enable, disable } from '@/api/config'
import clipboard from '@/utils/clipboard'
import { hasPermission } from '@/utils/permission'

export default {
  name: 'config',
  data () {
    return {
      tableKey: 0, // 用于table结构改变时使用，此时无用
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        key: undefined,
        value: undefined,
        remark: undefined
      },
      multipleSelection: [],
      temp: {
        id: undefined,
        key: undefined,
        value: undefined,
        enabled: undefined,
        remark: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      rules: {
        key: [
          { required: true, message: '配置键是必填的', trigger: 'change' },
          { max: 50, message: '小于50个字符', trigger: 'change' }
        ],
        value: [
          { required: true, message: '配置值是必填的', trigger: 'change' },
          { max: 2000, message: '小于2000个字符', trigger: 'change' }
        ],
        remark: [
          { max: 500, message: '小于500个字符', trigger: 'change' }
        ]
      }
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
        key: undefined,
        value: undefined,
        enabled: undefined,
        remark: undefined
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
          createConfig(this.temp).then(() => {
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
          message: '请选择一项系统配置！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项系统配置！'
        })
        return
      }
      this.temp = Object.assign({}, this.multipleSelection[0]) // copy obj
      this.dialogStatus = 'edit'
      this.dialogTitle = this.$t('common.' + this.dialogStatus) + '[' + this.temp.key + ']'
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
          updateConfig(tempData).then(() => {
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
          message: '请选择一项系统配置！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项系统配置！'
        })
        return
      }
      this.$confirm('确定删除吗？删除后将无法恢复！', '提示', {
        type: 'warning'
      }).then(() => {
        deleteConfig(this.multipleSelection[0].id).then(response => {
          if (response.code === 0) {
            this.$message.success({
              message: '删除成功!'
            })
            this.getList()
          }
        })
      })
    },
    handleEnable () {
      if (this.multipleSelection.length === 0) {
        this.$message.warning({
          message: '请至少选择一项！'
        })
        return
      }
      this.$confirm('确定启用吗?', '提示', {
        type: 'warning'
      }).then(() => {
        const idAry = this.multipleSelection.map(config => {
          return config.id
        })
        enable(idAry).then(response => {
          if (response.code === 0) {
            this.$message.success({
              message: '启用成功!'
            })
            this.getList()
          }
        })
      })
    },
    handleDisable () {
      if (this.multipleSelection.length === 0) {
        this.$message.warning({
          message: '请至少选择一项！'
        })
        return
      }
      this.$confirm('确定禁用吗?', '提示', {
        type: 'warning'
      }).then(() => {
        const idAry = this.multipleSelection.map(config => {
          return config.id
        })
        disable(idAry).then(response => {
          if (response.code === 0) {
            this.$message.success({
              message: '禁用成功!'
            })
            this.getList()
          }
        })
      })
    }
  }
}

</script>
<style>
  @import "../../styles/content.less";
</style>
