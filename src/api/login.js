import request from '@/utils/request'

export function login (userInfo) {
  return request({
    url: '/login/login',
    method: 'post',
    data: userInfo
  })
}

export function logout () {
  return request({
    url: '/login/logout',
    method: 'get'
  })
}

export function getUserInfo () {
  return request({
    url: '/login/user',
    method: 'get'
  })
}

export function unlock (password) {
  return request({
    url: '/login/unlock',
    method: 'post',
    data: { password }
  })
}
