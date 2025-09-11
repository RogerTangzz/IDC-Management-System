import request from '@/utils/request'

export function getSlaConfig(){
  return request({ url: '/system/sla', method: 'get' })
}

export function updateSlaConfig(data){
  return request({ url: '/system/sla', method: 'put', data })
}

