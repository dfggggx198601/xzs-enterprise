import { post } from '@/utils/request'

export default {
  list: query => post('/api/admin/education/businessLine/list'),
  pageList: query => post('/api/admin/education/businessLine/page', query),
  edit: query => post('/api/admin/education/businessLine/edit', query),
  select: id => post('/api/admin/education/businessLine/select/' + id),
  deleteBusinessLine: id => post('/api/admin/education/businessLine/delete/' + id)
}
