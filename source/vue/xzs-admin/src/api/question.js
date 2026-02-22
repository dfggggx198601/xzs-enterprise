import { post, form } from '@/utils/request'
import axios from 'axios'

export default {
    pageList: query => post('/api/admin/question/page', query),
    edit: query => post('/api/admin/question/edit', query),
    select: id => post('/api/admin/question/select/' + id),
    deleteQuestion: id => post('/api/admin/question/delete/' + id),
    bankList: () => post('/api/admin/question/bank/list'),
    bankTypeCount: (tag, subjectId) => form('/api/admin/question/bank/typeCount', { tag, subjectId }),
    updateBank: query => form('/api/admin/question/bank/update', query),
    deleteBank: query => form('/api/admin/question/bank/delete', query),
    importQuestions: (file, subjectId, tag) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('subjectId', subjectId)
        formData.append('tag', tag)
        return axios.request({
            baseURL: process.env.VUE_APP_URL,
            url: '/api/admin/question/import',
            method: 'post',
            withCredentials: true,
            timeout: 120000,
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data', 'request-ajax': true }
        }).then(res => res.data)
    }
}
