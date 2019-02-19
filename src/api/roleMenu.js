import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/sys/roleMenus',
    method: 'get',
    params: query
  })
}

/**
 * 详情
 * @param id 主键
 */
export function fetchRoleMenu (id) {
  return request({
    url: '/sys/roleMenus/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createRoleMenu (data) {
  return request({
    url: '/sys/roleMenus',
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param data 对象
 */
export function updateRoleMenu (data) {
  return request({
    url: '/sys/roleMenus/' + data.roleId,
    method: 'put',
    data
  })
}

/**
 * 删除
 * @param id 主键
 */
export function deleteRoleMenu (id) {
  return request({
    url: '/sys/roleMenus/' + id,
    method: 'delete'
  })
}
