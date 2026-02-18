<template>
  <div>
    <el-row class="do-exam-title">
      <el-col :span="24">
        <span :key="index" v-for="(item, index) in answerItems">
          <el-tag :type="item.completed ? 'success' : 'info'" class="do-exam-title-tag" @click="goAnchor('#question-'+(index+1))">{{index+1}}</el-tag>
        </span>
      </el-col>
    </el-row>
    <el-container class="app-item-contain">
      <el-header class="align-center">
        <h1>{{practiceTitle}}</h1>
        <div>
          <span class="question-title-padding">共 {{questions.length}} 题</span>
        </div>
      </el-header>
      <el-main v-loading="formLoading">
        <el-card class="exampaper-item-box" v-if="questions.length > 0">
          <div :key="index" v-for="(question, index) in questions" :id="'question-'+(index+1)" style="margin-bottom: 20px;">
            <div style="font-weight: bold; margin-bottom: 5px;">{{index+1}}.</div>
            <QuestionEdit :qType="question.questionType" :question="question" :answer="answerItems[index]"/>
          </div>
        </el-card>
        <el-row class="do-align-center" style="margin-top: 20px;">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="$router.push('/index')">返回</el-button>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import QuestionEdit from '../exam/components/QuestionEdit'
import dailyPracticeApi from '@/api/dailyPractice'

export default {
  components: { QuestionEdit },
  data () {
    return {
      practiceId: null,
      practiceTitle: '',
      questions: [],
      answerItems: [],
      formLoading: false
    }
  },
  created () {
    let id = this.$route.query.id
    let _this = this
    if (id && parseInt(id) !== 0) {
      _this.practiceId = parseInt(id)
      _this.formLoading = true
      dailyPracticeApi.start(id).then(re => {
        let data = re.response
        _this.practiceTitle = data.title
        _this.questions = data.questions
        _this.initAnswers()
        _this.formLoading = false
      }).catch(() => {
        _this.formLoading = false
      })
    }
  },
  methods: {
    initAnswers () {
      this.answerItems = this.questions.map(q => ({
        questionId: q.id,
        content: null,
        contentArray: [],
        completed: false
      }))
    },
    goAnchor (selector) {
      this.$el.querySelector(selector).scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' })
    },
    submitForm () {
      let _this = this
      _this.formLoading = true
      let submitData = {
        id: _this.practiceId,
        answerItems: _this.answerItems.map(item => ({
          questionId: item.questionId,
          content: item.content,
          contentArray: item.contentArray
        }))
      }
      dailyPracticeApi.submit(submitData).then(re => {
        if (re.code === 1) {
          let resp = re.response
          _this.$alert('本次练习得分：' + resp.score + '分，共' + resp.questionCount + '题，正确' + resp.questionCorrect + '题', '练习结果', {
            confirmButtonText: '返回首页',
            callback: action => {
              _this.$router.push('/index')
            }
          })
        } else {
          _this.$message.error(re.message)
        }
        _this.formLoading = false
      }).catch(e => {
        _this.formLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .align-center {
    text-align: center
  }
  .question-title-padding {
    padding-left: 25px;
    padding-right: 25px;
  }
</style>
