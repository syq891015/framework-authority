import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/sys/userRoles',
    method: 'get',
    params: query
  })
}

/**
 * 详情
 * @param id 主键
 */
export function fetchUserRole (id) {
  return request({
    url: '/sys/userRoles/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createUserRole (data) {
  return request({
    url: '/sys/userRoles',
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param data 对象
 */
export function updateUserRole (data) {
  return request({
    url: '/sys/userRoles/' + data.userId,
    method: 'put',
    data
  })
}

/**
 * 删除
 * @param id 主键
 */
export function deleteUserRole (id) {
  return request({
    url: '/sys/userRoles/' + id,
    method: 'delete'
  })
}
