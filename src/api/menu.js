import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/auth/menus',
    method: 'get',
    params: query
  })
}

/**
 * 详情
 * @param id 主键
 */
export function fetchMenu (id) {
  return request({
    url: '/auth/menus/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createMenu (data) {
  return request({
    url: '/auth/menus',
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param data 对象
 */
export function updateMenu (data) {
  return request({
    url: '/auth/menus/' + data.id,
    method: 'put',
    data
  })
}

/**
 * 删除
 * @param id 主键
 */
export function deleteMenu (id) {
  return request({
    url: '/auth/menus/' + id,
    method: 'delete'
  })
}

/**
 * 获得所有的权限树
 */
export function getMenuTree () {
  return request({
    url: '/auth/menus/tree',
    method: 'get'
  })
}
