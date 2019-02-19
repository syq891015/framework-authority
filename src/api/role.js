import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/sys/roles',
    method: 'get',
    params: query
  })
}

/**
 * 详情
 * @param id 主键
 */
export function fetchRole (id) {
  return request({
    url: '/sys/roles/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createRole (data) {
  return request({
    url: '/sys/roles',
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param data 对象
 */
export function updateRole (data) {
  return request({
    url: '/sys/roles/' + data.id,
    method: 'put',
    data
  })
}

/**
 * 删除
 * @param id 主键
 */
export function deleteRole (id) {
  return request({
    url: '/sys/roles/' + id,
    method: 'delete'
  })
}
