<template>
  <div class="app-container">
    <div style="margin-bottom: 15px;">
      <el-button type="primary" size="small" @click="handleImport">导入题库</el-button>
      <el-button size="small" @click="handleDownloadTemplate">下载导入模板</el-button>
    </div>

    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="name" label="题库名称 (Tag)" />
      <el-table-column prop="value" label="题目数量" width="150px" />
      <el-table-column label="操作" align="center" width="280px">
        <template slot-scope="{row}">
          <el-button size="mini" type="success" @click="handleCreatePaper(row)">组成试卷</el-button>
          <el-button size="mini" @click="handleEdit(row)">重命名</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="重命名题库" :visible.sync="editDialogVisible" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="原名称">
          <el-input v-model="editForm.oldTag" disabled></el-input>
        </el-form-item>
        <el-form-item label="新名称">
          <el-input v-model="editForm.newTag"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEdit">确 定</el-button>
      </span>
    </el-dialog>
    
    <el-dialog title="一键组卷" :visible.sync="paperDialogVisible" width="600px">
      <el-form :model="paperForm" label-width="100px">
        <el-form-item label="题库标签">
          <el-input v-model="paperForm.tag" disabled></el-input>
        </el-form-item>
        <el-form-item label="部门" required>
           <el-select v-model="paperForm.level" placeholder="请选择部门" @change="levelChange" clearable>
            <el-option v-for="item in levelEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务范围" required>
           <el-select v-model="paperForm.subjectId" placeholder="请选择业务范围" clearable>
            <el-option v-for="item in subjectFilter" :key="item.id" :value="item.id" :label="item.name + ' (id:' + item.id + ')'"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="试卷名称" required>
          <el-input v-model="paperForm.name" placeholder="请输入试卷名称"></el-input>
        </el-form-item>
        <el-form-item label="建议时长" required>
          <el-input v-model="paperForm.suggestTime" placeholder="分钟"></el-input>
        </el-form-item>
        <el-divider content-position="left">题型配置（从题库随机抽取）</el-divider>
        <el-form-item label="单选题">
          <el-col :span="8">
            <el-input-number v-model="paperForm.singleCount" :min="0" :max="typeCountMap[1] || 0" size="small"></el-input-number>
          </el-col>
          <el-col :span="6">
            <span style="margin-left:8px;color:#909399;font-size:12px;">共 {{typeCountMap[1] || 0}} 题</span>
          </el-col>
          <el-col :span="10">
            <span style="margin-right:4px;font-size:12px;">每题</span>
            <el-input-number v-model="paperForm.singleScore" :min="1" :max="100" size="small" style="width:100px;"></el-input-number>
            <span style="margin-left:4px;font-size:12px;">分</span>
          </el-col>
        </el-form-item>
        <el-form-item label="多选题">
          <el-col :span="8">
            <el-input-number v-model="paperForm.multiCount" :min="0" :max="typeCountMap[2] || 0" size="small"></el-input-number>
          </el-col>
          <el-col :span="6">
            <span style="margin-left:8px;color:#909399;font-size:12px;">共 {{typeCountMap[2] || 0}} 题</span>
          </el-col>
          <el-col :span="10">
            <span style="margin-right:4px;font-size:12px;">每题</span>
            <el-input-number v-model="paperForm.multiScore" :min="1" :max="100" size="small" style="width:100px;"></el-input-number>
            <span style="margin-left:4px;font-size:12px;">分</span>
          </el-col>
        </el-form-item>
        <el-form-item label="判断题">
          <el-col :span="8">
            <el-input-number v-model="paperForm.judgeCount" :min="0" :max="typeCountMap[3] || 0" size="small"></el-input-number>
          </el-col>
          <el-col :span="6">
            <span style="margin-left:8px;color:#909399;font-size:12px;">共 {{typeCountMap[3] || 0}} 题</span>
          </el-col>
          <el-col :span="10">
            <span style="margin-right:4px;font-size:12px;">每题</span>
            <el-input-number v-model="paperForm.judgeScore" :min="1" :max="100" size="small" style="width:100px;"></el-input-number>
            <span style="margin-left:4px;font-size:12px;">分</span>
          </el-col>
        </el-form-item>
        <el-form-item label="试卷总分">
          <span style="font-size:16px;font-weight:bold;color:#409EFF;">{{ computedTotalScore }} 分</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paperDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="paperLoading" @click="submitCreatePaper">生 成</el-button>
      </span>
    </el-dialog>

    <el-dialog title="导入题库" :visible.sync="importDialogVisible" width="500px">
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="题库标签" required>
          <el-input v-model="importForm.tag" placeholder="请输入题库名称（如：安全知识库）"></el-input>
        </el-form-item>
        <el-form-item label="部门" required>
          <el-select v-model="importForm.level" placeholder="请选择部门" @change="importLevelChange" clearable>
            <el-option v-for="item in levelEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务范围" required>
          <el-select v-model="importForm.subjectId" placeholder="请选择业务范围" clearable>
            <el-option v-for="item in importSubjectFilter" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Excel文件" required>
          <el-upload
            ref="importUpload"
            action=""
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            accept=".xlsx,.xls">
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传 .xlsx / .xls 文件</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="importLoading" @click="submitImport">开始导入</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import questionApi from '@/api/question'
import { post } from '@/utils/request'
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      listLoading: false,
      tableData: [],
      editDialogVisible: false,
      paperDialogVisible: false,
      paperLoading: false,
      subjectFilter: null,
      importDialogVisible: false,
      importLoading: false,
      importFile: null,
      importSubjectFilter: null,
      typeCountMap: {},
      editForm: {
        oldTag: '',
        newTag: ''
      },
      paperForm: {
        tag: '',
        name: '',
        level: null,
        subjectId: null,
        suggestTime: 60,
        singleCount: 0,
        multiCount: 0,
        judgeCount: 0,
        singleScore: 5,
        multiScore: 10,
        judgeScore: 5
      },
      importForm: {
        tag: '',
        level: null,
        subjectId: null
      }
    }
  },
  created() {
    this.$store.dispatch('enumItem/initLevelEnum')
    this.fetchData()
    let _this = this
    this.initSubject(function () {
      _this.subjectFilter = _this.subjects
      _this.importSubjectFilter = _this.subjects
    })
  },
  methods: {
    fetchData() {
      this.listLoading = true
      questionApi.bankList().then(response => {
        this.tableData = response.response
        this.listLoading = false
      })
    },
    handleEdit(row) {
      this.editForm.oldTag = row.name
      this.editForm.newTag = row.name
      this.editDialogVisible = true
    },
    submitEdit() {
      questionApi.updateBank({
            oldTag: this.editForm.oldTag,
            newTag: this.editForm.newTag
      }).then(response => {
        if (response.code === 1) {
          this.$message.success('修改成功')
          this.editDialogVisible = false
          this.fetchData()
        } else {
          this.$message.error(response.message)
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该题库标签吗？这也将移除所有题目中的该标签。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        questionApi.deleteBank({
            tag: row.name
        }).then(response => {
          if (response.code === 1) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(response.message)
          }
        })
      })
    },
    handleCreatePaper(row) {
        this.paperForm.tag = row.name
        this.paperForm.name = row.name + " 自动生成试卷"
        this.paperForm.level = null
        this.paperForm.subjectId = null
        this.paperForm.suggestTime = 60
        this.paperForm.singleCount = 0
        this.paperForm.multiCount = 0
        this.paperForm.judgeCount = 0
        this.paperForm.singleScore = 5
        this.paperForm.multiScore = 10
        this.paperForm.judgeScore = 5
        this.typeCountMap = {}
        questionApi.bankTypeCount(row.name).then(response => {
            if (response.code === 1 && response.response) {
                let map = {}
                response.response.forEach(item => {
                    map[item.name] = parseInt(item.value)
                })
                this.typeCountMap = map
            }
        })
        this.paperDialogVisible = true
    },
    levelChange () {
      this.paperForm.subjectId = null
      this.subjectFilter = this.subjects.filter(data => data.level === this.paperForm.level)
    },
    submitCreatePaper() {
        if(!this.paperForm.name) {
            this.$message.error('请输入试卷名称')
            return
        }
        if(!this.paperForm.level) {
            this.$message.error('请选择部门')
            return
        }
        if(!this.paperForm.subjectId) {
            this.$message.error('请选择业务范围')
            return
        }
        if (this.computedTotalScore <= 0) {
            this.$message.error('请至少选择一种题型并设置数量')
            return
        }
        this.paperLoading = true
        post('/api/admin/exam/paper/randomCreate', {
            subjectId: this.paperForm.subjectId,
            tag: this.paperForm.tag,
            name: this.paperForm.name,
            suggestTime: this.paperForm.suggestTime,
            singleCount: this.paperForm.singleCount,
            multiCount: this.paperForm.multiCount,
            judgeCount: this.paperForm.judgeCount,
            singleScore: String(this.paperForm.singleScore),
            multiScore: String(this.paperForm.multiScore),
            judgeScore: String(this.paperForm.judgeScore)
        }).then(response => {
            if(response.code === 1) {
                this.$message.success('试卷生成成功！已为您跳转到试卷列表。')
                this.paperDialogVisible = false
                this.$router.push({ path: '/exam/paper/list' })
            } else {
                this.$message.error(response.message)
            }
        }).catch(e => {
            this.$message.error('生成失败: ' + e.message)
        }).finally(() => {
            this.paperLoading = false
        })
    },
    handleImport() {
      this.importForm.tag = ''
      this.importForm.level = null
      this.importForm.subjectId = null
      this.importFile = null
      this.importDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.importUpload) {
          this.$refs.importUpload.clearFiles()
        }
      })
    },
    importLevelChange() {
      this.importForm.subjectId = null
      this.importSubjectFilter = this.subjects.filter(data => data.level === this.importForm.level)
    },
    handleFileChange(file) {
      this.importFile = file.raw
    },
    handleFileRemove() {
      this.importFile = null
    },
    handleDownloadTemplate() {
      window.open('/api/public/question/import/template', '_blank')
    },
    submitImport() {
      if (!this.importForm.tag) {
        this.$message.error('请输入题库标签')
        return
      }
      if (!this.importForm.subjectId) {
        this.$message.error('请选择业务范围')
        return
      }
      if (!this.importFile) {
        this.$message.error('请选择Excel文件')
        return
      }
      this.importLoading = true
      questionApi.importQuestions(this.importFile, this.importForm.subjectId, this.importForm.tag).then(response => {
        if (response.code === 1) {
          this.$message.success('导入成功，共导入 ' + response.response + ' 道题目')
          this.importDialogVisible = false
          this.fetchData()
        } else {
          this.$message.error(response.message)
        }
      }).catch(e => {
        this.$message.error('导入失败: ' + (e.message || e))
      }).finally(() => {
        this.importLoading = false
      })
    },
    ...mapActions('exam', { initSubject: 'initSubject' })
  },
  computed: {
    computedTotalScore() {
      return (this.paperForm.singleCount || 0) * (this.paperForm.singleScore || 0) +
             (this.paperForm.multiCount || 0) * (this.paperForm.multiScore || 0) +
             (this.paperForm.judgeCount || 0) * (this.paperForm.judgeScore || 0)
    },
    ...mapState('user', {
      levelEnum: state => state.levelEnum
    }),
    ...mapState('enumItem', {
      levelEnum: state => state.user.levelEnum
    }),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
