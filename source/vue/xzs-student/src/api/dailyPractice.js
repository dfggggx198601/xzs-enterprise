import { post } from '@/utils/request'

export default {
  list: () => post('/api/student/dailyPractice/list'),
  start: id => post('/api/student/dailyPractice/start/' + id),
  submit: query => post('/api/student/dailyPractice/submit', query),
  history: query => post('/api/student/dailyPractice/history', query)
}
