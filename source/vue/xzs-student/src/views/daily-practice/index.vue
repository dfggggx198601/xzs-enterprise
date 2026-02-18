<template>
  <div style="margin-top: 10px">
    <el-row class="app-item-contain">
      <h3 class="index-title-h3" style="border-left: solid 10px #e6a23c;">今日练习</h3>
      <div style="padding-left: 15px" v-loading="dailyLoading">
        <div v-if="dailyList.length === 0 && !dailyLoading" style="color: #909399; padding: 10px 0;">今日暂无练习</div>
        <el-col :span="4" v-for="(item, index) in dailyList" :key="'dp-'+index" :offset="index > 0 ? 1 : 0">
          <el-card :body-style="{ padding: '0px' }">
            <img src="@/assets/exam-paper/show1.png" class="image">
            <div style="padding: 14px;">
              <span>{{item.title}}</span>
              <div style="font-size: 12px; color: #909399; margin-top: 5px;">{{item.questionCount}}题</div>
              <div class="bottom clearfix">
                <router-link :to="{path:'/daily-practice/do',query:{id:item.id}}" v-if="!item.completed">
                  <el-button type="text" class="button">开始练习</el-button>
                </router-link>
                <el-tag type="success" size="mini" v-else>已完成</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </div>
    </el-row>
    <el-row class="app-item-contain" style="margin-top: 20px;">
      <h3 class="index-title-h3" style="border-left: solid 10px #909399;">练习记录</h3>
      <div style="padding-left: 15px">
        <el-table v-loading="historyLoading" :data="historyList" border fit highlight-current-row style="width: 100%">
          <el-table-column prop="dailyPracticeTitle" label="练习名称"/>
          <el-table-column prop="score" label="得分" width="80px"/>
          <el-table-column prop="questionCount" label="题目数" width="80px"/>
          <el-table-column prop="questionCorrect" label="正确数" width="80px"/>
          <el-table-column prop="practiceDate" label="练习日期" width="160px"/>
          <el-table-column prop="createTime" label="提交时间" width="160px"/>
        </el-table>
        <pagination v-show="historyTotal>0" :total="historyTotal" :page.sync="historyParam.pageIndex"
                    :limit.sync="historyParam.pageSize" @pagination="searchHistory"/>
      </div>
    </el-row>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import dailyPracticeApi from '@/api/dailyPractice'

export default {
  components: { Pagination },
  data () {
    return {
      dailyLoading: false,
      dailyList: [],
      historyLoading: false,
      historyList: [],
      historyTotal: 0,
      historyParam: {
        pageIndex: 1,
        pageSize: 10
      }
    }
  },
  created () {
    this.loadDaily()
    this.searchHistory()
  },
  methods: {
    loadDaily () {
      let _this = this
      _this.dailyLoading = true
      dailyPracticeApi.list().then(re => {
        _this.dailyList = re.response
        _this.dailyLoading = false
      }).catch(() => {
        _this.dailyLoading = false
      })
    },
    searchHistory () {
      let _this = this
      _this.historyLoading = true
      dailyPracticeApi.history(_this.historyParam).then(re => {
        const data = re.response
        _this.historyList = data.list
        _this.historyTotal = data.total
        _this.historyParam.pageIndex = data.pageNum
        _this.historyLoading = false
      }).catch(() => {
        _this.historyLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .index-title-h3 {
    font-size: 22px;
    font-weight: 400;
    color: #1f2f3d;
    padding-left: 10px;
  }
  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }
  .button {
    padding: 0;
    float: right;
  }
  .image {
    width: 50%;
    height: 80%;
    display: block;
    margin: 20px auto 10px auto;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
</style>
