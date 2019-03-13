import { MessageBox } from 'element-ui'
import i18n from '@/lang'

const popup = {
  install: function (Vue) {
    Vue.prototype.__confirm = function (options) {
      const opts = Object.assign({
        showCancelButton: true,
        title: 'tips.tip',
        type: 'warning'
      }, options)

      opts.message = i18n.t(opts.message)
      opts.title = i18n.t(opts.title)

      return new Promise((resolve, reject) => {
        MessageBox(opts).then(() => {
          resolve()
        }).catch(() => {
          console.log('cancelled')
        })
      })
    }
  }
}

export default popup
