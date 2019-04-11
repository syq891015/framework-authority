<template>
  <div id="app">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="listQuery" label-position="left">
        <el-form-item :label="$t('dic.baseId')">
          <el-select v-model="listQuery.baseId" clearable @clear="listQuery.baseId = undefined">
            <el-option v-for="item in baseDicList" :label="item.name" :key="item.id" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dic.name')">
          <el-input v-model="listQuery.name" :placeholder="$t('dic.name')" clearable @clear="listQuery.name = undefined" />
        </el-form-item>
        <el-form-item :label="$t('dic.val')">
          <el-input v-model="listQuery.val" :placeholder="$t('dic.val')" clearable @clear="listQuery.val = undefined" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleFilter">{{$t('common.search')}}</el-button>
          <el-button icon="el-icon-plus" v-if="hasPermission('sys:dic:add')" @click="handleCreate">{{$t('common.add')}}</el-button>
          <el-button icon="el-icon-edit" v-if="hasPermission('sys:dic:update')" @click="handleUpdate">{{$t('common.edit')}}</el-button>
          <el-button icon="el-icon-delete" v-if="hasPermission('sys:dic:delete')" @click="handleDelete">{{$t('common.delete')}}</el-button>
          <el-button @click="handleEnable" v-if="hasPermission('sys:dic:enable')"><svg-icon icon-class="enable"/>{{$t('common.enable')}}</el-button>
          <el-button icon="el-icon-fa fa-stop" v-if="hasPermission('sys:dic:disable')" @click="handleDisable">{{$t('common.disable')}}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-table ref="dataTable" :data="list" v-loading="listLoading" :element-loading-text="$t('common.loadingText')" border :fit="true" highlight-current-row stripe @selection-change="handleSelectionChange" @row-click="handleRowClick" tooltip-effect="light">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" align="center" />
      <el-table-column :label="$t('dic.baseName')" prop="baseName" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('dic.baseCode')" align="center" prop="baseCode" :render-header="labelHead">
        <template slot-scope="scope">
          <span style="cursor: pointer;" @click="handleClipboard(scope.row.baseCode,$event)">{{scope.row.baseCode}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dic.name')" prop="name" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('dic.val')" align="center" prop="val" :render-header="labelHead">
        <template slot-scope="scope">
          <span style="cursor: pointer;" @click="handleClipboard(scope.row.val,$event)">{{scope.row.val}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dic.used')" align="center" prop="used" :render-header="labelHead">
        <template slot-scope="scope">
          <svg-icon v-if="scope.row.used === '1'" icon-class="enable"/>
          <i v-if="scope.row.used === '0'" class="el-icon-fa fa-stop"></i>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-sizes="[20,30,50,100]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog :close-on-click-modal="false" :title="dialogTitle" :visible.sync="dialogFormVisible" class="help-info">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="120px" style='width: 90%;'>
        <el-form-item :label="$t('dic.baseId')" prop="baseId">
          <el-select v-model="temp.baseId">
            <el-option v-for="item in baseDicList" :label="item.name" :key="item.id" :value="item.id"></el-option>
          </el-select>
          <el-alert title="字典目录是必选的" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('dic.name')" prop="name">
          <el-input v-model="temp.name" clearable></el-input>
          <el-alert title="中文名称是必填的；长度应小于20个字符" :closable="false" />
        </el-form-item>
        <el-form-item :label="$t('dic.val')" prop="val">
          <el-input v-model="temp.val" clearable></el-input>
          <el-alert title="编码是必填的；长度应小于100个字符" :closable="false" />
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
import { fetchAll } from '@/api/baseDic'
import { fetchList, createDic, updateDic, deleteDic, enable, disable } from '@/api/dic'
import clipboard from '@/utils/clipboard'
import { hasPermission } from '@/utils/permission'

export default {
  name: 'dic',
  data () {
    return {
      list: null,
      total: null,
      listLoading: true,
      baseDicList: null,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name: undefined,
        val: undefined
      },
      multipleSelection: [],
      temp: {
        id: undefined,
        baseId: undefined,
        name: undefined,
        val: undefined,
        used: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      rules: {
        baseId: [
          { required: true, message: '字典目录ID是必填的', trigger: 'change' }
        ],
        name: [
          { required: true, message: '中文名称是必填的', trigger: 'change' },
          { max: 20, message: '小于20个字符', trigger: 'change' }
        ],
        val: [
          { required: true, message: '编码是必填的', trigger: 'change' },
          { max: 100, message: '小于100个字符', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    if (window.self === window.top) {
      location.href = 'home.html'
    }
    this.getAllBaseDic()
    this.getList()
  },
  methods: {
    hasPermission,
    labelHead (h, {column}) {
      if (this.list && this.list.length > 0 && column.property) {
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
    getAllBaseDic () {
      fetchAll({}).then(response => {
        this.baseDicList = response.data
      })
    },
    handleClipboard (text, event) {
      clipboard(text, event)
    },
    resetTemp () {
      this.temp = {
        id: undefined,
        baseId: undefined,
        name: undefined,
        val: undefined,
        used: undefined
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
          createDic(this.temp).then(() => {
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
          message: '请选择一项！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项！'
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
          updateDic(tempData).then(() => {
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
          message: '请选择一项！'
        })
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning({
          message: '只能选择一项！'
        })
        return
      }
      this.$confirm('确定删除吗？删除后将无法恢复！', '提示', {
        type: 'warning'
      }).then(() => {
        deleteDic(this.multipleSelection[0].id).then(response => {
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

<style lang="scss">
  @import "../../styles/content.less";
</style>
