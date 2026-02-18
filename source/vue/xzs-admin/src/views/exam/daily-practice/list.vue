<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="名称：">
        <el-input v-model="queryParam.title" clearable></el-input>
      </el-form-item>
      <el-form-item label="部门：">
        <el-select v-model="queryParam.gradeLevel" placeholder="部门" clearable>
          <el-option v-for="item in levelEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <router-link :to="{path:'/exam/daily-practice/edit'}" class="link-left">
          <el-button type="primary">添加</el-button>
        </router-link>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="id" label="Id" width="80px"/>
      <el-table-column prop="title" label="名称"/>
      <el-table-column prop="tag" label="题库标签" width="120px"/>
      <el-table-column prop="questionCount" label="题目数量" width="100px"/>
      <el-table-column prop="gradeLevel" label="部门" :formatter="levelFormatter" width="120px"/>
      <el-table-column prop="status" label="状态" width="80px">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160px"/>
      <el-table-column label="操作" align="center" width="240px">
        <template slot-scope="{row}">
          <el-button size="mini" @click="$router.push({path:'/exam/daily-practice/edit',query:{id:row.id}})">编辑</el-button>
          <el-button size="mini" type="info" @click="showAnswers(row)">完成记录</el-button>
          <el-button size="mini" type="danger" @click="deletePractice(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageIndex" :limit.sync="queryParam.pageSize"
                @pagination="search"/>

    <el-dialog title="完成记录" :visible.sync="answerDialog" width="70%">
      <el-table v-loading="answerLoading" :data="answerTableData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="id" label="Id" width="80px"/>
        <el-table-column prop="userName" label="员工" width="120px"/>
        <el-table-column prop="dailyPracticeTitle" label="练习名称"/>
        <el-table-column prop="score" label="得分" width="80px"/>
        <el-table-column prop="questionCount" label="题目数" width="80px"/>
        <el-table-column prop="questionCorrect" label="正确数" width="80px"/>
        <el-table-column prop="practiceDate" label="练习日期" width="160px"/>
        <el-table-column prop="createTime" label="提交时间" width="160px"/>
      </el-table>
      <pagination v-show="answerTotal>0" :total="answerTotal" :page.sync="answerQueryParam.pageIndex"
                  :limit.sync="answerQueryParam.pageSize" @pagination="searchAnswers"/>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import dailyPracticeApi from '@/api/dailyPractice'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        title: null,
        gradeLevel: null,
        pageIndex: 1,
        pageSize: 10
      },
      listLoading: true,
      tableData: [],
      total: 0,
      answerDialog: false,
      answerLoading: false,
      answerTableData: [],
      answerTotal: 0,
      answerQueryParam: {
        dailyPracticeId: null,
        pageIndex: 1,
        pageSize: 10
      }
    }
  },
  created () {
    this.$store.dispatch('enumItem/initLevelEnum')
    this.search()
  },
  methods: {
    submitForm () {
      this.queryParam.pageIndex = 1
      this.search()
    },
    search () {
      this.listLoading = true
      dailyPracticeApi.pageList(this.queryParam).then(data => {
        const re = data.response
        this.tableData = re.list
        this.total = re.total
        this.queryParam.pageIndex = re.pageNum
        this.listLoading = false
      })
    },
    deletePractice (row) {
      let _this = this
      this.$confirm('确认删除？', '提示', { type: 'warning' }).then(() => {
        dailyPracticeApi.deletePractice(row.id).then(re => {
          if (re.code === 1) {
            _this.search()
            _this.$message.success(re.message)
          } else {
            _this.$message.error(re.message)
          }
        })
      }).catch(() => {})
    },
    showAnswers (row) {
      this.answerQueryParam.dailyPracticeId = row.id
      this.answerQueryParam.pageIndex = 1
      this.answerDialog = true
      this.searchAnswers()
    },
    searchAnswers () {
      this.answerLoading = true
      dailyPracticeApi.answerPage(this.answerQueryParam).then(data => {
        const re = data.response
        this.answerTableData = re.list
        this.answerTotal = re.total
        this.answerQueryParam.pageIndex = re.pageNum
        this.answerLoading = false
      })
    },
    levelFormatter (row, column, cellValue) {
      return this.enumFormat(this.levelEnum, cellValue)
    }
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      levelEnum: state => state.user.levelEnum
    })
  }
}
</script>
