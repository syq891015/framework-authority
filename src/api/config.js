import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/sys/configs',
    method: 'get',
    params: query
  })
}

/**
 * 详情
 * @param id 主键
 */
export function fetchConfig (id) {
  return request({
    url: '/sys/configs/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createConfig (data) {
  return request({
    url: '/sys/configs',
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param data 对象
 */
export function updateConfig (data) {
  return request({
    url: '/sys/configs/' + data.id,
    method: 'put',
    data
  })
}

/**
 * 删除
 * @param id 主键
 */
export function deleteConfig (id) {
  return request({
    url: '/sys/configs/' + id,
    method: 'delete'
  })
}

/**
 * 启用
 * @param idAry id数组
 */
export function enable (idAry) {
  return request({
    url: '/sys/configs/enable',
    method: 'post',
    data: idAry
  })
}

/**
 * 禁用
 * @param idAry id数组
 */
export function disable (idAry) {
  return request({
    url: '/sys/configs/disable',
    method: 'post',
    data: idAry
  })
}
