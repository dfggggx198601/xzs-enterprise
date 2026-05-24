import { post, postWithLongTimeout } from '@/utils/request'

export default {
  create: query => post('/api/student/agent/create', query),
  chat: query => postWithLongTimeout('/api/student/agent/chat', query),
  history: id => post(`/api/student/agent/history/${id}`),
  list: () => post('/api/student/agent/list')
}
