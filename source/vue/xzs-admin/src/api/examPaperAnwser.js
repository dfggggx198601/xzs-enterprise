import { post } from '@/utils/request'

export default {
  page: query => post('/api/admin/examPaperAnswer/page', query),
  delete: id => post('/api/admin/examPaperAnswer/delete/' + id, {})
}
