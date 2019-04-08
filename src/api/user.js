import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/auth/users',
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
    url: '/auth/users/' + id,
    method: 'get'
  })
}

/**
 * 添加
 * @param data 对象
 */
export function createUser (data) {
  return request({
    url: '/auth/users',
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
    url: '/auth/users/' + data.id,
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
    url: '/auth/users/' + id,
    method: 'delete'
  })
}

/**
 * 获得某个用户下的角色ID集合
 * @param id 用户ID
 */
export function getRoleIdListByUserId (id) {
  return request({
    url: '/auth/users/' + id + '/roles/ids',
    method: 'get'
  })
}

/**
 * 给用户绑定角色
 * @param data {roleIds: [], userId: 1}
 */
export function boundRole (data) {
  const { roleIds, userId } = data
  return request({
    url: '/auth/users/' + userId + '/roles',
    method: 'post',
    data: { roleIds }
  })
}

/**
 * 给用户重置密码
 * @param data 用户ID
 */
export function resetPwd (data) {
  return request({
    url: '/auth/users/' + data + '/resetPwd',
    method: 'post'
  })
}

/**
 * 修改个人密码
 * @param data {oldPasswd, passwd}
 */
export function updatePwd (data) {
  console.log(data)
  return request({
    url: '/auth/users/updatePwd',
    method: 'post',
    data
  })
}
