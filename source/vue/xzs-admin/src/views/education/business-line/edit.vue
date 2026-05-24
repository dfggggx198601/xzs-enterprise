<template>
  <div class="app-container">
    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading">
      <el-form-item label="部门名称：" required>
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="排序：" required>
        <el-input v-model="form.itemOrder"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import businessLineApi from '@/api/businessLine'
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      form: {
        id: null,
        name: '',
        itemOrder: 0
      },
      formLoading: false
    }
  },
  created () {
    let id = this.$route.query.id
    if (id && parseInt(id) !== 0) {
      this.formLoading = true
      businessLineApi.select(id).then(re => {
        this.form = re.response
        this.formLoading = false
      })
    }
  },
  methods: {
    submitForm () {
      let _this = this
      this.formLoading = true
      businessLineApi.edit(this.form).then(data => {
        if (data.code === 1) {
          _this.$message.success(data.message)
          _this.delCurrentView(_this).then(() => {
            _this.$router.push('/education/businessLine/list')
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
        itemOrder: 0
      }
      this.form.id = lastId
    },
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  }
}
</script>
