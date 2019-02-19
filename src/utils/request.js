import axios from 'axios'
import { Message } from 'element-ui'

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 60000, // request timeout
  withCredentials: true, // 允许携带cookie,axios默认是发送请求的时候不会带上cookie的，需要通过设置withCredentials: true来解决
  headers: {
    'X-Requested-with': 'XMLHttpRequest'
  }
})

// request interceptor
service.interceptors.request.use(config => {
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => {
    /**
    * 下面的注释为通过response自定义code来标示请求状态，错误返回都在cache中处理
    */
    const res = response.data
    if (res.code !== 0) {
      Message({
        message: res.msg,
        type: 'error',
        duration: 1500
      })
      return Promise.reject(res)
    } else {
      return res
    }
  },
  error => {
    console.log(error)
    Message({
      message: error.message,
      type: 'error',
      duration: 1500
    })
    return Promise.reject(error)
  })

export default service
