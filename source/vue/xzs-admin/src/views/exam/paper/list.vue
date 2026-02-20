<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="题目ID：">
        <el-input v-model="queryParam.id" clearable></el-input>
      </el-form-item>
      <el-form-item label="部门：">
        <el-select v-model="queryParam.level" placeholder="部门" @change="levelChange" clearable>
          <el-option v-for="item in levelEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="业务范围：" >
        <el-select v-model="queryParam.subjectId"  clearable>
          <el-option v-for="item in subjectFilter" :key="item.id" :value="item.id" :label="item.name+' ( '+item.levelName+' )'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <router-link :to="{path:'/exam/paper/edit'}" class="link-left">
          <el-button type="primary">添加</el-button>
        </router-link>
        <el-button type="success" @click="randomPaperDialog = true" style="margin-left: 10px;">随机组卷</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="id" label="Id" width="90px"/>
      <el-table-column prop="subjectId" label="业务范围" :formatter="subjectFormatter" width="120px" />
      <el-table-column prop="name" label="名称"  />
      <el-table-column prop="createTime" label="创建时间" width="160px"/>
      <el-table-column  label="操作" align="center"  width="160px">
        <template slot-scope="{row}">
          <el-button size="mini" @click="$router.push({path:'/exam/paper/edit',query:{id:row.id}})" >编辑</el-button>
          <el-button size="mini" type="danger"  @click="deletePaper(row)" class="link-left">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageIndex" :limit.sync="queryParam.pageSize"
                @pagination="search"/>
  </div>
    <el-dialog title="随机组卷" :visible.sync="randomPaperDialog" width="600px">
      <el-form :model="randomForm" label-width="100px">
        <el-form-item label="试卷名称">
          <el-input v-model="randomForm.name"></el-input>
        </el-form-item>
        <el-form-item label="业务范围">
          <el-select v-model="randomForm.subjectId">
             <el-option v-for="item in subjects" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题库标签">
          <el-input v-model="randomForm.tag" placeholder="输入题库标签" @blur="fetchTypeCount"></el-input>
        </el-form-item>
        <el-divider content-position="left">题型配置</el-divider>
        <el-form-item label="单选题">
          <el-col :span="8">
            <el-input-number v-model="randomForm.singleCount" :min="0" :max="typeCountMap[1] || 999" size="small"></el-input-number>
          </el-col>
          <el-col :span="6">
            <span style="margin-left:8px;color:#909399;font-size:12px;">共 {{typeCountMap[1] || '?'}} 题</span>
          </el-col>
          <el-col :span="10">
            <span style="margin-right:4px;font-size:12px;">每题</span>
            <el-input-number v-model="randomForm.singleScore" :min="1" :max="100" size="small" style="width:100px;"></el-input-number>
            <span style="margin-left:4px;font-size:12px;">分</span>
          </el-col>
        </el-form-item>
        <el-form-item label="多选题">
          <el-col :span="8">
            <el-input-number v-model="randomForm.multiCount" :min="0" :max="typeCountMap[2] || 999" size="small"></el-input-number>
          </el-col>
          <el-col :span="6">
            <span style="margin-left:8px;color:#909399;font-size:12px;">共 {{typeCountMap[2] || '?'}} 题</span>
          </el-col>
          <el-col :span="10">
            <span style="margin-right:4px;font-size:12px;">每题</span>
            <el-input-number v-model="randomForm.multiScore" :min="1" :max="100" size="small" style="width:100px;"></el-input-number>
            <span style="margin-left:4px;font-size:12px;">分</span>
          </el-col>
        </el-form-item>
        <el-form-item label="判断题">
          <el-col :span="8">
            <el-input-number v-model="randomForm.judgeCount" :min="0" :max="typeCountMap[3] || 999" size="small"></el-input-number>
          </el-col>
          <el-col :span="6">
            <span style="margin-left:8px;color:#909399;font-size:12px;">共 {{typeCountMap[3] || '?'}} 题</span>
          </el-col>
          <el-col :span="10">
            <span style="margin-right:4px;font-size:12px;">每题</span>
            <el-input-number v-model="randomForm.judgeScore" :min="1" :max="100" size="small" style="width:100px;"></el-input-number>
            <span style="margin-left:4px;font-size:12px;">分</span>
          </el-col>
        </el-form-item>
        <el-form-item label="试卷总分">
          <span style="font-size:16px;font-weight:bold;color:#409EFF;">{{ randomTotalScore }} 分</span>
        </el-form-item>
        <el-form-item label="建议时长">
          <el-input-number v-model="randomForm.suggestTime" :min="10"></el-input-number> 分钟
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="randomPaperDialog = false">取 消</el-button>
        <el-button type="primary" @click="createRandomPaper">生 成</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import examPaperApi from '@/api/examPaper'
import questionApi from '@/api/question'
import { post } from '@/utils/request'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        id: null,
        level: null,
        subjectId: null,
        pageIndex: 1,
        pageSize: 10
      },
      subjectFilter: null,
      listLoading: true,
      tableData: [],
      total: 0,
      randomPaperDialog: false,
      typeCountMap: {},
      randomForm: {
        name: '随机试卷',
        subjectId: null,
        tag: '',
        singleCount: 0,
        multiCount: 0,
        judgeCount: 0,
        singleScore: 5,
        multiScore: 10,
        judgeScore: 5,
        suggestTime: 60
      }
    }
  },
  created () {
    this.$store.dispatch('enumItem/initLevelEnum')
    this.initSubject()
    this.search()
  },
  methods: {
    submitForm () {
      this.queryParam.pageIndex = 1
      this.search()
    },
    search () {
      this.listLoading = true
      examPaperApi.pageList(this.queryParam).then(data => {
        const re = data.response
        this.tableData = re.list
        this.total = re.total
        this.queryParam.pageIndex = re.pageNum
        this.listLoading = false
      })
    },
    deletePaper (row) {
      let _this = this
      examPaperApi.deletePaper(row.id).then(re => {
        if (re.code === 1) {
          _this.search()
          _this.$message.success(re.message)
        } else {
          _this.$message.error(re.message)
        }
      })
    },
    levelChange () {
      this.queryParam.subjectId = null
      this.subjectFilter = this.subjects.filter(data => data.level === this.queryParam.level)
    },
    subjectFormatter  (row, column, cellValue, index) {
      return this.subjectEnumFormat(cellValue)
    },
    createRandomPaper() {
        if (!this.randomForm.subjectId) {
            this.$message.error('请选择业务范围');
            return;
        }
        if (!this.randomForm.tag) {
            this.$message.error('请输入题库标签');
            return;
        }
        if (this.randomTotalScore <= 0) {
            this.$message.error('请至少选择一种题型并设置数量');
            return;
        }
        post('/api/admin/exam/paper/randomCreate', {
            subjectId: this.randomForm.subjectId,
            tag: this.randomForm.tag,
            name: this.randomForm.name,
            suggestTime: this.randomForm.suggestTime,
            singleCount: this.randomForm.singleCount,
            multiCount: this.randomForm.multiCount,
            judgeCount: this.randomForm.judgeCount,
            singleScore: String(this.randomForm.singleScore),
            multiScore: String(this.randomForm.multiScore),
            judgeScore: String(this.randomForm.judgeScore)
        }).then(re => {
            if (re.code === 1) {
                this.$message.success('试卷生成成功');
                this.randomPaperDialog = false;
                this.search();
            } else {
                this.$message.error(re.message);
            }
        });
    },
    fetchTypeCount() {
        if (!this.randomForm.tag) {
            this.typeCountMap = {}
            return
        }
        questionApi.bankTypeCount(this.randomForm.tag).then(response => {
            if (response.code === 1 && response.response) {
                let map = {}
                response.response.forEach(item => {
                    map[item.name] = parseInt(item.value)
                })
                this.typeCountMap = map
            }
        })
    },
    ...mapActions('exam', { initSubject: 'initSubject' })
  },
  computed: {
    randomTotalScore() {
      return (this.randomForm.singleCount || 0) * (this.randomForm.singleScore || 0) +
             (this.randomForm.multiCount || 0) * (this.randomForm.multiScore || 0) +
             (this.randomForm.judgeCount || 0) * (this.randomForm.judgeScore || 0)
    },
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      levelEnum: state => state.user.levelEnum
    }),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
