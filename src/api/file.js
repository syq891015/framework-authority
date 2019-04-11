import request from '@/utils/request'

/**
 * 列表
 * @param query 查询参数，包含pageNum、pageSize以及其他参数
 */
export function fetchList (query) {
  return request({
    url: '/sys/files',
    method: 'get',
    params: query
  })
}

/**
 * 删除
 * @param id 主键
 */
export function deleteFile (id) {
  return request({
    url: '/sys/files/' + id,
    method: 'delete'
  })
}

/**
 * 获得上传地址
 */
export function getUploadPath (data) {
  if (data && data.id) {
    return process.env.BASE_API + '/sys/files/' + data.id + '/reUpload'
  }
  return process.env.BASE_API + '/sys/files/upload'
}
