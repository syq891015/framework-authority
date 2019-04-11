/**
 * 字节转换工具
 * @param limit 字节数
 * @returns {string} 带单位的大小
 */
export function byteConvert (limit) {
  let size = ''
  if (limit < 0.1 * 1024) {
    // 如果小于0.1KB转化成B
    size = limit.toFixed(2) + 'B'
  } else if (limit < 0.1 * 1024 * 1024) {
    // 如果小于0.1MB转化成KB
    size = (limit / 1024).toFixed(2) + 'KB'
  } else if (limit < 0.1 * 1024 * 1024 * 1024) {
    // 如果小于0.1GB转化成MB
    size = (limit / (1024 * 1024)).toFixed(2) + 'MB'
  } else {
    // 其他转化成GB
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }
  return size
}
