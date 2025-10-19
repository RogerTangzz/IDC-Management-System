import request from '@/utils/request'

export function listRooms(params){ return request({ url: '/business/asset/room/list', method: 'get', params }) }
export function addRoom(data){ return request({ url: '/business/asset/room', method: 'post', data }) }
export function updateRoom(data){ return request({ url: '/business/asset/room', method: 'put', data }) }
export function delRoom(id){ return request({ url: `/business/asset/room/${id}`, method: 'delete' }) }

export function listRacks(params){ return request({ url: '/business/asset/rack/list', method: 'get', params }) }
export function getRack(id){ return request({ url: `/business/asset/rack/${id}`, method: 'get' }) }
export function addRack(data){ return request({ url: '/business/asset/rack', method: 'post', data }) }
export function updateRack(data){ return request({ url: '/business/asset/rack', method: 'put', data }) }
export function delRack(id){ return request({ url: `/business/asset/rack/${id}`, method: 'delete' }) }
export function getRackUnits(id){ return request({ url: `/business/asset/rack/${id}/units`, method: 'get' }) }
export function occupyUnits(id, units){ return request({ url: `/business/asset/rack/${id}/occupy`, method: 'post', data: units }) }

// U位管理API
export function listUSlots(params){ return request({ url: '/business/rack/uslot/list', method: 'get', params }) }
export function getUSlotsByRackId(rackId){ return request({ url: `/business/rack/uslot/rack/${rackId}`, method: 'get' }) }
export function getUSlotStats(rackId){ return request({ url: `/business/rack/uslot/stats/${rackId}`, method: 'get' }) }
export function checkUSlotConflict(params){ return request({ url: '/business/rack/uslot/checkConflict', method: 'get', params }) }
export function allocateUSlots(data){ return request({ url: '/business/rack/uslot/allocate', method: 'post', data }) }
export function releaseUSlots(data){ return request({ url: '/business/rack/uslot/release', method: 'post', data }) }
export function addUSlot(data){ return request({ url: '/business/rack/uslot', method: 'post', data }) }
export function updateUSlot(data){ return request({ url: '/business/rack/uslot', method: 'put', data }) }
export function delUSlot(id){ return request({ url: `/business/rack/uslot/${id}`, method: 'delete' }) }

// 机柜变更日志API
export function getRackLogs(rackId){ return request({ url: `/business/asset/rack/${rackId}/logs`, method: 'get' }) }
