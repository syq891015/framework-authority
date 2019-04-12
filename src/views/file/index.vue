<template>
  <div id="app">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="listQuery" label-position="left">
        <el-form-item :label="$t('file.fileName')">
          <el-input v-model="listQuery.fileName" :placeholder="$t('file.fileName')" clearable
                    @clear="listQuery.fileName = undefined"/>
        </el-form-item>
        <el-form-item :label="$t('file.origFileName')">
          <el-input v-model="listQuery.origFileName" :placeholder="$t('file.origFileName')" clearable
                    @clear="listQuery.origFileName = undefined"/>
        </el-form-item>
        <el-form-item :label="$t('file.dir')">
          <el-input v-model="listQuery.dir" :placeholder="$t('file.dir')" clearable @clear="listQuery.dir = undefined"/>
        </el-form-item>
        <el-form-item :label="$t('file.fileType')">
          <el-input v-model="listQuery.fileType" :placeholder="$t('file.fileType')" clearable
                    @clear="listQuery.fileType = undefined"/>
        </el-form-item>
        <el-form-item :label="$t('file.fileExtension')">
          <el-input v-model="listQuery.fileExtension" :placeholder="$t('file.fileExtension')" clearable
                    @clear="listQuery.fileExtension = undefined"/>
        </el-form-item>
        <el-form-item :label="$t('file.createTime')">
          <el-date-picker v-model="createTime" type="datetimerange" unlink-panels range-separator="-"
                          start-placeholder="起" end-placeholder="止" value-format="yyyy-MM-dd HH:mm:ss"/>
        </el-form-item>
        <el-form-item :label="$t('file.comment')">
          <el-input v-model="listQuery.comment" :placeholder="$t('file.comment')" clearable
                    @clear="listQuery.comment = undefined"/>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" type="primary" @click="handleFilter">{{$t('common.search')}}</el-button>
          <el-button icon="el-icon-upload" type="primary" v-if="hasPermission('sys:file:upload')" @click="handleUpload">
            {{$t('common.upload')}}
          </el-button>
          <el-button icon="el-icon-upload" type="primary" v-if="hasPermission('sys:file:reUpload')" @click="handleReUpload">
            {{$t('common.reUpload')}}
          </el-button>
          <el-button icon="el-icon-download" type="primary" @click="download">
            {{$t('common.download')}}
          </el-button>
          <el-button icon="el-icon-delete" type="danger" v-if="hasPermission('sys:file:delete')" @click="handleDelete">
            {{$t('common.delete')}}
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-table ref="dataTable" :data="list" v-loading="listLoading" :element-loading-text="$t('common.loadingText')"
              border :fit="true" highlight-current-row stripe @selection-change="handleSelectionChange"
              @row-click="handleRowClick" tooltip-effect="light">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column type="index" width="55" align="center"/>
      <el-table-column :label="$t('file.id')" prop="id" align="center" :render-header="labelHead">
        <template slot-scope="scope">
          <span style="cursor: pointer;" @click="handleClipboard(scope.row.id,$event)">{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('file.fileName')" prop="fileName" align="center" :render-header="labelHead">
        <template slot-scope="scope">
          <el-popover placement="right" title="" trigger="hover" v-if="scope.row.fileType === 'image'">
            <img :src="fileAccessUrl + scope.row.dir + '/' + scope.row.fileName"/>
            <div slot="reference" style="cursor: pointer;" @click="handleClipboard(scope.row.fileName,$event)">
              {{scope.row.fileName}}
              <img :src="fileAccessUrl + scope.row.dir + '/' + scope.row.fileName" :alt="fileAccessUrl + scope.row.dir + '/' + scope.row.fileName" style="max-height: 16px;max-width: 130px"/>
            </div>
          </el-popover>
          <span v-if="scope.row.fileType !== 'image'" style="cursor: pointer;" @click="handleClipboard(scope.row.fileName,$event)">
            {{scope.row.fileName}}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('file.origFileName')" prop="origFileName" align="center" :render-header="labelHead">
        <template slot-scope="scope">
          <span style="cursor: pointer;" @click="handleClipboard(scope.row.origFileName,$event)">{{scope.row.origFileName}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('file.dir')" prop="dir" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('file.fileSize')" prop="fileSize" align="center" :render-header="labelHead">
        <template slot-scope="scope">
          {{ byteConvert(scope.row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('file.fileType')" prop="fileType" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('file.fileExtension')" prop="fileExtension" align="center"
                       :render-header="labelHead"/>
      <el-table-column :label="$t('file.comment')" prop="comment" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('file.createTime')" prop="createTime" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('file.creator')" prop="creatorName" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('file.modifyTime')" prop="modifyTime" align="center" :render-header="labelHead"/>
      <el-table-column :label="$t('file.modifier')" prop="modifierName" align="center" :render-header="labelHead"/>
    </el-table>
    <el-pagination class="toolbar" background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                   :current-page="listQuery.pageNum" :page-sizes="[20,30,50,100]" :page-size="listQuery.pageSize"
                   layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>

    <el-dialog :close-on-click-modal="false" :title="dialogTitle" :visible.sync="dialogFormVisible">
      <el-upload
        ref="upload"
        name="files"
        :data="data"
        :multiple="multiple"
        :action="uploadPath"
        :file-list="fileList"
        :auto-upload="false"
        :with-credentials="true"
        :on-success="uploadSuccess">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传</el-button>
      </el-upload>
    </el-dialog>
    <el-dialog class="down-dialog" :close-on-click-modal="false" :title="dialogTitle" :visible.sync="downDialogVisible">
      <el-row :key="item.id" v-for="item in multipleSelection">
        <el-col :span="20">
          <a target="_blank" :download="item.fileName" :href="fileAccessUrl + item.dir + '/' + item.fileName">{{item.fileName}}</a>
        </el-col><el-col :span="4">{{byteConvert(item.fileSize)}}</el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {fetchList, deleteFile, getUploadPath} from '@/api/file'
import {hasPermission} from '@/utils/permission'
import { byteConvert } from '@/utils'
import clipboard from '@/utils/clipboard'

export default {
  name: 'file',
  data () {
    return {
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        fileName: undefined,
        origFileName: undefined,
        dir: undefined,
        fileType: undefined,
        fileExtension: undefined,
        beginCreateTime: undefined,
        endCreateTime: undefined,
        comment: undefined
      },
      multipleSelection: [],
      dialogFormVisible: false,
      dialogTitle: '',
      createTime: undefined,
      uploadPath: '',
      fileList: [],
      fileAccessUrl: '',
      multiple: true,
      data: undefined,
      downDialogVisible: false
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
    byteConvert,
    labelHead (h, {column}) {
      if (this.list && this.list.length > 0 && column.property) {
        column.minWidth = this.__columnWidth(this.list, column.property, column.label)
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
      }, []
      )
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
        this.fileAccessUrl = response.fileAccessUrl
        this.listLoading = false
      })
    },
    getUploadPath () {
      this.uploadPath = getUploadPath(this.data)
    },
    handleUpload () {
      this.data = undefined
      this.getUploadPath()
      this.multiple = true
      this.fileList = []
      this.dialogTitle = this.$t('common.upload')
      this.dialogFormVisible = true
    },
    handleReUpload () {
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
      this.multiple = false
      this.fileList = []
      this.data = {id: this.multipleSelection[0].id}
      this.getUploadPath()
      this.dialogTitle = this.$t('common.reUpload')
      this.dialogFormVisible = true
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
      this.__confirm({message: 'tips.confirmDelete'}).then(() => {
        deleteFile(this.multipleSelection[0].id).then(response => {
          if (response.code === 0) {
            this.$message.success({
              message: '删除成功!'
            })
            this.getList()
          }
        })
      })
    },
    submitUpload () {
      this.$refs.upload.submit()
    },
    uploadSuccess (response, file, fileList) {
      if (response.code !== 0) {
        this.$message.error(response.msg)
      } else {
        this.$message.success('上传成功！')
        this.getList()
      }
    },
    handleClipboard (text, event) {
      clipboard(text, event)
    },
    download () {
      if (this.multipleSelection.length === 0) {
        this.$message.warning({
          message: '请至少选择一项！'
        })
        return
      }
      this.dialogTitle = this.$t('common.download')
      this.downDialogVisible = true
    }
  }
}
</script>
<style lang="less">
  @import "../../styles/content.less";

  .down-dialog .el-dialog {
    width: 500px;
  }
</style>
