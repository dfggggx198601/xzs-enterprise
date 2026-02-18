<template>
  <div class="app-container">

    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading">
      <el-form-item label="业务范围：" required>
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="部门：" required>
        <el-select v-model="form.level" placeholder="部门" @change="levelChange">
          <el-option v-for="item in businessLines" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import subjectApi from '@/api/subject'
import businessLineApi from '@/api/businessLine'

export default {
  data () {
    return {
      form: {
        id: null,
        name: '',
        level: null,
        levelName: ''
      },
      formLoading: false,
      businessLines: []
    }
  },
  created () {
    let id = this.$route.query.id
    let _this = this
    
    // Load Business Lines
    businessLineApi.list().then(re => {
      _this.businessLines = re.response
    })

    if (id && parseInt(id) !== 0) {
      _this.formLoading = true
      subjectApi.select(id).then(re => {
        _this.form = re.response
        _this.formLoading = false
      })
    }
  },
  methods: {
    levelChange (val) {
      let subject = this.businessLines.find(item => item.id === val)
      if (subject) {
        this.form.levelName = subject.name
      }
    },
    submitForm () {
      let _this = this
      this.formLoading = true
      // Ensure levelName is set if not already
      if (!this.form.levelName && this.form.level) {
         let subject = this.businessLines.find(item => item.id === this.form.level)
         if (subject) {
           this.form.levelName = subject.name
         }
      }
      
      subjectApi.edit(this.form).then(data => {
        if (data.code === 1) {
          _this.$message.success(data.message)
          _this.delCurrentView(_this).then(() => {
            _this.$router.push('/education/subject/list')
          })
        } else {
          _this.$message.error(data.message)
          _this.formLoading = false
        }
      }).catch(e => {
        _this.formLoading = false
      })
    },
    resetForm () {
      let lastId = this.form.id
      this.$refs['form'].resetFields()
      this.form = {
        id: null,
        name: '',
        level: null,
        levelName: ''
      }
      this.form.id = lastId
    },
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  }
}
</script>
