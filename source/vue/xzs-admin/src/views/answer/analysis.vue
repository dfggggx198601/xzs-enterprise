<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="examPaperId" label="试卷ID" width="100" />
      <el-table-column prop="paperName" label="试卷名称" />
      <el-table-column prop="userCount" label="参考人数" width="100" />
      <el-table-column prop="minScore" label="最低分" width="100" />
      <el-table-column prop="maxScore" label="最高分" width="100" />
      <el-table-column prop="avgScore" label="平均分" width="100">
        <template slot-scope="{row}">
          {{ row.avgScore ? row.avgScore.toFixed(1) : '0.0' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280px">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="handleDetail(row)">详情</el-button>
          <el-button size="mini" type="success" @click="handleExport(row)">导出Excel</el-button>
          <el-button size="mini" type="danger" @click="handleExportPdf(row)">导出PDF</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="考试详情" :visible.sync="detailVisible" width="90%">
      <el-table :data="detailData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="userName" label="姓名" />
        <el-table-column prop="userScore" label="得分" />
        <el-table-column prop="doTime" label="耗时" />
        <el-table-column prop="createTime" label="提交时间" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParam.pageIndex"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="queryParam.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
        <el-button @click="detailVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { post } from '@/utils/request'
import examPaperAnswerApi from '@/api/examPaperAnwser'

export default {
  data() {
    return {
      listLoading: false,
      tableData: [],
      detailVisible: false,
      detailData: [],
      currentPaperId: null,
      total: 0,
      queryParam: {
        pageIndex: 1,
        pageSize: 10,
        examPaperId: null
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      post('/api/admin/examPaperAnswer/analysis').then(response => {
        this.tableData = response.response
        this.listLoading = false
      })
    },
    handleDetail(row) {
      this.currentPaperId = row.examPaperId
      this.queryParam.examPaperId = row.examPaperId
      this.queryParam.pageIndex = 1
      this.detailVisible = true
      this.fetchDetail()
    },
    fetchDetail() {
      examPaperAnswerApi.page(this.queryParam).then(data => {
        const re = data.response
        this.detailData = re.list
        this.total = re.total
      })
    },
    handleSizeChange(val) {
      this.queryParam.pageSize = val
      this.fetchDetail()
    },
    handleCurrentChange(val) {
      this.queryParam.pageIndex = val
      this.fetchDetail()
    },
    handleExport(row) {
      window.open(`/api/admin/examPaperAnswer/export/${row.examPaperId}`, '_blank')
    },
    handleExportPdf(row) {
      window.open(`/api/admin/examPaperAnswer/exportPdf/${row.examPaperId}`, '_blank')
    }
  }
}
</script>
