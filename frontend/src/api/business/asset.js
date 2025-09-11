import request from '@/utils/request'

export function listRooms(params){ return request({ url: '/business/asset/room/list', method: 'get', params }) }
export function addRoom(data){ return request({ url: '/business/asset/room', method: 'post', data }) }
export function updateRoom(data){ return request({ url: '/business/asset/room', method: 'put', data }) }
export function delRoom(id){ return request({ url: `/business/asset/room/${id}`, method: 'delete' }) }

export function listRacks(params){ return request({ url: '/business/asset/rack/list', method: 'get', params }) }
export function addRack(data){ return request({ url: '/business/asset/rack', method: 'post', data }) }
export function updateRack(data){ return request({ url: '/business/asset/rack', method: 'put', data }) }
export function delRack(id){ return request({ url: `/business/asset/rack/${id}`, method: 'delete' }) }
export function getRackUnits(id){ return request({ url: `/business/asset/rack/${id}/units`, method: 'get' }) }
export function occupyUnits(id, units){ return request({ url: `/business/asset/rack/${id}/occupy`, method: 'post', data: units }) }

