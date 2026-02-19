<template>
  <div style="margin-top: 10px">
    <el-row>
      <el-carousel :interval="5000" arrow="always" type="card">
        <el-carousel-item >
          <img src="@/assets/carousel/1.png" class="carousel-img">
        </el-carousel-item>
        <el-carousel-item >
          <img src="@/assets/carousel/2.png" class="carousel-img">
        </el-carousel-item>
        <el-carousel-item >
          <img src="@/assets/carousel/3.png" class="carousel-img">
        </el-carousel-item>
        <el-carousel-item >
          <img src="@/assets/carousel/4.png" class="carousel-img">
        </el-carousel-item>
      </el-carousel>
    </el-row>
    <el-row class="app-item-contain">
      <h3 class="index-title-h3" style="border-left: solid 10px #e6a23c;">每日一练</h3>
      <div style="padding-left: 15px" v-loading="dailyLoading">
        <div v-if="dailyPracticeList.length === 0 && !dailyLoading" style="color: #909399; padding: 10px 0;">今日暂无练习</div>
        <el-col :span="4" v-for="(item, index) in dailyPracticeList" :key="'dp-'+index" :offset="index > 0 ? 1 : 0">
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
    <el-row class="app-item-contain">
      <h3 class="index-title-h3">固定试卷</h3>
      <div style="padding-left: 15px">
        <el-col :span="4" v-for="(item, index) in fixedPaper" :key="index" :offset="index > 0 ? 1 : 0">
          <el-card :body-style="{ padding: '0px' }" v-loading="loading">
            <img src="@/assets/exam-paper/show1.png" class="image">
            <div style="padding: 14px;">
              <span>{{item.name}}</span>
              <div class="bottom clearfix">
                <router-link target="_blank" :to="{path:'/do',query:{id:item.id}}">
                  <el-button type="text" class="button">开始做题</el-button>
                </router-link>
              </div>
            </div>
          </el-card>
        </el-col>
      </div>
    </el-row>
    <el-row class="app-item-contain">
      <h3 class="index-title-h3" style="border-left: solid 10px rgb(220, 208, 65);">时段试卷</h3>
      <div style="padding-left: 15px">
        <el-col :span="4" v-for="(item, index) in timeLimitPaper" :key="index" :offset="index > 0 ? 1 : 0">
          <el-card :body-style="{ padding: '0px' }" v-loading="loading">
            <img src="@/assets/exam-paper/show2.png" class="image">
            <div style="padding: 14px;">
              <span>{{item.name}}</span>
              <p class="index-limit-paper-time">
                <span>{{item.startTime}}</span>
                <br/>
                <span>{{item.endTime}}</span>
              </p>
              <div class="bottom clearfix">
                <router-link target="_blank" :to="{path:'/do',query:{id:item.id}}">
                  <el-button type="text" class="button">开始做题</el-button>
                </router-link>
              </div>
            </div>
          </el-card>
        </el-col>
      </div>
    </el-row>
  </div>
</template>

<script>
import indexApi from '@/api/dashboard'
import dailyPracticeApi from '@/api/dailyPractice'
export default {
  data () {
    return {
      fixedPaper: [],
      timeLimitPaper: [],
      pushPaper: [],
      loading: false,
      dailyLoading: false,
      dailyPracticeList: []
    }
  },
  created () {
    let _this = this
    this.loading = true
    indexApi.index().then(re => {
      _this.fixedPaper = re.response.fixedPaper
      _this.timeLimitPaper = re.response.timeLimitPaper
      _this.pushPaper = re.response.pushPaper
      _this.loading = false
    })

    this.dailyLoading = true
    dailyPracticeApi.list().then(re => {
      _this.dailyPracticeList = re.response
      _this.dailyLoading = false
    }).catch(() => {
      _this.dailyLoading = false
    })
  },
  methods: {
  },
  computed: {
  }
}
</script>

<style lang="scss" scoped>
  .index-title-h3 {
    font-size: 22px;
    font-weight: 400;
    color: #1f2f3d;
    border-left: solid 10px #2ce8b4;
    padding-left: 10px;
  }

  .el-carousel__item h3 {
    color: #475669;
    font-size: 18px;
    opacity: 0.75;
    line-height: 300px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
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
