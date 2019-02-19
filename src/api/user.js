import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/sys/users',
    method: 'get',
    params: query
  })
}

/**
 * 详情
 * @param id 主键
 */
export function fetchUser (id) {
  return request({
    url: '/sys/users/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createUser (data) {
  return request({
    url: '/sys/users',
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param data 对象
 */
export function updateUser (data) {
  return request({
    url: '/sys/users/' + data.id,
    method: 'put',
    data
  })
}

/**
 * 删除
 * @param id 主键
 */
export function deleteUser (id) {
  return request({
    url: '/sys/users/' + id,
    method: 'delete'
  })
}
