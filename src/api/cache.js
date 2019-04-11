import request from '@/utils/request'

/**
 * 列表
 */
export function fetchList (query) {
  return request({
    url: '/sys/caches',
    method: 'get'
  })
}

/**
 * 刷新缓存
 * @param serviceNames 服务名称
 */
export function refresh (serviceNames) {
  return request({
    url: '/sys/caches/refresh',
    method: 'get',
    params: {serviceNames}
  })
}
