import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/sys/baseDics',
    method: 'get',
    params: query
  })
}

/**
 * 查询全部
 * @param query 查询参数
 */
export function fetchAll (query) {
  return request({
    url: '/sys/baseDics',
    method: 'get',
    params: query
  })
}

/**
 * 详情
 * @param id 主键
 */
export function fetchBaseDic (id) {
  return request({
    url: '/sys/baseDics/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createBaseDic (data) {
  return request({
    url: '/sys/baseDics',
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param data 对象
 */
export function updateBaseDic (data) {
  return request({
    url: '/sys/baseDics/' + data.id,
    method: 'put',
    data
  })
}

/**
 * 删除
 * @param id 主键
 */
export function deleteBaseDic (id) {
  return request({
    url: '/sys/baseDics/' + id,
    method: 'delete'
  })
}
