import { post } from '@/utils/request'

export default {
  pageList: query => post('/api/admin/dailyPractice/page', query),
  edit: query => post('/api/admin/dailyPractice/edit', query),
  select: id => post('/api/admin/dailyPractice/select/' + id),
  deletePractice: id => post('/api/admin/dailyPractice/delete/' + id),
  answerPage: query => post('/api/admin/dailyPractice/answer/page', query)
}
