import request from '@/utils/request'

export function getUnreadMessages(params){
  return request({ url: '/business/message/unread', method: 'get', params })
}
export function countUnread(){
  return request({ url: '/business/message/countUnread', method: 'get' })
}
export function markRead(id){
  return request({ url: `/business/message/read/${id}`, method: 'post' })
}

export function getMessages(params){
  return request({ url: '/business/message/list', method: 'get', params })
}
export function markAllRead(){
  return request({ url: '/business/message/readAll', method: 'post' })
}
