import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/auth/roles',
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
    url: '/auth/roles/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createRole (data) {
  return request({
    url: '/auth/roles',
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
    url: '/auth/roles/' + data.id,
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
    url: '/auth/roles/' + id,
    method: 'delete'
  })
}

/**
 * 获得某个角色下的权限ID集合
 * @param id 角色ID
 */
export function getMenuIdListByRoleId (id) {
  return request({
    url: '/auth/roles/' + id + '/menus/ids',
    method: 'get'
  })
}

/**
 * 给角色绑定权限
 * @param data {menuIds: [], roleId: 1}
 */
export function boundMenu (data) {
  const { menuIds, roleId } = data
  return request({
    url: '/auth/roles/' + roleId + '/menus',
    method: 'post',
    data: { menuIds }
  })
}
