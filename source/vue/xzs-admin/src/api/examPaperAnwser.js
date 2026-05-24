import { post } from '@/utils/request'

export default {
  page: query => post('/api/admin/examPaperAnswer/page', query),
  delete: id => post('/api/admin/examPaperAnswer/delete/' + id, {}),
  analysis: () => post('/api/admin/examPaperAnswer/analysis', {}),
  report: examPaperId => post('/api/admin/examPaperAnswer/report/' + examPaperId, {}),
  weakness: examPaperId => post('/api/admin/examPaperAnswer/weakness/' + examPaperId, {})
}
