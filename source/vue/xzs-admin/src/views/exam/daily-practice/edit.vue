<template>
  <div class="app-container">
    <el-form :model="form" ref="form" label-width="120px" v-loading="formLoading" :rules="rules">
      <el-form-item label="练习名称：" prop="title" required>
        <el-input v-model="form.title"/>
      </el-form-item>
      <el-form-item label="描述：" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3"/>
      </el-form-item>
      <el-form-item label="部门：" prop="gradeLevel" required>
        <el-select v-model="form.gradeLevel" placeholder="部门" @change="levelChange">
          <el-option v-for="item in levelEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="业务范围：" prop="subjectId" required>
        <el-select v-model="form.subjectId" placeholder="业务范围">
          <el-option v-for="item in subjectFilter" :key="item.id" :value="item.id"
                     :label="item.name+' ( '+item.levelName+' )'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="题库标签：" prop="tag" required>
        <el-input v-model="form.tag" placeholder="从该标签的题库中随机抽题"/>
      </el-form-item>
      <el-form-item label="每日题目数：" prop="questionCount" required>
        <el-input-number v-model="form.questionCount" :min="1" :max="50"></el-input-number>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import dailyPracticeApi from '@/api/dailyPractice'

export default {
  data () {
    return {
      form: {
        id: null,
        title: '',
        description: '',
        gradeLevel: null,
        subjectId: null,
        tag: '',
        questionCount: 5,
        status: 1
      },
      subjectFilter: null,
      formLoading: false,
      rules: {
        title: [
          { required: true, message: '请输入练习名称', trigger: 'blur' }
        ],
        gradeLevel: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ],
        subjectId: [
          { required: true, message: '请选择业务范围', trigger: 'change' }
        ],
        tag: [
          { required: true, message: '请输入题库标签', trigger: 'blur' }
        ],
        questionCount: [
          { required: true, message: '请输入题目数量', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.$store.dispatch('enumItem/initLevelEnum')
    let id = this.$route.query.id
    let _this = this
    this.initSubject(function () {
      _this.subjectFilter = _this.subjects
    })
    if (id && parseInt(id) !== 0) {
      _this.formLoading = true
      dailyPracticeApi.select(id).then(re => {
        _this.form = re.response
        _this.formLoading = false
      })
    }
  },
  methods: {
    submitForm () {
      let _this = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoading = true
          dailyPracticeApi.edit(this.form).then(re => {
            if (re.code === 1) {
              _this.$message.success(re.message)
              _this.delCurrentView(_this).then(() => {
                _this.$router.push('/exam/daily-practice/list')
              })
            } else {
              _this.$message.error(re.message)
              this.formLoading = false
            }
          }).catch(e => {
            this.formLoading = false
          })
        } else {
          return false
        }
      })
    },
    levelChange () {
      this.form.subjectId = null
      this.subjectFilter = this.subjects.filter(data => data.level === this.form.gradeLevel)
    },
    resetForm () {
      let lastId = this.form.id
      this.$refs['form'].resetFields()
      this.form = {
        id: null,
        title: '',
        description: '',
        gradeLevel: null,
        subjectId: null,
        tag: '',
        questionCount: 5,
        status: 1
      }
      this.form.id = lastId
    },
    ...mapActions('exam', { initSubject: 'initSubject' }),
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      levelEnum: state => state.user.levelEnum
    }),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
